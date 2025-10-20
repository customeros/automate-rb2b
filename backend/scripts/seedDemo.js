import DatabaseService from "../services/database.js";
import dotenv from "dotenv";

dotenv.config();

const db = new DatabaseService(
    process.env.DATABASE_PATH || "./data/companies.db"
);

// Seed demo ICP configuration
const demoICP = {
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
    tech_stack: ["AWS", "Kubernetes", "Docker", "React", "Node.js", "Python"],
    pain_points: [
        "Testing complexity",
        "CI/CD bottlenecks",
        "Quality assurance",
        "Performance testing",
        "Load testing",
    ],
};

console.log("Seeding demo ICP configuration...");
db.saveICPConfig(demoICP);
console.log("✓ ICP configuration saved");

// Seed demo companies with multiple contacts
const demoCompanies = [
    {
        company_name: "Stripe",
        company_domain: "stripe.com",
        company_size: 1000,
        industry: "FinTech",
        region: "North America",
        icp_score: 95,
        icp_tier: "A",
        icp_explanation:
            "Perfect fit: Large fintech company, 1000+ employees, strong engineering culture, target industry",
        buying_stage: "Evaluate",
        buying_stage_explanation:
            "Viewing pricing, enterprise features, and security pages indicates active evaluation of solutions with budget approval",
        intent_score: 3,
        confidence_score: 0.92,
        needs_linkedin_search: false,
        contacts: [
            {
                contact_name: "Sarah Johnson",
                contact_email: "sarah.johnson@stripe.com",
                contact_title: "VP Engineering",
                persona: "Economic Buyer",
                persona_confidence: 0.95,
                persona_reasoning:
                    "VP level viewing pricing and security indicates buying authority and budget control",
                is_persona_match: true,
            },
            {
                contact_name: "Michael Chen",
                contact_email: "michael.chen@stripe.com",
                contact_title: "Senior Software Engineer",
                persona: "Researcher",
                persona_confidence: 0.75,
                persona_reasoning:
                    "Senior engineer reading educational content, likely in discovery phase",
                is_persona_match: false,
            },
        ],
        visited_pages: [
            {
                path: "/pricing",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/features/enterprise",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/case-studies/fintech",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/security",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
        ],
    },
    {
        company_name: "Shopify",
        company_domain: "shopify.com",
        company_size: 500,
        industry: "E-commerce",
        region: "North America",
        icp_score: 85,
        icp_tier: "B",
        icp_explanation:
            "Good fit: E-commerce tech leader, right size, but contact is not decision maker",
        buying_stage: "Educate",
        buying_stage_explanation:
            "Reading blog posts and documentation suggests early research phase, learning about automated testing concepts",
        intent_score: 1,
        confidence_score: 0.75,
        needs_linkedin_search: true,
        contacts: [
            {
                contact_name: "Emily Rodriguez",
                contact_email: "emily.rodriguez@shopify.com",
                contact_title: "Senior QA Engineer",
                persona: "Researcher",
                persona_confidence: 0.85,
                persona_reasoning:
                    "Senior engineer reading educational content, likely in discovery phase",
                is_persona_match: false,
            },
        ],
        visited_pages: [
            {
                path: "/blog/automated-testing",
                timestamp: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/documentation/getting-started",
                timestamp: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/features/ci-cd",
                timestamp: new Date(
                    Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
            },
        ],
    },
    {
        company_name: "HubSpot",
        company_domain: "hubspot.com",
        company_size: 300,
        industry: "SaaS",
        region: "North America",
        icp_score: 92,
        icp_tier: "A",
        icp_explanation:
            "Excellent fit: SaaS company, strong technical team, active buyer journey",
        buying_stage: "Evaluate",
        buying_stage_explanation:
            "Exploring Kubernetes integrations, pricing, and API documentation shows hands-on technical evaluation in progress",
        intent_score: 3,
        confidence_score: 0.91,
        needs_linkedin_search: false,
        contacts: [
            {
                contact_name: "David Park",
                contact_email: "david.park@hubspot.com",
                contact_title: "DevOps Lead",
                persona: "Technical Evaluator",
                persona_confidence: 0.92,
                persona_reasoning:
                    "DevOps lead checking integrations and pricing suggests active evaluation",
                is_persona_match: true,
            },
        ],
        visited_pages: [
            {
                path: "/integrations/kubernetes",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/pricing",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/case-studies/saas",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/documentation/api",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
        ],
    },
    {
        company_name: "Atlassian",
        company_domain: "atlassian.com",
        company_size: 800,
        industry: "Productivity Software",
        region: "APAC",
        icp_score: 75,
        icp_tier: "B",
        icp_explanation:
            "Medium fit: Enterprise software company with technical needs, but larger than ideal",
        buying_stage: "Explore",
        buying_stage_explanation:
            "Browsing load testing features and API docs indicates early exploration of testing solutions",
        intent_score: 2,
        confidence_score: 0.7,
        needs_linkedin_search: false,
        contacts: [
            {
                contact_name: "Alex Kumar",
                contact_email: "alex.kumar@atlassian.com",
                contact_title: "Engineering Manager",
                persona: "Technical Evaluator",
                persona_confidence: 0.8,
                persona_reasoning:
                    "Manager exploring technical features indicates hands-on evaluation",
                is_persona_match: true,
            },
        ],
        visited_pages: [
            {
                path: "/features/load-testing",
                timestamp: new Date(
                    Date.now() - 3 * 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/documentation/api",
                timestamp: new Date(
                    Date.now() - 3 * 24 * 60 * 60 * 1000
                ).toISOString(),
            },
        ],
    },
    {
        company_name: "Datadog",
        company_domain: "datadog.com",
        company_size: 200,
        industry: "Monitoring/Observability",
        region: "North America",
        icp_score: 98,
        icp_tier: "A",
        icp_explanation:
            "Perfect fit: Monitoring/observability SaaS, technical leadership engaged, ideal size",
        buying_stage: "Purchase",
        buying_stage_explanation:
            "CTO viewing enterprise pricing, security docs, and sales contact page shows strong buying intent with decision-making authority",
        intent_score: 3,
        confidence_score: 0.96,
        needs_linkedin_search: false,
        contacts: [
            {
                contact_name: "Lisa Wang",
                contact_email: "lisa.wang@datadog.com",
                contact_title: "CTO",
                persona: "Economic Buyer",
                persona_confidence: 0.98,
                persona_reasoning:
                    "C-level viewing enterprise pricing and security indicates strong purchase intent",
                is_persona_match: true,
            },
        ],
        visited_pages: [
            {
                path: "/pricing/enterprise",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/security",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/case-studies/saas",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/integrations/kubernetes",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
            {
                path: "/contact/sales",
                timestamp: new Date(
                    Date.now() - 24 * 60 * 60 * 1000
                ).toISOString(),
            },
        ],
    },
];

console.log("\nSeeding demo companies...");
for (let i = 0; i < demoCompanies.length; i++) {
    const companyData = demoCompanies[i];

    // Save company
    const companyResult = db.saveCompany(companyData);
    const companyId = companyResult.lastInsertRowid;

    console.log(`✓ Company ${i + 1} saved: ${companyData.company_name}`);

    // Save visited pages
    if (companyData.visited_pages && companyData.visited_pages.length > 0) {
        db.saveVisitedPages(companyId, companyData.visited_pages);
    }

    // Save contacts
    for (const contactData of companyData.contacts) {
        const contactResult = db.saveContact({
            company_id: companyId,
            ...contactData,
            contact_type: "original",
        });

        // Generate demo email for this contact
        const sampleEmails = [
            {
                subject: "Streamlining Stripe's testing workflows",
                body: `Hi ${contactData.contact_name},\n\nI noticed you've been exploring our testing platform. Given Stripe's scale and engineering excellence, I'd love to discuss how we can help streamline your testing workflows.\n\nWould you be interested in a quick technical deep-dive? We've helped similar companies reduce testing time by 60%.\n\nBest,\nYour Name`,
            },
            {
                subject: "Testing best practices for your team",
                body: `Hi ${contactData.contact_name},\n\nI saw you were reading about automated testing approaches. I wanted to share a few resources that might be helpful:\n\n- Our guide on modern testing strategies\n- Case study from a similar e-commerce platform\n\nNo pressure - just thought these might be useful for your research!\n\nCheers,\nYour Name`,
            },
            {
                subject: "Kubernetes integration for your testing needs",
                body: `Hi ${contactData.contact_name},\n\nNoticed you checked out our Kubernetes integration. Happy to walk you through a proof-of-concept setup for your infrastructure.\n\nI can also share some performance benchmarks from similar deployments. When works for a quick call?\n\nBest regards,\nYour Name`,
            },
            {
                subject: "Load testing resources for your team",
                body: `Hi ${contactData.contact_name},\n\nSaw you exploring our load testing capabilities. I've put together some technical documentation that might help:\n\n- API integration guide\n- Sample test configurations\n- Architecture recommendations\n\nHappy to answer any technical questions!\n\nBest,\nYour Name`,
            },
            {
                subject: "Enterprise testing solution for Datadog",
                body: `Hi ${contactData.contact_name},\n\nI understand you're evaluating enterprise testing solutions. I'd love to discuss:\n\n- Our security & compliance approach\n- ROI case studies from similar SaaS companies\n- Implementation timeline & support\n\nWhen would be convenient for a brief executive overview?\n\nBest regards,\nYour Name`,
            },
        ];

        const emailIndex = Math.min(i, sampleEmails.length - 1);
        db.saveGeneratedEmail({
            contact_id: contactResult.lastInsertRowid,
            subject: sampleEmails[emailIndex].subject,
            body: sampleEmails[emailIndex].body,
        });
    }
}

db.close();
console.log("\n✓ Demo data seeding complete!");
console.log(
    "🎯 You now have company-based data with multiple contacts per company"
);
console.log("🚀 Start the server with: npm run dev");
