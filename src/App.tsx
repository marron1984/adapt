import { useState, useCallback } from "react";
import {
  Train,
  Plane,
  Users,
  User,
  Calculator,
  CircleAlert,
  BadgeJapaneseYen,
  SlidersHorizontal,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** 障害区分 */
type DisabilityType = "type1" | "type2" | "mental";

interface FareInput {
  /** 障害区分 */
  disabilityType: DisabilityType;
  /** 介護者の有無 */
  hasCaregiver: boolean;
  /** 移動距離 (km) */
  distanceKm: number;
  /** 普通運賃（大人） */
  baseFare: number;
  /** 航空割引率 (0–100) */
  airlineDiscountPct: number;
}

interface FareResult {
  /** 通常料金 */
  originalFare: number;
  /** 割引後料金（本人） */
  discountedFare: number;
  /** 介護者の割引後料金 (null = 介護者なし) */
  caregiverFare: number | null;
  /** 合計（本人 + 介護者） */
  totalFare: number;
  /** おトク額 */
  savings: number;
  /** 割引が適用されたかどうか */
  discountApplied: boolean;
  /** 適用された割引の説明 */
  description: string;
}

// ---------------------------------------------------------------------------
// Fare Calculation – loosely‑coupled for future API integration
// ---------------------------------------------------------------------------

/**
 * 10 円未満切り捨て
 */
function floorTo10(amount: number): number {
  return Math.floor(amount / 10) * 10;
}

/**
 * 鉄道運賃の計算（JR準拠）
 *
 * - 第1種: 介護者同伴時は本人・介護者50%OFF、単独時は100km超で本人50%OFF
 * - 第2種: 100km超で本人のみ50%OFF
 * - 精神障害者: 2025年4月改定対応 — 本人50%OFF（100km超）、介護者割引なし
 */
export function calculateRailFare(input: FareInput): FareResult {
  const { disabilityType, hasCaregiver, distanceKm, baseFare } = input;

  const halfFare = floorTo10(baseFare / 2);
  const totalPeople = hasCaregiver ? 2 : 1;
  const originalTotal = baseFare * totalPeople;

  let discountedFare = baseFare;
  let caregiverFare: number | null = hasCaregiver ? baseFare : null;
  let discountApplied = false;
  let description = "";

  switch (disabilityType) {
    case "type1":
      if (hasCaregiver) {
        // 第1種 + 介護者: 本人・介護者ともに50%OFF（距離制限なし）
        discountedFare = halfFare;
        caregiverFare = halfFare;
        discountApplied = true;
        description =
          "第1種障害者割引: 本人・介護者ともに50%OFF（10円未満切り捨て）";
      } else if (distanceKm > 100) {
        // 第1種・単独・100km超: 本人50%OFF
        discountedFare = halfFare;
        discountApplied = true;
        description =
          "第1種障害者割引: 本人50%OFF（単独・100km超、10円未満切り捨て）";
      } else {
        description =
          "第1種障害者: 単独乗車で100km以下のため割引適用なし";
      }
      break;

    case "type2":
      if (distanceKm > 100) {
        discountedFare = halfFare;
        discountApplied = true;
        description =
          "第2種障害者割引: 本人のみ50%OFF（100km超、10円未満切り捨て）";
      } else {
        description = "第2種障害者: 100km以下のため割引適用なし";
      }
      break;

    case "mental":
      if (distanceKm > 100) {
        discountedFare = halfFare;
        discountApplied = true;
        description =
          "精神障害者割引（2025年4月改定）: 本人50%OFF（100km超、10円未満切り捨て）";
      } else {
        description =
          "精神障害者: 100km以下のため割引適用なし（2025年4月改定準拠）";
      }
      break;
  }

  const totalFare = discountedFare + (caregiverFare ?? 0);
  const savings = originalTotal - totalFare;

  return {
    originalFare: originalTotal,
    discountedFare,
    caregiverFare,
    totalFare,
    savings,
    discountApplied,
    description,
  };
}

/**
 * 航空運賃の計算
 *
 * 航空会社ごとの割引率をスライダーで調整可能。
 * デフォルトは基準運賃の50%OFF。
 */
export function calculateAirFare(input: FareInput): FareResult {
  const { hasCaregiver, baseFare, airlineDiscountPct } = input;

  const totalPeople = hasCaregiver ? 2 : 1;
  const originalTotal = baseFare * totalPeople;

  const rate = airlineDiscountPct / 100;
  const discountedFare = Math.round(baseFare * (1 - rate));
  const caregiverFare = hasCaregiver ? baseFare : null;

  const totalFare = discountedFare + (caregiverFare ?? 0);
  const savings = originalTotal - totalFare;

  return {
    originalFare: originalTotal,
    discountedFare,
    caregiverFare,
    totalFare,
    savings,
    discountApplied: true,
    description: `航空障害者割引: 本人${airlineDiscountPct}%OFF（介護者は通常運賃）`,
  };
}

// ---------------------------------------------------------------------------
// UI Helpers
// ---------------------------------------------------------------------------

const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: "type1", label: "第1種" },
  { value: "type2", label: "第2種" },
  { value: "mental", label: "精神" },
];

