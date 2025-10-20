import LinkedInScraper from "../services/linkedinScraper.js";
import OllamaService from "../services/ollama.js";

const ollama = new OllamaService("http://localhost:11434", "gemma3:12b");
const scraper = new LinkedInScraper(ollama);

async function testRoleVerification() {
    console.log("🧪 Testing LinkedIn role verification for Shopify...");
    console.log(
        "💡 This will verify that contacts actually work at Shopify, not just have board positions"
    );

    try {
        const contacts = await scraper.searchCompanyEmployees(
            "Shopify",
            ["VP Engineering", "CTO", "Engineering Manager"],
            3 // Limit to 3 for testing
        );

        console.log(
            `\n✅ Search completed! Found ${contacts.length} verified contacts:`
        );
        contacts.forEach((contact, index) => {
            console.log(
                `  ${index + 1}. ${contact.name} - ${
                    contact.verifiedRole || contact.title
                }`
            );
            console.log(
                `     Company: ${contact.verifiedCompany || "Unknown"}`
            );
            console.log(`     Verified: ${contact.isVerified ? "Yes" : "No"}`);
            if (contact.reason) {
                console.log(`     Reason: ${contact.reason}`);
            }
        });
    } catch (error) {
        console.error("❌ Error during LinkedIn search:", error.message);
    } finally {
        await scraper.close();
    }
}

testRoleVerification();
