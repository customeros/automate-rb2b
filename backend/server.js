import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import DatabaseService from "./services/database.js";
import OllamaService from "./services/ollama.js";
import LinkedInScraper from "./services/linkedinScraper.js";
import LeadProcessor from "./services/leadProcessor.js";

import createWebhookRouter from "./routes/webhook.js";
import createCompaniesRouter from "./routes/companies.js";
import createConfigRouter from "./routes/config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const database = new DatabaseService(
    process.env.DATABASE_PATH || "../data/companies.db"
);
const ollama = new OllamaService(
    process.env.OLLAMA_HOST || "http://localhost:11434",
    process.env.OLLAMA_MODEL || "gemma3:12b"
);
const linkedinScraper = new LinkedInScraper(ollama);
const leadProcessor = new LeadProcessor(database, ollama, linkedinScraper);

// Health check endpoint
app.get("/api/health", async (req, res) => {
    try {
        const ollamaConnected = await ollama.checkConnection();
        const icpConfig = database.getActiveICPConfig();

        res.json({
            success: true,
            status: {
                backend: true,
                database: true,
                ollama: ollamaConnected,
                icpConfigured: !!icpConfig,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            status: {
                backend: true,
                database: false,
                ollama: false,
                icpConfigured: false,
            },
        });
    }
});

// Routes
app.use("/api/webhook", createWebhookRouter(database, leadProcessor));
app.use("/api/companies", createCompaniesRouter(database, leadProcessor));
app.use("/api/config", createConfigRouter(database));

// Scrape LinkedIn endpoint for companies
app.post("/api/scrape-linkedin/:companyId", async (req, res) => {
    try {
        const companyId = parseInt(req.params.companyId);
        const company = database.getCompanyById(companyId);

        if (!company) {
            return res
                .status(404)
                .json({ success: false, error: "Company not found" });
        }

        const icpConfig = database.getActiveICPConfig();

        if (!icpConfig) {
            return res.status(400).json({
                success: false,
                error: "No ICP configuration found. Please configure your ICP first.",
            });
        }

        const targetJobTitles = JSON.parse(icpConfig.target_job_titles || "[]");

        if (targetJobTitles.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No target job titles configured in ICP.",
            });
        }

        console.log(
            `\n🎯 Starting LinkedIn search for: ${company.company_name}`
        );
        console.log(`📋 Company ID: ${companyId}`);

        const contacts = await linkedinScraper.searchCompanyEmployees(
            company.company_name,
            targetJobTitles,
            15, // Increased to get more results
            true // Enable role verification for higher quality contacts
        );

        console.log(`\n💾 Saving ${contacts.length} contacts to database...`);

        // Save contacts and generate emails for each
        const savedContacts = [];
        for (const contact of contacts) {
            const result = database.saveContact({
                company_id: companyId,
                contact_name: contact.name,
                contact_title: contact.title,
                profile_url: contact.profileUrl,
                persona: contact.persona,
                persona_fit_score: contact.persona_fit_score,
                contact_type: "enriched",
                is_persona_match: true,
            });

            const contactId = result.lastInsertRowid;

            // Generate email for this contact
            try {
                const email = await ollama.generateAlternativeContactEmail(
                    company,
                    contact,
                    contact.persona
                );

                database.saveGeneratedEmail({
                    contact_id: contactId,
                    subject: email.subject,
                    body: email.body,
                });

                console.log(`  ✓ Saved: ${contact.name} - ${contact.title}`);
            } catch (emailError) {
                console.error(
                    `  ⚠️  Failed to generate email for ${contact.name}:`,
                    emailError.message
                );
            }

            savedContacts.push({
                id: contactId,
                ...contact,
            });
        }

        console.log(
            `\n✅ LinkedIn search complete! Found ${savedContacts.length} matching contacts.\n`
        );

        res.json({
            success: true,
            contacts: savedContacts,
            message: `Found ${savedContacts.length} contacts matching your target personas`,
        });
    } catch (error) {
        console.error("❌ Error in LinkedIn scraping endpoint:", error);
        res.status(500).json({
            success: false,
            error: error.message,
            details: "Check server logs for more information",
        });
    }
});

// Clean up LinkedIn session lock file if it exists
function cleanupLinkedInSession() {
    const lockFile = path.join(__dirname, "linkedin-session", "SingletonLock");
    if (fs.existsSync(lockFile)) {
        try {
            fs.unlinkSync(lockFile);
            console.log("🧹 Cleaned up LinkedIn session lock file");
        } catch (error) {
            console.log(
                "⚠️  Could not remove LinkedIn lock file:",
                error.message
            );
        }
    }
}

// Initialize default ICP configuration if none exists
function initializeDefaultICP() {
    const existingICP = database.getActiveICPConfig();
    if (!existingICP) {
        console.log("📋 No ICP configuration found. Creating default...");
        const defaultICP = {
            name: "Default Tech ICP",
            industries: ["SaaS", "Technology", "E-commerce", "FinTech"],
            company_size_min: 50,
            company_size_max: 1000,
            regions: ["North America", "Europe"],
            target_job_titles: [
                "VP Engineering",
                "CTO",
                "Engineering Manager",
                "DevOps Lead",
                "Platform Engineer",
                "Head of Infrastructure",
            ],
            tech_stack: [
                "AWS",
                "Kubernetes",
                "Docker",
                "React",
                "Node.js",
                "Python",
            ],
            pain_points: [
                "Testing complexity",
                "CI/CD bottlenecks",
                "Quality assurance",
                "Performance testing",
                "Load testing",
            ],
        };
        database.saveICPConfig(defaultICP);
        console.log("✅ Default ICP configuration created");
    } else {
        console.log("✅ ICP configuration already exists");
    }
}

// Clean up on startup
cleanupLinkedInSession();

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    console.log(
        `📊 Webhook endpoint: http://localhost:${PORT}/api/webhook/rb2b`
    );
    console.log(
        `🏢 Companies endpoint: http://localhost:${PORT}/api/companies`
    );

    // Initialize default ICP if needed
    initializeDefaultICP();
});

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down gracefully...");
    await linkedinScraper.close();
    database.close();
    process.exit(0);
});
