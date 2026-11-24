# Smart Team Finder

A skill-based team recruitment platform. Team leads post the skills a project needs, and the app:

- **Ranks candidates by skill similarity** using cosine similarity over skill vectors (content-based recommendation). Core skills count double.
- **Runs team gap analysis** to show coverage percentage and which required skills no current member has.

## Tech stack
Node.js, Express.js, MongoDB (Mongoose), EJS, Passport.js (local auth), Joi validation.

## How the AI part works
1. **Normalization:** skill names are lowercased and synonyms are mapped (`reactjs` becomes `react`, `mongo` becomes `mongodb`).
2. **Vectors:** each candidate becomes a vector with one slot per required skill: 1 if they have it, 0 if not. The team's requirements form a second vector, where core skills have weight 2 and nice-to-haves have weight 1.
3. **Cosine similarity:** `(A · B) / (|A| × |B|)`. The score is 0 for no overlap and 1 for a perfect match.
4. **Gap analysis:** required skills minus the union of team members' skills. Coverage = covered ÷ required × 100.

No training data or ML libraries are needed. The logic lives in `src/ai/similarity.js`.

## Setup
```bash
npm install
cp .env.example .env     # then edit values
npm test                 # runs the unit tests for the AI logic
npm start                # http://localhost:3000
```
You need a running MongoDB (local or MongoDB Atlas). Put its connection string in `MONGO_URI`.

## Usage
1. Register, then fill in your profile skills (comma-separated, e.g. `React, Node, MongoDB`).
2. Create a team. In required skills, add `*` after a core skill: `react*, node*, mongodb, figma`.
3. Open the team to see the gap analysis and ranked candidates. As owner, add members from the ranked list.

## Project structure
```
server.js                 app entry point
src/ai/similarity.js      cosine similarity, matching, gap analysis (the AI features)
src/config/               database connection and Passport strategy
src/models/               User and Team schemas
src/routes/               auth, teams, profile routes
src/validators/           Joi schemas
src/middleware/           login guard and validation middleware
src/utils/parse.js        turns comma-separated input into arrays
views/                    EJS templates
test/                     unit tests
```

## Roadmap
- Invite / accept / reject recruitment flow
- Skill extraction from pasted resume text
