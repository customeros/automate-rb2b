# Architecture Documentation

## System Overview

The RB2B Lead Actionability System is a full-stack application that processes website visitor data from RB2B, scores leads against your Ideal Customer Profile (ICP), identifies buyer personas, finds alternative contacts, and generates personalized outreach emails.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         RB2B Webhook                            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (Node.js/Express)                    │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Webhook    │───▶│     Lead     │───▶│   Database   │      │
│  │   Handler    │    │  Processor   │    │   (SQLite)   │      │
│  └──────────────┘    └──────┬───────┘    └──────────────┘      │
│                              │                                    │
│                              ▼                                    │
│                      ┌──────────────┐                            │
│                      │    Ollama    │                            │
│                      │   Service    │                            │
│                      └──────┬───────┘                            │
│                              │                                    │
│                    ┌─────────┴─────────┐                         │
│                    ▼                   ▼                         │
│           ┌─────────────┐      ┌──────────────┐                │
│           │  ICP Scoring │      │   LinkedIn   │                │
│           │   Persona    │      │   Scraper    │                │
│           │   Detection  │      │ (Puppeteer)  │                │
│           │   Email Gen  │      └──────────────┘                │
│           └─────────────┘                                        │
│                                                                   │
│                    REST API Endpoints                            │
│  /api/webhook/rb2b  /api/leads  /api/config  /api/health       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vite)                         │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  Dashboard   │    │ ICP Config   │    │ Lead Detail  │      │
│  │   (List)     │    │   (Form)     │    │   (View)     │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│                                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  LeadCard    │    │ ScoreGauge   │    │EmailPreview  │      │
│  │ (Component)  │    │ (Component)  │    │ (Component)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Webhook Reception

```
RB2B → POST /api/webhook/rb2b → Express Handler
                                     ↓
                            Store Raw Event → SQLite
                                     ↓
                            Trigger Async Processing
```

### 2. Lead Processing Pipeline

```
1. Extract Company Info
   ↓
2. Score ICP Fit (Ollama)
   ├─ < 50 score? → SUPPRESS
   └─ ≥ 50 score? → Continue
                     ↓
3. Infer Persona (Ollama)
   - Economic Buyer
   - Technical Evaluator
   - Researcher
   - Other
                     ↓
4. Determine Buying Stage (Ollama)
   - Educate (Intent: 1)
   - Explore (Intent: 2)
   - Evaluate (Intent: 3)
   - Purchase (Intent: 3)
                     ↓
5. Check Persona Match
   ├─ Match? → Save Lead + Generate Email
   └─ No Match? → LinkedIn Search
                     ↓
6. LinkedIn Scraping (if needed)
   - Search company employees
   - Filter by target job titles
   - Score persona fit
   - Save enriched contacts
                     ↓
7. Generate Emails (Ollama)
   - Original contact email
   - Enriched contacts emails
   - Stage-appropriate messaging
```

### 3. Data Persistence

```
SQLite Database
├── icp_config         (ICP criteria)
├── webhook_events     (Raw webhook data)
├── leads              (Processed leads with scores)
├── enriched_contacts  (LinkedIn contacts)
└── generated_emails   (Outreach emails)
```

## Core Services

### OllamaService

**Purpose**: AI-powered analysis using local LLM

**Methods**:

-   `scoreICPFit(companyInfo, icpConfig)` - Returns 0-100 score + tier (A/B/C/D)
-   `inferPersona(visitedPages)` - Classifies visitor persona
-   `inferBuyingStage(visitedPages)` - Determines journey stage
-   `generateOutreachEmail(lead, stage, persona)` - Creates personalized email
-   `scorePersonaFit(jobTitle, targetPersonas)` - Scores job title match

**Prompting Strategy**:

-   Structured JSON responses with `format: 'json'`
-   Context-rich prompts with examples
-   Fallback handling for parsing errors

### LinkedInScraper

**Purpose**: Find alternative contacts at target companies

**Flow**:

1. Launch Puppeteer browser (non-headless for login)
2. Navigate to LinkedIn people search
3. Wait for user login (if needed)
4. Extract employee data (name, title, profile URL)
5. Score each contact's persona fit
6. Return sorted list by fit score

**Considerations**:

-   Requires user LinkedIn login
-   Persists session in `./linkedin-session`
-   Rate limiting to avoid blocks
-   Graceful error handling

### DatabaseService

**Purpose**: SQLite data persistence

**Key Methods**:

