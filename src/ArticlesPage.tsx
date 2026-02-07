import { useState, useMemo, useCallback } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  Calendar,
  Tag,
  ExternalLink,
  AlertTriangle,
  Clock,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  ALL_ARTICLES,
  getArticleBySlug,
  isNewArticle,
  formatArticleDate,
  ARTICLE_CATEGORIES,
} from "./articlesData";
import type { Article, ArticleCategory } from "./articlesData";

// ---------------------------------------------------------------------------
// Image with gradient fallback (shared pattern)
// ---------------------------------------------------------------------------

function ArticleThumbnail({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div
        className={`grad-hero ${className}`}
        role="img"
        aria-label={alt}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

// ---------------------------------------------------------------------------
// Category badge color map
// ---------------------------------------------------------------------------

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  "大阪": "bg-blue-100 text-blue-700",
  "神戸": "bg-red-100 text-red-700",
  "京都": "bg-purple-100 text-purple-700",
  "共通": "bg-slate-100 text-slate-700",
};

// ---------------------------------------------------------------------------
// NEW badge
// ---------------------------------------------------------------------------

function NewBadge() {
  return (
    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
      <Sparkles className="w-3 h-3" />
      NEW
    </span>
  );
}

// ---------------------------------------------------------------------------
// Article card (list view)
// ---------------------------------------------------------------------------

function ArticleCard({
  article,
  onSelect,
}: {
  article: Article;
  onSelect: (slug: string) => void;
}) {
  const isNew = isNewArticle(article.date);
  const dateLabel = formatArticleDate(article.date);

  return (
    <article
      className="card-soft hover-lift overflow-hidden cursor-pointer transition-all group"
      onClick={() => onSelect(article.slug)}
      role="link"
      tabIndex={0}
      aria-label={`${article.title}を読む`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(article.slug);
        }
      }}
    >
      {/* Thumbnail */}
      <div className="relative h-[160px] sm:h-[180px] overflow-hidden">
        <ArticleThumbnail
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category]}`}
          >
            {article.category}
          </span>
          {isNew && <NewBadge />}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col gap-2">
        <h3 className="text-sm sm:text-base font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {article.description}
        </p>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="w-3 h-3" />
            最終更新: {dateLabel}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs font-bold text-brand-700 group-hover:gap-1.5 transition-all">
            読む
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Article list view
// ---------------------------------------------------------------------------

function ArticleList({
  onSelect,
}: {
  onSelect: (slug: string) => void;
}) {
  const [activeCat, setActiveCat] = useState<ArticleCategory | null>(null);

  const filtered = useMemo(
    () =>
      activeCat
        ? ALL_ARTICLES.filter((a) => a.category === activeCat)
        : ALL_ARTICLES,
    [activeCat],
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-20">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-700" />
          お役立ちコラム
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          障害者手帳に関する最新情報・お役立ち記事をお届けします
        </p>
      </header>

      {/* Category filter tabs */}
      <nav aria-label="カテゴリーフィルター" className="mb-6">
        <div className="flex flex-wrap gap-2" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeCat === null}
            onClick={() => setActiveCat(null)}
            className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeCat === null
                ? "bg-brand-800 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:border-brand-600"
            }`}
          >
            すべて
          </button>
          {ARTICLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCat === cat}
              onClick={() => setActiveCat(activeCat === cat ? null : cat)}
              className={`min-h-[36px] px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeCat === cat
                  ? "bg-brand-800 text-white shadow-md"
                  : "bg-white border border-slate-200 text-slate-600 hover:border-brand-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </nav>

      {/* Article count */}
      <p className="text-xs text-slate-400 mb-4">
        {filtered.length}件の記事
      </p>

      {/* Article grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((article) => (
          <ArticleCard
            key={article.slug}
            article={article}
            onSelect={onSelect}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card-soft p-8 text-center mt-4">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-bold">
            該当する記事がありません
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article disclaimer & report components
// ---------------------------------------------------------------------------

function ArticleDisclaimer({ date }: { date: string }) {
  const dateLabel = formatArticleDate(date);
  return (
    <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-bold text-amber-700">
          情報の有効期限について
        </p>
        <p className="text-xs text-amber-600 mt-1 leading-relaxed">
          この記事の情報は <strong>{dateLabel}時点</strong>{" "}
          のものです。制度や割引内容は変更される場合があります。最新情報は各施設・自治体の公式サイトをご確認ください。
        </p>
      </div>
    </div>
  );
}

function ReportErrorButton() {
  const handleReport = useCallback(() => {
    const subject = encodeURIComponent("【情報の誤り報告】生活支援ガイド");
    const body = encodeURIComponent(
      `記事URL: ${window.location.href}\n\n誤りの内容:\n\n`,
    );
    window.open(
      `mailto:info@example.com?subject=${subject}&body=${body}`,
      "_blank",
    );
  }, []);

  return (
    <button
      type="button"
      onClick={handleReport}
      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                 border border-slate-200 bg-white text-slate-600 text-xs font-bold
                 hover:bg-slate-50 active:scale-[0.97] transition-all cursor-pointer"
    >
      <AlertTriangle className="w-4 h-4 text-slate-400" />
      情報の誤りを報告する
    </button>
  );
}

function OfficialLinksSection({
  links,
}: {
  links: { label: string; url: string }[];
}) {
  if (links.length === 0) return null;
  return (
    <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
      <h3 className="text-sm font-bold text-brand-800 mb-2 flex items-center gap-1.5">
        <ExternalLink className="w-4 h-4" />
        公式サイト・参考リンク
      </h3>
      <ul className="space-y-1.5">
        {links.map((link) => (
          <li key={link.url}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-brand-700 hover:text-brand-900
                         underline underline-offset-2 transition-colors"
            >
              {link.label}
              <ExternalLink className="w-3 h-3" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Article detail view
// ---------------------------------------------------------------------------

function ArticleDetail({
  article,
  onBack,
}: {
  article: Article;
  onBack: () => void;
}) {
  const isNew = isNewArticle(article.date);
  const dateLabel = formatArticleDate(article.date);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-20">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                   text-sm font-bold text-brand-700 hover:bg-brand-50
                   active:scale-[0.97] transition-all cursor-pointer mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        記事一覧に戻る
      </button>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden mb-6 h-[200px] sm:h-[280px]">
        <ArticleThumbnail
          src={article.thumbnail}
          alt={article.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[article.category]}`}
        >
          {article.category}
        </span>
        {isNew && <NewBadge />}
        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
          <Calendar className="w-3 h-3" />
          {dateLabel} 更新
        </span>
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mb-2">
        {article.title}
      </h1>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">
        {article.description}
      </p>

      {/* Tags */}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-500"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Disclaimer (top) */}
      <div className="mb-6">
        <ArticleDisclaimer date={article.date} />
      </div>

      {/* Markdown body */}
      <div className="prose prose-slate prose-sm sm:prose-base max-w-none mb-8">
        <Markdown remarkPlugins={[remarkGfm]}>{article.content}</Markdown>
      </div>

      {/* Official links */}
      <div className="space-y-4 mb-8">
        <OfficialLinksSection links={article.officialLinks} />
      </div>

      {/* Disclaimer (bottom) + report */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <ArticleDisclaimer date={article.date} />
        <div className="flex flex-wrap gap-3">
          <ReportErrorButton />
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-brand-50 text-brand-700 text-xs font-bold
                       hover:bg-brand-100 active:scale-[0.97] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            記事一覧に戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ArticlesPage (manages list ↔ detail navigation)
// ---------------------------------------------------------------------------

export default function ArticlesPage() {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const selectedArticle = useMemo(
    () => (selectedSlug ? getArticleBySlug(selectedSlug) : undefined),
    [selectedSlug],
  );

  const handleBack = useCallback(() => {
    setSelectedSlug(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSelect = useCallback((slug: string) => {
    setSelectedSlug(slug);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (selectedArticle) {
    return <ArticleDetail article={selectedArticle} onBack={handleBack} />;
  }

  return <ArticleList onSelect={handleSelect} />;
}
