// ===========================================================================
// articlesData.ts — Markdown article loader with frontmatter parsing
// ===========================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OfficialLink {
  label: string;
  url: string;
}

export type ArticleCategory = "大阪" | "神戸" | "京都" | "共通";

export interface Article {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: ArticleCategory;
  tags: string[];
  thumbnail: string;
  officialLinks: OfficialLink[];
  content: string;
}

// ---------------------------------------------------------------------------
// Frontmatter parser (lightweight — no external dependency)
// ---------------------------------------------------------------------------

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  content: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, content: raw };

  const meta: Record<string, string> = {};
  const lines = match[1].split("\n");
  for (const line of lines) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (!m) continue;
    let value = m[2].trim();
    // Strip surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[m[1]] = value;
  }
  return { meta, content: match[2] };
}

function parseTags(raw: string | undefined): string[] {
  if (!raw) return [];
  // e.g. ["tag1", "tag2", "tag3"]
  const inner = raw.replace(/^\[/, "").replace(/]$/, "");
  return inner
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function parseOfficialLinks(raw: string | undefined): OfficialLink[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is OfficialLink =>
          typeof item === "object" &&
          item !== null &&
          typeof (item as OfficialLink).label === "string" &&
          typeof (item as OfficialLink).url === "string",
      );
    }
  } catch {
    /* ignore parse errors */
  }
  return [];
}

// ---------------------------------------------------------------------------
// Load all .md files from content/articles/ via Vite glob import
// ---------------------------------------------------------------------------

const modules = import.meta.glob("/content/articles/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function buildArticles(): Article[] {
  const articles: Article[] = [];

  for (const [path, raw] of Object.entries(modules)) {
    // Extract slug from path: "/content/articles/foo-bar.md" → "foo-bar"
    const slug = path.replace("/content/articles/", "").replace(/\.md$/, "");
    const { meta, content } = parseFrontmatter(raw);

    articles.push({
      slug,
      title: meta.title ?? slug,
      description: meta.description ?? "",
      date: meta.date ?? "2026-01-01",
      category: (meta.category as ArticleCategory) ?? "共通",
      tags: parseTags(meta.tags),
      thumbnail: meta.thumbnail ?? "",
      officialLinks: parseOfficialLinks(meta.officialLinks),
      content,
    });
  }

  // Sort by date descending (newest first)
  articles.sort((a, b) => b.date.localeCompare(a.date));
  return articles;
}

export const ALL_ARTICLES: Article[] = buildArticles();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getArticleBySlug(slug: string): Article | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

export function isNewArticle(dateStr: string): boolean {
  const articleDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - articleDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return diffDays <= 14; // "NEW" for articles within 14 days
}

export function formatArticleDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  "共通",
  "大阪",
  "神戸",
  "京都",
];
