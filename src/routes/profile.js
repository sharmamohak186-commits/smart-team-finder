const express = require('express');
const requireLogin = require('../middleware/requireLogin');
const validate = require('../middleware/validate');
const { profileSchema } = require('../validators/schemas');
const { parseSkills } = require('../utils/parse');
const { normalizeSkills } = require('../ai/similarity');

const router = express.Router();
router.use(requireLogin);

router.get('/', (req, res) => {
  res.render('profile', {
    error: null,
    form: {
      bio: req.user.bio,
      experience: req.user.experience,
      skills: req.user.skills.join(', '),
    },
  });
});

router.post('/', validate(profileSchema, 'profile'), async (req, res, next) => {
  try {
    const user = req.user;
    user.bio = req.body.bio || '';
    user.experience = req.body.experience;
    user.skills = normalizeSkills(parseSkills(req.body.skills));
    await user.save();
    res.redirect('/profile');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
