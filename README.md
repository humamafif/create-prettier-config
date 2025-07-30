# Create Prettier Config 🧼
CLI tool to quickly scaffold Prettier configuration files with sensible defaults.

[![npm version](https://img.shields.io/npm/v/create-prettier-config)](https://www.npmjs.com/package/create-prettier-config)
[![GitHub](https://img.shields.io/github/stars/humamafif/create-prettier-config?style=social)](https://github.com/humamafif/create-prettier-config)

## ✨ Features

- Auto generates `.prettierrc` and `.prettierignore`
- Creates `.vscode/settings.json` for Prettier auto format
- Installs `prettier` as a dev dependency
- Easy to use with `npx`

---

## 🚀 Usage

```bash
npx create-prettier-config
```

Or if globally installed:

```bash
create-prettier-config
```

It will:

- Create `.prettierrc`
- Create `.prettierignore`
- Create `.vscode/settings.json`
- Install `prettier` locally to your project


---

## 🧼 What if I change my mind?

If you decide not to use Prettier after running the CLI, just clean it up:

```bash
### Mac/Linux
rm .prettierrc .prettierignore
### Windows PowerShell
Remove-Item .prettierrc, .prettierignore

npm uninstall prettier
```

---
## 📦 Installation (Optional)

If you prefer to install globally:

```bash
npm install -g create-prettier-config
```

---

## 📁 Output Example

```
.my-project/
├── .prettierrc
├── .prettierignore
└── .vscode/
    └── settings.json
```

---

## 🛠 Requirements

- Node.js ≥ 14
- NPM

---

## 👨‍💻 Author & License
Created by [@humamafif](https://github.com/humamafif)
[MIT](./LICENSE)