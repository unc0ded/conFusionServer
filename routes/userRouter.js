var express = require('express');
const mongoose = require('mongoose');

const Users = require('../models/user');

const userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

userRouter.post('/signup', (req, res, next) => {
  Users.findOne({ username: req.body.username }).then(user => {
    if(user) {
      let err = new Error('User ' + req.body.username + ' already exists.');
      err.status = 403;
      next(err);
    }
    else {
      return Users.create({
        username: req.body.username,
        password: req.body.password
      });
    }
  })
  .then(user => {
    res.status(200)
    .json({ status: 'Registration Successful', username: user.username });
  })
  .catch(err => next(err));
});

userRouter.post('/login', (req, res, next) => {
  if(!req.session.user) {

    let authHeader = req.headers.authorization;

    if (!authHeader) {
      let err = new Error('You are not authenticated');

      res.setHeader('WWW-Authenticate', 'Basic');

      err.status = 401;
      return next(err);
    }

    let auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');

    let username = auth[0];
    let password = auth[1];

    Users.findOne({ username: username }).then(user => {

      if (!user) {
        let err = new Error('User ' + username + ' does not exist.');
  
        err.status = 403;
        return next(err);
      }
      else if (user.password != password) {
        let err = new Error('Incorrect password');
        
        err.status = 403;
        return next(err);
      }
      else if (user.username === username && user.password === password) {
        req.session.user = 'authenticated'
        res.status(200)
        .send('You are authenticated!');
      }
      
    })
    .catch(err => next(err));
  }
  else {
    res.status(200)
    .send('You are already authenticated!');
  }
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