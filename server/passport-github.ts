import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import * as db from './db';

passport.use(new GitHubStrategy({
clientID: process.env.GITHUB_CLIENT_ID!,
clientSecret: process.env.GITHUB_CLIENT_SECRET!,
callbackURL: process.env.GITHUB_CALLBACK_URL!
},
async (accessToken, refreshToken, profile, done) => {
try {
const user = await db.upsertUser({
openId: `github:${profile.id}`,
name: profile.displayName || profile.username,
email: profile.emails?.[0]?.value || null,
loginMethod: 'github',
lastSignedIn: new Date(),
});
return done(null, user);
} catch (error) {
return done(error);
}
}
));
