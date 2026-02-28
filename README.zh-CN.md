# CCGO

[English](README.md) | 简体中文

> Claude Code 启动器 - 解决初次启动报错问题

**CCGO** (Claude Code Go) 是专门用于解决 Claude Code 安装后初次启动时出现各种报错问题的启动器。它通过跳过官方的初次认证流程，让你能够直接使用 Claude Code。

## ❓ 这个启动器解决什么问题

安装官方 Claude Code 后，初次执行 `claude` 命令时，经常会遇到各种报错导致无法正常使用。CCGO 通过以下方式解决这个问题：

- ✅ **跳过初次认证流程**：自动配置 `hasCompletedOnboarding`，避免卡在第一屏
- ✅ **环境变量注入**：支持自定义 API 端点和密钥
- ✅ **多配置切换**：支持多个 profile（ 模型配置，例如各类中转站和国产模型 ），方便切换不同环境

## 📦 安装

### 步骤 1：安装官方 Claude Code

```bash
npm install -g @anthropic-ai/claude-code
```

**⚠️ 重要：安装完成后，不要执行 `claude` 命令启动！**

如果你已经启动过并遇到了报错，建议先卸载 Claude Code：
```bash
npm uninstall -g @anthropic-ai/claude-code
```
然后重新安装。

### 步骤 2：安装 CCGO 启动器

```bash
npm install -g ccgo
```

## 🚀 快速开始

### 1. 初始化配置（必需）

```bash
ccgo init
```

这会配置 `~/.claude.json`，设置 `hasCompletedOnboarding: true`，跳过官方的初次认证流程。

### 2. 配置环境变量（可选）

```bash
ccgo config
```

命令会输出共享配置文件路径和配置示例。按提示手动编辑该配置文件。

配置示例：

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

### 3. 启动 Claude Code

```bash
ccgo
```

有多个 profile 时，会交互选择一个。

### 4. 无头模式执行任务

```bash
ccgo -p "执行xxx任务"
```

无头模式下如果有多个 profile，默认使用第一个 profile。

## 📖 命令说明

| 命令 | 说明 |
|------|------|
| `ccgo init` | **【首次使用必需】** 初始化 Claude Code，跳过初次认证流程 |
| `ccgo` | 启动 Claude Code（多 profile 时交互选择） |
| `ccgo -p "任务"` | 无头模式执行任务（默认使用第一个 profile） |
| `ccgo config` | 显示配置文件位置和示例 |
| `ccgo help` | 显示帮助信息 |
| `ccgo -v, --version` | 显示版本号 |

## 🔧 配置规则

- `profiles.<name>` 下必须是"环境变量键值对"
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
