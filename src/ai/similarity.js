// AI features for Smart Team Finder: normalization, cosine similarity,
// content-based candidate ranking, and team gap analysis.
// Uses only basic math and set operations. No trained models.

const SYNONYMS = {
  'reactjs': 'react',
  'react.js': 'react',
  'nodejs': 'node',
  'node.js': 'node',
  'expressjs': 'express',
  'express.js': 'express',
  'mongo': 'mongodb',
  'js': 'javascript',
  'ts': 'typescript',
  'py': 'python',
  'postgres': 'postgresql',
};

// Step 1: normalization. "  ReactJS " -> "react"
function normalizeSkill(raw) {
  const key = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return SYNONYMS[key] || key;
}

function normalizeSkills(list) {
  return [...new Set((list || []).map(normalizeSkill).filter(Boolean))];
}

// Step 2: cosine similarity = (A · B) / (|A| × |B|)
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const round2 = (x) => Math.round(x * 100) / 100;

// Step 3: rank candidates by similarity to the team's required skills.
// requiredSkills: [{ name, core }]. Core skills get weight 2, others weight 1.
function matchCandidates(requiredSkills, candidates) {
  const need = new Map();
  for (const s of requiredSkills || []) {
    const name = normalizeSkill(s.name);
    if (name) need.set(name, s.core ? 2 : 1);
  }

  const vocab = [...need.keys()];
  if (vocab.length === 0) {
    return candidates.map((candidate) => ({ candidate, score: 0 }));
  }

  const needVector = vocab.map((skill) => need.get(skill));

  return candidates
    .map((candidate) => {
      const skills = normalizeSkills(candidate.skills);
      const candidateVector = vocab.map((skill) => (skills.includes(skill) ? 1 : 0));
      return { candidate, score: round2(cosineSimilarity(candidateVector, needVector)) };
    })
    .sort((x, y) => y.score - x.score);
}

// Step 4: gap analysis using set operations.
// members: array of users whose skills form the team's combined skill set.
function gapAnalysis(requiredSkills, members) {
  const required = (requiredSkills || [])
    .map((s) => ({ name: normalizeSkill(s.name), core: !!s.core }))
    .filter((s) => s.name);

  const teamSkills = new Set(members.flatMap((m) => normalizeSkills(m.skills)));
  const missing = required.filter((s) => !teamSkills.has(s.name));
  const total = required.length;
  const covered = total - missing.length;

  return {
    total,
    covered,
    coverage: total ? Math.round((covered / total) * 100) : 100,
    missing: missing.map((s) => s.name),
    missingCore: missing.filter((s) => s.core).map((s) => s.name),
  };
}

module.exports = {
  normalizeSkill,
  normalizeSkills,
  cosineSimilarity,
  matchCandidates,
  gapAnalysis,
};
