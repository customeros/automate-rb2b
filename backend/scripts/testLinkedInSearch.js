import LinkedInScraper from "../services/linkedinScraper.js";
import OllamaService from "../services/ollama.js";

const ollama = new OllamaService("http://localhost:11434", "gemma3:12b");
const scraper = new LinkedInScraper(ollama);

async function testLinkedInSearch() {
    console.log("🧪 Testing LinkedIn search for Shopify...");
    console.log(
        "💡 Note: This will reuse your existing LinkedIn login session"
    );
    console.log(
        "   If you're not logged in, you'll need to log in manually in the browser window\n"
    );

    try {
        const contacts = await scraper.searchCompanyEmployees(
            "Shopify",
            ["VP Engineering", "CTO", "Engineering Manager"],
            5
        );

        console.log(
            `\n✅ Search completed! Found ${contacts.length} contacts:`
        );
        contacts.forEach((contact, index) => {
            console.log(`  ${index + 1}. ${contact.name} - ${contact.title}`);
        });
    } catch (error) {
        console.error("❌ Error during LinkedIn search:", error.message);
        console.log("\n💡 Troubleshooting tips:");
        console.log(
            "   1. Make sure you're logged into LinkedIn in the browser window"
        );
        console.log("   2. Complete any verification challenges that appear");
        console.log("   3. Try running the test again after logging in");
    } finally {
        // Don't close the browser to maintain the session
        console.log(
            "\n🔒 Browser session kept open to maintain LinkedIn login"
        );
        console.log("   Run the test again to reuse the same session");
    }
}

testLinkedInSearch();
