// Export the actual rendered repair screens for a credential-free, static review artifact.
// This is not a second implementation or a customer-facing deployment.
const fs = require("node:fs")
const path = require("node:path")

async function main() {
  const out = process.argv[2]
  if (!out) throw new Error("Supply a review output directory.")
  const routes = {
    "/preview": "overview.html", "/prequal": "prequal.html", "/auth/sign-up": "signup.html",
    "/auth/login": "login.html", "/auth/forgot-password": "recovery.html", "/auth/reset-password": "reset.html",
  }
  fs.mkdirSync(out, { recursive: true })
  fs.cpSync(path.resolve(__dirname, "../.next/static"), path.join(out, "_next/static"), {
    recursive: true,
    filter: source => fs.statSync(source).isDirectory() || /\.(css|woff2?|ttf|png|svg)$/.test(source),
  })
  fs.copyFileSync(path.resolve(__dirname, "../public/logo.png"), path.join(out, "logo.png"))
  for (const [route, filename] of Object.entries(routes)) {
    const response = await fetch("http://127.0.0.1:3000" + route)
    if (!response.ok) throw new Error(`Screen export failed: ${route} ${response.status}`)
    let html = await response.text()
    html = html.replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<link\b[^>]*(?:as="script"|rel="manifest")[^>]*>/gi, "")
      .replace(/\b(href|src)="(\/[^"]*)"/g, (_, attribute, value) => {
        if (value.startsWith("/_next/")) return `${attribute}=".${value}"`
        if (value.startsWith("/help")) return `${attribute}="https://www.cookincapital.com${value}"`
        if (attribute === "src") return `${attribute}=".${value}"`
        return `${attribute}="${routes[value.split("?")[0]] || "overview.html"}"`
      })
      .replace(/type="submit"/g, 'type="submit" disabled aria-disabled="true"')
      .replace("</body>", `<script>document.addEventListener('submit',event=>event.preventDefault());</script></body>`)
    fs.writeFileSync(path.join(out, filename), html)
  }
  console.log(`Exported ${Object.keys(routes).length} actual build screens. Submission remains disabled.`)
}
main().catch(error => { console.error(error); process.exit(1) })
