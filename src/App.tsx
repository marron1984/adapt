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
  Search,
  MapPin,
  Loader2,
  ArrowRight,
  Building2,
} from "lucide-react";
import OsakaBenefits from "./OsakaBenefits";

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
  originalFare: number;
  discountedTicket: number;
  expressFare: number;
  discountedFare: number;
  caregiverFare: number | null;
  caregiverTicket: number | null;
  totalFare: number;
  savings: number;
  discountApplied: boolean;
  description: string;
}

interface AirFareResult {
  originalFare: number;
  discountedFare: number;
  caregiverFare: number | null;
  totalFare: number;
  savings: number;
  discountApplied: boolean;
  description: string;
  earlyBirdFare: number;
  earlyBirdTotal: number;
  earlyBirdSavings: number;
  disabilityIsCheaper: boolean;
}

// ---------------------------------------------------------------------------
// Route Search API – loosely‑coupled for future real API integration
// ---------------------------------------------------------------------------

/** 経路検索の結果 */
interface RouteSearchResult {
  /** 出発駅 */
  from: string;
  /** 到着駅 */
  to: string;
  /** 乗車券（大人・片道） */
  ticketFare: number;
  /** 特急券（大人・片道）。在来線のみの場合は 0 */
  expressFare: number;
  /** 営業キロ */
  distanceKm: number;
  /** データソース */
  source: "api" | "mock";
}

/**
 * モックデータ: 主要区間の運賃テーブル
 * 将来 API 連携時にこのテーブルは不要になる
 */
