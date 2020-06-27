var express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Users = require('../models/user');

const userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req, res, next) => {

  Users.register({username: req.body.username}, req.body.password).then(user => {
    passport.authenticate('local')(req, res, () => {
      res.status(200)
      .json({ success: true, status: 'Registration Successful' });
    });
  })
  .catch(err => {
    res.status(500)
    .json({ err: err });
  });
});

userRouter.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.status(200)
  .json({ success: true, status: 'You are successfully logged in!'});
});

userRouter.get('/logout', (req, res) => {
  if(req.session) {
    req.session.destroy();
    res.clearCookie('sessionId');
    res.redirect('/');
  }
  else {
    let err = new Error('You are not logged in!')

    err.status = 403;
    next(err);
  }
})

module.exports = userRouter;