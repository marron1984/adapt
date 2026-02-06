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
  TrendingDown,
  Trophy,
  TicketPercent,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** 障害区分 */
type DisabilityType = "type1" | "type2" | "mental";

interface RailFareInput {
  disabilityType: DisabilityType;
  hasCaregiver: boolean;
  distanceKm: number;
  /** 乗車券（普通運賃） */
  ticketFare: number;
  /** 特急券（新幹線・特急料金） */
  expressFare: number;
}

interface AirFareInput {
  hasCaregiver: boolean;
  /** 航空普通運賃 */
  baseFare: number;
  /** 障害者割引率 (0–100) */
  airlineDiscountPct: number;
  /** 早期割引の運賃 */
  earlyBirdFare: number;
}

interface RailFareResult {
  /** 通常料金合計（乗車券 + 特急券）× 人数 */
  originalFare: number;
  /** 割引後の乗車券（本人） */
  discountedTicket: number;
  /** 特急券（割引なし） */
  expressFare: number;
  /** 本人合計 */
  discountedFare: number;
  /** 介護者合計 (null = 介護者なし) */
  caregiverFare: number | null;
  /** 介護者の乗車券 */
  caregiverTicket: number | null;
  /** 総合計 */
  totalFare: number;
  /** おトク額 */
  savings: number;
  discountApplied: boolean;
  description: string;
}

