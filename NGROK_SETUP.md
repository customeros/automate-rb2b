# 🌐 Setting Up Ngrok for RB2B Webhooks

This guide will help you set up ngrok to receive RB2B webhooks on your local development environment.

## 📋 Prerequisites

-   Your RB2B Lead Actionability app running locally (`npm run dev`)
-   An ngrok account (free tier works fine)
-   Access to your RB2B dashboard to configure webhooks

## 🚀 Quick Start

### Step 1: Install Ngrok

**Option A: Using Homebrew (macOS)**

```bash
brew install ngrok/ngrok/ngrok
```

**Option B: Download Directly**

1. Visit [ngrok.com/download](https://ngrok.com/download)
2. Download for your operating system
3. Unzip and move to a location in your PATH

**Option C: Using npm**

```bash
npm install -g ngrok
```

### Step 2: Sign Up & Get Your Auth Token

1. Create a free account at [ngrok.com](https://ngrok.com)
2. Copy your auth token from the [dashboard](https://dashboard.ngrok.com/get-started/your-authtoken)
3. Connect your account:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

### Step 3: Start Your Local Server

Make sure your backend server is running:

```bash
npm run dev
```

Your server should be running on `http://localhost:3001`

### Step 4: Start Ngrok Tunnel

In a **new terminal window**, run:

```bash
ngrok http 3001
```

You'll see output like this:

```
ngrok

Session Status                online
Account                       your@email.com (Plan: Free)
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3001

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

🔑 **Copy the Forwarding URL** (e.g., `https://abc123def456.ngrok-free.app`)

### Step 5: Configure RB2B Webhook

1. Log in to your [RB2B dashboard](https://rb2b.com)
2. Navigate to **Settings** → **Webhooks** or **Integrations**
3. Add a new webhook endpoint
4. Paste your ngrok URL + webhook path:
    ```
    https://YOUR-NGROK-URL.ngrok-free.app/api/webhook/rb2b
    ```
    For example:
    ```
    https://abc123def456.ngrok-free.app/api/webhook/rb2b
    ```
5. Select events to receive (usually "Visitor Identified" or "Contact Identified")
6. Save the webhook configuration

### Step 6: Test the Webhook

**Option 1: Send a Test Event from RB2B**

-   Most webhook interfaces have a "Send Test" button
-   Click it and watch your terminal for incoming webhook logs

**Option 2: Use Our Built-in Test Script**

```bash
# In your project directory
npm run test-webhook
```

You should see logs like:

```
📨 Received RB2B webhook:
{
  "company_name": "Stripe",
  "company_domain": "stripe.com",
  "contact_name": "John Smith",
  ...
}
✅ Webhook processed successfully
```

## 🔍 Monitoring Webhooks

### View Live Requests in Ngrok Dashboard

Ngrok provides a web interface at `http://127.0.0.1:4040` where you can:

-   See all incoming requests in real-time
-   Inspect request/response headers and bodies
-   Replay requests for testing
-   Debug webhook issues

### Check Your App Logs

Your backend server will log every webhook received:

```bash
# Watch your backend logs
cd backend
npm run dev
```

## 💡 Pro Tips

### Keep Ngrok Running

Ngrok needs to stay running to receive webhooks. Options:

1. **Separate Terminal**: Keep ngrok in a dedicated terminal window
2. **Background Process**: Add `&` to run in background (Mac/Linux)
    ```bash
    ngrok http 3001 > ngrok.log 2>&1 &
    ```
3. **tmux/screen**: Use terminal multiplexer for persistent sessions

### Use a Custom Domain (Paid Plans)

Free ngrok URLs change every time you restart. Paid plans offer:

-   **Reserved domains**: Same URL every time
-   **Custom domains**: Use your own domain
-   No "ngrok warning" page

### Configure Ngrok with Config File

Create `~/.ngrok/ngrok.yml`:

```yaml
version: "2"
authtoken: YOUR_AUTH_TOKEN
tunnels:
    rb2b:
        proto: http
        addr: 3001
        hostname: your-custom-subdomain.ngrok-free.app # Paid feature
```

Then start with:

```bash
ngrok start rb2b
```

## 🐛 Troubleshooting

### Webhook Not Received

1. **Check ngrok is running**: Look for the forwarding URL in terminal
2. **Verify URL in RB2B**: Make sure it's `https://YOUR-URL.ngrok-free.app/api/webhook/rb2b`
3. **Check backend is running**: Visit `http://localhost:3001/api/health`
4. **View ngrok inspector**: Go to `http://127.0.0.1:4040` to see if requests are arriving

### "Failed to Complete Tunnel Connection"

-   Your auth token may be invalid
-   Run `ngrok config add-authtoken YOUR_TOKEN` again
-   Check your account at [dashboard.ngrok.com](https://dashboard.ngrok.com)

### "ERR_NGROK_108: You've hit your account limit"

Free tier limits:

-   1 online ngrok process
-   40 connections/minute
-   Kill other ngrok processes: `pkill ngrok`

### Webhooks Arrive but Nothing Happens

1. Check backend logs for errors
2. Verify ICP configuration exists: `http://localhost:3001/api/config/icp`
3. Check Ollama is running: `ollama list`
4. Look at ngrok web interface (`http://127.0.0.1:4040`) to see response codes

## 🔄 Alternative: Use Ngrok npm Package

For more control, use ngrok programmatically:

```bash
npm install --save-dev ngrok
```

Create `backend/scripts/startWithNgrok.js`:

```javascript
import ngrok from "ngrok";

const PORT = 3001;

(async function () {
    try {
        const url = await ngrok.connect(PORT);
        console.log(`\n🌐 Ngrok tunnel created!`);
        console.log(`📍 Public URL: ${url}`);
        console.log(`🔗 Webhook URL: ${url}/api/webhook/rb2b`);
        console.log(`\n👉 Add this webhook URL to your RB2B dashboard\n`);
    } catch (error) {
        console.error("Error starting ngrok:", error);
    }
})();
```

Then add to `package.json`:

```json
{
    "scripts": {
        "ngrok": "node backend/scripts/startWithNgrok.js"
    }
}
```

## 📚 Additional Resources

-   [Ngrok Documentation](https://ngrok.com/docs)
-   [Ngrok Pricing](https://ngrok.com/pricing)
-   [RB2B Webhook Documentation](https://rb2b.com/docs/webhooks)
-   [Testing Webhooks Locally](https://ngrok.com/docs/guides/webhooks/)

## ✅ Verification Checklist

-   [ ] Ngrok installed and authenticated
-   [ ] Backend server running on port 3001
-   [ ] Ngrok tunnel created and running
-   [ ] Webhook URL configured in RB2B dashboard
-   [ ] Test webhook sent and received
-   [ ] Company appears in dashboard UI

---

**Need help?** Check the ngrok web interface at `http://127.0.0.1:4040` to debug webhook delivery issues!
