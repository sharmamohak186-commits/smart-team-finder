const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const requireLogin = require('../middleware/requireLogin');
const validate = require('../middleware/validate');
const { teamSchema } = require('../validators/schemas');
const { parseRequiredSkills } = require('../utils/parse');
const { matchCandidates, gapAnalysis } = require('../ai/similarity');

const router = express.Router();
router.use(requireLogin);

router.get('/', async (req, res, next) => {
  try {
    const teams = await Team.find().populate('owner', 'name').sort({ createdAt: -1 });
    res.render('teams', { teams });
  } catch (err) {
    next(err);
  }
});

router.get('/new', (req, res) => res.render('team-new', { error: null, form: {} }));

router.post('/', validate(teamSchema, 'team-new'), async (req, res, next) => {
  try {
    const requiredSkills = parseRequiredSkills(req.body.requiredSkills);
    if (requiredSkills.length === 0) {
      return res.status(400).render('team-new', { error: 'Add at least one required skill', form: req.body });
    }
    const team = await Team.create({
      title: req.body.title,
      description: req.body.description || '',
      owner: req.user._id,
      requiredSkills,
      members: [],
    });
    res.redirect(`/teams/${team._id}`);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).render('error', { message: 'Team not found' });
    }
    const team = await Team.findById(req.params.id).populate('owner members');
    if (!team) return res.status(404).render('error', { message: 'Team not found' });

    const memberIds = [team.owner._id, ...team.members.map((m) => m._id)];
    const candidates = await User.find({ _id: { $nin: memberIds } }).select('name skills experience');

    const ranking = matchCandidates(team.requiredSkills, candidates);
    const gaps = gapAnalysis(team.requiredSkills, [team.owner, ...team.members]);
    const isOwner = String(team.owner._id) === String(req.user._id);

    res.render('team', { team, ranking, gaps, isOwner });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/members/:userId', async (req, res, next) => {
  try {
    const { id, userId } = req.params;
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) {
      return res.status(404).render('error', { message: 'Not found' });
    }
    const team = await Team.findById(id);
    if (!team) return res.status(404).render('error', { message: 'Team not found' });
    if (String(team.owner) !== String(req.user._id)) {
      return res.status(403).render('error', { message: 'Only the team owner can add members' });
    }

    const exists = await User.exists({ _id: userId });
    const alreadyMember = team.members.some((m) => String(m) === userId);
    if (exists && !alreadyMember) {
      team.members.push(userId);
      await team.save();
    }
    res.redirect(`/teams/${id}`);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
