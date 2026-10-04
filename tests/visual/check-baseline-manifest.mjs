import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";

const manifest = JSON.parse(await readFile(new URL("./baseline-manifest.json", import.meta.url), "utf8"));
const evidence = JSON.parse(await readFile(new URL(`./${manifest.evidence}`, import.meta.url), "utf8"));
const requiredRoutes = ["/", "/services", "/fleet", "/booking", "/login", "/dashboard", "/corporate", "/corporate/usage"];
for (const route of requiredRoutes) {
  if (!manifest.routes.includes(route)) throw new Error(`Missing visual route: ${route}`);
}
for (const viewport of ["390x844", "768x1024", "1024x768", "1440x900", "1920x1080"]) {
  if (!manifest.viewports.some(({ width, height }) => `${width}x${height}` === viewport)) throw new Error(`Missing visual viewport: ${viewport}`);
}
execFileSync("git", ["rev-parse", "--verify", `${manifest.reference.gitRef}^{commit}`], { stdio: "ignore" });
for (const route of ["/", "/services", "/fleet"]) {
  for (const viewport of ["390x844", "768x1024", "1024x768", "1440x900", "1920x1080"]) {
    const comparison = evidence.exactComparisons.find((item) => item.route === route && item.viewport === viewport);
    if (!comparison?.exact || comparison.originalDigest !== comparison.migratedDigest) {
      throw new Error(`Missing exact visual evidence: ${route} at ${viewport}`);
    }
  }
}
if (!evidence.reviewedDifferences.some((item) => item.route === "/login" && item.intentional === true)) {
  throw new Error("Missing documented login visual difference.");
}
console.info(`Visual evidence verified against ${manifest.reference.gitRef} (${evidence.date}).`);
