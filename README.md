# CCGO

> 简单易用的 Claude Code 启动器

**CCGO** (Claude Code Go) 是一个轻量级的 Claude Code 启动工具，专注于核心功能：配置管理、环境变量注入和快速启动。

## ✨ 核心功能

- 🔧 **配置管理** - 支持多个 API 配置，轻松切换
- 🌍 **环境变量注入** - 自动注入 `ANTHROPIC_API_KEY`、`ANTHROPIC_BASE_URL` 等环境变量
- 🚀 **快速启动** - 一键启动 Claude Code，无需手动配置环境变量
- 🔄 **配置兼容** - 与 ccs (cc-code-status) 共享配置，无需重复配置
- 🌐 **跨平台支持** - 支持 Windows、macOS、Linux
- 📦 **零依赖困扰** - 安装即用，无需复杂配置

## 📦 安装

```bash
npm install -g ccgo
```

## 🚀 快速开始

### 1. 首次配置

```bash
ccgo config
```

按照交互式提示输入：
- **配置名称**：为你的配置起一个名字（如 `default`、`glm`、`deepseek`）
- **API Base URL**：你的 API 服务地址
- **API Key**：你的 API 密钥
- **Model**（可选）：主要使用的模型名称
- **Small Fast Model**（可选）：快速小模型名称

### 2. 启动 Claude Code

```bash
ccgo
```

## 📖 命令说明

| 命令 | 说明 |
|------|------|
| `ccgo` | 启动 Claude Code（如果有多个配置会提示选择） |
| `ccgo config` | 配置或重新配置 API |
| `ccgo config --list` | 列出所有配置 |
| `ccgo config --add` | 添加新配置 |
| `ccgo config --remove` | 删除配置 |
| `ccgo help` | 显示帮助信息 |
| `ccgo -v, --version` | 显示版本号 |

## 🌐 常见 API 服务

以下是一些支持 Anthropic 兼容 API 的服务商：

| 服务商 | Base URL | 说明 |
|--------|----------|------|
| Anthropic 官方 | `https://api.anthropic.com` | 官方 API（需要国际网络） |
| 智谱 GLM | `https://open.bigmodel.cn/api/anthropic` | 国内可用 |
| Kimi | `https://api.moonshot.cn/anthropic` | 国内可用 |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | 国内可用 |
| DeepSeek | `https://api.deepseek.com` | 国内可用 |

## 🔧 环境变量注入

CCGO 会自动注入以下环境变量到 Claude Code 进程：

- `ANTHROPIC_API_KEY` - API 密钥
- `ANTHROPIC_BASE_URL` - API Base URL
- `ANTHROPIC_MODEL`（可选）- 主要模型名称
- `ANTHROPIC_SMALL_FAST_MODEL`（可选）- 小快速模型名称

## 📝 使用示例

### 示例 1: 配置智谱 GLM

```bash
$ ccgo config
配置名称: glm
API Base URL: https://open.bigmodel.cn/api/anthropic
API Key: ********
是否配置可选参数（模型名称）？ No

✓ 配置保存成功！
配置名称: glm
```

### 示例 2: 管理多个配置

```bash
# 添加第一个配置（智谱 GLM）
$ ccgo config
配置名称: glm
...

# 添加第二个配置（DeepSeek）
$ ccgo config --add
配置名称: deepseek
API Base URL: https://api.deepseek.com
...

# 启动时选择配置
$ ccgo
? 选择要使用的配置:
❯ glm (open.bigmodel.cn)
  deepseek (api.deepseek.com)
```

### 示例 3: 查看所有配置

```bash
$ ccgo config --list

📋 配置列表:

  glm
    Base URL: https://open.bigmodel.cn/api/anthropic
    API Key:  sk-xxxxx...yyyy

  deepseek
    Base URL: https://api.deepseek.com
    API Key:  sk-aaaaa...bbbb
```

## 🔍 配置文件位置

配置文件存储在：
- **macOS/Linux**: `~/.config/cc-code-status/config.json`
- **Windows**: `%APPDATA%\cc-code-status\config.json`

## 🔄 与 ccs (cc-code-status) 的配置兼容

**重要提示：** `ccgo` 与 `ccs` (cc-code-status) **共享同一份配置文件**！

这意味着：
- ✅ 如果你已经配置了 `ccs`，可以直接使用 `ccgo`，无需重复配置
- ✅ 在 `ccgo` 中添加的配置，`ccs` 也能使用
- ✅ 两个工具可以同时安装，配置互通
- ✅ 将来 `ccs` 可以依赖 `ccgo` 作为核心启动器

```bash
# 查看配置（两个命令结果相同）
ccs config --list
ccgo config --list

# 在 ccgo 中添加配置
ccgo config --add

# ccs 也能看到这个配置
ccs config --list
```

## 🆚 与 ccs (cc-code-status) 的功能区别

`ccgo` 是从 `ccs` 精简而来的轻量级版本：

| 特性 | ccgo | ccs |
|------|-----------|----------------|
| 配置管理 | ✅ | ✅ |
| 环境变量注入 | ✅ | ✅ |
| 启动 Claude Code | ✅ | ✅ |
| 代码统计 | ❌ | ✅ |
| 数据上报 | ❌ | ✅ |
| 状态栏插件 | ❌ | ✅ |

如果你需要代码统计和数据上报功能，请使用 [ccs (cc-code-status)](https://github.com/willflow/cc-code-status)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT © qilin

## 🔗 相关链接

- [Claude Code 官方文档](https://docs.claude.com/code)
- [ccs (cc-code-status)](https://github.com/willflow/cc-code-status) - 功能更丰富的版本，包含代码统计和数据上报

---

**享受简单易用的 Claude Code 启动体验！** 🚀
