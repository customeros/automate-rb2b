import express from "express";

const createWebhookRouter = (database, leadProcessor) => {
    const router = express.Router();

    // RB2B webhook endpoint
    router.post("/rb2b", async (req, res) => {
        try {
            console.log("\n📨 Received RB2B webhook:");
            console.log(JSON.stringify(req.body, null, 2));

            // Process the webhook data
            const result = await leadProcessor.processWebhookEvent(req.body);

            res.json({
                success: true,
                message: "Webhook processed successfully",
                company_id: result.companyId,
            });
        } catch (error) {
            console.error("❌ Error processing webhook:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    return router;
};

export default createWebhookRouter;