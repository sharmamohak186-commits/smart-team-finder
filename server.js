require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const connectDB = require('./src/config/db');
require('./src/config/passport');

const authRoutes = require('./src/routes/auth');
const teamRoutes = require('./src/routes/teams');
const profileRoutes = require('./src/routes/profile');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));

async function start() {
  await connectDB();

  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
  });

  app.get('/', (req, res) => res.redirect('/teams'));
  app.use('/', authRoutes);
  app.use('/teams', teamRoutes);
  app.use('/profile', profileRoutes);

  app.use((req, res) => res.status(404).render('error', { message: 'Page not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render('error', { message: 'Something went wrong' });
  });

  app.listen(PORT, () => console.log(`Smart Team Finder running on http://localhost:${PORT}`));
}

start();
