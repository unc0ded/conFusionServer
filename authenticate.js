const passport = require('passport');
const Users = require('./models/user');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');

const config = require('./config');

//FROM DOCUMENTATION
//Starting with version 0.2.1 passport-local-mongoose adds a helper method createStrategy as static method to your schema. 
//The createStrategy is responsible to setup passport-local LocalStrategy with the correct options.
exports.local = passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

exports.getToken = (user) => {
    return jwt.sign(user, config.secretKey, { expiresIn: 3600 });
};

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
    console.log('JWT Payload: ', jwt_payload);
    Users.findOne({ _id: jwt_payload._id }).then(user => {
        if(user) {
            return done(null, user);
        }
        else {
            return done(null, false);
        }
    })
    .catch(err => done(err, false));
}));

exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req, res, next) => {
    if (req.user.admin) {
        next();
    }
    else {
        let err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        next(err);
    }
};