# CCGO

English | [简体中文](README.zh-CN.md)

> Claude Code Launcher - Fix Initial Startup Errors

**CCGO** (Claude Code Go) is a launcher specifically designed to solve various error issues that occur when Claude Code is first started after installation. It allows you to use Claude Code directly by skipping the official initial authentication process.

## ❓ What Problem Does This Launcher Solve

After installing the official Claude Code, when you first run the `claude` command, you often encounter various errors that prevent normal use. CCGO solves this problem in the following ways:

- ✅ **Skip Initial Authentication**: Automatically configure `hasCompletedOnboarding` to avoid getting stuck on the first screen
- ✅ **Environment Variable Injection**: Support custom API endpoints and keys
- ✅ **Multiple Profile Switching**: Support multiple profiles (model configurations, such as various proxy services and domestic models), making it easy to switch between different environments

## 📦 Installation

### Step 1: Install Official Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**⚠️ Important: After installation, do NOT run the `claude` command to start!**

If you have already started it and encountered errors, it is recommended to uninstall Claude Code first:
```bash
npm uninstall -g @anthropic-ai/claude-code
```
Then reinstall.

### Step 2: Install CCGO Launcher

```bash
npm install -g ccgo
```

## 🚀 Quick Start

### 1. Initialize Configuration (Required)

```bash
ccgo init
```

This configures `~/.claude.json` and sets `hasCompletedOnboarding: true` to skip the official initial authentication process.

### 2. Configure Environment Variables (Optional)

```bash
ccgo config
```

The command outputs the shared configuration file path and configuration examples. Edit the configuration file manually as prompted.

Configuration example:

```json
{
  "profiles": {
    "default": {
      "ANTHROPIC_BASE_URL": "your_base_url",
      "ANTHROPIC_AUTH_TOKEN": "your_api_key"
    },
    "kimi": {
      "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "your_api_key",
      "ANTHROPIC_MODEL": "kimi-k2.5"
    }
  }
}
```

### 3. Start Claude Code

```bash
ccgo
```

When there are multiple profiles, you will be prompted to select one interactively.

### 4. Run Tasks in Headless Mode

```bash
ccgo -p "execute xxx task"
```

In headless mode, if there are multiple profiles, the first profile is used by default.

## 📖 Command Reference

| Command | Description |
|---------|-------------|
| `ccgo init` | **【Required for first use】** Initialize Claude Code, skip initial authentication |
| `ccgo` | Start Claude Code (interactive selection when multiple profiles exist) |
| `ccgo -p "task"` | Run tasks in headless mode (uses first profile by default) |
| `ccgo config` | Show configuration file location and examples |
| `ccgo help` | Show help information |
| `ccgo -v, --version` | Show version number |

## 🔧 Configuration Rules

- `profiles.<name>` must contain "environment variable key-value pairs"
- Only keys with values in the profile are injected at startup
- No default fields are automatically filled, no field mapping is performed
- If no profile exists or the profile is empty, startup will fail directly

## 🔍 Configuration File Location

Configuration files are stored at:
- **macOS/Linux**: `~/.config/cc-code-status/config.json`
- **Windows**: `%APPDATA%\cc-code-status\config.json`


## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT © qilin
