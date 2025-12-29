import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import * as db from './db';

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
  callbackURL: process.env.GITHUB_CALLBACK_URL!,
  proxy: true
},
async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // 1. Handle potential missing email by defaulting to NULL or empty string
    // Ensure this property is NEVER 'undefined'
    const userEmail =  profile.emails?.[0]?.value ??
  `${profile.id}@github.local`;
    
    console.log('GitHub Profile ID:', profile.id);

    const user = await db.upsertUser({
      openId: `github:${profile.id}`,
      name: profile.displayName || profile.username || "GitHub User",
      email: userEmail, 
      loginMethod: 'github',
      lastSignedIn: new Date(),
    });

    return done(null, user);
  } catch (error) {
    console.error("Error during GitHub Upsert:", error);
    return done(error);
  }
}
// Removed the duplicate catch block that was here
));
