const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;

const loadPassport = () => {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user.user_id || user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (user, done) => {
    try {
      // User is already stored in session from login
      // Just return it as-is
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (username/password) - Uses MediaWiki authentication
  const mediawikiAuthService = require('../services/mediawikiAuthService');
  
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'username',
        passwordField: 'password',
      },
      async (username, password, done) => {
        try {
          const authResult = await mediawikiAuthService.authenticateUser(username, password);
          
          if (authResult.success) {
            // Check if user is blocked
            if (mediawikiAuthService.isBlocked(authResult.userInfo)) {
              return done(null, false, { message: 'User account is blocked' });
            }

            // Create user object for Passport
            const user = {
              id: authResult.userInfo.id,
              username: authResult.username,
              groups: authResult.groups,
              rights: authResult.rights,
              userInfo: authResult.userInfo,
              isAdmin: mediawikiAuthService.isAdmin(authResult.groups),
            };
            
            return done(null, user);
          }
          
          return done(null, false, { message: 'Invalid credentials' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  const googleClientId = process.env.GOOGLE_CLIENT_ID || process.env.QA_GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.QA_GOOGLE_CLIENT_SECRET;

  if (googleClientId && googleClientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: googleClientSecret,
          callbackURL: '/api/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Placeholder: Will be implemented when OAuth service is added
            // const user = await findOrCreateOAuthUser(profile, 'google');
            // return done(null, user);
            return done(null, false, { message: 'Google OAuth not yet implemented' });
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Apple Sign In Strategy
  const appleClientId = process.env.APPLE_CLIENT_ID || process.env.QA_APPLE_CLIENT_ID;
  const appleTeamId = process.env.APPLE_TEAM_ID || process.env.QA_APPLE_TEAM_ID;
  const appleKeyId = process.env.APPLE_KEY_ID || process.env.QA_APPLE_KEY_ID;
  const appleKey = process.env.APPLE_KEY || process.env.QA_APPLE_KEY;

  if (appleClientId && appleTeamId && appleKeyId && appleKey) {
    passport.use(
      new AppleStrategy(
        {
          clientID: appleClientId,
          teamID: appleTeamId,
          keyID: appleKeyId,
          privateKeyString: appleKey,
          callbackURL: '/api/auth/apple/callback',
        },
        async (accessToken, refreshToken, idToken, profile, done) => {
          try {
            // Placeholder: Will be implemented when OAuth service is added
            // const user = await findOrCreateOAuthUser(profile, 'apple');
            // return done(null, user);
            return done(null, false, { message: 'Apple Sign In not yet implemented' });
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  return passport;
};

module.exports = loadPassport;

