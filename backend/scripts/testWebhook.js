import axios from "axios";

const testWebhook = {
    id: `test-${Date.now()}`,
    company_domain: "test-company.com",
    company_name: "Test Company Inc",
    contact_name: "John Doe",
    contact_email: "john.doe@test-company.com",
    contact_title: "VP Engineering",
    visited_pages: [
        { path: "/pricing", timestamp: new Date().toISOString() },
        { path: "/features", timestamp: new Date().toISOString() },
        { path: "/documentation", timestamp: new Date().toISOString() },
        {
            path: "/integrations/kubernetes",
            timestamp: new Date().toISOString(),
        },
        { path: "/case-studies", timestamp: new Date().toISOString() },
    ],
};

console.log("Sending test webhook to http://localhost:3001/api/webhook/rb2b");
console.log("Payload:", JSON.stringify(testWebhook, null, 2));

axios
    .post("http://localhost:3001/api/webhook/rb2b", testWebhook)
    .then((response) => {
        console.log("\n✓ Webhook sent successfully!");
        console.log("Response:", response.data);
    })
    .catch((error) => {
        console.error("\n✗ Error sending webhook:");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error(error.message);
        }
    });

