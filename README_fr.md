<h1 align="center">Bienvenue sur Kaas 🧀</h1>
<div align="center">

[![license-icon]](https://opensource.org/license/mit)
[![app-version-icon]](https://github.com/0xfrankz/Kaas)
[![typeScript-version-icon]](https://www.typescriptlang.org/)
[![rust-version-icon]](https://www.rust-lang.org/)
[![twitter-follow-icon]](https://x.com/thekaasapp)

</div>
<div align="center">

[![en-icon]](./README_zh-Hans.md)  [![zh-hans-icon]](./README_zh-Hans.md) [![fr-icon]](./README_fr.md)

</div>

# 📄 Description

![Conversations avec differents modèles](https://github.com/user-attachments/assets/4e17f3b6-7b6a-4437-9da1-3ca03bc4b1fa)

Kaas est un client ChatGPT conçu pour fonctionner sur plusieurs plateformes. Construit avec Tauri et React, ce client met l'accent sur la confidentialité et la sécurité des données, assurées grâce à des pratiques de stockage local des données.

Avec Rust dans sa pile de développement, Kaas tire également le meilleur parti d'une exécution à haute vitesse et d'une sécurité robuste.

# ✨ Fonctionnalités
- **🔒 Confidentialité**
Kaas accorde la priorité à la confidentialité des données. Vos identifiants et données de chat ne sont jamais envoyés à nos serveurs. Ils sont stockés localement et en toute sécurité sur votre appareil.*
- **💻 Multiplateforme**
Kaas est conçu pour fonctionner sur plusieurs plateformes, notamment Windows, macOS et Linux.
- **💂 Sécurité**
La partie centrale de Kaas est construite avec Rust, assurant une exécution à haute vitesse et une sécurité robuste. De plus, nous limitons délibérément les privilèges du client au minimum nécessaire. Vous pouvez consulter la liste des autorisations requises dans le fichier `tauri.conf.json`.
- **🤖 Prise en charge de plusieurs fournisseurs**
  - OpenAI (ChatGPT)
  - Azure
  - Anthropic (Claude)
  - Ollama
  - Tous les fournisseurs compatibles OpenAI
  - Google (Gemini) (🚧 en cours)
- **📚 Prise en charge de plusieurs modèles du même fournisseur**
  - Vous voulez utiliser GPT-3.5 et GPT-4 en même temps ? Pas de problème !
  - Basculement de modèles dans une conversation (🚧 en cours)
- **🪜 Proxy intégré**
Kaas prend en charge les paramètres de proxy. Vous pouvez configurer un proxy pour contourner les restrictions de votre réseau.
- **🧩 Modèles d'invite**
CoT ou COSTAR, vos modèles d'invite préférés sont disponibles ici. Vous pouvez également créer les vôtres.
- **🌓 Thèmes doubles**
Kaas prend en charge les thèmes clair et foncé.
- **🦉 Multilingue**
Kaas prend désormais en charge
  - Anglais
  - Chinois simplifié
  - Chinois traditionnel (🚧 en cours)
  - Japonais (🚧 en cours)
  - Français (🚧 en cours)
  - Allemand (🚧 en cours)

_*: Lorsque vous utilisez des modèles en ligne, les données sont toujours envoyées aux API de votre fournisseur de modèle. Si cela vous dérange, envisagez d'utiliser les modèles d'Ollama localement._

# 📦 Installation
Rendez-vous sur la page [Release](https://github.com/0xfrankz/kaas/releases) pour obtenir les derniers installateurs.

# 🛠️ Compilation à partir des sources
1. Installez Node.js
2. Installez pnpm
3. Installez Rust
4. Exécutez les commandes suivantes :
```
pnpm i
pnpm tauri build
```

# 👍 Développement
1. Installez Node.js
2. Installez pnpm
3. Installez Rust
4. Exécutez les commandes suivantes :
```
pnpm i
pnpm tauri dev
```

# 🤖 Configurations et options prises en charge

[Configurations et options prises en charge](./docs/options.md)

[app-version-icon]: https://img.shields.io/github/package-json/v/0xfrankz/Kaas?color=f8c611
[typescript-version-icon]: https://img.shields.io/github/package-json/dependency-version/0xfrankz/Kaas/dev/typescript
[rust-version-icon]: https://img.shields.io/badge/Rust-1.75.0-dea584
[license-icon]: https://img.shields.io/github/license/0xfrankz/Kaas
[twitter-follow-icon]: https://img.shields.io/twitter/follow/thekaasapp
[en-icon]: https://img.shields.io/badge/English-teal?style=flat-square
[zh-hans-icon]: https://img.shields.io/badge/%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-teal?style=flat-square
[fr-icon]: https://img.shields.io/badge/Français-teal?style=flat-square
