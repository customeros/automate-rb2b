import DatabaseService from "./database.js";
import OllamaService from "./ollama.js";
import LeadProcessor from "./leadProcessor.js";

class AutoSeeder {
    constructor(database, ollama, leadProcessor) {
        this.database = database;
        this.ollama = ollama;
        this.leadProcessor = leadProcessor;
    }

    async seedIfEmpty() {
        try {
            // Check if we already have leads
            const existingLeads = this.database.getAllLeads();
            if (existingLeads.length > 0) {
                console.log(
                    `📊 Database already has ${existingLeads.length} leads, skipping auto-seed`
                );
                return;
            }

            console.log("🌱 Auto-seeding database with diverse demo data...");

            // Ensure we have an ICP configuration
            let icpConfig = this.database.getActiveICPConfig();
            if (!icpConfig) {
                console.log("📋 Creating default ICP configuration...");
                const defaultICP = {
                    name: "Demo ICP Configuration",
                    industries: ["SaaS", "Technology", "E-commerce", "FinTech"],
                    company_size_min: 50,
                    company_size_max: 500,
                    regions: ["North America", "Europe", "APAC"],
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
                this.database.saveICPConfig(defaultICP);
                icpConfig = this.database.getActiveICPConfig();
            }

            // Create diverse demo leads
            const demoLeads = this.createDiverseDemoLeads();

            console.log(
                `📝 Creating ${demoLeads.length} diverse demo leads...`
            );

            for (let i = 0; i < demoLeads.length; i++) {
                const lead = demoLeads[i];
                console.log(
                    `  ${i + 1}. ${lead.company_name} - ${
                        lead.contact_title
                    } (${lead.persona})`
                );

                // Save the lead
                this.database.saveLead(lead);

                // Generate email for this lead
                try {
                    const email = await this.ollama.generateOutreachEmail(
                        lead,
                        lead.buying_stage,
                        lead.persona
                    );

                    this.database.saveGeneratedEmail({
                        lead_id: i + 1,
                        contact_id: null,
                        contact_type: "original",
                        subject: email.subject,
                        body: email.body,
                    });
                } catch (emailError) {
                    console.log(
                        `    ⚠️  Could not generate email (Ollama not available): ${emailError.message}`
                    );
                    // Use fallback email
                    this.database.saveGeneratedEmail({
                        lead_id: i + 1,
                        contact_id: null,
                        contact_type: "original",
                        subject: `Exploring ${lead.company_name}'s testing needs`,
                        body: `Hi ${lead.contact_name},\n\nI noticed your team at ${lead.company_name} has been exploring testing solutions. I'd love to discuss how we can help streamline your testing workflows.\n\nBest regards,\nYour Name`,
                    });
                }
            }

            console.log("✅ Auto-seeding complete! Demo data is ready.");
            console.log(
                "🎯 You now have diverse leads showing different persona matches, ICP fits, and buying stages."
            );
        } catch (error) {
            console.error("❌ Error during auto-seeding:", error.message);
        }
    }

    createDiverseDemoLeads() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

        return [
            // Lead 1: Perfect ICP + Persona Match + High Intent
            {
                webhook_event_id: null,
                company_name: "Stripe",
                company_domain: "stripe.com",
                contact_name: "Sarah Johnson",
                contact_email: "sarah.johnson@stripe.com",
                contact_title: "VP Engineering",
                visited_pages: [
                    { path: "/pricing", timestamp: oneDayAgo.toISOString() },
                    {
                        path: "/features/enterprise",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    {
                        path: "/case-studies/fintech",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    { path: "/security", timestamp: oneDayAgo.toISOString() },
                ],
                icp_score: 95,
                icp_tier: "A",
                icp_explanation:
                    "Perfect fit: Large fintech company, 1000+ employees, strong engineering culture, target industry",
                persona: "Economic Buyer",
                persona_confidence: 0.95,
                persona_reasoning:
                    "VP level viewing pricing and security indicates buying authority and budget control",
                buying_stage: "Evaluate",
                intent_score: 3,
                next_action:
                    "Schedule executive meeting to discuss contract terms and implementation timeline",
                confidence_score: 0.92,
                is_persona_match: true,
                needs_linkedin_search: false,
            },

            // Lead 2: Good ICP + No Persona Match + Medium Intent
            {
                webhook_event_id: null,
                company_name: "Shopify",
                company_domain: "shopify.com",
                contact_name: "Michael Chen",
                contact_email: "michael.chen@shopify.com",
                contact_title: "Senior QA Engineer",
                visited_pages: [
                    {
                        path: "/blog/automated-testing",
                        timestamp: twoDaysAgo.toISOString(),
                    },
                    {
                        path: "/documentation/getting-started",
                        timestamp: twoDaysAgo.toISOString(),
                    },
                    {
                        path: "/features/ci-cd",
                        timestamp: twoDaysAgo.toISOString(),
                    },
                ],
                icp_score: 85,
                icp_tier: "B",
                icp_explanation:
                    "Good fit: E-commerce tech leader, right size, but contact is not decision maker",
                persona: "Researcher",
                persona_confidence: 0.85,
                persona_reasoning:
                    "Senior engineer reading educational content, likely in discovery phase",
                buying_stage: "Educate",
                intent_score: 1,
                next_action:
                    "Send educational content series on testing best practices and find decision maker",
                confidence_score: 0.75,
                is_persona_match: false,
                needs_linkedin_search: true,
            },

            // Lead 3: Excellent ICP + Persona Match + High Intent
            {
                webhook_event_id: null,
                company_name: "HubSpot",
                company_domain: "hubspot.com",
                contact_name: "Emily Rodriguez",
                contact_email: "emily.rodriguez@hubspot.com",
                contact_title: "DevOps Lead",
                visited_pages: [
                    {
                        path: "/integrations/kubernetes",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    { path: "/pricing", timestamp: oneDayAgo.toISOString() },
                    {
                        path: "/case-studies/saas",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    {
                        path: "/documentation/api",
                        timestamp: oneDayAgo.toISOString(),
                    },
                ],
                icp_score: 92,
                icp_tier: "A",
                icp_explanation:
                    "Excellent fit: SaaS company, strong technical team, active buyer journey",
                persona: "Technical Evaluator",
                persona_confidence: 0.92,
                persona_reasoning:
                    "DevOps lead checking integrations and pricing suggests active evaluation",
                buying_stage: "Evaluate",
                intent_score: 3,
                next_action:
                    "Offer technical proof-of-concept and implementation support",
                confidence_score: 0.91,
                is_persona_match: true,
                needs_linkedin_search: false,
            },

            // Lead 4: Medium ICP + Persona Match + Low Intent
            {
                webhook_event_id: null,
                company_name: "Atlassian",
                company_domain: "atlassian.com",
                contact_name: "David Park",
                contact_email: "david.park@atlassian.com",
                contact_title: "Engineering Manager",
                visited_pages: [
                    {
                        path: "/features/load-testing",
                        timestamp: threeDaysAgo.toISOString(),
                    },
                    {
                        path: "/documentation/api",
                        timestamp: threeDaysAgo.toISOString(),
                    },
                ],
                icp_score: 75,
                icp_tier: "B",
                icp_explanation:
                    "Medium fit: Enterprise software company with technical needs, but larger than ideal",
                persona: "Technical Evaluator",
                persona_confidence: 0.8,
                persona_reasoning:
                    "Manager exploring technical features indicates hands-on evaluation",
                buying_stage: "Explore",
                intent_score: 2,
                next_action:
                    "Share technical resources and offer architecture review",
                confidence_score: 0.7,
                is_persona_match: true,
                needs_linkedin_search: false,
            },

            // Lead 5: Perfect ICP + Persona Match + Very High Intent
            {
                webhook_event_id: null,
                company_name: "Datadog",
                company_domain: "datadog.com",
                contact_name: "Alex Kumar",
                contact_email: "alex.kumar@datadog.com",
                contact_title: "CTO",
                visited_pages: [
                    {
                        path: "/pricing/enterprise",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    { path: "/security", timestamp: oneDayAgo.toISOString() },
                    {
                        path: "/case-studies/saas",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    {
                        path: "/integrations/kubernetes",
                        timestamp: oneDayAgo.toISOString(),
                    },
                    {
                        path: "/contact/sales",
                        timestamp: oneDayAgo.toISOString(),
                    },
                ],
                icp_score: 98,
                icp_tier: "A",
                icp_explanation:
                    "Perfect fit: Monitoring/observability SaaS, technical leadership engaged, ideal size",
                persona: "Economic Buyer",
                persona_confidence: 0.98,
                persona_reasoning:
                    "C-level viewing enterprise pricing and security indicates strong purchase intent",
                buying_stage: "Purchase",
                intent_score: 3,
                next_action:
                    "Schedule executive meeting to discuss contract terms and implementation",
                confidence_score: 0.96,
                is_persona_match: true,
                needs_linkedin_search: false,
            },
        ];
    }
}

export default AutoSeeder;
