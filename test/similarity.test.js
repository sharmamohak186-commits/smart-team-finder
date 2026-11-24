const test = require('node:test');
const assert = require('node:assert');
const {
  cosineSimilarity,
  normalizeSkills,
  matchCandidates,
  gapAnalysis,
} = require('../src/ai/similarity');

test('cosine similarity of identical vectors is 1', () => {
  assert.strictEqual(cosineSimilarity([1, 1, 0], [1, 1, 0]), 1);
});

test('cosine similarity of orthogonal vectors is 0', () => {
  assert.strictEqual(cosineSimilarity([1, 0], [0, 1]), 0);
});

test('synonyms and casing are normalized', () => {
  assert.deepStrictEqual(normalizeSkills(['ReactJS', 'react', 'Mongo']), ['react', 'mongodb']);
});

test('candidate with more required skills ranks first', () => {
  const required = [{ name: 'react', core: true }, { name: 'node', core: false }];
  const ranked = matchCandidates(required, [
    { name: 'a', skills: ['python'] },
    { name: 'b', skills: ['React', 'Node.js'] },
  ]);
  assert.strictEqual(ranked[0].candidate.name, 'b');
  assert.strictEqual(ranked[1].score, 0);
});

test('gap analysis finds missing skills and coverage', () => {
  const required = [
    { name: 'react', core: true },
    { name: 'mongodb', core: false },
    { name: 'figma', core: false },
  ];
  const gaps = gapAnalysis(required, [{ skills: ['React', 'Mongo'] }]);
  assert.deepStrictEqual(gaps.missing, ['figma']);
  assert.strictEqual(gaps.coverage, 67);
});
