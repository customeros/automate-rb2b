import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseService {
    constructor(dbPath) {
        // Ensure data directory exists
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new Database(dbPath);
        this.db.pragma("journal_mode = WAL");
        this.initializeSchema();
    }

    initializeSchema() {
        const schemaPath = path.join(__dirname, "../db/schema.sql");
        const schema = fs.readFileSync(schemaPath, "utf-8");
        this.db.exec(schema);
    }

    // ICP Config methods
    getActiveICPConfig() {
        return this.db
            .prepare(
                "SELECT * FROM icp_config WHERE is_active = 1 ORDER BY created_at DESC LIMIT 1"
            )
            .get();
    }

    saveICPConfig(config) {
        // Deactivate all existing configs
        this.db.prepare("UPDATE icp_config SET is_active = 0").run();

        const stmt = this.db.prepare(`
      INSERT INTO icp_config (name, industries, company_size_min, company_size_max, regions, target_job_titles, tech_stack, pain_points)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            config.name,
            JSON.stringify(config.industries),
            config.company_size_min,
            config.company_size_max,
            JSON.stringify(config.regions),
            JSON.stringify(config.target_job_titles),
            JSON.stringify(config.tech_stack),
            JSON.stringify(config.pain_points)
        );
    }

    // Webhook events
    saveWebhookEvent(eventId, payload) {
        const stmt = this.db.prepare(`
      INSERT INTO webhook_events (event_id, payload)
      VALUES (?, ?)
    `);
        return stmt.run(eventId, JSON.stringify(payload));
    }

    markWebhookProcessed(eventId) {
        const stmt = this.db.prepare(
            "UPDATE webhook_events SET processed = 1 WHERE event_id = ?"
        );
        return stmt.run(eventId);
    }

    // Company methods
    saveCompany(company) {
        const stmt = this.db.prepare(`
      INSERT INTO companies (
        webhook_event_id, company_name, company_domain, company_size, industry, region,
        icp_score, icp_tier, icp_explanation, buying_stage, buying_stage_explanation,
        intent_score, confidence_score, needs_linkedin_search
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            company.webhook_event_id,
            company.company_name,
            company.company_domain,
            company.company_size,
            company.industry,
            company.region,
            company.icp_score,
            company.icp_tier,
            company.icp_explanation,
            company.buying_stage,
            company.buying_stage_explanation,
            company.intent_score,
            company.confidence_score,
            company.needs_linkedin_search ? 1 : 0
        );
    }

    getCompanyById(id) {
        const company = this.db
            .prepare("SELECT * FROM companies WHERE id = ?")
            .get(id);
        if (!company) return null;

        // Get contacts for this company
        const contacts = this.db
            .prepare(
                "SELECT * FROM contacts WHERE company_id = ? ORDER BY created_at ASC"
            )
            .all(id);

        // Get visited pages for this company
        const visitedPages = this.db
            .prepare(
                "SELECT * FROM visited_pages WHERE company_id = ? ORDER BY visited_at DESC"
            )
            .all(id);

        return {
            ...company,
            contacts: contacts.map((contact) => ({
                ...contact,
                is_persona_match: Boolean(contact.is_persona_match),
            })),
            visited_pages: visitedPages,
        };
    }

    getAllCompanies(filters = {}) {
        let query = "SELECT * FROM companies WHERE 1=1";
        const params = [];

        if (filters.tier) {
            query += " AND icp_tier = ?";
            params.push(filters.tier);
        }

        if (filters.stage) {
            query += " AND buying_stage = ?";
            params.push(filters.stage);
        }

        if (filters.persona_match !== undefined) {
            // This requires a join with contacts table
            query += ` AND id IN (SELECT company_id FROM contacts WHERE is_persona_match = ?)`;
            params.push(filters.persona_match ? 1 : 0);
        }

        query += " ORDER BY created_at DESC";

        if (filters.limit) {
            query += " LIMIT ?";
            params.push(filters.limit);
        }

        const stmt = this.db.prepare(query);
        const companies = stmt.all(...params);

        // For each company, get contact summary
        return companies.map((company) => {
            const primaryContact = this.db
                .prepare(
                    "SELECT * FROM contacts WHERE company_id = ? AND contact_type = 'original' LIMIT 1"
                )
                .get(company.id);

            // Get contact counts and persona matches
            const contactStats = this.db
                .prepare(
                    `
                    SELECT 
                        COUNT(*) as total_contacts,
                        SUM(CASE WHEN is_persona_match = 1 THEN 1 ELSE 0 END) as matched_contacts,
                        SUM(CASE WHEN contact_type = 'enriched' THEN 1 ELSE 0 END) as enriched_contacts
                    FROM contacts 
                    WHERE company_id = ?
                `
                )
                .get(company.id);

            return {
                ...company,
                primary_contact: primaryContact
                    ? {
                          ...primaryContact,
                          is_persona_match: Boolean(
                              primaryContact.is_persona_match
                          ),
                      }
                    : null,
                contact_stats: contactStats || {
                    total_contacts: 0,
                    matched_contacts: 0,
                    enriched_contacts: 0,
                },
            };
        });
    }

    // Contact methods
    saveContact(contact) {
        const stmt = this.db.prepare(`
      INSERT INTO contacts (
        company_id, contact_name, contact_email, contact_title, contact_type,
        persona, persona_confidence, persona_reasoning, is_persona_match,
        profile_url, persona_fit_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

        return stmt.run(
            contact.company_id,
            contact.contact_name,
            contact.contact_email,
            contact.contact_title,
            contact.contact_type || "original",
            contact.persona,
            contact.persona_confidence,
            contact.persona_reasoning,
            contact.is_persona_match ? 1 : 0,
            contact.profile_url,
            contact.persona_fit_score
        );
    }

    getContactsByCompanyId(companyId) {
        return this.db
            .prepare(
                "SELECT * FROM contacts WHERE company_id = ? ORDER BY created_at ASC"
            )
            .all(companyId)
            .map((contact) => ({
                ...contact,
                is_persona_match: Boolean(contact.is_persona_match),
            }));
    }

    // Visited pages methods
    saveVisitedPages(companyId, pages) {
        const stmt = this.db.prepare(`
      INSERT INTO visited_pages (company_id, page_path, visited_at)
      VALUES (?, ?, ?)
    `);

        for (const page of pages) {
            stmt.run(
                companyId,
                page.path || page,
                page.timestamp || new Date().toISOString()
            );
        }
    }

    getVisitedPagesByCompanyId(companyId) {
        return this.db
            .prepare(
                "SELECT * FROM visited_pages WHERE company_id = ? ORDER BY visited_at DESC"
            )
            .all(companyId);
    }

    // Generated emails methods
    saveGeneratedEmail(email) {
        const stmt = this.db.prepare(`
      INSERT INTO generated_emails (contact_id, subject, body)
      VALUES (?, ?, ?)
    `);

        return stmt.run(email.contact_id, email.subject, email.body);
    }

    getEmailsByContactId(contactId) {
        return this.db
            .prepare("SELECT * FROM generated_emails WHERE contact_id = ?")
            .all(contactId);
    }

    getEmailsByCompanyId(companyId) {
        return this.db
            .prepare(
                `
                SELECT ge.*, c.contact_name, c.contact_title, c.contact_type
                FROM generated_emails ge
                JOIN contacts c ON ge.contact_id = c.id
                WHERE c.company_id = ?
                ORDER BY ge.created_at DESC
            `
            )
            .all(companyId);
    }

    // Migration helper - convert old leads to new structure
    migrateFromV1() {
        console.log("🔄 Migrating from v1 to v2 schema...");

        // This would be implemented to migrate existing data
        // For now, we'll start fresh with the new schema
        console.log("✅ Migration complete (starting fresh)");
    }

    close() {
        this.db.close();
    }
}

export default DatabaseService;
