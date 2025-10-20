import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

console.log("🚀 Setting up RB2B Lead Actionability System...\n");

// Check Node.js version
console.log("Checking Node.js version...");
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split(".")[0].substring(1));
if (majorVersion < 18) {
    console.error("❌ Node.js version 18 or higher is required");
    console.error(`   Current version: ${nodeVersion}`);
    process.exit(1);
}
if (majorVersion >= 23) {
    console.log(`⚠️  Node.js ${nodeVersion} detected (very new)`);
    console.log("   Note: Node 20 LTS is recommended for best compatibility");
    console.log("   Continuing anyway with latest dependency versions...\n");
} else {
    console.log(`✓ Node.js ${nodeVersion} detected\n`);
}

// Check if Ollama is installed
console.log("Checking for Ollama...");
try {
    execSync("which ollama", { stdio: "ignore" });
    console.log("✓ Ollama is installed");
} catch {
    console.log("⚠ Ollama not found");
    console.log("  Please install Ollama from: https://ollama.ai");
    console.log("  After installation, run: ollama pull llama3\n");
}

// Check if Ollama is running
try {
    execSync("curl -s http://localhost:11434/api/tags", { stdio: "ignore" });
    console.log("✓ Ollama is running");

    // Check if llama3.2:3b model is available
    try {
        const modelsOutput = execSync("ollama list").toString();
        if (modelsOutput.includes("llama3.2:3b")) {
            console.log("✓ llama3.2:3b model is available\n");
        } else {
            console.log("⚠ llama3.2:3b model not found");
            console.log(
                "  Pulling llama3.2:3b model (smaller & faster, ~2GB download)..."
            );
            execSync("ollama pull llama3.2:3b", { stdio: "inherit" });
            console.log("✓ llama3.2:3b model installed\n");
        }
    } catch {
        console.log(
            "⚠ Could not check models. You may need to run: ollama pull llama3.2:3b\n"
        );
    }
} catch {
    console.log("⚠ Ollama is not running. Start it with: ollama serve\n");
}

// Install root dependencies
console.log("Installing root dependencies...");
try {
    execSync("npm install", { cwd: rootDir, stdio: "inherit" });
    console.log("✓ Root dependencies installed\n");
} catch (error) {
    console.error("❌ Failed to install root dependencies");
    process.exit(1);
}

// Install backend dependencies
console.log("Installing backend dependencies...");
try {
    execSync("npm install", {
        cwd: path.join(rootDir, "backend"),
        stdio: "inherit",
    });
    console.log("✓ Backend dependencies installed\n");
} catch (error) {
    console.error("❌ Failed to install backend dependencies");
    process.exit(1);
}

// Install frontend dependencies
console.log("Installing frontend dependencies...");
try {
    execSync("npm install", {
        cwd: path.join(rootDir, "frontend"),
        stdio: "inherit",
    });
    console.log("✓ Frontend dependencies installed\n");
} catch (error) {
    console.error("❌ Failed to install frontend dependencies");
    process.exit(1);
}

// Create .env file if it doesn't exist
const envPath = path.join(rootDir, "backend", ".env");
if (!fs.existsSync(envPath)) {
    console.log("Creating .env file...");
    const envContent = `PORT=3001
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
DATABASE_PATH=./data/leads.db
`;
    fs.writeFileSync(envPath, envContent);
    console.log("✓ .env file created\n");
} else {
    console.log("✓ .env file already exists\n");
}

// Create data directory
const dataDir = path.join(rootDir, "backend", "data");
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("✓ Data directory created\n");
}

// Initialize database and seed demo data
console.log("Seeding demo data...");
try {
    execSync("npm run seed-demo", { cwd: rootDir, stdio: "inherit" });
    console.log("✓ Demo data seeded\n");
} catch (error) {
    console.error(
        "⚠ Failed to seed demo data (you can do this later with: npm run seed-demo)\n"
    );
}

console.log("✅ Setup complete!\n");
console.log("Next steps:");
console.log("1. Make sure Ollama is running: ollama serve");
console.log("2. Start the application: npm run dev");
console.log("3. Open http://localhost:3000 in your browser");
console.log(
    "\nWebhook endpoint will be available at: http://localhost:3001/api/webhook/rb2b"
);
console.log("\nTo test with a demo webhook, run: npm run test-webhook\n");
