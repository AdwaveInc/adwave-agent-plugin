#!/usr/bin/env node
/**
 * Keeps every manifest in this repo saying the same thing: one plugin name,
 * one version, one MCP URL, assets that exist, and each platform's length
 * limits. The official validators (mcp-publisher, the Agent Plugins schemas,
 * agentskills, claude plugin validate) run in CI next to this.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const NAME = "adwave";
const MCP_URL = "https://waverunner.adwave.com/api/mcp";
const errors = [];
const fail = (message) => errors.push(message);
const json = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${file}: ${error.message}`);
    return {};
  }
};

const root = json("plugin.json");
const claude = json(".claude-plugin/plugin.json");
const market = json(".claude-plugin/marketplace.json");
const cursor = json(".cursor-plugin/plugin.json");
const gemini = json("gemini-extension.json");
const server = json("server.json");
const version = root.version;
if (!json(".agents/plugins/marketplace.json").plugins?.some((plugin) => plugin.name === NAME))
  fail(`.agents/plugins/marketplace.json: must list "${NAME}"`);

const listed = market.plugins?.find((plugin) => plugin.name === NAME);
for (const [file, manifest] of [
  ["plugin.json", root],
  [".claude-plugin/plugin.json", claude],
  [".claude-plugin/marketplace.json plugins[adwave]", listed ?? {}],
  [".cursor-plugin/plugin.json", cursor],
  ["gemini-extension.json", gemini],
]) {
  if (manifest.name !== NAME) fail(`${file}: name must be "${NAME}"`);
  if (manifest.version !== version)
    fail(`${file}: version ${manifest.version} differs from plugin.json ${version}`);
}
if (server.version !== version)
  fail(`server.json: version ${server.version} differs from plugin.json ${version}`);

const urls = {
  "mcp.json": json("mcp.json").mcpServers?.[NAME]?.url,
  ".mcp.json": json(".mcp.json").mcpServers?.[NAME]?.url,
  ".cursor-plugin/mcp.json": json(".cursor-plugin/mcp.json").mcpServers?.[NAME]
    ?.url,
  "gemini-extension.json": gemini.mcpServers?.[NAME]?.httpUrl,
  "server.json": server.remotes?.[0]?.url,
};
for (const [file, url] of Object.entries(urls)) {
  if (url !== MCP_URL) fail(`${file}: MCP URL must be ${MCP_URL}, found ${url}`);
}

// Cursor's manifest reference documents only these fields.
const cursorFields = new Set([
  "name", "version", "description", "author", "homepage", "repository",
  "license", "keywords", "logo", "rules", "skills", "agents", "commands",
  "hooks", "mcpServers", "variables",
]);
for (const field of Object.keys(cursor)) {
  if (!cursorFields.has(field)) fail(`.cursor-plugin/plugin.json: undocumented field "${field}"`);
}

const ui = root.extensions?.["com.openai"]?.interface ?? {};
const limits = { displayName: 30, shortDescription: 30, longDescription: 4000, developerName: 80 };
for (const [field, max] of Object.entries(limits)) {
  if (typeof ui[field] !== "string" || ui[field].length > max)
    fail(`plugin.json OpenAI interface.${field}: required, at most ${max} characters`);
}
if (!Array.isArray(ui.defaultPrompt) || ui.defaultPrompt.length > 3 || ui.defaultPrompt.some((p) => p.length > 128))
  fail("plugin.json OpenAI interface.defaultPrompt: up to 3 prompts of at most 128 characters");
for (const asset of [ui.logo, ui.composerIcon, cursor.logo]) {
  if (!asset || !existsSync(asset)) fail(`missing asset ${asset}`);
}
if (typeof server.description !== "string" || server.description.length > 100)
  fail("server.json: description is required and at most 100 characters");

for (const dir of readdirSync("skills")) {
  const file = path.join("skills", dir, "SKILL.md");
  if (!statSync(path.join("skills", dir)).isDirectory() || !existsSync(file)) continue;
  const front = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---\n/);
  const field = (key) => front?.[1].match(new RegExp(`^${key}: (.+)$`, "m"))?.[1];
  if (field("name") !== dir) fail(`${file}: frontmatter name must be "${dir}"`);
  const description = field("description") ?? "";
  if (!description || description.length > 1024)
    fail(`${file}: description is required and at most 1024 characters`);
}

const secret = /\b(wr_|wrs_)[A-Za-z0-9]{8,}|Bearer [A-Za-z0-9._-]{20,}/;
const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    if ([".git", "node_modules"].includes(entry)) return [];
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
for (const file of walk(".").filter((f) => /\.(json|md|mjs|ya?ml)$/.test(f))) {
  if (secret.test(readFileSync(file, "utf8"))) fail(`${file}: looks like it contains a credential`);
}

if (errors.length) {
  console.error(`Validation failed:\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log(`All manifests agree: ${NAME} ${version} at ${MCP_URL}`);
