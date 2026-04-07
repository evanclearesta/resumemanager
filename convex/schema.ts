import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.string(),
  }).index("by_clerk_id", ["clerkId"]),

  baseResumes: defineTable({
    userId: v.id("users"),
    title: v.string(),
    category: v.string(),
    content: v.any(),
    layoutSettings: v.any(),
    status: v.string(),
    lastEditedAt: v.number(),
  }).index("by_user", ["userId"]),

  branchResumes: defineTable({
    userId: v.id("users"),
    baseResumeId: v.id("baseResumes"),
    companyName: v.string(),
    roleName: v.string(),
    jobDescription: v.optional(v.string()),
    jobUrl: v.optional(v.string()),
    content: v.any(),
    layoutSettings: v.any(),
    status: v.string(),
    lastEditedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_base_resume", ["baseResumeId"]),

  coverLetters: defineTable({
    userId: v.id("users"),
    branchResumeId: v.id("branchResumes"),
    content: v.string(),
    targetCompany: v.string(),
    status: v.string(),
    lastEditedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_branch_resume", ["branchResumeId"]),
});
