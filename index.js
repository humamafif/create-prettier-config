#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const isRevert = process.argv.includes("--revert");

const filesToDelete = [".prettierrc", ".prettierignore"];
const settingsDestPath = path.join(process.cwd(), ".vscode/settings.json");
const settingsBackupPath = path.join(
  process.cwd(),
  ".vscode/settings.backup.prettier.json"
);

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

(async function () {
  if (isRevert) {
    console.log("\n⏪ Reverting changes...");

    if (fs.existsSync(settingsDestPath) && fs.existsSync(settingsBackupPath)) {
      const stripJsonComments = (str) =>
        str.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "");

      const currentRaw = fs.readFileSync(settingsDestPath, "utf8");
      const current = JSON.stringify(
        JSON.parse(stripJsonComments(currentRaw)),
        null,
        2
      );

      const backup = JSON.stringify(
        JSON.parse(fs.readFileSync(settingsBackupPath)),
        null,
        2
      );

      if (current !== backup) {
        const answer = await prompt(
          "⚠️  'settings.json' has been modified since setup. Reverting will overwrite changes. Proceed? (y/N): "
        );
        if (!/^y(es)?$/i.test(answer.trim())) {
          console.log("❌ Revert cancelled.");
          process.exit(0);
        }
      }
    }

    filesToDelete.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Removed: ${file}`);
      }
    });

    if (fs.existsSync(settingsBackupPath)) {
      fs.renameSync(settingsBackupPath, settingsDestPath);
      console.log("✅ Restored: .vscode/settings.json");
    }

    try {
      console.log("📦 Uninstalling Prettier...");
      execSync("npm uninstall prettier", { stdio: "inherit" });
      console.log("🧹 Prettier uninstalled.");
    } catch (err) {
      console.warn(
        "⚠️ Failed to uninstall Prettier. Please remove it manually."
      );
    }

    console.log("\n✅ Revert completed.\n");
    process.exit(0);
  }

  console.log("\n🧪 Setting up Prettier config files...");

  const filesToCopy = {
    ".prettierrc": "template/.prettierrc",
    ".prettierignore": "template/.prettierignore",
  };

  const settingsSrcPath = path.join(
    __dirname,
    "template/.vscode/settings.json"
  );

  Object.entries(filesToCopy).forEach(([target, src]) => {
    const destPath = path.join(process.cwd(), target);
    const srcPath = path.join(__dirname, src);

    if (!fs.existsSync(path.dirname(destPath))) {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
    }

    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Created: ${target}`);
  });

  if (!fs.existsSync(path.dirname(settingsDestPath))) {
    fs.mkdirSync(path.dirname(settingsDestPath), { recursive: true });
  }

  let existingSettings = {};
  if (fs.existsSync(settingsDestPath)) {
    try {
      existingSettings = JSON.parse(fs.readFileSync(settingsDestPath, "utf8"));
      fs.writeFileSync(
        settingsBackupPath,
        JSON.stringify(existingSettings, null, 2)
      );
      console.log("📦 Backed up: existing .vscode/settings.json");
    } catch (err) {
      console.warn("⚠️ Failed to read existing settings.json. Will overwrite.");
    }
  }

  let newSettingsBlock = [
    "  // >> Auto Generated Prettier settings ",
    '  "editor.formatOnSave": true,',
    '  "editor.defaultFormatter": "esbenp.prettier-vscode",',
    "  // Auto Generated Prettier settings <<",
  ];

  let existingLines = [];
  if (fs.existsSync(settingsDestPath)) {
    existingLines = fs.readFileSync(settingsDestPath, "utf8").split("\n");
  }

  const startIndex = existingLines.findIndex((line) =>
    line.includes("// create-prettier-config:start")
  );
  const endIndex = existingLines.findIndex((line) =>
    line.includes("// create-prettier-config:end")
  );

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    existingLines.splice(
      startIndex,
      endIndex - startIndex + 1,
      ...newSettingsBlock
    );
  } else {
    // Inject after opening brace (di atas properti lain)
    const openingBraceIndex = existingLines.findIndex((line) =>
      line.trim().startsWith("{")
    );
    if (openingBraceIndex !== -1) {
      existingLines.splice(openingBraceIndex + 1, 0, ...newSettingsBlock);
    } else {
      existingLines = ["{", ...newSettingsBlock, "}"];
    }
  }

  fs.writeFileSync(settingsDestPath, existingLines.join("\n"));
  console.log("✅ Injected Prettier settings with comments.");

  console.log("\n📦 Installing Prettier...");
  try {
    execSync("npm install --save-dev prettier", { stdio: "inherit" });
    console.log("\n🎉 Prettier installed successfully!\n");
  } catch (err) {
    console.error(
      "❌ Failed to install Prettier. Please run manually: npm install --save-dev prettier"
    );
  }
})();
