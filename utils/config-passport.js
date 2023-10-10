import passport from 'passport';
import passportJWT from 'passport-jwt';
import User from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, async (payload, done) => {
  try {
    const user = await User.findById(payload.id);

    if (!user) {
      return done(null, false, { message: 'User not found' });
    }

    return done(null, user);
  } catch (error) {
    return done(error, false, { message: 'Error finding user' });
  }
});

passport.use(strategy);
