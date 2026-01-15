// import passport from 'passport';
// import { Strategy as GitHubStrategy } from 'passport-github2';
// import * as db from './db';

// passport.use(new GitHubStrategy({
//     clientID: process.env.GITHUB_CLIENT_ID!,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET!,
//     callbackURL: process.env.GITHUB_CALLBACK_URL!
//   },
//   async (accessToken, refreshToken, profile, done) => {
//     try {
    
//       const userPayload = {
//         openId: `github:${profile.id}`,
//         name: profile.displayName || profile.username,
//         email: profile.emails?.[0]?.value || "", 
//         loginMethod: 'github',
//         lastSignedIn: new Date(),
//       };

    
//       await db.upsertUser(userPayload);

      
//       return done(null, userPayload);

//     } catch (error) {
//       console.error(" Strategy Error:", error);
//       return done(error);
//     }
//   }
// ));
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import * as db from "./db";

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("[GitHubStrategy] OAuth callback start", {
          githubId: profile.id,
        });

        const openId = `github:${profile.id}`;

        const userPayload = {
          openId,
          name: profile.displayName || profile.username || "User",
          email: profile.emails?.[0]?.value || "",
          loginMethod: "github",
          lastSignedIn: new Date(),
        };

        // 1️⃣ Create or update user
        await db.upsertUser(userPayload);

        console.log("[GitHubStrategy] User upserted", { openId });

        // 2️⃣ Fetch user + ensure tenant exists
        const userWithTenant = await db.getUserWithTenant(openId);

        if (!userWithTenant) {
          throw new Error("Failed to fetch user after upsert");
        }

        console.log("[GitHubStrategy] User with tenant", {
          userId: userWithTenant.id,
          tenantId: userWithTenant.tenantId,
        });

       
        return done(null, userWithTenant);
      } catch (error) {
        console.error("[GitHubStrategy] Error", error);
        return done(error as Error);
      }
    }
  )
);
