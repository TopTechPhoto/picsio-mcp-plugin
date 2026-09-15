#!/usr/bin/env node
// Consistency checks across the manifests this repo publishes to five
// ecosystems. Everything here is hand-edited, so drift between a version
// bump in one file and not another is the likeliest way to ship something
// broken. No dependencies — `node scripts/validate.mjs`.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
const fail = (msg) => problems.push(msg);

const read = (rel) => readFileSync(join(root, rel), 'utf8');
const readJson = (rel) => {
  try {
    return JSON.parse(read(rel));
  } catch (err) {
    fail(`${rel}: ${err.message}`);
    return null;
  }
};

const MCP_URL = 'https://mcp.pics.io/mcp';
const PLUGIN_NAME = 'picsio';

const manifests = {
  portablePlugin: readJson('plugin.json'),
  claudePlugin: readJson('.claude-plugin/plugin.json'),
  claudeMarketplace: readJson('.claude-plugin/marketplace.json'),
  codexPlugin: readJson('.codex-plugin/plugin.json'),
  codexMarketplace: readJson('.agents/plugins/marketplace.json'),
  cursorPlugin: readJson('.cursor-plugin/plugin.json'),
  gemini: readJson('gemini-extension.json'),
  mcp: readJson('.mcp.json'),
  server: readJson('server.json'),
  tools: readJson('mcp-manifest.json'),
};

if (problems.length) report();

// --- versions line up ------------------------------------------------------

const version = manifests.claudePlugin.version;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`.claude-plugin/plugin.json: version "${version}" is not semver`);
}
const versioned = {
  'plugin.json': manifests.portablePlugin.version,
  '.claude-plugin/marketplace.json (metadata)': manifests.claudeMarketplace.metadata?.version,
  '.claude-plugin/marketplace.json (plugin)': manifests.claudeMarketplace.plugins?.[0]?.version,
  '.codex-plugin/plugin.json': manifests.codexPlugin.version,
  '.cursor-plugin/plugin.json': manifests.cursorPlugin.version,
  'gemini-extension.json': manifests.gemini.version,
  'server.json': manifests.server.version,
  'mcp-manifest.json': manifests.tools.version,
};
for (const [where, v] of Object.entries(versioned)) {
  if (v !== version) fail(`${where}: version ${v} != ${version}`);
}

// --- names line up ---------------------------------------------------------

const named = {
  'plugin.json': manifests.portablePlugin.name,
  '.claude-plugin/plugin.json': manifests.claudePlugin.name,
  '.claude-plugin/marketplace.json': manifests.claudeMarketplace.name,
  '.claude-plugin/marketplace.json (plugin)': manifests.claudeMarketplace.plugins?.[0]?.name,
  '.codex-plugin/plugin.json': manifests.codexPlugin.name,
  '.agents/plugins/marketplace.json': manifests.codexMarketplace.name,
  '.agents/plugins/marketplace.json (plugin)': manifests.codexMarketplace.plugins?.[0]?.name,
  '.cursor-plugin/plugin.json': manifests.cursorPlugin.name,
  'gemini-extension.json': manifests.gemini.name,
  'mcp-manifest.json': manifests.tools.name,
};
for (const [where, n] of Object.entries(named)) {
  if (n !== PLUGIN_NAME) fail(`${where}: name "${n}" != "${PLUGIN_NAME}"`);
}

// --- every manifest points at the same server ------------------------------

const urls = {
  '.mcp.json': manifests.mcp.mcpServers?.[PLUGIN_NAME]?.url,
  'gemini-extension.json': manifests.gemini.mcpServers?.[PLUGIN_NAME]?.httpUrl,
  '.cursor-plugin/plugin.json': manifests.cursorPlugin.mcpServers?.[PLUGIN_NAME]?.url,
  'server.json': manifests.server.remotes?.[0]?.url,
};
for (const [where, url] of Object.entries(urls)) {
  if (url !== MCP_URL) fail(`${where}: MCP url "${url}" != ${MCP_URL}`);
}
if (manifests.mcp.mcpServers?.[PLUGIN_NAME]?.type !== 'http') {
  fail('.mcp.json: picsio server must declare "type": "http"');
}

// --- the shared description is identical everywhere ------------------------

const description = manifests.claudePlugin.description;
const openaiInterface = manifests.portablePlugin.extensions?.['com.openai']?.interface;
const described = {
  'plugin.json': manifests.portablePlugin.description,
  'plugin.json (com.openai longDescription)': openaiInterface?.longDescription,
  '.claude-plugin/marketplace.json (metadata)': manifests.claudeMarketplace.metadata?.description,
  '.claude-plugin/marketplace.json (plugin)': manifests.claudeMarketplace.plugins?.[0]?.description,
  '.codex-plugin/plugin.json': manifests.codexPlugin.description,
  '.codex-plugin/plugin.json (longDescription)': manifests.codexPlugin.interface?.longDescription,
  '.cursor-plugin/plugin.json': manifests.cursorPlugin.description,
  'gemini-extension.json': manifests.gemini.description,
};
for (const [where, d] of Object.entries(described)) {
  if (d !== description) fail(`${where}: description differs from .claude-plugin/plugin.json`);
}

// --- the portable manifest stays inside its (closed) schema ---------------

