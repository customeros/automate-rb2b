# RB2B Lead Actionability System

Transform your RB2B visitor data into actionable leads by automatically:

-   🎯 Scoring companies against your Ideal Customer Profile (ICP)
-   👤 Identifying buyer personas from website behavior
-   🤖 Using AI (Ollama) to analyze intent and buying stage
-   🔍 Finding alternative contacts via LinkedIn when needed
-   📧 Generating personalized outreach emails based on buying stage

## Features

-   **Smart Lead Scoring**: AI-powered ICP fit analysis (A/B/C/D tiers)
-   **Persona Detection**: Identifies Economic Buyers, Technical Evaluators, Researchers
-   **Buying Stage Intelligence**: Classifies leads into Educate/Explore/Evaluate/Purchase stages
-   **LinkedIn Integration**: Automatically finds better-fit contacts at target companies
-   **Email Generation**: Creates stage-appropriate outreach emails
-   **Beautiful Dashboard**: Modern React UI to review and act on leads
-   **Local & Private**: Runs entirely on your machine using Ollama

## Prerequisites

-   **Node.js** 18+ ([download](https://nodejs.org))
-   **Ollama** ([download](https://ollama.ai))
-   **llama3 model** (we'll help you install this)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/automate-rb2b.git
cd automate-rb2b

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:

-   ✓ Check prerequisites
-   ✓ Install all dependencies
-   ✓ Pull the llama3 model
-   ✓ Create database and seed demo data
-   ✓ Configure environment

### 2. Start Ollama (if not already running)

```bash
ollama serve
```

### 3. Start the Application

```bash
npm run dev
```

This starts both the backend (port 3001) and frontend (port 3000).

### 4. Open the App

Navigate to http://localhost:3000

## Usage

### First-Time Setup

When you first open the app, you'll see an onboarding wizard with two options:

1. **Use Demo Configuration** - Instantly set up with sample ICP and demo leads
2. **Configure Manually** - Define your own ICP criteria

### Defining Your ICP

Go to **ICP Config** to set up your Ideal Customer Profile:

-   **Industries**: Target verticals (SaaS, E-commerce, etc.)
-   **Company Size**: Employee count range
-   **Regions**: Geographic focus
-   **Target Job Titles**: Decision-maker personas (VP Engineering, CTO, etc.)
-   **Tech Stack**: Technology indicators (AWS, Kubernetes, etc.)
-   **Pain Points**: Problems your solution solves

### Processing Leads

#### From RB2B Webhooks

**For Local Development**: Use ngrok to expose your local server to the internet.

📖 **[See detailed ngrok setup guide →](NGROK_SETUP.md)**

**Quick setup:**

```bash
# Install ngrok
brew install ngrok/ngrok/ngrok

# Start ngrok tunnel
ngrok http 3001

# Copy the forwarding URL (e.g., https://abc123.ngrok-free.app)
# Configure in RB2B as: https://abc123.ngrok-free.app/api/webhook/rb2b
```

**For Production**: Deploy to a server and configure your RB2B webhook to point to:

```
https://your-domain.com/api/webhook/rb2b
```

The system will automatically:

1. Receive the webhook
2. Score the company against your ICP
3. Analyze persona and buying stage
4. Search LinkedIn for alternative contacts (if needed)
5. Generate personalized outreach emails
6. Display in dashboard

#### Demo Lead Generator

Click **"Generate Demo Lead"** in the dashboard to create test leads without real RB2B data.

### Reviewing Leads

The dashboard shows:

-   Company name and domain
-   ICP fit score (A/B/C/D tier)
-   Detected persona and buying stage
-   Whether persona matches your target
-   Recommended next action

Click any lead to see:

-   Full visitor journey (pages visited)
-   Detailed scoring explanation
-   Alternative contacts from LinkedIn
-   Generated outreach emails (ready to copy)

### LinkedIn Scraping

When a lead doesn't match your target persona, click **"Find on LinkedIn"** to:

-   Search for employees at that company
-   Filter by your target job titles
-   Score persona fit for each contact
-   Generate emails for high-fit contacts

**Note**: LinkedIn scraping requires you to be logged into LinkedIn in the browser window that opens.

## Important: Compliance and Responsible Use

This repository includes example code that demonstrates how one might automate discovery of alternative contacts (e.g., via LinkedIn) for learning and illustration purposes only.

-   Do not scrape LinkedIn or any website in violation of its Terms of Service.
-   Always prefer official APIs, partner programs, or first‑party integrations where available.
-   Obtain all required permissions and consent before collecting or processing personal data.
-   Respect robots.txt, rate limits, and applicable laws and regulations (e.g., GDPR/CCPA).
-   This project’s authors and contributors are not responsible for misuse. You are solely responsible for how you use these examples in your environment.

If you plan to use similar functionality in production, replace any scraping logic with compliant, supported integrations and follow your legal counsel’s guidance.

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Pull Ollama model (smaller & faster)
ollama pull llama3.2:3b

# Seed demo data
npm run seed-demo

# Start the app
npm run dev
```

## Scripts

-   `npm run dev` - Start both backend and frontend
-   `npm run dev:backend` - Start backend only (port 3001)
-   `npm run dev:frontend` - Start frontend only (port 3000)
-   `npm run seed-demo` - Seed database with demo data
-   `npm run test-webhook` - Send a test webhook to the backend
-   `npm run setup` - Run setup wizard

## Architecture

### Backend (Node.js/Express)

-   **Webhook Receiver**: Processes RB2B data
-   **Lead Processor**: Orchestrates scoring pipeline
-   **Ollama Service**: AI-powered analysis
-   **LinkedIn Scraper**: Finds alternative contacts
-   **SQLite Database**: Stores leads and emails

### Frontend (React/Vite)

-   **Dashboard**: Lead list with filters
-   **ICP Config**: Dynamic configuration UI
-   **Lead Detail**: Full lead intelligence view
-   **Components**: Reusable UI elements

### AI Processing (Ollama)

-   ICP fit scoring
-   Persona inference
-   Buying stage detection
-   Personalized email generation

## API Endpoints

-   `POST /api/webhook/rb2b` - Receive RB2B webhook
-   `GET /api/leads` - List all leads
-   `GET /api/leads/:id` - Get lead details
-   `POST /api/leads/:id/rescore` - Re-analyze a lead
-   `POST /api/scrape-linkedin/:leadId` - Find LinkedIn contacts
-   `GET /api/config/icp` - Get ICP configuration
-   `POST /api/config/icp` - Save ICP configuration
-   `GET /api/health` - System health check

## Troubleshooting

### Ollama Not Connected

Make sure Ollama is running:

```bash
ollama serve
```

Check if llama3 model is installed:

```bash
ollama list
ollama pull llama3  # if not installed
```

### Database Issues

Reset the database:

```bash
rm backend/data/leads.db
npm run seed-demo
```

### Port Already in Use

Change ports in:

-   Backend: `backend/.env` (PORT=3001)
-   Frontend: `frontend/vite.config.js` (port: 3000)

### LinkedIn Scraping Fails

-   Make sure you're logged into LinkedIn in your browser
-   The browser window will persist login between sessions
-   Rate limiting: Don't scrape too many companies too quickly

## Configuration

### Environment Variables

Edit `backend/.env`:

```env
PORT=3001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
DATABASE_PATH=./data/leads.db
```

### Using Different Ollama Models

You can use other models like `mistral` or `llama2`:

```bash
ollama pull mistral
```

Update `backend/.env`:

```
OLLAMA_MODEL=mistral
```

## How It Works

### Lead Processing Pipeline

1. **Webhook Received**: RB2B sends visitor data
2. **ICP Scoring**: Ollama analyzes company fit (0-100 score)
3. **Persona Detection**: Classifies visitor based on pages viewed
4. **Stage Analysis**: Determines buying stage (Educate/Explore/Evaluate/Purchase)
5. **Intent Filtering**: Suppresses low-intent leads (career pages, etc.)
6. **Persona Matching**: Checks if contact matches target buyer personas
7. **LinkedIn Search**: If no match, finds better contacts at the company
8. **Email Generation**: Creates personalized outreach for each contact
9. **Dashboard Display**: Shows actionable leads with all context

### Ollama Prompting Strategy

The system uses structured prompts to get consistent JSON responses:

-   **ICP Scoring**: Analyzes domain/company against criteria
-   **Persona Inference**: Maps page visits to buyer types
-   **Stage Detection**: Sequences pages to identify intent
-   **Email Generation**: Creates stage-appropriate outreach

All prompts use `format: 'json'` for reliable parsing.

## Contributing

Contributions welcome! Areas for improvement:

-   Additional data enrichment sources
-   More sophisticated persona detection
-   Email template variations
-   CRM integrations
-   Webhook security (HMAC validation)

## License

MIT License - see LICENSE file

## Support

For issues or questions:

-   GitHub Issues: [Report a bug](https://github.com/yourusername/automate-rb2b/issues)
-   Email: hello@customeros.ai

## Credits

Built with guidance from the [CustomerOS RB2B Actionability Guide](https://customeros.ai/gtm-guides/how-to-make-rb2b-data-actionable)
