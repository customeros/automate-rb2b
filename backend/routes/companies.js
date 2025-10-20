import express from "express";

function createCompaniesRouter(database, leadProcessor) {
    const router = express.Router();

    // Get all companies with optional filters
    router.get("/", async (req, res) => {
        try {
            const filters = {
                tier: req.query.tier,
                stage: req.query.stage,
                persona_match:
                    req.query.persona_match === "true"
                        ? true
                        : req.query.persona_match === "false"
                        ? false
                        : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            };

            const companies = database.getAllCompanies(filters);

            res.json({
                success: true,
                companies: companies,
                count: companies.length,
            });
        } catch (error) {
            console.error("Error fetching companies:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // Get company by ID with full details
    router.get("/:id", async (req, res) => {
        try {
            const companyId = parseInt(req.params.id);
            const company = database.getCompanyById(companyId);

            if (!company) {
                return res.status(404).json({
                    success: false,
                    error: "Company not found",
                });
            }

            // Get emails for all contacts in this company
            const emails = database.getEmailsByCompanyId(companyId);

            res.json({
                success: true,
                company: company,
                emails: emails,
            });
        } catch (error) {
            console.error("Error fetching company:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // Scrape LinkedIn for a company
    router.post("/:id/scrape-linkedin", async (req, res) => {
        try {
            const companyId = parseInt(req.params.id);

            console.log(
                `\n🎯 Starting LinkedIn search for company ID: ${companyId}`
            );

            const contacts = await leadProcessor.scrapeLinkedInForCompany(
                companyId
            );

            res.json({
                success: true,
                contacts: contacts,
                message: `Found ${contacts.length} contacts matching your target personas`,
            });
        } catch (error) {
            console.error("Error scraping LinkedIn:", error);
            res.status(500).json({
                success: false,
                error: error.message,
                details: "Check server logs for more information",
            });
        }
    });

    // Get contacts for a company
    router.get("/:id/contacts", async (req, res) => {
        try {
            const companyId = parseInt(req.params.id);
            const contacts = database.getContactsByCompanyId(companyId);

            res.json({
                success: true,
                contacts: contacts,
            });
        } catch (error) {
            console.error("Error fetching contacts:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    // Get visited pages for a company
    router.get("/:id/pages", async (req, res) => {
        try {
            const companyId = parseInt(req.params.id);
            const pages = database.getVisitedPagesByCompanyId(companyId);

            res.json({
                success: true,
                pages: pages,
            });
        } catch (error) {
            console.error("Error fetching pages:", error);
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    });

    return router;
}

export default createCompaniesRouter;
