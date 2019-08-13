import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { jwtSecret, masterKey } from '../../config';
import models from '../../database/models/index';

// HEADER API KEY AUTH
export const apiKey = () => (req, res, next) =>
  passport.authenticate('apiKey', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use(
  'apiKey',
  new HeaderAPIKeyStrategy({ header: 'Authorization', prefix: 'ApiKey ' }, false, (apikey, done) => {
    models.ApiKey.findOne({ where: { key: apikey } }).then(apikey => {
      if (!apikey || !apikey.isActive) {
        done(true);
        return null;
      } else {
        models.User.findOne({ where: { id: apikey.userId } }).then(user => {
          if (!user) {
            return done(null, false);
          }
          return done(null, user);
        });
      }
    });
  }),
);
// HEADER BASIC AUTH
export const password = () => (req, res, next) =>
  passport.authenticate('password', { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use(
  'password',
  new BasicStrategy((username, password, done) => {
    models.User.findOne({ where: { username, role: 'admin' } }).then(user => {
      if (!user) {
        done(true);
        return null;
      }
      return user
        .authenticate(password, user.password)
        .then(user => {
          done(null, user);
          return null;
        })
        .catch(done);
    });
  }),
);

// MASTER KEY AUTH
export const master = () => passport.authenticate('master', { session: false });

passport.use(
  'master',
  new BearerStrategy((token, done) => {
    if (token === masterKey) {
      done(null, {});
    } else {
      done(null, false);
    }
  }),
);

// APIKEY OR ACCESS TOKEN AUTH

export const keyOrToken = () => (req, res, next) =>
  passport.authenticate(['apiKey', 'accessToken'], { session: false }, (err, user, info) => {
    if (err && err.param) {
      return res.status(400).json(err);
    } else if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

// REFRESH TOKEN AUTH
export const refreshToken = () => (req, res, next) =>
  passport.authenticate('refreshToken', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use(
  'refreshToken',
  new JwtStrategy(
    {
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('access_token'),
        ExtractJwt.fromBodyField('access_token'),
        ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    },
    ({ id, type }, done) => {
      if (type === 'refreshToken') {
        models.User.findByPk(id)
          .then(user => {
            done(null, user);
            return null;
          })
          .catch(done);
      } else {
        done(true);
        return null;
      }
    },
  ),
);

// ACCESS TOKEN AUTH
export const accessToken = () => (req, res, next) =>
  passport.authenticate('accessToken', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).end();
    }
    req.logIn(user, { session: false }, err => {
      if (err) return res.status(401).end();
      next();
    });
  })(req, res, next);

passport.use(
  'accessToken',
  new JwtStrategy(
    {
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromUrlQueryParameter('access_token'),
        ExtractJwt.fromBodyField('access_token'),
        ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
    },
    ({ id, type }, done) => {
      if (type === 'accessToken') {
        models.User.findByPk(id)
          .then(user => {
            done(null, user);
            return null;
          })
          .catch(done);
      } else {
        done(true);
        return null;
      }
    },
  ),
);