-   `getActiveICPConfig()` - Retrieve current ICP
-   `saveICPConfig(config)` - Store new ICP (deactivates old)
-   `saveLead(lead)` - Insert processed lead
-   `getAllLeads(filters)` - Query leads with filters
-   `getLeadById(id)` - Fetch lead details
-   `saveEnrichedContact(contact)` - Store LinkedIn contact
-   `saveGeneratedEmail(email)` - Store generated email

### LeadProcessor

**Purpose**: Orchestrate the full processing pipeline

**Process**:

1. Validate ICP configuration exists
2. Call Ollama for ICP scoring
3. Suppress if score < 50 or tier D
4. Call Ollama for persona inference
5. Call Ollama for buying stage detection
6. Suppress if intent score = 0
7. Check persona match
8. Save lead to database
9. Generate email for original contact
10. If no persona match, trigger LinkedIn scraper
11. Generate emails for enriched contacts

## Frontend Architecture

### Pages

-   **Dashboard** (`/`) - Lead list with filters and actions
-   **ICP Config** (`/config`) - Dynamic ICP configuration form
-   **Lead Detail** (`/leads/:id`) - Detailed lead view with journey

### Components

-   **LeadCard** - Lead summary card with key metrics
-   **ScoreGauge** - Visual ICP score indicator
-   **EmailPreview** - Generated email display with copy
-   **HealthCheck** - System status indicator
-   **OnboardingWizard** - First-run setup experience

### State Management

-   React hooks (`useState`, `useEffect`)
-   No global state library (yet)
-   API calls via Axios client

### Routing

-   React Router v6
-   Client-side routing
-   Navigate programmatically with `useNavigate`

## API Endpoints

### Webhook

-   `POST /api/webhook/rb2b` - Receive RB2B webhook

### Leads

-   `GET /api/leads` - List all leads (with filters)
-   `GET /api/leads/:id` - Get lead details
-   `POST /api/leads/:id/rescore` - Re-process lead
-   `POST /api/scrape-linkedin/:leadId` - Trigger LinkedIn search

### Configuration

-   `GET /api/config/icp` - Get active ICP config
-   `POST /api/config/icp` - Save ICP config

### System

-   `GET /api/health` - Health check status

## Deployment Considerations

### Local Development

-   Backend: `http://localhost:3001`
-   Frontend: `http://localhost:3000`
-   Ollama: `http://localhost:11434`

### Production Deployment

**Backend**:

-   Node.js server (PM2 or similar)
-   SQLite database (or migrate to PostgreSQL for scale)
-   Ollama running as system service
-   Reverse proxy (Nginx) for HTTPS

**Frontend**:

-   Build: `npm run build` (Vite)
-   Serve static files via Nginx or CDN
-   API proxy to backend

**Security**:

-   Add webhook signature verification (HMAC)
-   Rate limiting on API endpoints
-   CORS configuration for production domains
-   Environment variable management
-   LinkedIn credentials handling

## Scaling Considerations

### Current Limitations

-   SQLite (single writer)
-   Synchronous Ollama calls
-   Single LinkedIn scraper instance

### Scaling Strategies

1. **Database**: Migrate to PostgreSQL
2. **Queue System**: Add Redis/Bull for async processing
3. **Ollama**: Load balance across multiple instances
4. **LinkedIn**: Implement queue with rate limiting
5. **Caching**: Redis for ICP configs and scores
6. **Monitoring**: Add logging, metrics, alerts

## Technology Choices

### Why These Technologies?

**Backend: Node.js/Express**

-   JavaScript everywhere (full-stack consistency)
-   Rich ecosystem for web scraping (Puppeteer)
-   Easy async/await for LLM calls
-   Fast development iteration

**Frontend: React/Vite**

-   Component-based architecture
-   Fast HMR with Vite
-   Large ecosystem for UI components
-   TailwindCSS for rapid styling

**Database: SQLite**

-   Zero configuration
-   File-based (easy backup)
-   Good for MVP/demo
-   Can migrate to PostgreSQL later

**AI: Ollama**

-   Runs locally (no API costs)
-   Privacy-preserving
-   Multiple model support
-   Easy to swap models

**LinkedIn Scraping: Puppeteer**

-   Automated browser control
-   Session persistence
-   Handle dynamic content
-   User login support

## Future Enhancements

1. **Integrations**

    - Salesforce/HubSpot CRM sync
    - Slack notifications
    - Email sending (SendGrid, Resend)

2. **Analytics**

    - Conversion tracking
    - A/B testing emails
    - Persona accuracy metrics

3. **Advanced Features**

    - Multi-language support
    - Custom scoring models
    - Machine learning on historical data
    - Real-time dashboard updates (WebSockets)

4. **Data Enrichment**
    - Additional data sources (Clearbit, Hunter)
    - Company technographics
    - Funding information
    - Contact verification
