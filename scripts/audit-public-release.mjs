import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { extname } from 'node:path';
import assert from 'node:assert/strict';

// Owner explicitly approved publishing this existing public Site link.
// This exception never permits another Site host, credentials or deployment IDs.
const approvedPublicOrigin = /https:\/\/helios-solar-explorer\.chasewilcox93\.chatgpt\.site(?=[/\s)#?]|$)/g;
const withoutApprovedOrigin = line => line.replace(approvedPublicOrigin, '');

// A deterministic public-file guard; use a dedicated scanner as well.
const files = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
if (!files.length) throw new Error('No tracked files: stage the intended public snapshot before auditing.');
const findings = [];
const binary = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.woff', '.woff2']);
const forbidden = /(?:^|\/)(?:\.env(?:\..*)?|\.npmrc|\.netrc|\.git-credentials|hosting\.json|id_rsa|id_ed25519|node_modules|dist|\.next|\.vinext|\.wrangler|\.openai|coverage)(?:\/|$)|\.(?:pem|key|p12|pfx|keystore|log)$/i;
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/],
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['openai-key', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{30,}\b/],
  ['aws-access-id', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['slack-token', /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ['credential-url', /https?:\/\/[^\s/:]+:[^\s/@]+@/],
  ['literal-auth-header', /(?:Authorization|Bearer)\s*[:=]\s*["']?(?:Bearer\s+)?[A-Za-z0-9_+./=-]{30,}/i],
  ['private-host-identity', /\bappg(?:prj|dep|ver)_[a-f0-9]{20,}\b|git\.chatgpt-team\.site|https?:\/\/[\w.-]+\.chatgpt\.site/i],
  ['machine-path', /[A-Z]:[\\/](?:Users|Documents and Settings)[\\/]|\/Users\/[^/\s]+\//i],
  ['personal-email', /[A-Z0-9._%+-]+@(?:gmail|outlook|hotmail|yahoo|beltc\.ctc)\.(?:com|edu)/i],
];
const hostingIdentityRule = rules.find(([name]) => name === 'private-host-identity')[1];
const approvedExample = 'https://' + 'helios-solar-explorer.chasewilcox93.chatgpt.site/';
assert.ok(!hostingIdentityRule.test(withoutApprovedOrigin(approvedExample)));
assert.ok(hostingIdentityRule.test(withoutApprovedOrigin('https://' + 'another-private.chatgpt.site/')));
assert.ok(hostingIdentityRule.test(withoutApprovedOrigin(approvedExample + ' appgprj_' + 'a'.repeat(32))));
assert.ok(hostingIdentityRule.test(withoutApprovedOrigin('https://' + 'helios-solar-explorer.chasewilcox93.chatgpt.site.evil.chatgpt.site/')));
for (const file of files) {
  if (forbidden.test(file) && file !== '.env.example') findings.push({file, rule:'forbidden-path'});
  const bytes = readFileSync(file);
  if (binary.has(extname(file))) continue;
  if (bytes.includes(0)) { findings.push({file,rule:'unreviewed-binary'}); continue; }
  const lines = bytes.toString('utf8').split(/\r?\n/);
  for (const [index,line] of lines.entries()) {
    for (const [rule,pattern] of rules) if (pattern.test(rule === 'private-host-identity' ? withoutApprovedOrigin(line) : line)) findings.push({file,line:index+1,rule});
  }
}
const lock = JSON.parse(readFileSync('package-lock.json','utf8'));
for (const [name,entry] of Object.entries(lock.packages ?? {})) {
  if (entry.resolved && !entry.resolved.startsWith('https://registry.npmjs.org/')) findings.push({file:'package-lock.json',rule:'non-public-registry',package:name});
}
console.log(JSON.stringify({trackedFiles:files.length,findings},null,2));
if (findings.length) process.exitCode = 1;
