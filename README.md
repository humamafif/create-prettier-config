# Create Prettier Config 🧼

CLI tool to quickly scaffold Prettier configuration files with sensible defaults.

## ✨ Features

- Auto generates `.prettierrc` and `.prettierignore`
- Creates `.vscode/settings.json` for Prettier auto format
- Installs `prettier` as a dev dependency
- Easy to use with `npx`

---

## 🚀 Usage

```bash
npx prettier-config
```

Or if globally installed:

```bash
prettier-config
```

It will:

- Create `.prettierrc`
- Create `.prettierignore`
- Create `.vscode/settings.json` (optional)
- Install `prettier` locally to your project

---

## 📦 Installation (Optional)

If you prefer to install globally:

```bash
npm install -g prettier-config
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

## 👨‍💻 Author

Created by [@humamafif](https://github.com/humamafif)

---
## 🧾 License

[MIT](./LICENSE)