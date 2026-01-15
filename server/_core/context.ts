import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  console.log("[tRPC][Context] Creating context");
  console.log("[tRPC][Context] Request URL:", opts.req.originalUrl);
  console.log("[tRPC][Context] Request Method:", opts.req.method);
  console.log("[tRPC][Context] Cookies:", opts.req.headers.cookie);

  try {
    console.log("[tRPC][Auth] Authenticating request...");

    user = await sdk.authenticateRequest(opts.req);

    console.log("[tRPC][Auth] Authentication success");
    console.log("[tRPC][Auth] User:", user);
  } catch (error) {
    console.error("[tRPC][Auth] Authentication failed");

    if (error instanceof Error) {
      console.error("[tRPC][Auth] Error message:", error.message);
      console.error("[tRPC][Auth] Stack:", error.stack);
    } else {
      console.error("[tRPC][Auth] Unknown error:", error);
    }

    // Authentication is optional for public procedures.
    user = null;
  }

  console.log("[tRPC][Context] Final user value:", user);

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
