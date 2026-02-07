import { useState, createContext, useContext, useCallback } from "react";
import {
  Home as HomeIcon,
  Building2,
  Calculator,
  BookOpen,
  X,
  CheckCircle2,
} from "lucide-react";
import type { UserPreferences, HandbookType, HandbookGrade } from "./data";
import HomePage from "./HomePage";
import OsakaBenefits from "./OsakaBenefits";
import TransitCalc from "./TransitCalc";
import ArticlesPage from "./ArticlesPage";

// ---------------------------------------------------------------------------
// User Preferences Context
// ---------------------------------------------------------------------------

interface PrefsContextValue {
  preferences: UserPreferences;
  update: (p: Partial<UserPreferences>) => void;
}

const PrefsCtx = createContext<PrefsContextValue>({
  preferences: { handbookType: null, grade: null },
  update: () => {},
});

export function useUserPreferences() {
  return useContext(PrefsCtx);
}

const STORAGE_KEY = "adapt_user_prefs";

function loadPrefs(): UserPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as UserPreferences;
  } catch {
    /* ignore */
  }
  return { handbookType: null, grade: null };
}

function savePrefs(p: UserPreferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ---------------------------------------------------------------------------
// Preferences Modal
// ---------------------------------------------------------------------------

const HANDBOOK_OPTIONS: { value: HandbookType; label: string; desc: string }[] =
  [
    { value: "physical", label: "身体障害者手帳", desc: "身体" },
    { value: "intellectual", label: "療育手帳", desc: "知的" },
    { value: "mental", label: "精神障害者保健福祉手帳", desc: "精神" },
  ];

const GRADE_OPTIONS: { value: HandbookGrade; label: string }[] = [
  { value: 1, label: "1級" },
  { value: 2, label: "2級" },
  { value: 3, label: "3級" },
];

function PreferencesModal({
  initial,
  onSave,
  onClose,
}: {
  initial: UserPreferences;
  onSave: (p: UserPreferences) => void;
  onClose: () => void;
}) {
  const [hb, setHb] = useState<HandbookType | null>(initial.handbookType);
  const [gr, setGr] = useState<HandbookGrade | null>(initial.grade);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="手帳情報の設定"
    >
      <div className="card-soft w-full max-w-lg space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            あなたの手帳情報
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="閉じる"
          >
            <X size={22} aria-hidden />
          </button>
        </div>

        <p className="text-sm leading-relaxed text-slate-600">
          手帳の種類と等級を設定すると、あなたが対象の割引だけを表示します。
        </p>

        {/* Handbook type */}
        <fieldset>
          <legend className="mb-2 text-base font-bold text-slate-700">
            手帳の種類
          </legend>
          <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
            {HANDBOOK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={hb === opt.value}
                onClick={() => setHb(opt.value)}
                className={`min-h-[44px] rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  hb === opt.value
                    ? "bg-brand-800 text-white shadow-md"
                    : "border border-gray-200 bg-white text-slate-600 hover:border-brand-600"
                }`}
              >
                {opt.desc}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Grade */}
        <fieldset>
          <legend className="mb-2 text-base font-bold text-slate-700">
            等級
          </legend>
          <div className="flex gap-2" role="radiogroup">
            {GRADE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={gr === opt.value}
                onClick={() => setGr(opt.value)}
                className={`min-h-[44px] flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                  gr === opt.value
                    ? "bg-brand-800 text-white shadow-md"
                    : "border border-gray-200 bg-white text-slate-600 hover:border-brand-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              onSave({ handbookType: null, grade: null });
              onClose();
            }}
            className="min-h-[44px] flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-gray-50"
          >
            リセット
          </button>
          <button
            type="button"
            onClick={() => {
              onSave({ handbookType: hb, grade: gr });
              onClose();
            }}
            className="min-h-[44px] flex-1 rounded-xl bg-brand-800 px-4 py-3 text-sm font-bold text-white shadow-md transition-colors hover:bg-brand-900"
          >
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 size={16} aria-hidden />
              保存する
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bottom Navigation
// ---------------------------------------------------------------------------

type Page = "home" | "articles" | "osaka" | "calculator";

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode }[] = [
  {
    page: "home",
    label: "ホーム",
    icon: <HomeIcon size={22} aria-hidden />,
  },
  {
    page: "articles",
    label: "コラム",
    icon: <BookOpen size={22} aria-hidden />,
  },
  {
    page: "osaka",
    label: "大阪制度",
    icon: <Building2 size={22} aria-hidden />,
  },
  {
    page: "calculator",
    label: "運賃計算",
    icon: <Calculator size={22} aria-hidden />,
  },
];

function BottomNav({
  current,
  onChange,
}: {
  current: Page;
  onChange: (p: Page) => void;
}) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm"
      aria-label="メインナビゲーション"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const active = current === item.page;
          return (
            <button
              key={item.page}
              type="button"
              onClick={() => onChange(item.page)}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-bold transition-colors ${
                active
                  ? "text-brand-800"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
              {active && (
                <span className="h-0.5 w-6 rounded-full bg-brand-800" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// App Shell
// ---------------------------------------------------------------------------

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPrefs);
  const [page, setPage] = useState<Page>("home");
  const [showPrefs, setShowPrefs] = useState(false);

  const update = useCallback((partial: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const next = { ...prev, ...partial };
      savePrefs(next);
      return next;
    });
  }, []);

  return (
    <PrefsCtx.Provider value={{ preferences, update }}>
      <div className="min-h-screen bg-surface pb-16">
        {/* Skip link */}
        <a href="#main-content" className="skip-link">
          本文へスキップ
        </a>

        {/* Page content */}
        <div id="main-content">
          {page === "home" && (
            <HomePage
              preferences={preferences}
              onOpenPrefs={() => setShowPrefs(true)}
              onNavigate={(p) => setPage(p as Page)}
            />
          )}
          {page === "articles" && <ArticlesPage />}
          {page === "osaka" && (
            <OsakaBenefits onBack={() => setPage("home")} />
          )}
          {page === "calculator" && <TransitCalc />}
        </div>

        {/* Bottom navigation */}
        <BottomNav current={page} onChange={setPage} />

        {/* Preferences modal */}
        {showPrefs && (
          <PreferencesModal
            initial={preferences}
            onSave={(p) => update(p)}
            onClose={() => setShowPrefs(false)}
          />
        )}
      </div>
    </PrefsCtx.Provider>
  );
}