function formatYen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

function ResultCard({
  title,
  icon,
  result,
  accentColor,
}: {
  title: string;
  icon: React.ReactNode;
  result: FareResult;
  accentColor: string;
}) {
  return (
    <div
      className={`rounded-2xl border-2 ${accentColor} bg-white shadow-lg p-6 flex flex-col gap-4`}
      role="region"
      aria-label={`${title}の運賃計算結果`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>

      <p className="text-base text-gray-700 leading-relaxed">
        {result.description}
      </p>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="rounded-xl bg-gray-100 p-4">
          <p className="text-sm font-semibold text-gray-500 mb-1">通常料金</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatYen(result.originalFare)}
          </p>
        </div>
        <div
          className={`rounded-xl p-4 ${
            result.discountApplied ? "bg-green-50" : "bg-gray-100"
          }`}
        >
          <p className="text-sm font-semibold text-gray-500 mb-1">
            割引後料金
          </p>
          <p
            className={`text-2xl font-bold ${
              result.discountApplied ? "text-green-700" : "text-gray-800"
            }`}
          >
            {formatYen(result.totalFare)}
          </p>
        </div>
      </div>

      {/* 内訳 */}
      <div className="text-base text-gray-700 space-y-1">
        <p>
          <span className="font-semibold">本人:</span>{" "}
          {formatYen(result.discountedFare)}
        </p>
        {result.caregiverFare !== null && (
          <p>
            <span className="font-semibold">介護者:</span>{" "}
            {formatYen(result.caregiverFare)}
          </p>
        )}
      </div>

      {result.savings > 0 && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-4 text-center">
          <p className="text-lg font-bold text-yellow-800">
            <BadgeJapaneseYen
              className="inline-block mr-1 -mt-1"
              size={22}
              aria-hidden
            />
            おトク額: {formatYen(result.savings)}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

export default function App() {
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("type1");
  const [hasCaregiver, setHasCaregiver] = useState(false);
  const [distanceKm, setDistanceKm] = useState(150);
  const [baseFare, setBaseFare] = useState(5000);
  const [airlineDiscountPct, setAirlineDiscountPct] = useState(50);

  const buildInput = useCallback(
    (): FareInput => ({
      disabilityType,
      hasCaregiver,
      distanceKm,
      baseFare,
      airlineDiscountPct,
    }),
    [disabilityType, hasCaregiver, distanceKm, baseFare, airlineDiscountPct],
  );

  const railResult = calculateRailFare(buildInput());
  const airResult = calculateAirFare(buildInput());

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      {/* ヘッダー */}
      <header className="bg-indigo-800 text-white py-6 px-4 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Calculator size={36} aria-hidden />
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              障害者割引運賃シミュレーター
            </h1>
            <p className="text-indigo-200 text-lg mt-1">
              鉄道・飛行機の割引運賃をかんたん比較
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        {/* ── 入力セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="入力フォーム"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal size={24} aria-hidden />
            条件を入力
          </h2>

          {/* 障害区分 */}
          <fieldset>
            <legend className="text-lg font-semibold mb-2">障害区分</legend>
            <div className="flex flex-wrap gap-3" role="radiogroup">
              {DISABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={disabilityType === opt.value}
                  onClick={() => setDisabilityType(opt.value)}
                  className={`px-6 py-3 rounded-xl text-lg font-bold border-2 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                    disabilityType === opt.value
                      ? "bg-indigo-700 text-white border-indigo-700"
                      : "bg-white text-gray-800 border-gray-300 hover:border-indigo-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* 介護者 */}
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold" id="caregiver-label">
              介護者
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={hasCaregiver}
              aria-labelledby="caregiver-label"
              onClick={() => setHasCaregiver((v) => !v)}
              className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-400 ${
                hasCaregiver ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-9 w-9 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  hasCaregiver ? "translate-x-10" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-lg flex items-center gap-1" aria-live="polite">
              {hasCaregiver ? (
                <>
                  <Users size={22} aria-hidden /> あり
                </>
              ) : (
                <>
                  <User size={22} aria-hidden /> なし
                </>
              )}
            </span>
          </div>

          {/* 移動距離 */}
          <div>
            <label
              htmlFor="distance"
              className="block text-lg font-semibold mb-1"
            >
              移動距離（km）
            </label>
            <div className="flex items-center gap-4">
              <input
                id="distance"
                type="range"
                min={10}
                max={1500}
                step={10}
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="flex-1 h-3 rounded-full accent-indigo-600"
              />
              <input
                type="number"
                min={1}
                value={distanceKm}
                onChange={(e) =>
                  setDistanceKm(Math.max(1, Number(e.target.value)))
                }
                aria-label="移動距離（km）の数値入力"
                className="w-24 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
              />
              <span className="text-lg font-semibold">km</span>
            </div>
            {distanceKm <= 100 && (
              <p
                className="mt-2 text-base text-amber-700 flex items-center gap-1"
                role="alert"
              >
                <CircleAlert size={18} aria-hidden />
                100km以下の場合、一部の割引が適用されません
              </p>
            )}
          </div>

          {/* 普通運賃 */}
          <div>
            <label
              htmlFor="baseFare"
              className="block text-lg font-semibold mb-1"
            >
              普通運賃（大人・片道）
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" aria-hidden>
                ¥
              </span>
              <input
                id="baseFare"
                type="number"
                min={0}
                step={10}
                value={baseFare}
                onChange={(e) =>
                  setBaseFare(Math.max(0, Number(e.target.value)))
                }
                className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* 航空割引率 */}
          <div>
            <label
              htmlFor="airDiscount"
              className="block text-lg font-semibold mb-1"
            >
              航空割引率（%）
            </label>
            <p className="text-sm text-gray-500 mb-2">
              JAL / ANA 等の障害者割引率を調整できます（デフォルト 50%）
            </p>
            <div className="flex items-center gap-4">
              <input
                id="airDiscount"
                type="range"
                min={0}
                max={70}
                step={5}
                value={airlineDiscountPct}
                onChange={(e) =>
                  setAirlineDiscountPct(Number(e.target.value))
                }
                className="flex-1 h-3 rounded-full accent-sky-600"
              />
              <span className="text-xl font-bold w-16 text-center">
                {airlineDiscountPct}%
              </span>
            </div>
          </div>
        </section>

        {/* ── 結果セクション ── */}
        <section aria-label="運賃計算結果" className="space-y-6">
          <h2 className="text-2xl font-bold">計算結果</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <ResultCard
              title="鉄道（JR準拠）"
              icon={
                <Train
                  size={30}
                  className="text-indigo-700"
                  aria-hidden
                />
              }
              result={railResult}
              accentColor="border-indigo-300"
            />
            <ResultCard
              title="飛行機"
              icon={
                <Plane size={30} className="text-sky-600" aria-hidden />
              }
              result={airResult}
              accentColor="border-sky-300"
            />
          </div>
        </section>

        {/* ── 注意事項 ── */}
        <section
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 text-base text-amber-900 space-y-2"
          aria-label="注意事項"
        >
          <h3 className="text-lg font-bold flex items-center gap-2">
            <CircleAlert size={22} aria-hidden />
            ご利用にあたって
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>
              本ツールはシミュレーションです。実際の運賃は各事業者にご確認ください。
            </li>
            <li>
              鉄道運賃は JR
              旅客鉄道の障害者割引制度に準拠しています。私鉄各社の制度とは異なる場合があります。
            </li>
            <li>
              精神障害者割引は 2025 年 4
              月の制度改定内容を反映しています。
            </li>
            <li>
              航空割引率は航空会社・路線・時期により異なります。スライダーで調整してください。
            </li>
          </ul>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
        <p>障害者割引運賃シミュレーター &copy; 2025</p>
      </footer>
    </div>
  );
}
