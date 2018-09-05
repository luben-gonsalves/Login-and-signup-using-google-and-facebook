const facebookStrategy = require('passport-facebook').Strategy;
const mongoose = require('mongoose');
const keys = require('./keys');
// Load user model
var User = require('../models/user');

module.exports = function (passport) {
  passport.use(
    new facebookStrategy({
      clientID: keys.facebookClientID,
      clientSecret: keys.facebookClientSecret,
      callbackURL: 'http://localhost:3000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'email'],
      passReqToCallBack: true
    }, (accessToken, refreshToken, profile, done) => {
      // console.log(accessToken);
      // console.log(profile);

      const newUser = {
        facebookID: profile.id,
        username: profile.name.givenName,
        email: profile.emails[0].value,
      }

      // Check for existing user
      User.findOne({
        email: profile.emails[0].value,
      }).then(user => {
        if (user) {
          // Return user
          done(null, user);
        } else {
          // Create user
          new User(newUser)
            .save()
            .then(user => done(null, user));
        }
      })
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
}