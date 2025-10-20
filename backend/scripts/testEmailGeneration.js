import OllamaService from "../services/ollama.js";

const ollama = new OllamaService("http://localhost:11434", "gemma3:12b");

async function testEmailGeneration() {
    console.log("🧪 Testing email generation for alternative contacts...");

    // Mock lead data
    const lead = {
        company_name: "Shopify",
        contact_name: "Michael Chen",
        contact_title: "Senior QA Engineer",
        visited_pages: [
            { path: "/blog/automated-testing" },
            { path: "/documentation/getting-started" },
            { path: "/features/ci-cd" },
        ],
        buying_stage: "Evaluate",
    };

    // Mock alternative contact
    const contact = {
        name: "Sarah Johnson",
        title: "VP Engineering",
        persona: "Economic Buyer",
    };

    try {
        console.log("\n📧 Generating email for alternative contact...");
        console.log(
            `Original contact: ${lead.contact_name} (${lead.contact_title})`
        );
        console.log(`Alternative contact: ${contact.name} (${contact.title})`);

        const email = await ollama.generateAlternativeContactEmail(
            lead,
            contact,
            contact.persona
        );

        console.log("\n✅ Generated email:");
        console.log(`Subject: ${email.subject}`);
        console.log(`Body: ${email.body}`);
    } catch (error) {
        console.error("❌ Error generating email:", error.message);
    }
}

testEmailGeneration();
