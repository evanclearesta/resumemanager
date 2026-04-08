import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const resolve = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const asBase = ctx.db.normalizeId("baseResumes", args.id);
    if (asBase) {
      const doc = await ctx.db.get(asBase);
      return doc ? { type: "base" as const, ...doc } : null;
    }
    const asBranch = ctx.db.normalizeId("branchResumes", args.id);
    if (asBranch) {
      const doc = await ctx.db.get(asBranch);
      return doc ? { type: "branch" as const, ...doc } : null;
    }
    return null;
  },
});
