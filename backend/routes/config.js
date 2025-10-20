import express from "express";

const router = express.Router();

export default function createConfigRouter(database) {
    // Get active ICP configuration
    router.get("/icp", (req, res) => {
        try {
            const config = database.getActiveICPConfig();

            if (!config) {
                return res.json({ success: true, config: null });
            }

            // Parse JSON fields
            const parsedConfig = {
                ...config,
                industries: JSON.parse(config.industries || "[]"),
                regions: JSON.parse(config.regions || "[]"),
                target_job_titles: JSON.parse(config.target_job_titles || "[]"),
                tech_stack: JSON.parse(config.tech_stack || "[]"),
                pain_points: JSON.parse(config.pain_points || "[]"),
            };

            res.json({ success: true, config: parsedConfig });
        } catch (error) {
            console.error("Error fetching ICP config:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    // Save ICP configuration
    router.post("/icp", (req, res) => {
        try {
            const config = req.body;
            database.saveICPConfig(config);
            res.json({ success: true, message: "ICP configuration saved" });
        } catch (error) {
            console.error("Error saving ICP config:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    });

    return router;
}

