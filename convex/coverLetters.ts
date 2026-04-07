import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByBranch = query({
  args: { branchResumeId: v.id("branchResumes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.branchResumeId))
      .first();
  },
});

export const listAll = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("coverLetters")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const create = mutation({
  args: {
    branchResumeId: v.id("branchResumes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const branch = await ctx.db.get(args.branchResumeId);
    if (!branch) throw new Error("Branch resume not found");

    const existing = await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.branchResumeId))
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("coverLetters", {
      userId: user._id,
      branchResumeId: args.branchResumeId,
      content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }),
      targetCompany: branch.companyName,
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("coverLetters"),
    content: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.status !== undefined) updates.status = fields.status;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("coverLetters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
