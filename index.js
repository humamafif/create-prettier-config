#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const isRevert = process.argv.includes("--revert");

const filesToDelete = [".prettierrc", ".prettierignore"];
const settingsDir = path.join(process.cwd(), ".vscode");
const settingsDestPath = path.join(settingsDir, "settings.json");
const settingsBackupPath = path.join(
  settingsDir,
  "settings.backup.prettier.json"
);

const prettierConfigBlock = `// create-prettier-config:start
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
// create-prettier-config:end`;

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

function removePrettierBlock(content) {
  const start = content.indexOf("// create-prettier-config:start");
  const end = content.indexOf("// create-prettier-config:end");
  if (start !== -1 && end !== -1 && end > start) {
    const before = content.slice(0, start);
    const after = content.slice(end + "// create-prettier-config:end".length);
    return before.trimEnd() + "\n" + after.trimStart();
  }
  return content;
}

(async function () {
  if (isRevert) {
    console.log("\n⏪ Reverting changes...");

    // Delete Prettier config files
    filesToDelete.forEach((file) => {
      const fullPath = path.join(process.cwd(), file);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        console.log(`🗑️  Removed: ${file}`);
      }
    });

    // Restore or clean up settings.json
    if (fs.existsSync(settingsDestPath)) {
      let settingsContent = fs.readFileSync(settingsDestPath, "utf8");
      const updatedContent = removePrettierBlock(settingsContent);

      if (updatedContent !== settingsContent) {
        const answer = await prompt(
          "⚠️  Revert will modify .vscode/settings.json. Proceed? (y/N): "
        );
        if (!/^y(es)?$/i.test(answer.trim())) {
          console.log("❌ Revert cancelled.");
          process.exit(0);
        }

        fs.writeFileSync(settingsDestPath, updatedContent.trim() + "\n");
        console.log("✅ Removed Prettier config from settings.json");
      }
    }

    // Delete backup if exists
    if (fs.existsSync(settingsBackupPath)) {
      fs.unlinkSync(settingsBackupPath);
    }

    // Uninstall prettier
    try {
      console.log("📦 Uninstalling Prettier...");
      execSync("npm uninstall prettier", { stdio: "inherit" });
      console.log("🧹 Prettier uninstalled.");
    } catch {
      console.warn(
        "⚠️  Failed to uninstall Prettier. Please remove it manually."
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

  Object.entries(filesToCopy).forEach(([target, src]) => {
    const destPath = path.join(process.cwd(), target);
    const srcPath = path.join(__dirname, src);
    fs.copyFileSync(srcPath, destPath);
    console.log(`✅ Created: ${target}`);
  });

  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
  }

  // Backup if exists
  let existingSettings = "";
  if (fs.existsSync(settingsDestPath)) {
    existingSettings = fs.readFileSync(settingsDestPath, "utf8");
    fs.writeFileSync(settingsBackupPath, existingSettings);
    console.log("📦 Backed up: existing settings.json");
  }

  // Update or create new settings.json
  let result = "{}";
  if (existingSettings) {
    let lines = existingSettings.trim().split("\n");
    const startIndex = lines.findIndex((line) =>
      line.includes("// create-prettier-config:start")
    );
    const endIndex = lines.findIndex((line) =>
      line.includes("// create-prettier-config:end")
    );

    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      lines.splice(startIndex, endIndex - startIndex + 1);
    }

    const insertIndex = lines.findIndex((line) => line.trim().startsWith("{"));
    if (insertIndex !== -1) {
      lines.splice(insertIndex + 1, 0, prettierConfigBlock);
      result = lines.join("\n");
    } else {
      result = "{\n" + prettierConfigBlock + "\n}";
    }
  } else {
    result = "{\n" + prettierConfigBlock + "\n}";
  }

  if (!fs.existsSync(path.dirname(settingsDestPath))) {
    fs.mkdirSync(path.dirname(settingsDestPath), { recursive: true });
  }

  fs.writeFileSync(settingsDestPath, result.trim() + "\n");
  console.log("✅ Injected Prettier settings with tags.");

  // Install prettier
  try {
    console.log("\n📦 Installing Prettier...");
    execSync("npm install --save-dev prettier", { stdio: "inherit" });
    console.log("🎉 Prettier installed successfully!\n");
  } catch (err) {
    console.error("❌ Failed to install Prettier.");
  }
})();
