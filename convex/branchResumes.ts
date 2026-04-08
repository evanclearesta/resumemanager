import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByBase = query({
  args: { baseResumeId: v.id("baseResumes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branchResumes")
      .withIndex("by_base_resume", (q) => q.eq("baseResumeId", args.baseResumeId))
      .collect();
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
      .query("branchResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("branchResumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    baseResumeId: v.id("baseResumes"),
    sourceBranchId: v.optional(v.id("branchResumes")),
    companyName: v.string(),
    roleName: v.string(),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    const baseResume = await ctx.db.get(args.baseResumeId);
    if (!baseResume) throw new Error("Base resume not found");

    let contentSource: { content: any; layoutSettings: any } = baseResume;
    if (args.sourceBranchId) {
      const sourceBranch = await ctx.db.get(args.sourceBranchId);
      if (!sourceBranch) throw new Error("Source branch not found");
      contentSource = sourceBranch;
    }

    return await ctx.db.insert("branchResumes", {
      userId: user._id,
      baseResumeId: args.baseResumeId,
      companyName: args.companyName,
      roleName: args.roleName,
      jobDescription: args.jobDescription,
      jobUrl: args.jobUrl,
      content: JSON.parse(JSON.stringify(contentSource.content)),
      layoutSettings: JSON.parse(JSON.stringify(contentSource.layoutSettings)),
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("branchResumes"),
    companyName: v.optional(v.string()),
    roleName: v.optional(v.string()),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    content: v.optional(v.any()),
    layoutSettings: v.optional(v.any()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) updates[key] = value;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("branchResumes") },
  handler: async (ctx, args) => {
    const coverLetters = await ctx.db
      .query("coverLetters")
      .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", args.id))
      .collect();
    for (const cl of coverLetters) {
      await ctx.db.delete(cl._id);
    }
    await ctx.db.delete(args.id);
  },
});