const MOCK_ROUTES: Record<string, RouteSearchResult> = {
  "東京-大阪": {
    from: "東京",
    to: "大阪",
    ticketFare: 8910,
    expressFare: 4960,
    distanceKm: 556,
    source: "mock",
  },
  "東京-名古屋": {
    from: "東京",
    to: "名古屋",
    ticketFare: 6380,
    expressFare: 4180,
    distanceKm: 366,
    source: "mock",
  },
  "東京-仙台": {
    from: "東京",
    to: "仙台",
    ticketFare: 6050,
    expressFare: 4430,
    distanceKm: 352,
    source: "mock",
  },
  "東京-新潟": {
    from: "東京",
    to: "新潟",
    ticketFare: 5720,
    expressFare: 4510,
    distanceKm: 334,
    source: "mock",
  },
  "東京-広島": {
    from: "東京",
    to: "広島",
    ticketFare: 12100,
    expressFare: 5490,
    distanceKm: 894,
    source: "mock",
  },
  "東京-博多": {
    from: "東京",
    to: "博多",
    ticketFare: 13870,
    expressFare: 6250,
    distanceKm: 1175,
    source: "mock",
  },
  "東京-金沢": {
    from: "東京",
    to: "金沢",
    ticketFare: 7480,
    expressFare: 6930,
    distanceKm: 450,
    source: "mock",
  },
  "大阪-博多": {
    from: "大阪",
    to: "博多",
    ticketFare: 9790,
    expressFare: 5490,
    distanceKm: 622,
    source: "mock",
  },
  "名古屋-大阪": {
    from: "名古屋",
    to: "大阪",
    ticketFare: 3410,
    expressFare: 3070,
    distanceKm: 190,
    source: "mock",
  },
  "東京-京都": {
    from: "東京",
    to: "京都",
    ticketFare: 8360,
    expressFare: 4960,
    distanceKm: 476,
    source: "mock",
  },
  "大阪-新潟": {
    from: "大阪",
    to: "新潟",
    ticketFare: 8910,
    expressFare: 5810,
    distanceKm: 638,
    source: "mock",
  },
  // ── 東北・北海道方面 ──
  "東京-盛岡": {
    from: "東京",
    to: "盛岡",
    ticketFare: 8580,
    expressFare: 5040,
    distanceKm: 535,
    source: "mock",
  },
  "東京-秋田": {
    from: "東京",
    to: "秋田",
    ticketFare: 9610,
    expressFare: 6050,
    distanceKm: 663,
    source: "mock",
  },
  "東京-山形": {
    from: "東京",
    to: "山形",
    ticketFare: 5940,
    expressFare: 4430,
    distanceKm: 360,
    source: "mock",
  },
  "東京-新青森": {
    from: "東京",
    to: "新青森",
    ticketFare: 10340,
    expressFare: 6350,
    distanceKm: 714,
    source: "mock",
  },
  "東京-新函館北斗": {
    from: "東京",
    to: "新函館北斗",
    ticketFare: 11330,
    expressFare: 6530,
    distanceKm: 863,
    source: "mock",
  },
  "仙台-盛岡": {
    from: "仙台",
    to: "盛岡",
    ticketFare: 3410,
    expressFare: 3520,
    distanceKm: 183,
    source: "mock",
  },
  // ── 東海道・中部方面 ──
  "東京-静岡": {
    from: "東京",
    to: "静岡",
    ticketFare: 3410,
    expressFare: 3520,
    distanceKm: 180,
    source: "mock",
  },
  "東京-浜松": {
    from: "東京",
    to: "浜松",
    ticketFare: 4510,
    expressFare: 4180,
    distanceKm: 257,
    source: "mock",
  },
  "東京-長野": {
    from: "東京",
    to: "長野",
    ticketFare: 4070,
    expressFare: 4200,
    distanceKm: 222,
    source: "mock",
  },
  "名古屋-金沢": {
    from: "名古屋",
    to: "金沢",
    ticketFare: 4510,
    expressFare: 2640,
    distanceKm: 256,
    source: "mock",
  },
  "名古屋-仙台": {
    from: "名古屋",
    to: "仙台",
    ticketFare: 10560,
    expressFare: 5280,
    distanceKm: 732,
    source: "mock",
  },
  "名古屋-博多": {
    from: "名古屋",
    to: "博多",
    ticketFare: 11000,
    expressFare: 5280,
    distanceKm: 811,
    source: "mock",
  },
  // ── 関西方面 ──
  "大阪-広島": {
    from: "大阪",
    to: "広島",
    ticketFare: 5720,
    expressFare: 4180,
    distanceKm: 342,
    source: "mock",
  },
  "大阪-金沢": {
    from: "大阪",
    to: "金沢",
    ticketFare: 4840,
    expressFare: 2640,
    distanceKm: 268,
    source: "mock",
  },
  "大阪-仙台": {
    from: "大阪",
    to: "仙台",
    ticketFare: 11000,
    expressFare: 5490,
    distanceKm: 853,
    source: "mock",
  },
  "京都-博多": {
    from: "京都",
    to: "博多",
    ticketFare: 9610,
    expressFare: 5280,
    distanceKm: 612,
    source: "mock",
  },
  "京都-広島": {
    from: "京都",
    to: "広島",
    ticketFare: 5500,
    expressFare: 4180,
    distanceKm: 332,
    source: "mock",
  },
  // ── 九州方面 ──
  "東京-熊本": {
    from: "東京",
    to: "熊本",
    ticketFare: 14080,
    expressFare: 6800,
    distanceKm: 1118,
    source: "mock",
  },
  "東京-鹿児島中央": {
    from: "東京",
    to: "鹿児島中央",
    ticketFare: 15950,
    expressFare: 7250,
    distanceKm: 1325,
    source: "mock",
  },
  "大阪-鹿児島中央": {
    from: "大阪",
    to: "鹿児島中央",
    ticketFare: 11000,
    expressFare: 5810,
    distanceKm: 912,
    source: "mock",
  },
  "大阪-熊本": {
    from: "大阪",
    to: "熊本",
    ticketFare: 10010,
    expressFare: 5590,
    distanceKm: 756,
    source: "mock",
  },
  "博多-熊本": {
    from: "博多",
    to: "熊本",
    ticketFare: 2170,
    expressFare: 2200,
    distanceKm: 118,
    source: "mock",
  },
  "博多-鹿児島中央": {
    from: "博多",
    to: "鹿児島中央",
    ticketFare: 4510,
    expressFare: 3740,
    distanceKm: 289,
    source: "mock",
  },
  "広島-博多": {
    from: "広島",
    to: "博多",
    ticketFare: 5720,
    expressFare: 3740,
    distanceKm: 281,
    source: "mock",
  },
  // ── 短距離区間（100km以下で割引なしケース確認用） ──
  "東京-小田原": {
    from: "東京",
    to: "小田原",
    ticketFare: 1520,
    expressFare: 1760,
    distanceKm: 84,
    source: "mock",
  },
  "大阪-京都": {
    from: "大阪",
    to: "京都",
    ticketFare: 580,
    expressFare: 0,
    distanceKm: 43,
    source: "mock",
  },
  "名古屋-京都": {
    from: "名古屋",
    to: "京都",
    ticketFare: 2640,
    expressFare: 2530,
    distanceKm: 146,
    source: "mock",
  },
  "博多-小倉": {
    from: "博多",
    to: "小倉",
    ticketFare: 1310,
    expressFare: 1730,
    distanceKm: 67,
    source: "mock",
  },
  // ── 鶴橋起点 ──
  "鶴橋-新金岡": {
    from: "鶴橋",
    to: "新金岡",
    ticketFare: 460,
    expressFare: 0,
    distanceKm: 15,
    source: "mock",
  },
  "鶴橋-新潟": {
    from: "鶴橋",
    to: "新潟",
    ticketFare: 9130,
    expressFare: 5810,
    distanceKm: 641,
    source: "mock",
  },
  "鶴橋-富山": {
    from: "鶴橋",
    to: "富山",
    ticketFare: 5280,
    expressFare: 4180,
    distanceKm: 330,
    source: "mock",
  },
  "鶴橋-東京": {
    from: "鶴橋",
    to: "東京",
    ticketFare: 8910,
    expressFare: 4960,
    distanceKm: 560,
    source: "mock",
  },
  "鶴橋-名古屋": {
    from: "鶴橋",
    to: "名古屋",
    ticketFare: 3630,
    expressFare: 3070,
    distanceKm: 193,
    source: "mock",
  },
  "鶴橋-仙台": {
    from: "鶴橋",
    to: "仙台",
    ticketFare: 11220,
    expressFare: 5490,
    distanceKm: 857,
    source: "mock",
  },
  "鶴橋-広島": {
    from: "鶴橋",
    to: "広島",
    ticketFare: 5940,
    expressFare: 4180,
    distanceKm: 345,
    source: "mock",
  },
  "鶴橋-熊本": {
    from: "鶴橋",
    to: "熊本",
    ticketFare: 10230,
    expressFare: 5590,
    distanceKm: 760,
    source: "mock",
  },
  "鶴橋-新高岡": {
    from: "鶴橋",
    to: "新高岡",
    ticketFare: 5080,
    expressFare: 4180,
    distanceKm: 315,
    source: "mock",
  },
  "鶴橋-金沢": {
    from: "鶴橋",
    to: "金沢",
    ticketFare: 4840,
    expressFare: 2640,
    distanceKm: 272,
    source: "mock",
  },
  "鶴橋-芦原温泉": {
    from: "鶴橋",
    to: "芦原温泉",
    ticketFare: 3740,
    expressFare: 2530,
    distanceKm: 205,
    source: "mock",
  },
};

