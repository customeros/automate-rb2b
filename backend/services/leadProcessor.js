import OllamaService from "./ollama.js";
import LinkedInScraper from "./linkedinScraper.js";

class LeadProcessor {
    constructor(database, ollamaService, linkedinScraper) {
        this.database = database;
        this.ollama = ollamaService;
        this.linkedinScraper = linkedinScraper;
    }

    async processWebhookEvent(webhookData) {
        console.log(`\n🎯 Processing webhook event for company-based model...`);

        try {
            // Extract company information
            const companyInfo = this.extractCompanyInfo(webhookData);
            console.log(
                `📊 Company: ${companyInfo.company_name} (${companyInfo.company_domain})`
            );

            // Check if company already exists
            const existingCompany = this.database.db
                .prepare("SELECT * FROM companies WHERE company_domain = ?")
                .get(companyInfo.company_domain);

            let companyId;
            if (existingCompany) {
                console.log(
                    `🔄 Updating existing company: ${companyInfo.company_name}`
                );
                companyId = existingCompany.id;
                await this.updateCompany(
                    existingCompany.id,
                    companyInfo,
                    webhookData
                );
            } else {
                console.log(
                    `✨ Creating new company: ${companyInfo.company_name}`
                );
                companyId = await this.createNewCompany(
                    companyInfo,
                    webhookData
                );
            }

            return { success: true, company_id: companyId };
        } catch (error) {
            console.error("❌ Error processing webhook:", error);
            return { success: false, error: error.message };
        }
    }

    extractCompanyInfo(webhookData) {
        // Extract company information from webhook data
        return {
            company_name: webhookData.company?.name || webhookData.company_name,
            company_domain:
                webhookData.company?.domain || webhookData.company_domain,
            company_size: webhookData.company?.size || webhookData.company_size,
            industry: webhookData.company?.industry || webhookData.industry,
            region: webhookData.company?.region || webhookData.region,
        };
    }

    async createNewCompany(companyInfo, webhookData) {
        // Get ICP configuration
        const icpConfig = this.database.getActiveICPConfig();
        if (!icpConfig) {
            throw new Error("No ICP configuration found");
        }

        // Score ICP fit
        const icpResult = await this.ollama.scoreICPFit(companyInfo, icpConfig);
        console.log(`📈 ICP Score: ${icpResult.score} (${icpResult.tier})`);

        // Determine buying stage from visited pages
        const visitedPages =
            webhookData.visited_pages || webhookData.pages || [];
        const stageResult = await this.ollama.inferBuyingStage(visitedPages);
        console.log(`🛒 Buying Stage: ${stageResult.stage}`);

        // Calculate intent score
        const intentScore = this.calculateIntentScore(visitedPages);

        // Save company
        const companyData = {
            webhook_event_id: webhookData.event_id,
            ...companyInfo,
            icp_score: icpResult.score,
            icp_tier: icpResult.tier,
            icp_explanation: icpResult.explanation,
            buying_stage: stageResult.stage,
            buying_stage_explanation: stageResult.explanation,
            intent_score: intentScore,
            confidence_score: (icpResult.score + intentScore * 33) / 2 / 100, // Normalize to 0-1
            needs_linkedin_search: false,
        };

        const result = this.database.saveCompany(companyData);
        const companyId = result.lastInsertRowid;

        // Save visited pages
        if (visitedPages.length > 0) {
            this.database.saveVisitedPages(companyId, visitedPages);
        }

        // Process contacts
        await this.processContacts(companyId, webhookData, icpConfig);

        return companyId;
    }

