import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import passport from 'passport'; //
import './passport-github'; //
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
    passport.authenticate('github', { scope: ['user:email'] }) //
  );


  app.get('/api/oauth/callback',
    passport.authenticate('github', { failureRedirect: '/login', session: false }), //
    async (req: Request, res: Response) => {
      try {
        const user = req.user as any; 

        if (!user || !user.openId) {
          res.status(400).json({ error: "User profile could not be verified" });
          return;
        }

        await db.upsertUser({
          openId: user.openId,
          name: user.name || null,
          email: user.email ?? null,
          loginMethod: 'github',
          lastSignedIn: new Date(),
        });

   
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.name || "",
          expiresInMs: ONE_YEAR_MS,
        });


        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        res.redirect(302, "/dashboard");

      } catch (error) {
        console.error("[OAuth] Passport Callback internal error", error);
        res.status(500).json({ error: "Internal server error during authentication" });
      }
    }
  );
}
