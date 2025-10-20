#!/bin/bash

echo "🚀 RB2B Lead Actionability Setup"
echo "================================"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js 18+ from: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js $(node --version) detected"

# Check for Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama is not installed"
    echo "   Please install from: https://ollama.ai"
    echo "   After installation, run: ollama pull llama3.2:3b"
    echo ""
else
    echo "✓ Ollama detected"
fi

# Run setup script
node scripts/setup.js


