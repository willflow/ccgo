# CCGO

> 简单易用的 Claude Code 启动器

**CCGO** (Claude Code Go) 用于在启动 Claude Code 前，按配置文件注入环境变量，并支持多配置切换与无头模式。

## ✨ 核心功能

- 🔧 **配置管理**：支持多个 profile
- 🌍 **按配置注入环境变量**：profile 里有哪些键，就注入哪些键
- 🚀 **快速启动**：一条命令启动 Claude Code
- 🤝 **配置共享**：与 `ccs (cc-code-status)` 共享同一份配置文件
- ⚡ **无头模式**：`-p/--prompt` 直接执行任务，不弹交互选择

## 📦 安装

```bash
npm install -g ccgo
```

## 🚀 快速开始

### 1. 查看配置说明

```bash
ccgo config
```

命令会输出共享配置文件路径和配置示例。按提示手动编辑该配置文件。

配置示例：

```json
{
  "profiles": {
    "kimi": {
      "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
      "ANTHROPIC_AUTH_TOKEN": "your_api_key",
      "ANTHROPIC_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k2.5",
      "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-k2.5",
      "CLAUDE_CODE_SUBAGENT_MODEL": "kimi-k2.5"
    }
  }
}
```

### 2. 启动 Claude Code

```bash
ccgo
```

有多个 profile 时，会交互选择一个。

### 3. 无头模式执行任务

```bash
ccgo -p "执行xxx任务"
```

无头模式下如果有多个 profile，默认使用第一个 profile。

### 4. 初始化 Claude Code onboarding 状态

```bash
ccgo init
```

会在 `~/.claude.json` 写入或更新 `hasCompletedOnboarding: true`。

## 📖 命令说明

| 命令 | 说明 |
|------|------|
| `ccgo` | 启动 Claude Code（多 profile 时交互选择） |
| `ccgo -p "任务"` | 无头模式执行任务（默认使用第一个 profile） |
| `ccgo init` | 初始化 Claude Code 配置，写入 `hasCompletedOnboarding: true` |
| `ccgo config` | 显示配置文件位置和示例 |
| `ccgo help` | 显示帮助信息 |
| `ccgo -v, --version` | 显示版本号 |

## 🔧 配置规则

- `profiles.<name>` 下必须是“环境变量键值对”
- 启动时仅注入该 profile 中有值的键
- 不会自动补默认字段，不会做字段映射
- 如果没有 profile 或 profile 为空，启动会直接报错

## 🔍 配置文件位置

配置文件存储在：
- **macOS/Linux**: `~/.config/cc-code-status/config.json`
- **Windows**: `%APPDATA%\cc-code-status\config.json`


## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT © qilin
