# Quick Start Guide

Get the RB2B Lead Actionability System running in 5 minutes.

## Prerequisites Check

Before starting, ensure you have:

-   ✅ **Node.js 18+** - Check with `node --version`
-   ✅ **Ollama** - Download from [ollama.ai](https://ollama.ai)
-   ✅ **Git** - For cloning the repository

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd automate-rb2b

# Run the setup script
chmod +x setup.sh
./setup.sh
```

The setup script will:

-   Install all dependencies
-   Pull the llama3 model
-   Initialize the database
-   Seed demo data

### Option 2: Manual Setup

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Pull Ollama model (smaller & faster)
ollama pull llama3.2:3b

# Seed demo data
npm run seed-demo
```

## Start the Application

### Step 1: Start Ollama

```bash
ollama serve
```

Keep this terminal open.

### Step 2: Start the Application

In a new terminal:

```bash
cd automate-rb2b
npm run dev
```

This starts:

-   Backend on `http://localhost:3001`
-   Frontend on `http://localhost:3000`

### Step 3: Open the App

Navigate to `http://localhost:3000` in your browser.

## First-Time Setup

When you first open the app, you'll see an onboarding wizard with two options:

### Option A: Use Demo Configuration (Fastest)

1. Click **"Use Demo Configuration"**
2. Wait 2-3 seconds for setup
3. You'll see a pre-populated dashboard with 5 demo leads

### Option B: Configure Manually

1. Click **"Configure Manually"**
2. Fill in your ICP criteria:
    - Target industries (e.g., SaaS, Technology)
    - Company size range (e.g., 50-500 employees)
    - Geographic regions
    - Target job titles (e.g., VP Engineering, CTO)
    - Technology stack
    - Pain points
3. Click **"Save Configuration"**
4. Return to dashboard

## Testing the System

### Generate a Demo Lead

1. In the dashboard, click **"Generate Demo Lead"**
2. Wait 3-5 seconds for processing
3. A new lead will appear with:
    - ICP fit score and tier
    - Detected persona
    - Buying stage
    - Generated outreach email

### Send a Test Webhook

```bash
npm run test-webhook
```

This simulates an RB2B webhook and processes it through the full pipeline.

### View Lead Details

1. Click on any lead card
2. You'll see:
    - Full visitor journey (pages visited)
    - Detailed scoring explanation
    - Persona reasoning
    - Recommended next action
    - Generated outreach email

### Test LinkedIn Scraping

**Note**: This requires you to be logged into LinkedIn.

1. Open a lead that shows "No Persona Match"
2. Click **"Find on LinkedIn"**
3. A browser window will open
4. Log into LinkedIn if prompted
5. Wait for results
6. Alternative contacts will appear with fit scores

## Understanding the Dashboard

### Lead Cards Show:

-   **Company Name & Domain**
-   **ICP Fit Score** - Visual gauge (A/B/C/D)
-   **Persona** - Economic Buyer, Technical Evaluator, Researcher
-   **Buying Stage** - Educate, Explore, Evaluate, Purchase
-   **Persona Match Status** - Green badge or yellow "Alt. Contacts Available"
-   **Next Action** - Recommended follow-up

### Filter Options:

-   **By Tier** - A, B, C, D
-   **By Stage** - Educate, Explore, Evaluate, Purchase
-   **By Persona Match** - Matched or Needs LinkedIn Search

## Connecting Real RB2B Data

### Get Your Webhook URL

Your webhook endpoint is:

```
http://localhost:3001/api/webhook/rb2b
```

For production, use your deployed URL.

### Configure RB2B

1. Log into your RB2B account
2. Go to Settings → Webhooks
3. Add webhook URL: `https://your-domain.com/api/webhook/rb2b`
4. Select events to receive
5. Save configuration

### Expected Webhook Format

RB2B should send:

```json
{
    "id": "event-123",
    "company_domain": "example.com",
    "company_name": "Example Inc",
    "contact_name": "John Doe",
    "contact_email": "john@example.com",
    "contact_title": "VP Engineering",
    "visited_pages": [
        {
            "path": "/pricing",
            "timestamp": "2024-01-01T12:00:00Z"
        },
        {
            "path": "/features",
            "timestamp": "2024-01-01T12:05:00Z"
        }
    ]
}
```

## Common Issues & Solutions

### Issue: Ollama Not Connected

**Symptoms**: Yellow health check indicator, "Ollama not detected" message

**Solution**:

```bash
# Start Ollama
ollama serve

# Verify it's running
curl http://localhost:11434/api/tags
```

### Issue: llama3 Model Not Found

**Solution**:

```bash
ollama pull llama3
```

This downloads ~4GB and may take a few minutes.

### Issue: LinkedIn Login Required

**Symptoms**: LinkedIn scraping opens browser but shows login page

**Solution**:

1. Log into LinkedIn in the browser window
2. The session persists in `./backend/linkedin-session`
3. Future scrapes won't require login

### Issue: Port Already in Use

**Solution**:

```bash
# Find what's using port 3001 or 3000
lsof -i :3001
lsof -i :3000

# Kill the process or change port in:
# - backend/.env (PORT=3001)
# - frontend/vite.config.js (port: 3000)
```

### Issue: No Leads Showing

**Solutions**:

1. Click "Generate Demo Lead" button
2. Run `npm run seed-demo` to reset demo data
3. Check browser console for errors
4. Check backend terminal for errors

## Next Steps

### Customize Your ICP

1. Go to **ICP Config** page
2. Update criteria to match your business:
    - Industries you serve
    - Ideal company sizes
    - Decision-maker titles
    - Technology indicators
    - Common pain points

### Process Real Leads

1. Configure RB2B webhook
2. Monitor leads in real-time
3. Use generated emails as templates
4. Track which leads convert

### Export Leads

Currently manual (copy emails), but you can:

-   Copy generated emails to your outreach tool
-   Export lead data from SQLite
-   Build CRM integration (see CONTRIBUTING.md)

## Resources

-   **Full Documentation**: See README.md
-   **Architecture**: See ARCHITECTURE.md
-   **Contributing**: See CONTRIBUTING.md
-   **Support**: hello@customeros.ai

## System Status

Check system health in the top-right corner of the dashboard:

-   ✅ **Green**: All systems operational
-   ⚠️ **Yellow**: Missing Ollama or ICP config
-   ❌ **Red**: Backend or database issues

## Tips for Best Results

1. **Accurate ICP Configuration**

    - Be specific with job titles
    - Include variations (CTO, Chief Technology Officer)
    - Update as you learn what works

2. **LinkedIn Scraping**

    - Use sparingly to avoid rate limits
    - Login once, session persists
    - Review results before outreach

3. **Generated Emails**

    - Review and personalize
    - Adjust based on your brand voice
    - Track what messaging works

4. **Scoring Interpretation**
    - A (90-100): Hot prospects, prioritize
    - B (70-89): Good fit, warm outreach
    - C (50-69): Nurture with content
    - D (0-49): Auto-suppressed

## Quick Commands Reference

```bash
# Start everything
npm run dev

# Start backend only
npm run dev:backend

# Start frontend only
npm run dev:frontend

# Reset demo data
npm run seed-demo

# Test webhook
npm run test-webhook

# Setup from scratch
./setup.sh
```

---

**Ready to process your first lead?** Click "Generate Demo Lead" in the dashboard! 🚀
