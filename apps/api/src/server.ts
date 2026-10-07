import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { DemoRepository } from "./demo-repository.js";
import { MySqlRepository } from "./mysql-repository.js";

const config = loadConfig();
const repository = config.dataMode === "demo" ? new DemoRepository() : new MySqlRepository();
// Fail before accepting traffic if the configured database is unavailable.
await repository.health();
const app = createApp({ repository, config });
const server = app.listen(config.port, "127.0.0.1", () => {
  console.info(`Ascenta API listening on http://127.0.0.1:${config.port} (${config.dataMode} data mode)`);
});

async function shutdown(signal: string) {
  console.info(`${signal} received; closing Ascenta API.`);
  server.close(async () => {
    await repository.close?.();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
