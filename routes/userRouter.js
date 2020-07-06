var express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const passMongoose = require('passport-local-mongoose');

const Users = require('../models/user');
const authenticate = require('../authenticate');
const cors = require('./cors');

const userRouter = express.Router();

userRouter.options('*', cors.corsWithOptions, (req, res, next) => { res.sendStatus(200); });
/* GET users listing. */
userRouter.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
  Users.find({}).then(users => {
    res.status(200)
    .json(users);
  })
  .catch(err => next(err));
});

userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {

  Users.register({ username: req.body.username }, req.body.password).then(user => {
    if (req.body.firstname)
      user.firstname = req.body.firstname;
    if (req.body.lastname)
      user.lastname = req.body.lastname;
    return user.save();
  })
  .then(user => {
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

userRouter.post('/login', cors.corsWithOptions, (req, res, next) => { 
  passport.authenticate('local', (err, user, info) => {
    if (err)
      return next(err);
    if (!user) {
      res.status(401)
      .json({ success: false, status: 'Login Unsuccessful!', error: info });
    }
    req.login(user, err => {
      if (err) {
        res.status(401)
        .json({ success: false, status: 'Login Unsuccessful!', error: 'Could not log in user.' });
      }

      let token = authenticate.getToken({ _id: req.user._id });
      res.status(200)
      .json({ success: true, status: 'You are successfully logged in!', token: token });
    });
  }) (req, res, next);
});

userRouter.get('/logout', cors.corsWithOptions, (req, res, next) => {
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
});

userRouter.get('/facebook/token', passport.authenticate('facebook-token'), (req, res, next) => {
  if (req.user) {
    let token = authenticate.getToken({ _id: req.user._id });
    res.status(200)
    .json({ success: true, token: token, status: 'You are successfully logged in!' });
  }
});

userRouter.get('/checkJWTtoken', cors.corsWithOptions, (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.status(200)
      .json({ status: 'JWT invalid', success: false, error: info });
    }
    else {
      res.status(200)
      .json({ status: 'JWT Valid', success: true, user: user });
    }
  }) (req, res, next);
})

module.exports = userRouter;