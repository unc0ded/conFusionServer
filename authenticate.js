const passport = require('passport');
const Users = require('./models/user');

exports.local = passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());