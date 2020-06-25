var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');

const mongoose = require('mongoose');
const Dishes = require('./models/dishes')
const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url, { useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true });

connect.then(client => {
  console.log('Connected correctly to server!');
})
.catch(err => console.log(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('8ACC0-122HA-67AB2-89XC1'));

app.use(function (req, res, next) {
  console.log(req.signedCookies);

  if(!req.signedCookies.user) {

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

    if (username === 'admin' && password === 'password') {
      res.cookie('user', 'admin', { signed: true });
      next();
    }
    else {
      let err = new Error('Please provide correct authentication details!');

      res.setHeader('WWW-Authenticate', 'Basic');

      err.status = 401;
      return next(err);
    }
  }
  else {
    if(req.signedCookies.user === 'admin')
      next();
    else {
      let err = new Error('Not Authenticated (Correct cookie not found)!');

      err.status = 401;
      return next(err);
    }
  }
});
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
