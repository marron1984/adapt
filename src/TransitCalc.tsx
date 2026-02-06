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
} from "lucide-react";
import type {
  DisabilityType,
  RailFareResult,
  AirFareResult,
} from "./data";
import {
  DISABILITY_OPTIONS,
  MOCK_ROUTES,
  calculateRailFare,
  calculateAirFare,
  formatYen,
  searchRoute,
} from "./data";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SavingsBadge({ savings }: { savings: number }) {
  if (savings <= 0) return null;
  return (
    <span className="absolute -top-3 right-4 inline-flex items-center gap-1 rounded-full bg-brand-800 px-3 py-1 text-sm font-bold text-white shadow">
      <TrendingDown size={14} aria-hidden />
      {formatYen(savings)} おトク
    </span>
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
      className="card-soft relative p-6 flex flex-col gap-4 border-2 border-brand-200"
      role="region"
      aria-label="鉄道（JR準拠）の運賃計算結果"
    >
      <SavingsBadge savings={result.savings} />

      <div className="flex items-center gap-3">
        <Train size={30} className="text-brand-700 shrink-0" aria-hidden />
        <div>
          <h2 className="text-2xl font-bold text-slate-900">鉄道（JR準拠）</h2>
          {routeLabel && (
            <p className="text-sm text-brand-700 font-semibold">
              {routeLabel}
            </p>
          )}
        </div>
      </div>

      <p className="text-base text-slate-700 leading-relaxed">
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

      <div className="text-base text-slate-700 space-y-1 border-t border-gray-200 pt-3">
        <p className="font-semibold text-slate-900 mb-1">内訳（本人）</p>
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
            <p className="font-semibold text-slate-900 mt-2 mb-1">
              内訳（介護者）
            </p>
            <p>
              乗車券: {formatYen(result.caregiverTicket ?? 0)}
              {result.discountApplied &&
                result.caregiverTicket !== null &&
                result.caregiverTicket < result.discountedTicket * 2 && (
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
      className="card-soft relative p-6 flex flex-col gap-4 border-2 border-sky-200"
      role="region"
      aria-label="飛行機の運賃計算結果"
    >
      <SavingsBadge savings={bestSavings} />

      <div className="flex items-center gap-3">
        <Plane size={30} className="text-sky-600" aria-hidden />
        <h2 className="text-2xl font-bold text-slate-900">飛行機</h2>
      </div>

      <p className="text-base text-slate-700 leading-relaxed">
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
// TransitCalc — main component
// ---------------------------------------------------------------------------

function TransitCalc() {
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
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* ── タイトル ── */}
      <div className="flex items-center gap-3">
        <Calculator size={32} className="text-brand-700" aria-hidden />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            障害者割引運賃シミュレーター
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            鉄道・飛行機の割引運賃をかんたん比較
          </p>
        </div>
      </div>

      {/* ── 共通条件 ── */}
      <section
        className="card-soft p-6 space-y-6"
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
                className={`px-6 py-3 rounded-xl text-lg font-bold border-2 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-300 ${
                  disabilityType === opt.value
                    ? "bg-brand-800 text-white border-brand-800"
                    : "bg-white text-gray-800 border-gray-300 hover:border-brand-600"
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
            className={`relative inline-flex h-10 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-4 focus:ring-brand-300 ${
              hasCaregiver ? "bg-brand-800" : "bg-gray-300"
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
        className="card-soft p-6 space-y-6"
        aria-label="駅名から運賃を検索"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Search size={24} aria-hidden />
          駅名から運賃を検索
        </h2>
        <p className="text-sm text-slate-500">
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
                className="inline-block mr-1 -mt-0.5 text-brand-700"
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
              className="w-full text-xl font-bold border-2 border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
              className="w-full text-xl font-bold border-2 border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:ring-4 focus:ring-brand-300"
            />
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 rounded-xl text-lg font-bold bg-brand-800 text-white border-2 border-brand-800 hover:bg-brand-900 transition-colors focus:outline-none focus:ring-4 focus:ring-brand-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
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
          <div className="rounded-xl bg-brand-50 border border-brand-200 p-4 text-brand-800 text-base font-semibold flex items-center gap-2">
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
        className="card-soft p-6 space-y-6"
        aria-label="鉄道運賃の入力フォーム"
      >
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Train size={24} className="text-brand-700" aria-hidden />
          鉄道運賃（手動入力 / 検索結果を編集）
        </h2>
        <p className="text-sm text-slate-500">
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
                className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
                className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
                className="w-full text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
        className="card-soft p-6 space-y-6"
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
              className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
          <p className="text-sm text-slate-500 mb-2">
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
          <p className="text-sm text-slate-500 mb-2">
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
              className="w-40 text-center text-xl font-bold border-2 border-gray-300 rounded-xl py-2 focus:outline-none focus:ring-4 focus:ring-brand-300"
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
  );
}

export default TransitCalc;