    async updateCompany(companyId, companyInfo, webhookData) {
        // Get existing company data
        const existingCompany = this.database.getCompanyById(companyId);

        // Add new visited pages
        const newPages = webhookData.visited_pages || webhookData.pages || [];
        if (newPages.length > 0) {
            this.database.saveVisitedPages(companyId, newPages);
        }

        // Recalculate buying stage with all pages
        const allPages = this.database.getVisitedPagesByCompanyId(companyId);
        const stageResult = await this.ollama.inferBuyingStage(allPages);

        // Update company with new information
        const updateStmt = this.database.db.prepare(`
            UPDATE companies 
            SET buying_stage = ?, buying_stage_explanation = ?, intent_score = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        updateStmt.run(
            stageResult.stage,
            stageResult.explanation,
            this.calculateIntentScore(allPages),
            companyId
        );

        // Process new contacts if any
        if (webhookData.contact_name || webhookData.contact) {
            const icpConfig = this.database.getActiveICPConfig();
            await this.processContacts(companyId, webhookData, icpConfig);
        }
    }

    async processContacts(companyId, webhookData, icpConfig) {
        const contacts = this.extractContacts(webhookData);

        for (const contactData of contacts) {
            console.log(
                `👤 Processing contact: ${contactData.contact_name} (${contactData.contact_title})`
            );

            // Infer persona
            const visitedPages =
                webhookData.visited_pages || webhookData.pages || [];
            const personaResult = await this.ollama.inferPersona(visitedPages);
            console.log(
                `🎭 Persona: ${personaResult.persona} (${(
                    personaResult.confidence * 100
                ).toFixed(0)}%)`
            );

            // Check persona match
            const targetPersonas = JSON.parse(
                icpConfig.target_job_titles || "[]"
            );
            const isPersonaMatch = this.checkPersonaMatch(
                personaResult.persona,
                contactData.contact_title,
                targetPersonas
            );

            console.log(`🎯 Persona Match: ${isPersonaMatch ? "Yes" : "No"}`);

            // Save contact
            const contact = {
                company_id: companyId,
                ...contactData,
                persona: personaResult.persona,
                persona_confidence: personaResult.confidence,
                persona_reasoning: personaResult.reasoning,
                is_persona_match: isPersonaMatch,
                contact_type: "original",
            };

            const contactResult = this.database.saveContact(contact);
            const contactId = contactResult.lastInsertRowid;

            // Generate email for this contact
            try {
                const email = await this.ollama.generateOutreachEmail(
                    { ...contact, company_name: webhookData.company?.name },
                    contact.buying_stage || "Explore",
                    contact.persona
                );

                this.database.saveGeneratedEmail({
                    contact_id: contactId,
                    subject: email.subject,
                    body: email.body,
                });
            } catch (emailError) {
                console.log(
                    `⚠️  Could not generate email: ${emailError.message}`
                );
            }
        }
    }

    extractContacts(webhookData) {
        const contacts = [];

        // Primary contact from webhook
        if (webhookData.contact_name || webhookData.contact) {
            contacts.push({
                contact_name:
                    webhookData.contact_name || webhookData.contact?.name,
                contact_email:
                    webhookData.contact_email || webhookData.contact?.email,
                contact_title:
                    webhookData.contact_title || webhookData.contact?.title,
            });
        }

        // Additional contacts if present
        if (webhookData.additional_contacts) {
            contacts.push(...webhookData.additional_contacts);
        }

        return contacts;
    }

    checkPersonaMatch(inferredPersona, contactTitle, targetJobTitles) {
        console.log("\n   🔍 Checking persona match...");

        if (!contactTitle || !targetJobTitles || targetJobTitles.length === 0) {
            console.log(
                "   ❌ No persona match: Missing title or target job titles"
            );
            return false;
        }

        const titleLower = contactTitle.toLowerCase();
        console.log(`   Comparing "${contactTitle}" against:`);

        let matchedTitle = null;
        const titleMatches = targetJobTitles.some((target) => {
            const targetLower = target.toLowerCase();
            console.log(`     - "${target}"`);

            const isMatch =
                titleLower.includes(targetLower) ||
                titleLower === targetLower ||
                titleLower
                    .replace(/ of /g, " ")
                    .includes(targetLower.replace(/ of /g, " ")) ||
                targetLower
                    .replace(/ of /g, " ")
                    .includes(titleLower.replace(/ of /g, " "));

            if (isMatch) {
                matchedTitle = target;
                console.log(`       ✓ MATCH!`);
            }

            return isMatch;
        });

        if (!titleMatches) {
            console.log(
                `\n   ❌ No persona match: Title "${contactTitle}" doesn't match any target titles`
            );
            return false;
        }

        console.log(`\n   ✓ Title matched: "${matchedTitle}"`);

        const buyerPersonas = ["Economic Buyer", "Technical Evaluator"];
        const isGoodPersona = buyerPersonas.includes(inferredPersona);

        if (!isGoodPersona) {
            console.log(
                `   ⚠️  Inferred persona is "${inferredPersona}" (not a buyer persona)`
            );
            const seniorTitleKeywords = [
                "vp",
                "vice president",
                "cto",
                "chief",
                "head of",
                "director",
                "lead",
                "manager",
            ];
            const hasSeniorTitle = seniorTitleKeywords.some((keyword) =>
                titleLower.includes(keyword)
            );

            if (hasSeniorTitle) {
                console.log(
                    `   ✓✓ PERSONA MATCH: Senior title "${contactTitle}" overrides inferred persona`
                );
                return true;
            }

            console.log(`   ❌ Not a senior title, marking as no match`);
            return false;
        }

        console.log(`   ✓✓ PERSONA MATCH: Title + inferred persona both good`);
        return true;
    }

    calculateIntentScore(visitedPages) {
        if (!visitedPages || visitedPages.length === 0) return 1;

        let score = 1;

        // Helper to get page path from different formats
        const getPagePath = (page) => {
            if (typeof page === "string") return page;
            return page.page_path || page.path || "";
        };

        // Higher intent for pricing pages
        if (
            visitedPages.some((page) => {
                const path = getPagePath(page).toLowerCase();
                return path.includes("pricing") || path.includes("cost");
            })
        ) {
            score += 1;
        }

        // Higher intent for demo/contact pages
        if (
            visitedPages.some((page) => {
                const path = getPagePath(page).toLowerCase();
                return (
                    path.includes("demo") ||
                    path.includes("contact") ||
                    path.includes("sales")
                );
            })
        ) {
            score += 1;
        }

        // Higher intent for multiple visits
        if (visitedPages.length > 3) {
            score += 1;
        }

        return Math.min(score, 3);
    }

    async scrapeLinkedInForCompany(companyId) {
        const company = this.database.getCompanyById(companyId);
        if (!company) {
            throw new Error("Company not found");
        }

        const icpConfig = this.database.getActiveICPConfig();
        if (!icpConfig) {
            throw new Error("No ICP configuration found");
        }

        const targetJobTitles = JSON.parse(icpConfig.target_job_titles || "[]");

        console.log(
            `\n🎯 Starting LinkedIn search for: ${company.company_name}`
        );

        const contacts = await this.linkedinScraper.searchCompanyEmployees(
            company.company_name,
            targetJobTitles,
            15,
            true // Enable role verification for higher quality contacts
        );

        console.log(`\n💾 Saving ${contacts.length} contacts to database...`);

        const savedContacts = [];
        for (const contact of contacts) {
            const result = this.database.saveContact({
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
                const email = await this.ollama.generateAlternativeContactEmail(
                    company,
                    contact,
                    contact.persona
                );

                this.database.saveGeneratedEmail({
                    contact_id: contactId,
                    subject: email.subject,
                    body: email.body,
                });
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

        return savedContacts;
    }
}

export default LeadProcessor;
