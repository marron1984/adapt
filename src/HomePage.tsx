import { useState, useMemo, useCallback } from "react";
import {
  Ticket,
  Smartphone,
  Train,
  Heart,
  Accessibility,
  ParkingSquare,
  Bath,
  Volume2,
  Ear,
  Eye,
  CheckCircle2,
  Star,
  ArrowRight,
  Settings2,
  MapPin,
  Sparkles,
  BookOpen,
  Clock,
  ChevronRight,
} from "lucide-react";
import {
  LIFE_CATEGORIES,
  FEATURED_SITUATIONS,
  MOCK_FACILITIES,
  HERO_IMAGE,
  CITY_IMAGES,
  type Facility,
  type UserPreferences,
  type LifeCategory,
  type FeaturedSituation,
  getDiscountForUser,
  isFacilityEligible,
} from "./data";
import { ALL_ARTICLES, isNewArticle, formatArticleDate } from "./articlesData";

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Ticket,
  Smartphone,
  Train,
  Heart,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

// ---------------------------------------------------------------------------
// Handbook labels
// ---------------------------------------------------------------------------

const HANDBOOK_LABELS: Record<string, string> = {
  physical: "身体障害者手帳",
  intellectual: "療育手帳",
  mental: "精神障害者保健福祉手帳",
};

// ---------------------------------------------------------------------------
// A11y chips
// ---------------------------------------------------------------------------

