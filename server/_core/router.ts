import { initTRPC } from "@trpc/server";
import { z } from "zod";
import superjson from "superjson";
import { dataStore } from "./data";
import type { Context } from "./context";
import { feedbackSchema, passFilterSchema, statusUpdateSchema } from "../../shared/schemas";
import type { PassFilter } from "../../shared/types";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const router = t.router;
const procedure = t.procedure;

export const appRouter = router({
  summary: procedure.query(() => dataStore.summary()),
  passes: router({
    list: procedure
      .input(passFilterSchema.optional())
      .query(({ input }) => dataStore.list((input ?? {}) as PassFilter)),
    detail: procedure
      .input(
        z.object({
          passId: z.string().min(1),
        }),
      )
      .query(({ input }) => dataStore.getById(input.passId)),
  }),
  timeline: procedure.query(() => dataStore.timeline()),
  status: router({
    update: procedure
      .input(statusUpdateSchema)
      .mutation(({ input, ctx }) => dataStore.updateStatus({ ...input, actor: ctx.user.name })),
  }),
  feedback: router({
    create: procedure
      .input(feedbackSchema)
      .mutation(({ input, ctx }) => dataStore.addFeedback({ ...input, actor: ctx.user.name })),
  }),
});

export type AppRouter = typeof appRouter;
