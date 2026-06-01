import mongoose, { Schema, Document, Model } from "mongoose";

export type ArticleStatus = "draft" | "published";

export interface IArticleInternalLink {
  label: string;
  href: string;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  authorName: string;
  status: ArticleStatus;
  featuredImage?: string;
  featuredImageAlt?: string;
  tags: string[];
  targetKeywords: string[];
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  internalLinks: IArticleInternalLink[];
  relatedProductCategories: string[];
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleInternalLinkSchema = new Schema<IArticleInternalLink>(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ArticleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    excerpt: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    authorName: { type: String, required: true, trim: true, default: "Impact Store Team" },
    status: { type: String, enum: ["draft", "published"], default: "draft", index: true },
    featuredImage: { type: String, trim: true },
    featuredImageAlt: { type: String, trim: true },
    tags: [{ type: String, trim: true, index: true }],
    targetKeywords: [{ type: String, trim: true }],
    seoTitle: { type: String, trim: true },
    seoDescription: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
    internalLinks: [ArticleInternalLinkSchema],
    relatedProductCategories: [{ type: String, trim: true }],
    publishedAt: { type: Date, index: true },
  },
  { timestamps: true }
);

ArticleSchema.index({ status: 1, publishedAt: -1, createdAt: -1 });
ArticleSchema.index({ title: "text", excerpt: "text", body: "text", tags: "text", targetKeywords: "text" });

const Article: Model<IArticle> =
  mongoose.models.Article || mongoose.model<IArticle>("Article", ArticleSchema);

export default Article;
