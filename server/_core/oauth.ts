// import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
// import type { Express, Request, Response } from "express";
// import passport from 'passport'; //
// import '../passport-github.ts'; //
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
//     passport.authenticate('github', { scope: ['user:email'] })
//   );


//   app.get('/api/oauth/callback',
//     passport.authenticate('github', { failureRedirect: '/', session: true }), 
//     async (req: Request, res: Response) => {
//       try {
//         const user = req.user as any; 

//         if (!user || !user.openId) {
//           res.status(400).json({ error: "User profile could not be verified" });
//           return;
//         }

//         // await db.upsertUser({
//         //   openId: user.openId,
//         //   name: user.name || null,
//         //   email: user.email ?? null,
//         //   loginMethod: 'github',
//         //   lastSignedIn: new Date(),
//         // });

   
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
import type { Express, Request, Response, NextFunction } from "express";
import passport from 'passport';
import '../passport-github.ts';
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.use(passport.initialize());

  app.get('/api/oauth/github',
    passport.authenticate('github', { scope: ['user:email'], prompt: 'login' })
  );

  // app.get('/api/oauth/callback',
  //   passport.authenticate('github', { failureRedirect: '/blog', session: false }),
  //   async (req: Request, res: Response) => {
  //     try {
  //       const user = req.user as any;

  //       if (!user || !user.openId) {
  //         res.status(400).json({ error: "User profile could not be verified" });
  //         return;
  //       }

  //       const sessionToken = await sdk.createSessionToken(user.openId, {
  //         name: user.name || "",
  //         expiresInMs: ONE_YEAR_MS,
  //       });

  //       const cookieOptions = getSessionCookieOptions(req);
  //       res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
  //       res.redirect(302, "/dashboard");

  //     } catch (error) {
  //       console.error("[OAuth] Passport Callback internal error", error);
  //       res.status(500).json({ error: "Internal server error during authentication" });
  //     }
  //   }
  // );

app.get('/api/oauth/callback', (req: Request, res: Response, next: NextFunction) => {
    
  
    console.log("[OAuth Debug] Callback hit. Query params:", req.query);


    passport.authenticate('github', { session: false }, async (err: any, user: any, info: any) => {
      
  
      if (err) {
        console.error("[OAuth Debug]  Passport Error:", err);
        
        return res.status(500).json({ error: "Authentication failed", details: err.message });
      }

    console.log("user:", user);
      if (!user) {
        console.warn("[OAuth Debug]  No user returned. Info:", info);
        return res.redirect('/?error=no_user');
      }

      
      console.log("[OAuth Debug] User authenticated:", user.openId);

      try {
       
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          path: '/',
          expiresInMs: ONE_YEAR_MS,

        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
        console.log("[OAuth Debug]  Cookie set. Redirecting to dashboard...");
        res.redirect(302, "/dashboard");
        // --- YOUR ORIGINAL LOGIC ENDS HERE ---

      } catch (tokenError) {
        console.error("[OAuth Debug]  Token Creation Error:", tokenError);
        res.status(500).json({ error: "Failed to create session" });
      }

    })(req, res, next); 
  });

}

