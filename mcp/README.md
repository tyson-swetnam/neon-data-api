# NEON Data API MCP Server

An MCP (Model Context Protocol) server that provides AI assistants with direct access to the NEON (National Ecological Observatory Network) Data API. Query 180+ ecological data products across 81 field sites using natural language.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [macOS](#macos)
  - [Windows](#windows)
  - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
- [Client Configuration](#client-configuration)
  - [Claude Code (CLI)](#claude-code-cli)
  - [Claude Desktop](#claude-desktop)
  - [VS Code Extensions](#vs-code-extensions)
  - [Other MCP Clients](#other-mcp-clients)
- [Verifying the Installation](#verifying-the-installation)
- [Available Tools](#available-tools)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## Features

- **Product Discovery**: Search and explore NEON's 180+ data products by keyword, theme, or science team
- **Site Information**: Access details about NEON's 81 field sites across 20 ecoclimatic domains
- **Data Queries**: Find and download ecological data files with flexible date and site filtering
- **Location Services**: Explore tower locations, sensor positions, and site hierarchies
- **Smart Caching**: Optimized performance with intelligent TTL-based response caching
- **Zero Configuration**: No API keys required—uses the public NEON API

## Prerequisites

- **Node.js 18+** (required)
- **npm** (included with Node.js)
- **Git** (for cloning the repository)

---

## Installation

Choose your operating system for platform-specific instructions:

- [macOS](#macos)
- [Windows](#windows)
- [Linux (Ubuntu/Debian)](#linux-ubuntudebian)

---

### macOS

#### 1. Install Node.js

**Option A: Using Homebrew (Recommended)**

```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Add to PATH (if using node@20)
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**Option B: Using the Official Installer**

1. Download the macOS installer from [nodejs.org](https://nodejs.org/)
2. Run the `.pkg` file and follow the installation wizard
3. Restart your terminal

**Option C: Using nvm (Node Version Manager)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or run:
source ~/.zshrc

# Install and use Node.js 20
nvm install 20
nvm use 20
```

#### 2. Install Git (if not already installed)

```bash
# Git comes with Xcode Command Line Tools
xcode-select --install

# Or install via Homebrew
brew install git
```

#### 3. Clone and Build

```bash
# Clone the repository
git clone https://github.com/NEONScience/neon-data-api.git
cd neon-data-api/mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Verify the build succeeded
ls build/index.js
```

#### 4. Note Your Installation Path

```bash
# Get the absolute path (you'll need this for client configuration)
pwd
# Example output: /Users/yourname/neon-data-api/mcp
```

---

### Windows

#### 1. Install Node.js

**Option A: Using the Official Installer (Recommended)**

1. Download the Windows installer (`.msi`) from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the wizard
3. Ensure "Add to PATH" is checked during installation
4. Restart your terminal (PowerShell or Command Prompt)

**Option B: Using winget**

```powershell
# Open PowerShell as Administrator
winget install OpenJS.NodeJS.LTS
```

**Option C: Using Chocolatey**

```powershell
# Install Chocolatey first if needed (run as Administrator)
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install Node.js
choco install nodejs-lts
```

**Option D: Using nvm-windows**

1. Download nvm-windows from [github.com/coreybutler/nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. Run the installer
3. Open a new PowerShell window:

```powershell
nvm install 20
nvm use 20
```

#### 2. Install Git

**Option A: Using the Official Installer**

1. Download from [git-scm.com](https://git-scm.com/download/win)
2. Run the installer with default options
3. Restart your terminal

**Option B: Using winget**

```powershell
winget install Git.Git
```

#### 3. Verify Installation

```powershell
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version

# Check Git version
git --version
```

#### 4. Clone and Build

**Using PowerShell:**

```powershell
# Clone the repository
git clone https://github.com/NEONScience/neon-data-api.git
cd neon-data-api\mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Verify the build succeeded
dir build\index.js
```

**Using Command Prompt:**

```cmd
git clone https://github.com/NEONScience/neon-data-api.git
cd neon-data-api\mcp
npm install
npm run build
dir build\index.js
```

#### 5. Note Your Installation Path

```powershell
# Get the absolute path (you'll need this for client configuration)
(Get-Location).Path
# Example output: C:\Users\yourname\neon-data-api\mcp
```

> **Windows Path Note**: When configuring MCP clients, use double backslashes (`\\`) or forward slashes (`/`) in JSON configuration files:
> - `C:\\Users\\yourname\\neon-data-api\\mcp\\build\\index.js`
> - `C:/Users/yourname/neon-data-api/mcp/build/index.js`

---

### Linux (Ubuntu/Debian)

#### 1. Install Node.js

**Option A: Using NodeSource Repository (Recommended)**

```bash
# Update package index
sudo apt update

# Install prerequisites
sudo apt install -y ca-certificates curl gnupg

# Add NodeSource GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | sudo gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg

# Add Node.js 20.x repository
NODE_MAJOR=20
echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_$NODE_MAJOR.x nodistro main" | sudo tee /etc/apt/sources.list.d/nodesource.list

# Install Node.js
sudo apt update
sudo apt install -y nodejs
```

**Option B: Using nvm (Node Version Manager)**

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Restart terminal or run:
source ~/.bashrc

# Install and use Node.js 20
nvm install 20
nvm use 20
```

**Option C: Using Snap**

```bash
sudo snap install node --classic --channel=20
```

#### 2. Install Git

```bash
sudo apt update
sudo apt install -y git
```

#### 3. Verify Installation

```bash
# Check Node.js version
node --version
# Should output: v18.0.0 or higher

# Check npm version
npm --version

# Check Git version
git --version
```

#### 4. Clone and Build

```bash
# Clone the repository
git clone https://github.com/NEONScience/neon-data-api.git
cd neon-data-api/mcp

# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Verify the build succeeded
ls -la build/index.js
```

#### 5. Note Your Installation Path

```bash
# Get the absolute path (you'll need this for client configuration)
pwd
# Example output: /home/yourname/neon-data-api/mcp
```

#### Optional: Fix npm Permissions

If you encounter permission errors with npm:

```bash
# Create npm global directory in home folder
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'

# Add to PATH
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

### Development Mode (All Platforms)

For active development with auto-reload:

```bash
cd neon-data-api/mcp
npm install
npm run dev
```

---

### Quick Verification (All Platforms)

After installation, verify everything works:

```bash
# Navigate to the mcp directory
cd /path/to/neon-data-api/mcp

# Run the server
node build/index.js
```

You should see:

```
NEON MCP Server started successfully
Available tools: 14
Tools: neon_list_products, neon_get_product, neon_search_products, ...
```

Press `Ctrl+C` to stop the server.

## Client Configuration

After installation, configure your MCP client to connect to the server. Replace `/path/to/neon-data-api/mcp` with your actual installation path in all examples below.

> **Tip**: Use `pwd` in the `mcp` directory to get the absolute path.

---

### Claude Code (CLI)

Add the server to your Claude Code configuration:

**Global configuration** (`~/.claude/settings.json`):

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

**Project-specific configuration** (`.claude/settings.json` in your project root):

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

**Alternative using `cwd`**:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/neon-data-api/mcp"
    }
  }
}
```

---

### Claude Desktop

Add to your Claude Desktop configuration file:

| Platform | Configuration File Path |
|----------|------------------------|
| macOS    | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows  | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux    | `~/.config/Claude/claude_desktop_config.json` |

**macOS / Linux**:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

**Windows**:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["C:\\path\\to\\neon-data-api\\mcp\\build\\index.js"]
    }
  }
}
```

**Windows (alternative with `cwd`)**:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "C:\\path\\to\\neon-data-api\\mcp"
    }
  }
}
```

> **Note**: After editing the configuration, restart Claude Desktop for changes to take effect.

---

### VS Code Extensions

#### Cline

Add to your VS Code settings (`settings.json`) or workspace settings:

```json
{
  "cline.mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

Or create/edit `.vscode/mcp.json` in your workspace:

```json
{
  "servers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

#### Continue

Add to your Continue configuration (`~/.continue/config.json`):

```json
{
  "mcpServers": [
    {
      "name": "neon-data-api",
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  ]
}
```

#### Cursor

Add to Cursor's MCP settings (Settings > MCP Servers):

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"]
    }
  }
}
```

---

### Other MCP Clients

For any MCP-compatible client, use this standard configuration:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["/path/to/neon-data-api/mcp/build/index.js"],
      "env": {}
    }
  }
}
```

**Using `cwd` (working directory)**:

```json
{
  "mcpServers": {
    "neon-data-api": {
      "command": "node",
      "args": ["build/index.js"],
      "cwd": "/path/to/neon-data-api/mcp",
      "env": {}
    }
  }
}
```

---

## Verifying the Installation

### Test with MCP Inspector

The MCP Inspector provides a web interface to explore and test tools interactively:

```bash
cd /path/to/neon-data-api/mcp
npx @modelcontextprotocol/inspector node build/index.js
```

This opens a browser where you can:
- View all 14 available tools
- Test tool calls with sample parameters
- Inspect response formats

### Verify Client Connection

After configuring your MCP client, verify the connection:

1. **Claude Desktop / Claude Code**: Look for "neon-data-api" in the MCP servers list or try asking *"What NEON tools are available?"*
2. **VS Code Extensions**: Check the extension's MCP status indicator
3. **Check logs**: Most clients show server startup messages in their logs

---

## Available Tools

### Product Tools

| Tool | Description |
|------|-------------|
| `neon_list_products` | List all NEON data products (180+) with optional release filtering |
| `neon_get_product` | Get detailed info about a specific product by code (e.g., `DP1.10003.001`) |
| `neon_search_products` | Search products by keyword, theme, or science team |

### Site Tools

| Tool | Description |
|------|-------------|
| `neon_list_sites` | List all 81 NEON field sites with optional filtering |
| `neon_get_site` | Get detailed info about a specific site by code (e.g., `HARV`) |
| `neon_search_sites` | Search sites by name, location, or proximity (lat/lon + radius) |
| `neon_get_site_products` | Get all data products available at a specific site |

### Data Tools

| Tool | Description |
|------|-------------|
| `neon_query_data` | Query for available data files with date/site/product filtering |
| `neon_get_download_url` | Get download URL and metadata for a specific file |
| `neon_summarize_data_availability` | Summarize data availability for a product across sites/time |

### Location Tools

| Tool | Description |
|------|-------------|
| `neon_get_location` | Get detailed info about a specific location (tower, plot, etc.) |
| `neon_list_site_locations` | List all site-level locations across NEON |
| `neon_find_towers` | Find tower locations at a site or across all sites |
| `neon_get_location_hierarchy` | Get the complete location hierarchy for a site |
| `neon_search_locations` | Search locations by name, type, or proximity |

---

## Usage Examples

### Natural Language Queries

Once configured, you can ask your AI assistant questions like:

- *"What bird data products does NEON offer?"*
- *"Show me all sites in California"*
- *"Find soil temperature data for Harvard Forest from 2023"*
- *"Where are the flux towers located at SRER?"*
- *"What data is available at sites within 50km of Denver?"*

### Programmatic Examples

```javascript
// Search for bird-related products
await neon_search_products({ keyword: "bird" });

// Get details about breeding landbird counts
await neon_get_product({ productCode: "DP1.10003.001" });

// Query bird data for Harvard Forest, summer 2023
await neon_query_data({
  productCode: "DP1.10003.001",
  siteCode: "HARV",
  startDateMonth: "2023-05",
  endDateMonth: "2023-08"
});

// Find sites near a specific location
await neon_search_sites({
  latitude: 42.5378,
  longitude: -72.1715,
  radius: 50
});

// Get tower locations at Santa Rita Experimental Range
await neon_find_towers({ siteCode: "SRER" });
```

---

## Development

### Commands

```bash
npm install          # Install dependencies
npm run build        # Compile TypeScript to JavaScript
npm start            # Run the compiled server
npm run dev          # Development mode with auto-reload (tsx)
npm run lint         # Run ESLint
npm test             # Run all tests
npm run test:unit    # Run unit tests only
npm run test:coverage # Run tests with coverage report
```

### Project Structure

```
mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── client.ts         # NEON API HTTP client
│   │   ├── cache.ts          # TTL-based response caching
│   │   └── types.ts          # TypeScript interfaces
│   ├── tools/
│   │   ├── products.ts       # Product discovery tools
│   │   ├── sites.ts          # Site information tools
│   │   ├── data.ts           # Data query tools
│   │   └── locations.ts      # Location/tower tools
│   └── utils/
│       ├── formatters.ts     # Output formatting utilities
│       └── validators.ts     # Input validation (Zod schemas)
├── build/                    # Compiled JavaScript output
├── package.json
└── tsconfig.json
```

### Caching Strategy

| Data Type | TTL | Rationale |
|-----------|-----|-----------|
| Products & Sites | 1 hour | Rarely change, safe to cache longer |
| Data Queries | 30 minutes | Balance freshness with performance |
| Download URLs | Not cached | URLs expire after 1 hour |

---

## Troubleshooting

### Server won't start

1. **Check Node.js version**: Ensure you have Node.js 18+
   ```bash
   node --version
   ```

2. **Rebuild the project**:
   ```bash
   cd /path/to/neon-data-api/mcp
   rm -rf build node_modules
   npm install
   npm run build
   ```

3. **Check for TypeScript errors**:
   ```bash
   npm run build 2>&1
   ```

### Client can't connect to server

1. **Verify the path**: Ensure the path in your configuration is absolute and correct
   ```bash
   ls /path/to/neon-data-api/mcp/build/index.js
   ```

2. **Check file permissions**: Ensure the build directory is readable
   ```bash
   chmod -R 755 /path/to/neon-data-api/mcp/build
   ```

3. **Test manually**: Run the server directly to see error output
   ```bash
   node /path/to/neon-data-api/mcp/build/index.js
   ```

### Tools not appearing in client

1. **Restart the client**: Most clients require a restart after configuration changes

2. **Check configuration syntax**: Validate your JSON configuration
   ```bash
   cat ~/.claude/settings.json | python -m json.tool
   ```

3. **Check server logs**: Look for errors in stderr output when the server starts

### API errors or timeouts

1. **Check internet connectivity**: The server requires access to `https://data.neonscience.org`

2. **Verify NEON API status**: Visit https://data.neonscience.org/data-api to check if the API is operational

3. **Review rate limiting**: The NEON API is public but may throttle excessive requests

---

## Quick Reference

### NEON Codes Format

| Type | Format | Example |
|------|--------|---------|
| Product Code | `DP#.#####.###` | `DP1.10003.001` (Breeding Landbird Point Counts) |
| Site Code | 4 letters | `HARV` (Harvard Forest), `SRER` (Santa Rita) |
| Domain Code | `D##` | `D01` (Northeast), `D14` (Desert Southwest) |
| Date Format | `YYYY-MM` | `2023-06` |

### Common Product Themes

- Biogeochemistry
- Ecohydrology
- Organisms, Populations, and Communities
- Land Use, Land Cover, and Land Management

---

## Resources

- [NEON Data API Documentation](https://data.neonscience.org/data-api)
- [NEON Data Portal](https://data.neonscience.org)
- [neonUtilities R Package](https://cran.r-project.org/web/packages/neonUtilities/index.html)
- [MCP Protocol Specification](https://modelcontextprotocol.io)

## License

MIT License - see the LICENSE file for details.