interface AirFareResult {
  originalFare: number;
  /** 障害者割引後の本人運賃 */
  discountedFare: number;
  caregiverFare: number | null;
  totalFare: number;
  savings: number;
  discountApplied: boolean;
  description: string;
  /** 早期割引の本人運賃 */
  earlyBirdFare: number;
  /** 早期割引を含めた合計 */
  earlyBirdTotal: number;
  /** 早期割引のおトク額 */
  earlyBirdSavings: number;
  /** 障害者割引の方が安い？ */
  disabilityIsCheaper: boolean;
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
 * 障害者割引は「乗車券」のみに適用。特急券は割引対象外。
 *
 * - 第1種 + 介護者: 乗車券を本人・介護者ともに50%OFF（距離制限なし）
 * - 第1種 単独 100km超: 乗車券を本人50%OFF
 * - 第2種 100km超: 乗車券を本人のみ50%OFF
 * - 精神障害者 100km超: 乗車券を本人50%OFF（2025年4月改定）
 */
export function calculateRailFare(input: RailFareInput): RailFareResult {
  const { disabilityType, hasCaregiver, distanceKm, ticketFare, expressFare } =
    input;

  const halfTicket = floorTo10(ticketFare / 2);
  const totalPeople = hasCaregiver ? 2 : 1;
  const originalTotal = (ticketFare + expressFare) * totalPeople;

  let discountedTicket = ticketFare;
  let caregiverTicket: number | null = hasCaregiver ? ticketFare : null;
  let discountApplied = false;
  let description = "";

  switch (disabilityType) {
    case "type1":
      if (hasCaregiver) {
        discountedTicket = halfTicket;
        caregiverTicket = halfTicket;
        discountApplied = true;
        description =
          "第1種障害者割引: 乗車券を本人・介護者ともに50%OFF（10円未満切り捨て）。特急券は割引対象外。";
      } else if (distanceKm > 100) {
        discountedTicket = halfTicket;
        discountApplied = true;
        description =
          "第1種障害者割引: 乗車券を本人50%OFF（単独・100km超、10円未満切り捨て）。特急券は割引対象外。";
      } else {
        description =
          "第1種障害者: 単独乗車で100km以下のため割引適用なし";
      }
      break;

    case "type2":
      if (distanceKm > 100) {
        discountedTicket = halfTicket;
        discountApplied = true;
        description =
          "第2種障害者割引: 乗車券を本人のみ50%OFF（100km超、10円未満切り捨て）。特急券は割引対象外。";
      } else {
        description = "第2種障害者: 100km以下のため割引適用なし";
      }
      break;

    case "mental":
      if (distanceKm > 100) {
        discountedTicket = halfTicket;
        discountApplied = true;
        description =
          "精神障害者割引（2025年4月改定）: 乗車券を本人50%OFF（100km超、10円未満切り捨て）。特急券は割引対象外。";
      } else {
        description =
          "精神障害者: 100km以下のため割引適用なし（2025年4月改定準拠）";
      }
      break;
  }

  const discountedFare = discountedTicket + expressFare;
  const caregiverFare = hasCaregiver
    ? (caregiverTicket ?? ticketFare) + expressFare
    : null;

  const totalFare = discountedFare + (caregiverFare ?? 0);
  const savings = originalTotal - totalFare;

  return {
    originalFare: originalTotal,
    discountedTicket,
    expressFare,
    discountedFare,
    caregiverFare,
    caregiverTicket,
    totalFare,
    savings,
    discountApplied,
    description,
  };
}

/**
 * 航空運賃の計算
 *
 * 障害者割引と早期割引を比較し、安い方を強調表示。
 */
export function calculateAirFare(input: AirFareInput): AirFareResult {
  const { hasCaregiver, baseFare, airlineDiscountPct, earlyBirdFare } = input;

  const totalPeople = hasCaregiver ? 2 : 1;
  const originalTotal = baseFare * totalPeople;

  const rate = airlineDiscountPct / 100;
  const discountedFare = Math.round(baseFare * (1 - rate));
  const caregiverFare = hasCaregiver ? baseFare : null;

  const totalFare = discountedFare + (caregiverFare ?? 0);
  const savings = originalTotal - totalFare;

  // 早期割引: 本人のみ適用（介護者は通常運賃）
  const earlyBirdTotal = earlyBirdFare + (caregiverFare ?? 0);
  const earlyBirdSavings = originalTotal - earlyBirdTotal;

  const disabilityIsCheaper = totalFare <= earlyBirdTotal;

  return {
    originalFare: originalTotal,
    discountedFare,
    caregiverFare,
    totalFare,
    savings,
    discountApplied: true,
    description: `航空障害者割引: 本人${airlineDiscountPct}%OFF（介護者は通常運賃）`,
    earlyBirdFare,
    earlyBirdTotal,
    earlyBirdSavings,
    disabilityIsCheaper,
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

/** 節約額バッジ（カード右上） */
function SavingsBadge({ savings }: { savings: number }) {
  if (savings <= 0) return null;
  return (
    <div
      className="absolute -top-3 -right-3 bg-indigo-700 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1 text-base font-bold"
      aria-label={`節約額 ${formatYen(savings)}`}
    >
      <TrendingDown size={18} aria-hidden />
      <span>{formatYen(savings)}</span>
    </div>
  );
}

/** 鉄道カード */
function RailResultCard({ result }: { result: RailFareResult }) {
  return (
    <div
      className="relative rounded-2xl border-2 border-indigo-300 bg-white shadow-lg p-6 flex flex-col gap-4"
      role="region"
      aria-label="鉄道（JR準拠）の運賃計算結果"
    >
      <SavingsBadge savings={result.savings} />

      <div className="flex items-center gap-3">
        <Train size={30} className="text-indigo-700" aria-hidden />
        <h2 className="text-2xl font-bold text-gray-900">鉄道（JR準拠）</h2>
      </div>

      <p className="text-base text-gray-700 leading-relaxed">
        {result.description}
      </p>

      {/* 通常料金 vs 割引後料金 */}
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
            className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              result.discountApplied ? "text-green-700" : "text-gray-800"
            }`}
          >
            {result.discountApplied && (
              <TrendingDown size={20} aria-hidden className="shrink-0" />
            )}
            {formatYen(result.totalFare)}
          </p>
        </div>
      </div>

      {/* 内訳 */}
      <div className="text-base text-gray-700 space-y-1 border-t border-gray-200 pt-3">
        <p className="font-semibold text-gray-900 mb-1">内訳（本人）</p>
        <p>
          乗車券: {formatYen(result.discountedTicket)}
          {result.discountApplied && (
            <span className="ml-1 text-sm text-green-700">（割引適用）</span>
          )}
        </p>
        <p>特急券: {formatYen(result.expressFare)}</p>
        <p className="font-semibold">
          本人合計: {formatYen(result.discountedFare)}
        </p>
        {result.caregiverFare !== null && (
          <>
            <p className="font-semibold text-gray-900 mt-2 mb-1">
              内訳（介護者）
            </p>
            <p>
              乗車券: {formatYen(result.caregiverTicket ?? 0)}
              {result.discountApplied &&
                result.caregiverTicket !== null &&
                result.caregiverTicket < (result.discountedTicket * 2) && (
                  <span className="ml-1 text-sm text-green-700">
                    （割引適用）
                  </span>
                )}
            </p>
            <p>特急券: {formatYen(result.expressFare)}</p>
            <p className="font-semibold">
              介護者合計: {formatYen(result.caregiverFare)}
            </p>
          </>
        )}
      </div>

      {result.savings > 0 && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-4 text-center">
          <p className="text-lg font-bold text-yellow-800 flex items-center justify-center gap-1">
            <BadgeJapaneseYen size={22} aria-hidden />
            おトク額: {formatYen(result.savings)}
          </p>
        </div>
      )}
    </div>
  );
}

/** 航空カード（障害者割引 vs 早期割引の比較付き） */
function AirResultCard({ result }: { result: AirFareResult }) {
  const bestSavings = Math.max(result.savings, result.earlyBirdSavings);

  return (
    <div
      className="relative rounded-2xl border-2 border-sky-300 bg-white shadow-lg p-6 flex flex-col gap-4"
      role="region"
      aria-label="飛行機の運賃計算結果"
    >
      <SavingsBadge savings={bestSavings} />

      <div className="flex items-center gap-3">
        <Plane size={30} className="text-sky-600" aria-hidden />
        <h2 className="text-2xl font-bold text-gray-900">飛行機</h2>
      </div>

      <p className="text-base text-gray-700 leading-relaxed">
        {result.description}
      </p>

      {/* 通常料金 */}
      <div className="rounded-xl bg-gray-100 p-4 text-center">
        <p className="text-sm font-semibold text-gray-500 mb-1">通常料金</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatYen(result.originalFare)}
        </p>
      </div>

      {/* 障害者割引 vs 早期割引 比較 */}
      <div className="grid grid-cols-2 gap-4 text-center">
        {/* 障害者割引 */}
        <div
          className={`rounded-xl p-4 border-2 transition-colors ${
            result.disabilityIsCheaper
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {result.disabilityIsCheaper && (
            <p className="text-sm font-bold text-green-700 mb-1 flex items-center justify-center gap-1">
              <Trophy size={16} aria-hidden />
              最安値
            </p>
          )}
          <p className="text-sm font-semibold text-gray-500 mb-1">
            障害者割引
          </p>
          <p
            className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              result.disabilityIsCheaper ? "text-green-700" : "text-gray-800"
            }`}
          >
            {result.disabilityIsCheaper && (
              <TrendingDown size={20} aria-hidden className="shrink-0" />
            )}
            {formatYen(result.totalFare)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            本人 {formatYen(result.discountedFare)}
          </p>
        </div>

        {/* 早期割引 */}
        <div
          className={`rounded-xl p-4 border-2 transition-colors ${
            !result.disabilityIsCheaper
              ? "border-green-500 bg-green-50"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {!result.disabilityIsCheaper && (
            <p className="text-sm font-bold text-green-700 mb-1 flex items-center justify-center gap-1">
              <Trophy size={16} aria-hidden />
              最安値
            </p>
          )}
          <p className="text-sm font-semibold text-gray-500 mb-1">
            早期割引
          </p>
          <p
            className={`text-2xl font-bold flex items-center justify-center gap-1 ${
              !result.disabilityIsCheaper ? "text-green-700" : "text-gray-800"
            }`}
          >
            {!result.disabilityIsCheaper && (
              <TrendingDown size={20} aria-hidden className="shrink-0" />
            )}
            {formatYen(result.earlyBirdTotal)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            本人 {formatYen(result.earlyBirdFare)}
          </p>
        </div>
      </div>

      {/* 介護者がいる場合の注記 */}
      {result.caregiverFare !== null && (
        <p className="text-sm text-gray-500">
          ※ 介護者は通常運賃（{formatYen(result.caregiverFare)}
          ）を加算しています
        </p>
      )}

      {bestSavings > 0 && (
        <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-4 text-center">
          <p className="text-lg font-bold text-yellow-800 flex items-center justify-center gap-1">
            <BadgeJapaneseYen size={22} aria-hidden />
            最大おトク額: {formatYen(bestSavings)}
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

  // 鉄道: 乗車券と特急券を分離
  const [ticketFare, setTicketFare] = useState(5000);
  const [expressFare, setExpressFare] = useState(3000);

  // 航空
  const [airBaseFare, setAirBaseFare] = useState(30000);
  const [airlineDiscountPct, setAirlineDiscountPct] = useState(50);
  const [earlyBirdFare, setEarlyBirdFare] = useState(14000);

  const buildRailInput = useCallback(
    (): RailFareInput => ({
      disabilityType,
      hasCaregiver,
      distanceKm,
      ticketFare,
      expressFare,
    }),
    [disabilityType, hasCaregiver, distanceKm, ticketFare, expressFare],
  );

  const buildAirInput = useCallback(
    (): AirFareInput => ({
      hasCaregiver,
      baseFare: airBaseFare,
      airlineDiscountPct,
      earlyBirdFare,
    }),
    [hasCaregiver, airBaseFare, airlineDiscountPct, earlyBirdFare],
  );

  const railResult = calculateRailFare(buildRailInput());
  const airResult = calculateAirFare(buildAirInput());

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900">
      {/* ヘッダー */}
      <header className="bg-indigo-800 text-white py-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
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

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* ── 共通入力セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="共通条件の入力フォーム"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SlidersHorizontal size={24} aria-hidden />
            共通条件
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
        </section>

        {/* ── 鉄道入力セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="鉄道運賃の入力フォーム"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Train size={24} className="text-indigo-700" aria-hidden />
            鉄道運賃の入力
          </h2>
          <p className="text-sm text-gray-500">
            障害者割引は「乗車券」のみに適用されます。特急券（新幹線含む）は割引対象外です。
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="ticketFare"
                className="block text-lg font-semibold mb-1"
              >
                乗車券（大人・片道）
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" aria-hidden>
                  ¥
                </span>
                <input
                  id="ticketFare"
                  type="number"
                  min={0}
                  step={10}
                  value={ticketFare}
                  onChange={(e) =>
                    setTicketFare(Math.max(0, Number(e.target.value)))
                  }
                  className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
                />
              </div>
              <p className="text-xs text-green-700 mt-1 flex items-center gap-1">
                <TicketPercent size={14} aria-hidden />
                割引対象
              </p>
            </div>

            <div>
              <label
                htmlFor="expressFare"
                className="block text-lg font-semibold mb-1"
              >
                特急券（大人・片道）
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold" aria-hidden>
                  ¥
                </span>
                <input
                  id="expressFare"
                  type="number"
                  min={0}
                  step={10}
                  value={expressFare}
                  onChange={(e) =>
                    setExpressFare(Math.max(0, Number(e.target.value)))
                  }
                  className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">割引対象外</p>
            </div>
          </div>
        </section>

        {/* ── 航空入力セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="航空運賃の入力フォーム"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Plane size={24} className="text-sky-600" aria-hidden />
            航空運賃の入力
          </h2>

          {/* 航空普通運賃 */}
          <div>
            <label
              htmlFor="airBaseFare"
              className="block text-lg font-semibold mb-1"
            >
              普通運賃（大人・片道）
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" aria-hidden>
                ¥
              </span>
              <input
                id="airBaseFare"
                type="number"
                min={0}
                step={100}
                value={airBaseFare}
                onChange={(e) =>
                  setAirBaseFare(Math.max(0, Number(e.target.value)))
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
              障害者割引率（%）
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

          {/* 早期割引 */}
          <div className="border-t border-gray-200 pt-4">
            <label
              htmlFor="earlyBirdFare"
              className="block text-lg font-semibold mb-1"
            >
              早期割引の想定価格（特割・先得など）
            </label>
            <p className="text-sm text-gray-500 mb-2">
              早期割引の方が安い場合があります。確認用に想定価格を入力してください。
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold" aria-hidden>
                ¥
              </span>
              <input
                id="earlyBirdFare"
                type="number"
                min={0}
                step={100}
                value={earlyBirdFare}
                onChange={(e) =>
                  setEarlyBirdFare(Math.max(0, Number(e.target.value)))
                }
                className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
              />
            </div>
          </div>
        </section>

        {/* ── 結果セクション ── */}
        <section aria-label="運賃計算結果" className="space-y-6">
          <h2 className="text-2xl font-bold">計算結果</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <RailResultCard result={railResult} />
            <AirResultCard result={airResult} />
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
              鉄道の障害者割引は「乗車券」のみに適用されます。特急券・グリーン券・指定席券等は割引対象外です。
            </li>
            <li>
              精神障害者割引は 2025 年 4
              月の制度改定内容を反映しています。
            </li>
            <li>
              航空の早期割引は路線・時期により大きく変動します。各社サイトで最新価格をご確認ください。
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
