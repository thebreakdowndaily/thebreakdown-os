/**
 * The Breakdown OS — Autonomous Engineering System Smoke Test
 *
 * Verifies that:
 * 1. Root AGENTS.md contains the active operating contract (Section 8).
 * 2. Core skills exist with valid frontmatter and discoverable paths.
 * 3. Specialist agents exist with correct roles and tool restrictions.
 * 4. Durable working memory in docs/agent-operating-system/ is verified.
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert/strict';

const ROOT = process.cwd();

console.log('======================================================');
console.log('SMOKE TEST: AUTONOMOUS ENGINEERING SYSTEM VERIFICATION');
console.log('======================================================\n');

// 1. Verify AGENTS.md contract
console.log('1. Checking AGENTS.md Operating Contract:');
const agentsMdPath = path.join(ROOT, 'AGENTS.md');
assert.ok(fs.existsSync(agentsMdPath), 'AGENTS.md must exist at root');
const agentsContent = fs.readFileSync(agentsMdPath, 'utf-8');
assert.ok(
  agentsContent.includes('## 8. Autonomous engineering collaborator contract'),
  'AGENTS.md must contain Section 8'
);
assert.ok(
  agentsContent.includes('issue-to-completion'),
  'AGENTS.md must reference issue-to-completion skill'
);
assert.ok(
  agentsContent.includes('adversarial-verification'),
  'AGENTS.md must reference adversarial-verification skill'
);
assert.ok(
  agentsContent.includes('publication-safety'),
  'AGENTS.md must reference publication-safety skill'
);
assert.ok(
  agentsContent.includes('release-readiness'),
  'AGENTS.md must reference release-readiness skill'
);
assert.ok(
  agentsContent.includes('evidence-first-completion'),
  'AGENTS.md must reference evidence-first-completion skill'
);
assert.ok(
  agentsContent.includes('docs/agent-operating-system/'),
  'AGENTS.md must reference working memory path'
);

const breakdownRulePath = path.join(ROOT, '.agents', 'rules', 'thebreakdown.md');
assert.ok(fs.existsSync(breakdownRulePath), 'thebreakdown.md rule must exist');
const breakdownRuleContent = fs.readFileSync(breakdownRulePath, 'utf-8');
assert.ok(
  breakdownRuleContent.includes('evidence-first-completion'),
  'thebreakdown.md must reference evidence-first-completion'
);
console.log('   PASS: AGENTS.md and rule contain all required autonomous contract clauses.\n');

// 2. Verify Skills
console.log('2. Checking Core Agent Skills:');
const requiredSkills = [
  'issue-to-completion',
  'adversarial-verification',
  'publication-safety',
  'release-readiness',
  'evidence-first-completion',
];

for (const skillName of requiredSkills) {
  const skillPath = path.join(ROOT, '.agents', 'skills', skillName, 'SKILL.md');
  assert.ok(fs.existsSync(skillPath), `Skill file must exist: ${skillPath}`);
  const skillContent = fs.readFileSync(skillPath, 'utf-8');
  assert.ok(skillContent.startsWith('---\n'), `${skillName} must start with frontmatter`);
  assert.ok(skillContent.includes(`name: ${skillName}`), `${skillName} name must match directory`);
  assert.ok(skillContent.includes('description:'), `${skillName} must contain description`);
  assert.ok(skillContent.length >= 250, `${skillName} must be sufficiently detailed`);
  console.log(`   PASS: Skill "${skillName}" is valid.`);
}
console.log('');

// 3. Verify Specialist Agents
console.log('3. Checking Specialist Custom Agents:');
const requiredAgents = [
  { name: 'codebase-researcher', readOnly: true },
  { name: 'security-reviewer', readOnly: true },
  { name: 'verification-specialist', readOnly: false },
];

for (const agent of requiredAgents) {
  const agentPath = path.join(ROOT, '.agents', 'agents', agent.name, 'agent.md');
  assert.ok(fs.existsSync(agentPath), `Agent file must exist: ${agentPath}`);
  const agentContent = fs.readFileSync(agentPath, 'utf-8');
  assert.ok(agentContent.startsWith('---\n'), `${agent.name} must start with frontmatter`);
  assert.ok(agentContent.includes(`name: ${agent.name}`), `${agent.name} frontmatter name must match`);
  if (agent.readOnly) {
    assert.ok(
      !agentContent.includes('write_file') && !agentContent.includes('run_command'),
      `${agent.name} must be read-only (no write/execute tools)`
    );
  }
  console.log(`   PASS: Agent "${agent.name}" is valid.`);
}
console.log('');

// 4. Verify Durable Working Memory
console.log('4. Checking Working Memory Ledger:');
const memoryDir = path.join(ROOT, 'docs', 'agent-operating-system');
const requiredMemoryFiles = ['ACTIVE_STATE.md', 'DECISIONS.md', 'TASK_LEDGER.md', 'README.md'];

for (const file of requiredMemoryFiles) {
  const filePath = path.join(memoryDir, file);
  assert.ok(fs.existsSync(filePath), `Memory file must exist: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  assert.ok(content.length > 100, `${file} must contain substantive content`);
  console.log(`   PASS: Memory file "${file}" is present and non-empty.`);
}

console.log('\n======================================================');
console.log('ALL AUTONOMOUS SYSTEM VERIFICATION CHECKS PASSED ✅');
console.log('======================================================');
