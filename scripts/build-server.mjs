import { build } from "esbuild";
import pathModule from "node:path";
import { fileURLToPath as fileURLToPathShim } from "node:url";
import { createRequire as createRequireShim } from "node:module";

const banner = `
import pathModule from "node:path";
import { fileURLToPath as fileURLToPathShim } from "node:url";
import { createRequire as createRequireShim } from "node:module";
const require = globalThis.require ?? createRequireShim(import.meta.url);
const __filename = globalThis.__filename ?? fileURLToPathShim(import.meta.url);
const __dirname = globalThis.__dirname ?? pathModule.dirname(__filename);
`.trim();

const __filename = fileURLToPathShim(import.meta.url);
const __dirname = pathModule.dirname(__filename);

await build({
  entryPoints: ["server/index.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  outfile: "dist/index.js",
  external: ["lightningcss", "vite"],
  banner: {
    js: banner,
  },
});

console.log("Server bundle written to dist/index.js");