const PORTABLE_KEYS = new Set(['$schema', 'name', 'version', 'description', 'author',
  'homepage', 'repository', 'license', 'keywords', 'extensions']);
for (const key of Object.keys(manifests.portablePlugin)) {
  if (!PORTABLE_KEYS.has(key)) {
    fail(`plugin.json: "${key}" is not in the Agent Plugins 1.0.0 schema, which sets additionalProperties:false`);
  }
}
if (manifests.portablePlugin.$schema !== 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json') {
  fail('plugin.json: $schema must be the Agent Plugins 1.0.0 identifier');
}
// Components are discovered at their default locations rather than declared.
for (const conventional of ['skills', '.mcp.json']) {
  if (!existsSync(join(root, conventional))) {
    fail(`plugin.json relies on ${conventional} at the plugin root, which is missing`);
  }
}
if (openaiInterface?.logo && !existsSync(join(root, openaiInterface.logo))) {
  fail(`plugin.json: com.openai logo points at missing path "${openaiInterface.logo}"`);
}

// --- manifest file references resolve --------------------------------------

for (const [where, manifest] of [
  ['.claude-plugin/plugin.json', manifests.claudePlugin],
  ['.codex-plugin/plugin.json', manifests.codexPlugin],
  ['.cursor-plugin/plugin.json', manifests.cursorPlugin],
]) {
  for (const key of ['mcpServers', 'skills', 'commands', 'logo']) {
    const value = manifest[key];
    if (typeof value === 'string' && !existsSync(join(root, value))) {
      fail(`${where}: ${key} points at missing path "${value}"`);
    }
  }
}
if (!existsSync(join(root, manifests.gemini.contextFileName ?? ''))) {
  fail(`gemini-extension.json: contextFileName "${manifests.gemini.contextFileName}" is missing`);
}

// --- skills are well formed ------------------------------------------------

const skillsDir = join(root, 'skills');
const skillNames = readdirSync(skillsDir).filter((d) => statSync(join(skillsDir, d)).isDirectory());
if (skillNames.length === 0) fail('skills/: no skills found');

for (const dir of skillNames) {
  const rel = `skills/${dir}/SKILL.md`;
  if (!existsSync(join(root, rel))) {
    fail(`skills/${dir}/: missing SKILL.md`);
    continue;
  }
  const body = read(rel);
  const frontmatter = body.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) {
    fail(`${rel}: missing YAML frontmatter`);
    continue;
  }
  const name = frontmatter[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const desc = frontmatter[1].match(/^description:\s*([\s\S]+?)(?=\n\w+:|$)/m)?.[1]?.trim();
  if (name !== dir) fail(`${rel}: frontmatter name "${name}" != directory "${dir}"`);
  if (!desc) fail(`${rel}: frontmatter has no description`);
  else if (desc.length < 80) fail(`${rel}: description is too thin to trigger reliably`);
}

// --- commands are well formed ----------------------------------------------

const commandsDir = join(root, 'commands');
if (existsSync(commandsDir)) {
  for (const file of readdirSync(commandsDir).filter((f) => f.endsWith('.md'))) {
    const rel = `commands/${file}`;
    const fm = read(rel).match(/^---\n([\s\S]*?)\n---\n/);
    if (!fm) fail(`${rel}: missing YAML frontmatter`);
    else if (!/^description:\s*\S/m.test(fm[1])) fail(`${rel}: frontmatter has no description`);
  }
}

// --- prose only mentions tools the server actually exposes -----------------

const toolNames = new Set((manifests.tools.tools ?? []).map((t) => t.name));
if (toolNames.size === 0) fail('mcp-manifest.json: no tools declared');

const proseFiles = ['README.md', 'GEMINI.md'];
for (const dir of skillNames) {
  const skillRoot = join(skillsDir, dir);
  const walk = (abs, rel) => {
    for (const entry of readdirSync(abs)) {
      const next = join(abs, entry);
      if (statSync(next).isDirectory()) walk(next, `${rel}/${entry}`);
      else if (entry.endsWith('.md')) proseFiles.push(`${rel}/${entry}`);
    }
  };
  walk(skillRoot, `skills/${dir}`);
}
if (existsSync(commandsDir)) {
  for (const f of readdirSync(commandsDir).filter((f) => f.endsWith('.md'))) {
    proseFiles.push(`commands/${f}`);
  }
}

for (const rel of proseFiles) {
  if (!existsSync(join(root, rel))) continue;
  for (const match of read(rel).matchAll(/\bpicsio_[a-z_]+/g)) {
    if (!toolNames.has(match[0])) {
      fail(`${rel}: references unknown tool "${match[0]}"`);
    }
  }
}

// --- no hooks: the marketplace policy scan is strict about them ------------

for (const hookPath of ['hooks', '.claude/hooks', 'hooks.json']) {
  if (existsSync(join(root, hookPath))) {
    fail(`${hookPath} exists — this plugin ships no hooks by design; see CONTRIBUTING.md`);
  }
}

report();

function report() {
  if (problems.length === 0) {
    console.log(`OK — ${PLUGIN_NAME} v${version ?? '?'}, ${skillNames?.length ?? 0} skill(s), all manifests in sync.`);
    process.exit(0);
  }
  console.error(`${problems.length} problem(s):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
