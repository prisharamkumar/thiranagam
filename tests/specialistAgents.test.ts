import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  computeEffectiveSkillLevel,
  findMatchingLearnerSkill,
} from '../src/agents/specialistAgents.ts';
import type { SkillRecord } from '../src/types.ts';
import { normalizeMentorHistory, normalizeMentorQuestion } from '../server/requestLimits.ts';

const skill = (overrides: Partial<SkillRecord> = {}): SkillRecord => ({
  id: 'skill-1',
  name: 'React',
  kind: 'technical',
  selfReportedLevel: 3,
  origin: 'self-reported',
  ...overrides,
});

test('missing skills receive zero effective level', () => {
  const result = computeEffectiveSkillLevel(undefined);
  assert.equal(result.effectiveLevel, 0);
  assert.equal(result.status, 'missing');
});

test('self-reported skills remain explicitly unverified', () => {
  const result = computeEffectiveSkillLevel(skill({ selfReportedLevel: 4 }));
  assert.equal(result.effectiveLevel, 4);
  assert.equal(result.status, 'self-reported-only');
  assert.match(result.discrepancyNote, /unverified/i);
});

test('low assessment scores flag verified skills for revision', () => {
  const result = computeEffectiveSkillLevel(
    skill({ verifiedLevel: 2, lastAssessedScore: 45, origin: 'both' })
  );
  assert.equal(result.effectiveLevel, 2);
  assert.equal(result.status, 'needs-revision');
  assert.match(result.discrepancyNote, /45%/);
});

test('passing assessment scores mark skills as verified', () => {
  const result = computeEffectiveSkillLevel(
    skill({ verifiedLevel: 4, lastAssessedScore: 85, origin: 'both' })
  );
  assert.equal(result.effectiveLevel, 4);
  assert.equal(result.status, 'verified');
});

test('learner skill matching is case-insensitive and supports aliases', () => {
  const learnerSkills = [skill({ name: 'JS' })];
  assert.equal(findMatchingLearnerSkill('JavaScript', ['js'], learnerSkills), learnerSkills[0]);
  assert.equal(findMatchingLearnerSkill('Python', ['py'], learnerSkills), undefined);
});

test('mentor questions are trimmed and capped at 2,000 characters', () => {
  assert.equal(normalizeMentorQuestion('  Help me plan  '), 'Help me plan');
  assert.equal(normalizeMentorQuestion('   '), null);
  assert.equal(normalizeMentorQuestion('x'.repeat(2001)), null);
});

test('mentor history keeps only the latest 12 valid, bounded messages', () => {
  const input = Array.from({ length: 14 }, (_, index) => ({
    role: index % 2 === 0 ? 'user' : 'mentor',
    text: `message-${index}`,
  }));
  input.push({ role: 'system', text: 'must be discarded' });
  const result = normalizeMentorHistory(input);
  assert.equal(result.length, 12);
  assert.equal(result[0].text, 'message-2');
  assert.equal(result[11].text, 'message-13');
  assert.ok(result.every((entry) => entry.text.length <= 2000));
});

test('mentor history discards malformed entries and bounds long messages', () => {
  const result = normalizeMentorHistory([
    null,
    { role: 'user', text: 'x'.repeat(2500) },
    { role: 'assistant', text: 'invalid role' },
  ]);
  assert.equal(result.length, 1);
  assert.equal(result[0].text.length, 2000);
});
