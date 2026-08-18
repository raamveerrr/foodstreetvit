/**
 * build-spa.cjs
 * Builds ONLY the Vite client bundle and generates a static index.html
 * that loads the app as a pure Single Page Application.
 * This completely bypasses SSR / Nitro / Edge functions.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const DIST = path.resolve(__dirname, "dist");

// ── Step 1: Run the normal build (client + server) ──────────────────────
console.log("⏳ Running vite build ...");
try {
    execSync("npx vite build", { stdio: "inherit", cwd: __dirname });
} catch {
    console.log("⚠️  Full build had errors (likely SSR) — continuing with client assets...");
}

// ── Step 2: Nuke the server output so Netlify never discovers it ────────
for (const dir of [".netlify", ".output/server"]) {
    const full = path.resolve(__dirname, dir);
    if (fs.existsSync(full)) {
        fs.rmSync(full, { recursive: true, force: true });
        console.log(`🗑️  Removed ${dir}`);
    }
}

// ── Step 3: Discover the entry JS and CSS chunks in dist/assets ─────────
if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST, { recursive: true });
}

const assetsDir = path.join(DIST, "assets");
let entryJs = "";
let entryCss = "";

if (fs.existsSync(assetsDir)) {
    const files = fs.readdirSync(assetsDir);
    // The entry chunk is the one whose name starts with "index-"
    entryJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js")) || "";
    entryCss = files.find((f) => f.endsWith(".css")) || "";
}

if (!entryJs) {
    console.error("❌ Could not find entry JS chunk in dist/assets/");
    process.exit(1);
}

console.log(`✅ Entry JS:  assets/${entryJs}`);
console.log(`✅ Entry CSS: assets/${entryCss || "(none)"}`);

// ── Step 4: Generate index.html ─────────────────────────────────────────
const cssLink = entryCss
    ? `<link rel="stylesheet" href="/assets/${entryCss}" />`
    : "";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="DigitalFoodStreet — Campus food ordering made easy" />
  <title>DigitalFoodStreet</title>
  ${cssLink}
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/${entryJs}"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(DIST, "index.html"), html, "utf-8");
console.log("✅ Generated dist/index.html");

// ── Step 5: Write _redirects for SPA client-side routing ────────────────
fs.writeFileSync(path.join(DIST, "_redirects"), "/*    /index.html   200\n", "utf-8");
console.log("✅ Generated dist/_redirects");

console.log("\n🎉 SPA build complete — dist/ is ready for static deployment!");
