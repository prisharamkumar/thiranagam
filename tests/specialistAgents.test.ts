import assert from 'node:assert/strict';
import test from 'node:test';
import {
  computeEffectiveSkillLevel,
  findMatchingLearnerSkill,
} from '../src/agents/specialistAgents.ts';
import type { SkillRecord } from '../src/types.ts';

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
