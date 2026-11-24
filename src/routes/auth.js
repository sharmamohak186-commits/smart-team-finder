const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const validate = require('../middleware/validate');
const { registerSchema } = require('../validators/schemas');

const router = express.Router();

router.get('/register', (req, res) => res.render('register', { error: null, form: {} }));

router.post('/register', validate(registerSchema, 'register'), async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    if (await User.exists({ email })) {
      return res.status(400).render('register', { error: 'Email already registered', form: req.body });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    const user = await User.create({ name: req.body.name, email, passwordHash });
    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect('/profile');
    });
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  res.render('login', { error: req.query.error ? 'Invalid email or password' : null });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/teams',
  failureRedirect: '/login?error=1',
}));

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

module.exports = router;