interface A11yChipDef {
  key: keyof Facility["accessibility"];
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

const A11Y_CHIPS: A11yChipDef[] = [
  { key: "wheelchairParking", icon: ParkingSquare, label: "車いすP" },
  { key: "multiPurposeToilet", icon: Bath, label: "多機能トイレ" },
  { key: "ostomateToilet", icon: Bath, label: "オストメイト" },
  { key: "sensoryRoom", icon: Volume2, label: "感覚室" },
  { key: "signLanguage", icon: Ear, label: "手話対応" },
  { key: "elevator", icon: Accessibility, label: "EV" },
  { key: "braille", icon: Eye, label: "点字" },
];

// ---------------------------------------------------------------------------
// Image with gradient fallback
// ---------------------------------------------------------------------------

function CoverImage({
  src,
  alt,
  gradientClass,
  className = "",
}: {
  src: string;
  alt: string;
  gradientClass: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div className={`${gradientClass} ${className}`} role="img" aria-label={alt} />;
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
// Hero section
// ---------------------------------------------------------------------------

function HeroSection({
  preferences,
  onOpenPrefs,
}: {
  preferences: UserPreferences;
  onOpenPrefs: () => void;
}) {
  const hasPrefs = !!(preferences.handbookType && preferences.grade);
  return (
    <section className="img-card h-[260px] sm:h-[300px] mb-8">
      <CoverImage
        src={HERO_IMAGE}
        alt="大阪の街並みと医療をモチーフにしたイラスト — 通天閣・道頓堀・心電図"
        gradientClass="grad-hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="img-overlay z-10">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight drop-shadow-lg">
            生活支援ガイド
          </h1>
          <p className="text-sm sm:text-base text-white/80 mt-1 max-w-md">
            障害者手帳で使える割引・制度を、大阪・神戸・京都からまとめてチェック
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-4">
            {hasPrefs ? (
              <button
                onClick={onOpenPrefs}
                aria-label="手帳設定を変更する"
                className="glass min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-full
                           text-white text-sm font-bold hover:bg-white/25 active:scale-[0.97] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-green-300" />
                {HANDBOOK_LABELS[preferences.handbookType!]} {preferences.grade}級
              </button>
            ) : (
              <button
                onClick={onOpenPrefs}
                aria-label="手帳の種別を設定する"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl
                           bg-white text-brand-800 font-bold text-sm shadow-lg
                           hover:bg-brand-50 active:scale-[0.97] transition-all cursor-pointer"
              >
                <Settings2 className="w-4 h-4" />
                手帳を設定して始める
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Category card (image-backed)
// ---------------------------------------------------------------------------

function CategoryCard({
  cat,
  isActive,
  count,
  onClick,
}: {
  cat: LifeCategory;
  isActive: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      role="radio"
      aria-checked={isActive}
      aria-label={`${cat.title}（${count}件）`}
      onClick={onClick}
      className={`img-card hover-lift min-h-[120px] sm:min-h-[140px] cursor-pointer transition-all
                  ${isActive ? "ring-2 ring-white ring-offset-2 ring-offset-brand-700" : ""}`}
    >
      <CoverImage
        src={cat.imageUrl}
        alt={cat.title}
        gradientClass={cat.gradientClass}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="img-overlay z-10">
        <div className="flex items-center gap-2">
          <span className="glass inline-flex items-center justify-center w-9 h-9 rounded-xl">
            <CategoryIcon name={cat.iconName} className="w-5 h-5 text-white" />
          </span>
          <div>
            <span className="block text-sm font-bold text-white leading-snug drop-shadow">
              {cat.title}
            </span>
            <span className="block text-xs text-white/70">{count}件</span>
          </div>
        </div>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// City banner cards
// ---------------------------------------------------------------------------

function CityBanners() {
  return (
    <section aria-label="対応エリア" className="mb-10">
      <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-brand-700" />
        対応エリア
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {CITY_IMAGES.map((city) => (
          <div key={city.id} className="img-card h-[100px] sm:h-[120px]">
            <CoverImage
              src={city.imageUrl}
              alt={city.name}
              gradientClass={city.gradientClass}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="img-overlay z-10">
              <span className="text-base sm:text-lg font-bold text-white drop-shadow-lg">
                {city.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Situation card
// ---------------------------------------------------------------------------

function SituationCard({
  situation,
  facilities,
  onSelect,
}: {
  situation: FeaturedSituation;
  facilities: Facility[];
  onSelect: (ids: string[]) => void;
}) {
  const matchedFacilities = facilities.filter((f) =>
    situation.facilityIds.includes(f.id),
  );
  return (
    <article className="card-soft hover-lift p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-accent-100 shrink-0">
          <Star className="w-4 h-4 text-accent-600" />
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-snug">
            {situation.title}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {situation.description}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {matchedFacilities.slice(0, 3).map((f) => (
          <span
            key={f.id}
            className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 truncate max-w-[140px]"
          >
            {f.name}
          </span>
        ))}
        {matchedFacilities.length > 3 && (
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            +{matchedFacilities.length - 3}件
          </span>
        )}
      </div>
      <button
        onClick={() => onSelect(situation.facilityIds)}
        aria-label={`${situation.title}の施設を表示`}
        className="min-h-[44px] min-w-[44px] mt-auto inline-flex items-center justify-center gap-1.5
                   px-4 py-2.5 rounded-xl bg-brand-50 text-brand-700 text-xs font-bold
                   hover:bg-brand-100 active:scale-[0.97] transition-all cursor-pointer"
      >
        施設を見る
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Facility card
// ---------------------------------------------------------------------------

function FacilityCard({
  facility,
  preferences,
}: {
  facility: Facility;
  preferences: UserPreferences;
}) {
  const discount = getDiscountForUser(facility, preferences);
  const hasPrefs = !!(preferences.handbookType && preferences.grade);
  const activeA11y = A11Y_CHIPS.filter((chip) => facility.accessibility[chip.key]);
  const catMeta = LIFE_CATEGORIES.find((c) => c.id === facility.category);
  const badgeColor = catMeta?.colorBadge ?? "bg-slate-100 text-slate-600";

  return (
    <article
      className="card-soft hover-lift p-4 sm:p-5 flex flex-col gap-3 expand-enter"
      aria-label={`${facility.name}の割引情報`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 leading-snug">
            {facility.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
              {facility.subcategory}
            </span>
            {facility.location && (
              <span className="text-[11px] text-slate-400">{facility.location}</span>
            )}
          </div>
        </div>
      </div>

      {hasPrefs && discount && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-50 border border-accent-100">
          <CheckCircle2 className="w-4 h-4 text-accent-600 shrink-0" />
          <span className="text-sm font-bold text-accent-600">{discount}</span>
        </div>
      )}
      {hasPrefs && !discount && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-100">
          <span className="text-xs text-slate-400">対象外</span>
        </div>
      )}
      {!hasPrefs && (
        <div className="px-3 py-2 rounded-lg bg-brand-50 border border-brand-100">
          <p className="text-xs text-brand-700 leading-relaxed">
            手帳を設定すると割引額を表示します
          </p>
        </div>
      )}

      {facility.caregiver && (
        <div className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
          <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{facility.caregiver}</span>
        </div>
      )}

      {activeA11y.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="バリアフリー情報">
          {activeA11y.map((chip) => {
            const ChipIcon = chip.icon;
            return (
              <span
                key={chip.key}
                title={chip.label}
                aria-label={chip.label}
                className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500"
              >
                <ChipIcon className="w-3 h-3" />
                {chip.label}
              </span>
            );
          })}
        </div>
      )}

      {facility.notes && (
        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-2 mt-auto">
          {facility.notes}
        </p>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Main HomePage
// ---------------------------------------------------------------------------

interface HomePageProps {
  preferences: UserPreferences;
  onOpenPrefs: () => void;
  onNavigate?: (page: string) => void;
}

export default function HomePage({ preferences, onOpenPrefs, onNavigate }: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState<Facility["category"] | null>(null);
  const [situationFilter, setSituationFilter] = useState<string[] | null>(null);

  const hasPrefs = !!(preferences.handbookType && preferences.grade);

  const eligibleFacilities = useMemo(
    () => MOCK_FACILITIES.filter((f) => isFacilityEligible(f, preferences)),
    [preferences],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of LIFE_CATEGORIES) {
      counts[cat.id] = eligibleFacilities.filter((f) => f.category === cat.id).length;
    }
    return counts;
  }, [eligibleFacilities]);

  const visibleFacilities = useMemo(() => {
    let list = eligibleFacilities;
    if (activeCategory) list = list.filter((f) => f.category === activeCategory);
    if (situationFilter) list = list.filter((f) => situationFilter.includes(f.id));
    return list;
  }, [eligibleFacilities, activeCategory, situationFilter]);

  const groupedFacilities = useMemo(() => {
    const groups: { category: LifeCategory; facilities: Facility[] }[] = [];
    for (const cat of LIFE_CATEGORIES) {
      const facs = visibleFacilities.filter((f) => f.category === cat.id);
      if (facs.length > 0) groups.push({ category: cat, facilities: facs });
    }
    return groups;
  }, [visibleFacilities]);

  const handleCategoryToggle = useCallback((catId: Facility["category"]) => {
    setSituationFilter(null);
    setActiveCategory((prev) => (prev === catId ? null : catId));
  }, []);

  const handleSituationSelect = useCallback((facilityIds: string[]) => {
    setActiveCategory(null);
    setSituationFilter((prev) =>
      prev && prev.join() === facilityIds.join() ? null : facilityIds,
    );
  }, []);

  const handleClearFilters = useCallback(() => {
    setActiveCategory(null);
    setSituationFilter(null);
  }, []);

  const isFiltered = activeCategory !== null || situationFilter !== null;

  return (
    <div className="pb-16">
      {/* ── Hero ── */}
      <HeroSection preferences={preferences} onOpenPrefs={onOpenPrefs} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* ── Handbook banner (no prefs) ── */}
        {!hasPrefs && (
          <div className="card-soft bg-warn-50 border-warn-100 p-5 sm:p-6 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-warn-700 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  手帳の種別を設定しましょう
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  手帳の種別と等級を設定すると、あなたに合った割引情報だけを表示できます。
                </p>
              </div>
              <button
                onClick={onOpenPrefs}
                aria-label="手帳の種別を設定する"
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-3 rounded-xl
                           bg-brand-800 text-white font-bold text-sm
                           hover:bg-brand-700 active:scale-[0.97] transition-all cursor-pointer shrink-0"
              >
                <Settings2 className="w-5 h-5" />
                手帳を設定
              </button>
            </div>
          </div>
        )}

        {/* ── Category nav (image cards) ── */}
        <nav aria-label="カテゴリーナビゲーション" className="mb-8">
          <h2 className="text-base font-bold text-slate-800 mb-3">カテゴリー</h2>
          <div
            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
            role="radiogroup"
            aria-label="カテゴリーフィルター"
          >
            {LIFE_CATEGORIES.map((cat) => (
              <CategoryCard
                key={cat.id}
                cat={cat}
                isActive={activeCategory === cat.id}
                count={categoryCounts[cat.id] ?? 0}
                onClick={() => handleCategoryToggle(cat.id)}
              />
            ))}
          </div>
        </nav>

        {/* ── City banners ── */}
        <CityBanners />

        {/* ── Featured situations ── */}
        <section aria-label="おすすめシーン" className="mb-10">
          <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent-600" />
            シーン別おすすめ
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURED_SITUATIONS.map((sit) => (
              <SituationCard
                key={sit.id}
                situation={sit}
                facilities={MOCK_FACILITIES}
                onSelect={handleSituationSelect}
              />
            ))}
          </div>
        </section>

        {/* ── Filter status bar ── */}
        {isFiltered && (
          <div className="flex items-center justify-between mb-4 px-1 expand-enter">
            <p className="text-sm text-slate-500">
              <span className="font-bold text-brand-700">{visibleFacilities.length}件</span>
              の施設を表示中
              {activeCategory && (
                <span className="ml-1">
                  （{LIFE_CATEGORIES.find((c) => c.id === activeCategory)?.title}）
                </span>
              )}
              {situationFilter && <span className="ml-1">（シーン絞り込み）</span>}
            </p>
            <button
              onClick={handleClearFilters}
              aria-label="フィルターを解除"
              className="min-h-[44px] inline-flex items-center gap-1 px-3 py-2 rounded-lg
                         text-xs font-bold text-brand-700 hover:bg-brand-50
                         active:scale-[0.97] transition-all cursor-pointer"
            >
              フィルター解除
            </button>
          </div>
        )}

        {/* ── Facility listing ── */}
        <section aria-label="施設一覧">
          {groupedFacilities.length === 0 && (
            <div className="card-soft p-8 text-center">
              <Accessibility className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-500 font-bold mb-1">該当する施設がありません</p>
              <p className="text-xs text-slate-400">
                フィルター条件を変更するか、手帳の設定を確認してください。
              </p>
            </div>
          )}
          {groupedFacilities.map(({ category: cat, facilities: facs }) => (
            <div key={cat.id} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${cat.colorIconBg}`}>
                  <CategoryIcon name={cat.iconName} className={`w-4 h-4 ${cat.colorIconFg}`} />
                </span>
                <h2 className="text-base font-bold text-slate-800">{cat.title}</h2>
                <span className="text-xs text-slate-400 ml-1">{facs.length}件</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {facs.map((f) => (
                  <FacilityCard key={f.id} facility={f} preferences={preferences} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* ── Latest articles ── */}
        <section aria-label="最新コラム" className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-brand-700" />
              最新コラム
            </h2>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate("articles")}
                className="min-h-[44px] inline-flex items-center gap-0.5 px-3 py-2 rounded-lg
                           text-xs font-bold text-brand-700 hover:bg-brand-50
                           active:scale-[0.97] transition-all cursor-pointer"
              >
                すべて見る
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_ARTICLES.slice(0, 3).map((article) => (
              <article
                key={article.slug}
                className="card-soft hover-lift p-4 cursor-pointer group"
                onClick={() => onNavigate?.("articles")}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onNavigate?.("articles");
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {article.category}
                      </span>
                      {isNewArticle(article.date) && (
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500 text-white uppercase">
                          NEW
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-brand-700 transition-colors">
                      {article.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1.5">
                      <Clock className="w-3 h-3" />
                      {formatArticleDate(article.date)}
                    </span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:text-brand-700 transition-colors" />
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg mx-auto">
            ※ 掲載情報は2026年2月時点のものです。制度や割引内容は変更される場合があります。
            最新情報は各施設・自治体の公式サイトをご確認ください。
            写真: Unsplash（フリーライセンス）
          </p>
        </footer>
      </div>
    </div>
  );
}
