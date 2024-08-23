<h1 align="center">Welcome to Kaas 🧀</h1>
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

# 📄Description

Kaas is a ChatGPT client designed to serve multiple platforms. Built using Tauri and React, this client places significant emphasis on data privacy and security. It ensures this through local data storage practices, thereby reinforcing data safety.

With Rust in its development stack, Kaas also makes the most of high-speed execution and robust security.

# ✨Features
- **🔒Privacy**  
Kaas prioritizes data privacy. Your credentials and chat data are never sent to our servers. They are stored locally and securely on your device.*
- **💻Cross-platform**  
Kaas is designed to work across multiple platforms, including Windows, macOS, and Linux.
- **💂Security**  
The core part of Kaas is built using Rust, ensuring high-speed execution and robust security. Plus, we delibrately limit the privileges of the client to the minimum necessary. You can view the list of permissions required in the `tauri.conf.json` file.
- **🤖Support for multiple providers**
  - OpenAI (ChatGPT)
  - Azure
  - Anthropic (Claude)
  - Ollama
  - All OpenAI compatible providers
  - Google (Gemini) (🚧进行中)
- **📚Support for multiple models from the same provider**
  - Want to use GPT-3.5 and GPT-4 at the same time? No problem!
  - Switching models in a conversation(🚧work in progress)
- **🪜Built-in proxy**  
Kaas supports proxy settings. You can set up a proxy to bypass your network restrictions.
- **🧩Prompt templates**  
CoT or COSTAR, your favorite prompt templates are available here. You can also create your own.
- **🌓Dual themes**  
Kaas supports both light and dark themes.
- **🦉Multilingual**  
Kaas now supports
  - English
  - Chinese Simplified
  - Chinese Traditional (🚧work in progress)
  - Japanese (🚧work in progress)
  - French (🚧work in progress)
  - German (🚧work in progress)

_*: When you use online models, data is still sent to your model provider's APIs. If that bothers you, consider using Ollama's models locally_

# 📦Installation
Go to [Release](https://github.com/0xfrankz/kaas/releases) page for latest installers.

# 🛠️Built from source
1. Install Node.js
2. Install pnpm
3. Install Rust
4. Run the following commands:
```
pnpm i
pnpm tauri build
```

# 👍Development
1. Install Node.js
2. Install pnpm
3. Install Rust
4. Run the following commands:
```
pnpm i
pnpm tauri dev
```

# 🤖Supported configs & options

[Supported configs & options](./docs/options.md)

[app-version-icon]: https://img.shields.io/github/package-json/v/0xfrankz/Kaas?color=f8c611
[typescript-version-icon]: https://img.shields.io/github/package-json/dependency-version/0xfrankz/Kaas/dev/typescript
[rust-version-icon]: https://img.shields.io/badge/Rust-1.75.0-dea584
[license-icon]: https://img.shields.io/github/license/0xfrankz/Kaas
[twitter-follow-icon]: https://img.shields.io/twitter/follow/thekaasapp
[en-icon]: https://img.shields.io/badge/English-teal?style=flat-square
[zh-hans-icon]: https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-teal?style=flat-square


