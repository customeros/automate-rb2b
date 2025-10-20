# Node.js Version Compatibility

## Recommended Versions

### ✅ Best Compatibility: Node.js 20 LTS

```bash
# Check your current version
node --version

# Using nvm? Switch to Node 20 LTS
nvm install 20
nvm use 20
```

### Supported Versions

| Node Version   | Status             | Notes                                |
| -------------- | ------------------ | ------------------------------------ |
| **18.x (LTS)** | ✅ Fully Supported | Minimum required version             |
| **20.x (LTS)** | ✅ Recommended     | Best balance of features & stability |
| **22.x**       | ✅ Supported       | Latest stable features               |
| **23.x+**      | ⚠️ Experimental    | May have dependency issues           |

## Why Node 20 LTS?

1. **Long Term Support** - Maintained until April 2026
2. **Stable Dependencies** - All packages tested and working
3. **Better Performance** - Optimizations for production use
4. **Wide Compatibility** - Works with all our dependencies

## If You're on Node 23+

You have two options:

### Option 1: Switch to Node 20 LTS (Recommended)

```bash
# Using nvm (recommended)
nvm install 20
nvm use 20
nvm alias default 20

# Using Homebrew (Mac)
brew install node@20
brew link node@20

# Then reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
./setup.sh
```

### Option 2: Use Latest Dependencies (Experimental)

The project will automatically use newer versions of dependencies that support Node 23+:

-   `better-sqlite3@^11.0.0` (instead of ^9.x)
-   `puppeteer@^23.0.0` (instead of ^21.x)

```bash
# This should work with the updated package.json
./setup.sh
```

## Current Issue (Node 23)

If you see errors like:

```
error "C++20 or later required."
gyp ERR! build error
```

This means `better-sqlite3` needs to compile native modules and your Node version is too new. Solution: Use Node 20 LTS.

## Installing Node Version Manager (nvm)

### On Mac/Linux:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc  # or ~/.zshrc

# Install Node 20 LTS
nvm install 20
nvm use 20
nvm alias default 20
```

### On Windows:

Use [nvm-windows](https://github.com/coreybutler/nvm-windows):

```bash
# After installation
nvm install 20
nvm use 20
```

## Verifying Your Setup

```bash
# Check Node version
node --version  # Should show v20.x.x

# Check npm version
npm --version

# Clean install
cd automate-rb2b
rm -rf node_modules backend/node_modules frontend/node_modules
./setup.sh
```

## Why We Support Node 18+

-   Node 16 reached end-of-life in September 2023
-   Node 18 is the minimum with modern ES modules support
-   Most packages still actively support Node 18+
-   Gives users flexibility while maintaining stability

## Future Compatibility

We'll update the minimum Node version as:

-   Older versions reach end-of-life
-   Dependencies drop support
-   New features require newer Node versions

**Current Policy**: Support Node 18+ LTS versions actively maintained by the Node.js team.

## Quick Fix for Common Errors

### "gyp ERR! build error"

→ Switch to Node 20 LTS

### "prebuild-install warn"

→ Normal during first install, continues to build from source

### "better-sqlite3" fails to install

→ Make sure you have build tools:

```bash
# Mac
xcode-select --install

# Linux (Debian/Ubuntu)
sudo apt-get install build-essential

# Linux (Fedora/CentOS)
sudo yum install gcc-c++ make
```

## Need Help?

Check `node --version` and compare with the supported versions above. When in doubt, **use Node 20 LTS**.
