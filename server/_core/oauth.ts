// import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
// import type { Express, Request, Response } from "express";
// import passport from 'passport'; //
// import '../passport-github'; //
// import * as db from "../db";
// import { getSessionCookieOptions } from "./cookies";
// import { sdk } from "./sdk";


// function getQueryParam(req: Request, key: string): string | undefined {
//   const value = req.query[key];
//   return typeof value === "string" ? value : undefined;
// }

// export function registerOAuthRoutes(app: Express) {

//   app.use(passport.initialize());


//   app.get('/api/oauth/github',
//     passport.authenticate('github', { scope: ['user:email'] }) //
//   );


//   app.get('/api/oauth/callback',
//     passport.authenticate('github', { failureRedirect: '/', session: false }), //
//     async (req: Request, res: Response) => {
//       try {
//         const user = req.user as any; 

//         if (!user || !user.openId) {
//           res.status(400).json({ error: "User profile could not be verified" });
//           return;
//         }

//         await db.upsertUser({
//           openId: user.openId,
//           name: user.name || null,
//           email: user.email ?? null,
//           loginMethod: 'github',
//           lastSignedIn: new Date(),
//         });

   
//         const sessionToken = await sdk.createSessionToken(user.openId, {
//           name: user.name || "",
//           expiresInMs: ONE_YEAR_MS,
//         });


//         const cookieOptions = getSessionCookieOptions(req);
//         res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
//         res.redirect(302, "/dashboard");

//       } catch (error) {
//         console.error("[OAuth] Passport Callback internal error", error);
//         res.status(500).json({ error: "Internal server error during authentication" });
//       }
//     }
//   );
// }

import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import passport from "passport";
import { SignJWT } from "jose";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import '../passport-github'; // Ensure your strategy is loaded

// Ensure Secret exists or throw error early
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is missing");
}
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export function registerOAuthRoutes(app: Express) {
  // 1. Initialize Passport
  app.use(passport.initialize());

  // 2. Trigger Route (Redirects to GitHub)
  app.get('/api/oauth/github',
    passport.authenticate('github', { session: false, scope: ['user:email'] })
  );

  // 3. Callback Route (GitHub redirects back here)
  app.get('/api/oauth/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/' }),
    async (req: Request, res: Response) => {
      try {
        // passport-github passes the raw profile to req.user
        const githubUser = req.user as any; 

        if (!githubUser || !githubUser.id) {
            console.error("[OAuth] No user data returned from GitHub");
            res.status(400).json({ error: "Login failed" });
            return;
        }

        // Construct a consistent OpenID
        const openId = `github:${githubUser.id}`;
        
        // Save user to database
        // await db.upsertUser({
        //   openId: openId,
        //   // Handle potential missing display names
        //   name: githubUser.displayName || githubUser.username || "GitHub User",
        //   email: githubUser.emails?.[0]?.value || null,
        //   loginMethod: 'github',
        //   lastSignedIn: new Date(),
        // });

        // Create JWT token using 'jose'
        const token = await new SignJWT({
            openId: openId,
            appId: process.env.VITE_APP_ID || 'leadengineos',
            name: githubUser.displayName || githubUser.username || '',
            // Add other claims here if necessary (e.g. userId, roles)
          })
          .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
          .setIssuedAt()
          .setExpirationTime(Math.floor((Date.now() + ONE_YEAR_MS) / 1000))
          .sign(JWT_SECRET);

        // Set cookie
        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, token, { 
            ...cookieOptions, 
            maxAge: ONE_YEAR_MS 
        });

        // Redirect to dashboard
        res.redirect('/dashboard');

      } catch (error) {
        console.error("[OAuth] Callback error:", error);
        res.status(500).redirect("/"); // Redirect to home on internal error
      }
    }
  );
}