/**
 * 経路検索 — 駅すぱあと WebサービスAPI を想定した fetch 関数。
 *
 * - 環境変数 VITE_EKISPERT_API_KEY が設定されていれば実APIを呼ぶ
 * - 未設定の場合はモックデータを返す
 */
export async function searchRoute(
  from: string,
  to: string,
): Promise<RouteSearchResult> {
  const apiKey = import.meta.env.VITE_EKISPERT_API_KEY as string | undefined;

  if (apiKey) {
    // --- 実 API 呼び出し（駅すぱあと Webサービス想定） ---
    const url = new URL(
      "https://api.ekispert.jp/v1/json/search/course/light",
    );
    url.searchParams.set("key", apiKey);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();

    // レスポンス構造を解析して必要な値を抽出（実APIの仕様に合わせて調整が必要）
    const course = data?.ResultSet?.Course?.[0];
    if (!course) {
      throw new Error("経路が見つかりませんでした");
    }

    const price = course.Price ?? [];
    const ticketFare =
      price.find((p: { kind: string }) => p.kind === "FareSummary")
        ?.Oneway ?? 0;
    const expressFare =
      price.find(
        (p: { kind: string }) => p.kind === "ChargeSummary",
      )?.Oneway ?? 0;
    const distanceKm = Number(course.Distance) || 0;

    return {
      from,
      to,
      ticketFare: Number(ticketFare),
      expressFare: Number(expressFare),
      distanceKm,
      source: "api",
    };
  }

  // --- モックデータ ---
  // 正引き・逆引き両方で検索
  const key = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;
  const found = MOCK_ROUTES[key] ?? MOCK_ROUTES[reverseKey];

  if (found) {
    // 逆引きの場合は from/to を入れ替え
    return { ...found, from, to };
  }

  throw new Error(
    `「${from}→${to}」のモックデータがありません。対応区間: ${Object.keys(MOCK_ROUTES).join(", ")}`,
  );
}

// ---------------------------------------------------------------------------
// Fare Calculation
// ---------------------------------------------------------------------------

function floorTo10(amount: number): number {
  return Math.floor(amount / 10) * 10;
}

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

