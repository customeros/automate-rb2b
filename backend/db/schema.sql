-- ICP Configuration Table
CREATE TABLE IF NOT EXISTS icp_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    industries TEXT, -- JSON array
    company_size_min INTEGER,
    company_size_max INTEGER,
    regions TEXT, -- JSON array
    target_job_titles TEXT, -- JSON array
    tech_stack TEXT, -- JSON array
    pain_points TEXT, -- JSON array
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Webhook Events Table
CREATE TABLE IF NOT EXISTS webhook_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id TEXT UNIQUE,
    payload TEXT NOT NULL, -- Full JSON payload
    received_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    processed INTEGER DEFAULT 0
);

-- Companies Table (Primary Entity)
CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webhook_event_id INTEGER,
    company_name TEXT NOT NULL,
    company_domain TEXT,
    company_size INTEGER,
    industry TEXT,
    region TEXT,
    icp_score INTEGER,
    icp_tier TEXT, -- A, B, C, D
    icp_explanation TEXT,
    buying_stage TEXT, -- Educate, Explore, Evaluate, Purchase
    buying_stage_explanation TEXT,
    intent_score INTEGER,
    confidence_score REAL,
    needs_linkedin_search INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (webhook_event_id) REFERENCES webhook_events(id)
);

-- Contacts Table (Associated with Companies)
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_title TEXT,
    contact_type TEXT DEFAULT 'original', -- 'original', 'enriched'
    persona TEXT, -- Economic Buyer, Technical Evaluator, Researcher, Other
    persona_confidence REAL,
    persona_reasoning TEXT,
    is_persona_match INTEGER DEFAULT 0,
    profile_url TEXT, -- For LinkedIn contacts
    persona_fit_score REAL, -- For LinkedIn contacts
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Visited Pages Table (Associated with Companies)
CREATE TABLE IF NOT EXISTS visited_pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    page_path TEXT NOT NULL,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);

-- Generated Emails Table (Associated with Contacts)
CREATE TABLE IF NOT EXISTS generated_emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contact_id INTEGER NOT NULL,
    subject TEXT,
    body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(company_domain);
CREATE INDEX IF NOT EXISTS idx_companies_tier ON companies(icp_tier);
CREATE INDEX IF NOT EXISTS idx_companies_stage ON companies(buying_stage);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_persona_match ON contacts(is_persona_match);
CREATE INDEX IF NOT EXISTS idx_visited_pages_company ON visited_pages(company_id);
CREATE INDEX IF NOT EXISTS idx_webhook_processed ON webhook_events(processed);
