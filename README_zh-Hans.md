<h1 align="center">欢迎使用 Kaas 🧀</h1>
<div align="center">

[![license-icon]](https://opensource.org/license/mit)
[![app-version-icon]](https://github.com/0xfrankz/Kaas)
[![typeScript-version-icon]](https://www.typescriptlang.org/)
[![rust-version-icon]](https://www.rust-lang.org/)  
[![twitter-follow-icon]](https://x.com/thekaasapp)

</div>
<div align="center">

[![en-icon]](./README_zh-Hans.md)  [![zh-hans-icon]](./README_zh-Hans.md)

</div>

# 📄描述

![和不同的模型对话](https://github.com/user-attachments/assets/4e17f3b6-7b6a-4437-9da1-3ca03bc4b1fa)

Kaas 是一个为多平台设计的 ChatGPT 客户端，使用 Tauri 和 React 构建。Kaas 非常注重数据隐私和安全。它通过本地数据存储来确保这一点，从而加强数据安全性。

Kaas 还充分利用了Rust语言的高速执行和强大的安全性。

# ✨功能特性

- **🔒隐私**  
  Kaas优先考虑数据隐私。你的密码凭证和聊天数据永远不会发送到我们的服务器。它们安全地存储在你的设备本地。*

- **💻跨平台**  
  Kaas设计为可在多个平台上运行，包括Windows、macOS和Linux。

- **💂安全性**  
  Kaas的核心部分使用Rust构建，确保高速执行和强大的安全性。此外，我们刻意将客户端的权限限制在最低必要水平。你可以在`tauri.conf.json`文件中查看所需权限列表。

- **🤖支持多个服务商**
  - OpenAI (ChatGPT)
  - Azure
  - Anthropic (Claude)
  - Ollama
  - 所有兼容OpenAI API标准的服务商
  - Google (Gemini) (🚧进行中)


- **📚支持同一服务商的多个模型**
  - 想同时使用GPT-3.5和GPT-4？没问题！
  - 在对话中切换模型(🚧进行中)

- **🪜内置代理**  
  Kaas支持代理设置。你可以设置代理以绕过网络限制。

- **🧩提示模板**  
  不管你是习惯CoT还是COSTAR，你喜欢的提示模板都可在此使用。你还可以创建自己的模板。

- **🌓双主题**  
  Kaas支持亮色和暗色主题。

- **🦉多语言**  
  Kaas现在支持
  - 英语
  - 简体中文
  - 繁体中文 (🚧进行中)
  - 日语 (🚧进行中)
  - 法语 (🚧进行中)
  - 德语 (🚧进行中)

_*: 当你使用在线模型时，数据仍会发送到模型服务商的API。如果这让你感到困扰，请考虑在本地使用Ollama的模型_

# 📦安装

前往[发布页面](https://github.com/0xfrankz/kaas/releases)获取最新的安装程序。

# 🛠️从源代码构建

1. 安装 Node.js
2. 安装 pnpm
3. 安装 Rust
4. 运行以下命令：

```
pnpm i
pnpm tauri build
```

# 👍开发

1. 安装 Node.js
2. 安装 pnpm
3. 安装 Rust
4. 运行以下命令：

```
pnpm i
pnpm tauri dev
```

# 🤖支持的配置项

[支持的配置及选项](./docs/options_zh-Hans.md)

[app-version-icon]: https://img.shields.io/github/package-json/v/0xfrankz/Kaas?color=f8c611
[typescript-version-icon]: https://img.shields.io/github/package-json/dependency-version/0xfrankz/Kaas/dev/typescript
[rust-version-icon]: https://img.shields.io/badge/Rust-1.75.0-dea584
[license-icon]: https://img.shields.io/github/license/0xfrankz/Kaas
[twitter-follow-icon]: https://img.shields.io/twitter/follow/thekaasapp
[en-icon]: https://img.shields.io/badge/English-teal?style=flat-square
[zh-hans-icon]: https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-teal?style=flat-square