export function calculateAirFare(input: AirFareInput): AirFareResult {
  const { hasCaregiver, baseFare, airlineDiscountPct, earlyBirdFare } = input;

  const totalPeople = hasCaregiver ? 2 : 1;
  const originalTotal = baseFare * totalPeople;

  const rate = airlineDiscountPct / 100;
  const discountedFare = Math.round(baseFare * (1 - rate));
  const caregiverFare = hasCaregiver ? baseFare : null;

  const totalFare = discountedFare + (caregiverFare ?? 0);
  const savings = originalTotal - totalFare;

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

function RailResultCard({
  result,
  routeLabel,
}: {
  result: RailFareResult;
  routeLabel: string | null;
}) {
  return (
    <div
      className="relative rounded-2xl border-2 border-indigo-300 bg-white shadow-lg p-6 flex flex-col gap-4"
      role="region"
      aria-label="鉄道（JR準拠）の運賃計算結果"
    >
      <SavingsBadge savings={result.savings} />

      <div className="flex items-center gap-3">
        <Train size={30} className="text-indigo-700 shrink-0" aria-hidden />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">鉄道（JR準拠）</h2>
          {routeLabel && (
            <p className="text-sm text-indigo-600 font-semibold">
              {routeLabel}
            </p>
          )}
        </div>
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

      <div className="rounded-xl bg-gray-100 p-4 text-center">
        <p className="text-sm font-semibold text-gray-500 mb-1">通常料金</p>
        <p className="text-2xl font-bold text-gray-800">
          {formatYen(result.originalFare)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
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
          <p className="text-sm font-semibold text-gray-500 mb-1">早期割引</p>
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

function SimulatorPage({ onNavigateOsaka }: { onNavigateOsaka: () => void }) {
  // 共通
  const [disabilityType, setDisabilityType] = useState<DisabilityType>("type1");
  const [hasCaregiver, setHasCaregiver] = useState(false);
  const [distanceKm, setDistanceKm] = useState(150);

  // 駅名検索
  const [fromStation, setFromStation] = useState("東京");
  const [toStation, setToStation] = useState("大阪");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [routeLabel, setRouteLabel] = useState<string | null>(null);

  // 鉄道
  const [ticketFare, setTicketFare] = useState(8910);
  const [expressFare, setExpressFare] = useState(4960);

  // 航空
  const [airBaseFare, setAirBaseFare] = useState(30000);
  const [airlineDiscountPct, setAirlineDiscountPct] = useState(50);
  const [earlyBirdFare, setEarlyBirdFare] = useState(14000);

  const handleSearch = useCallback(async () => {
    if (!fromStation.trim() || !toStation.trim()) {
      setSearchError("出発駅と到着駅を入力してください");
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const result = await searchRoute(fromStation.trim(), toStation.trim());
      setTicketFare(result.ticketFare);
      setExpressFare(result.expressFare);
      setDistanceKm(result.distanceKm);
      setRouteLabel(
        `${result.from} → ${result.to}（${result.distanceKm}km）${result.source === "mock" ? " [デモデータ]" : ""}`,
      );
    } catch (err) {
      setSearchError(
        err instanceof Error ? err.message : "検索中にエラーが発生しました",
      );
    } finally {
      setIsSearching(false);
    }
  }, [fromStation, toStation]);

  const railResult = calculateRailFare({
    disabilityType,
    hasCaregiver,
    distanceKm,
    ticketFare,
    expressFare,
  });

  const airResult = calculateAirFare({
    hasCaregiver,
    baseFare: airBaseFare,
    airlineDiscountPct,
    earlyBirdFare,
  });

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
        {/* ── 共通条件 ── */}
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
        </section>

        {/* ── 駅名検索セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="駅名から運賃を検索"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Search size={24} aria-hidden />
            駅名から運賃を検索
          </h2>
          <p className="text-sm text-gray-500">
            出発駅と到着駅を入力すると、乗車券・特急券・営業キロを自動取得します。
            <span className="text-amber-600 font-semibold">
              （現在はデモデータで動作）
            </span>
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1">
              <label
                htmlFor="fromStation"
                className="block text-lg font-semibold mb-1"
              >
                <MapPin
                  size={18}
                  className="inline-block mr-1 -mt-0.5 text-indigo-600"
                  aria-hidden
                />
                出発駅
              </label>
              <input
                id="fromStation"
                type="text"
                value={fromStation}
                onChange={(e) => setFromStation(e.target.value)}
                placeholder="例: 東京"
                className="w-full text-xl font-bold border-2 border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-400"
              />
            </div>

            <ArrowRight
              size={28}
              className="hidden sm:block text-gray-400 shrink-0 mb-2"
              aria-hidden
            />

            <div className="flex-1">
              <label
                htmlFor="toStation"
                className="block text-lg font-semibold mb-1"
              >
                <MapPin
                  size={18}
                  className="inline-block mr-1 -mt-0.5 text-red-500"
                  aria-hidden
                />
                到着駅
              </label>
              <input
                id="toStation"
                type="text"
                value={toStation}
                onChange={(e) => setToStation(e.target.value)}
                placeholder="例: 大阪"
                className="w-full text-xl font-bold border-2 border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-4 focus:ring-indigo-400"
              />
            </div>

            <button
              type="button"
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 rounded-xl text-lg font-bold bg-indigo-700 text-white border-2 border-indigo-700 hover:bg-indigo-800 transition-colors focus:outline-none focus:ring-4 focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
            >
              {isSearching ? (
                <>
                  <Loader2 size={20} className="animate-spin" aria-hidden />
                  検索中…
                </>
              ) : (
                <>
                  <Search size={20} aria-hidden />
                  検索
                </>
              )}
            </button>
          </div>

          {searchError && (
            <div
              className="rounded-xl bg-red-50 border border-red-300 p-4 text-red-800 flex items-start gap-2"
              role="alert"
            >
              <CircleAlert size={20} className="shrink-0 mt-0.5" aria-hidden />
              <p>{searchError}</p>
            </div>
          )}

          {routeLabel && !searchError && (
            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-4 text-indigo-800 text-base font-semibold flex items-center gap-2">
              <Train size={20} aria-hidden />
              {routeLabel} — 乗車券 {formatYen(ticketFare)} / 特急券{" "}
              {formatYen(expressFare)}
            </div>
          )}

          <details className="text-xs text-gray-400">
            <summary className="cursor-pointer hover:text-gray-600">
              対応区間一覧（デモ: {Object.keys(MOCK_ROUTES).length}区間）※逆方向も可
            </summary>
            <p className="mt-1 leading-relaxed">
              {Object.keys(MOCK_ROUTES).join(", ")}
            </p>
          </details>
        </section>

        {/* ── 鉄道入力セクション ── */}
        <section
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
          aria-label="鉄道運賃の入力フォーム"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Train size={24} className="text-indigo-700" aria-hidden />
            鉄道運賃（手動入力 / 検索結果を編集）
          </h2>
          <p className="text-sm text-gray-500">
            駅名検索で取得した値がセットされます。手動で変更することもできます。
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
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
                  className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
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
                  className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">割引対象外</p>
            </div>

            <div>
              <label
                htmlFor="distance"
                className="block text-lg font-semibold mb-1"
              >
                営業キロ（km）
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="distance"
                  type="number"
                  min={1}
                  value={distanceKm}
                  onChange={(e) =>
                    setDistanceKm(Math.max(1, Number(e.target.value)))
                  }
                  className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-indigo-400"
                />
                <span className="text-lg font-semibold">km</span>
              </div>
              {distanceKm <= 100 && (
                <p
                  className="mt-1 text-xs text-amber-700 flex items-center gap-1"
                  role="alert"
                >
                  <CircleAlert size={14} aria-hidden />
                  100km以下: 一部割引なし
                </p>
              )}
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
            <RailResultCard result={railResult} routeLabel={routeLabel} />
            <AirResultCard result={airResult} />
          </div>
        </section>

        {/* ── 大阪ガイドへのナビゲーション ── */}
        <section
          className="bg-indigo-50 border-2 border-indigo-300 rounded-2xl p-6"
          aria-label="大阪の障害者割引・優待ガイドへ"
        >
          <button
            type="button"
            onClick={onNavigateOsaka}
            className="w-full flex items-center justify-between gap-4 text-left focus:outline-none focus:ring-4 focus:ring-indigo-400 rounded-xl p-3 hover:bg-indigo-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Building2
                size={32}
                className="text-indigo-600 shrink-0"
                aria-hidden
              />
              <div>
                <p className="text-lg font-bold text-indigo-800">
                  大阪 障害者割引・優待ガイド
                </p>
                <p className="text-sm text-indigo-600">
                  交通・施設・医療・税金・住宅・携帯など大阪で使える制度を網羅
                </p>
              </div>
            </div>
            <ArrowRight
              size={24}
              className="text-indigo-500 shrink-0"
              aria-hidden
            />
          </button>
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
              駅名検索は現在デモデータで動作しています。将来的に駅すぱあとWebサービスAPI等と連携予定です。
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

      <footer className="bg-gray-800 text-gray-400 text-center py-4 text-sm">
        <p>障害者割引運賃シミュレーター &copy; 2025</p>
      </footer>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<"simulator" | "osaka">("simulator");

  if (page === "osaka") {
    return <OsakaBenefits onBack={() => setPage("simulator")} />;
  }

  return <SimulatorPage onNavigateOsaka={() => setPage("osaka")} />;
}
