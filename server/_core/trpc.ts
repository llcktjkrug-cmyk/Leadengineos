// import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
// import { initTRPC, TRPCError } from "@trpc/server";
// import superjson from "superjson";
// import type { TrpcContext } from "./context";

// const t = initTRPC.context<TrpcContext>().create({
//   transformer: superjson,
// });

// export const router = t.router;
// export const publicProcedure = t.procedure;

// const requireUser = t.middleware(async opts => {
//   const { ctx, next } = opts;

//   if (!ctx.user) {
//     throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
//   }

//   return next({
//     ctx: {
//       ...ctx,
//       user: ctx.user,
//     },
//   });
// });

// export const protectedProcedure = t.procedure.use(requireUser);

// export const adminProcedure = t.procedure.use(
//   t.middleware(async opts => {
//     const { ctx, next } = opts;

//     if (!ctx.user || ctx.user.role !== 'admin') {
//       throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
//     }

//     return next({
//       ctx: {
//         ...ctx,
//         user: ctx.user,
//       },
//     });
//   }),
// );
import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Require authenticated user
 */
const requireUser = t.middleware(async opts => {
  const { ctx, next, path, type } = opts;

  console.log("[tRPC][Middleware][requireUser] Start");
  console.log("[tRPC][Middleware][requireUser] Path:", path);
  console.log("[tRPC][Middleware][requireUser] Type:", type);
  console.log("[tRPC][Middleware][requireUser] ctx.user:", ctx.user);

  try {
    if (!ctx.user) {
      console.warn("[tRPC][Middleware][requireUser] No user found in context");

      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: UNAUTHED_ERR_MSG,
      });
    }

    console.log(
      "[tRPC][Middleware][requireUser] User authenticated:",
      ctx.user.id
    );

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  } catch (error) {
    console.error("[tRPC][Middleware][requireUser] Error");

    if (error instanceof TRPCError) {
      console.error(
        "[tRPC][Middleware][requireUser] TRPCError:",
        error.code,
        error.message
      );
    } else {
      console.error(
        "[tRPC][Middleware][requireUser] Unknown error:",
        error
      );
    }

    throw error;
  }
});

export const protectedProcedure = t.procedure.use(requireUser);

/**
 * Middleware: Require admin user
 */
export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next, path, type } = opts;

    console.log("[tRPC][Middleware][adminProcedure] Start");
    console.log("[tRPC][Middleware][adminProcedure] Path:", path);
    console.log("[tRPC][Middleware][adminProcedure] Type:", type);
    console.log("[tRPC][Middleware][adminProcedure] ctx.user:", ctx.user);

    try {
      if (!ctx.user) {
        console.warn("[tRPC][Middleware][adminProcedure] No user in context");

        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: UNAUTHED_ERR_MSG,
        });
      }

      if (ctx.user.role !== "admin") {
        console.warn(
          "[tRPC][Middleware][adminProcedure] User is not admin:",
          ctx.user.role
        );

        throw new TRPCError({
          code: "FORBIDDEN",
          message: NOT_ADMIN_ERR_MSG,
        });
      }

      console.log(
        "[tRPC][Middleware][adminProcedure] Admin access granted:",
        ctx.user.id
      );

      return next({
        ctx: {
          ...ctx,
          user: ctx.user,
        },
      });
    } catch (error) {
      console.error("[tRPC][Middleware][adminProcedure] Error");

      if (error instanceof TRPCError) {
        console.error(
          "[tRPC][Middleware][adminProcedure] TRPCError:",
          error.code,
          error.message
        );
      } else {
        console.error(
          "[tRPC][Middleware][adminProcedure] Unknown error:",
          error
        );
      }

      throw error;
    }
  })
);
