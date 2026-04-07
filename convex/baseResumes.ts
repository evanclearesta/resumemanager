import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    return await ctx.db
      .query("baseResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("baseResumes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    content: v.any(),
    layoutSettings: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) throw new Error("User not found");

    return await ctx.db.insert("baseResumes", {
      userId: user._id,
      title: args.title,
      category: args.category,
      content: args.content,
      layoutSettings: args.layoutSettings,
      status: "draft",
      lastEditedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("baseResumes"),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    content: v.optional(v.any()),
    layoutSettings: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, any> = { lastEditedAt: Date.now() };
    if (fields.title !== undefined) updates.title = fields.title;
    if (fields.category !== undefined) updates.category = fields.category;
    if (fields.content !== undefined) updates.content = fields.content;
    if (fields.layoutSettings !== undefined) updates.layoutSettings = fields.layoutSettings;

    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("baseResumes") },
  handler: async (ctx, args) => {
    const branches = await ctx.db
      .query("branchResumes")
      .withIndex("by_base_resume", (q) => q.eq("baseResumeId", args.id))
      .collect();

    for (const branch of branches) {
      const coverLetters = await ctx.db
        .query("coverLetters")
        .withIndex("by_branch_resume", (q) => q.eq("branchResumeId", branch._id))
        .collect();
      for (const cl of coverLetters) {
        await ctx.db.delete(cl._id);
      }
      await ctx.db.delete(branch._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const listCategories = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user) return [];

    const resumes = await ctx.db
      .query("baseResumes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const categories = [...new Set(resumes.map((r) => r.category).filter(Boolean))];
    return categories;
  },
});
