// ===========================================================================
// data.ts — Central data layer
//   Types, mock data, fare calculations, facility database
// ===========================================================================

// ---------------------------------------------------------------------------
// User Preferences
// ---------------------------------------------------------------------------

export type HandbookType = "physical" | "intellectual" | "mental";

export type HandbookGrade = 1 | 2 | 3;

export interface UserPreferences {
  handbookType: HandbookType | null;
  grade: HandbookGrade | null;
}

// ---------------------------------------------------------------------------
// Facility / Discount types
// ---------------------------------------------------------------------------

export interface DiscountByGrade {
  g1: string;
  g2: string;
  g3: string;
}

export interface AccessibilityInfo {
  wheelchairParking?: boolean;
  multiPurposeToilet?: boolean;
  ostomateToilet?: boolean;
  sensoryRoom?: boolean;
  signLanguage?: boolean;
  elevator?: boolean;
  braille?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  category: "entertainment" | "telecom" | "mobility" | "support";
  subcategory: string;
  discount: {
    physical?: DiscountByGrade;
    intellectual?: DiscountByGrade;
    mental?: DiscountByGrade;
  };
  caregiver?: string;
  accessibility: AccessibilityInfo;
  location?: string;
  notes?: string;
}

export interface FeaturedSituation {
  id: string;
  title: string;
  description: string;
  facilityIds: string[];
}

// ---------------------------------------------------------------------------
// Category metadata
// ---------------------------------------------------------------------------

export interface LifeCategory {
  id: Facility["category"];
  title: string;
  iconName: string;
  colorBadge: string;
  colorIconBg: string;
  colorIconFg: string;
}

export const LIFE_CATEGORIES: LifeCategory[] = [
  {
    id: "entertainment",
    title: "エンタメ・レジャー",
    iconName: "Ticket",
    colorBadge: "bg-rose-100 text-rose-700",
    colorIconBg: "bg-rose-100",
    colorIconFg: "text-rose-600",
  },
  {
    id: "telecom",
    title: "通信・固定費",
    iconName: "Smartphone",
    colorBadge: "bg-violet-100 text-violet-700",
    colorIconBg: "bg-violet-100",
    colorIconFg: "text-violet-700",
  },
  {
    id: "mobility",
    title: "移動・交通",
    iconName: "Train",
    colorBadge: "bg-brand-100 text-brand-800",
    colorIconBg: "bg-brand-100",
    colorIconFg: "text-brand-700",
  },
  {
    id: "support",
    title: "生活支援",
    iconName: "Heart",
    colorBadge: "bg-accent-100 text-accent-600",
    colorIconBg: "bg-accent-100",
    colorIconFg: "text-accent-600",
  },
];

// ---------------------------------------------------------------------------
// Featured situations
// ---------------------------------------------------------------------------

export const FEATURED_SITUATIONS: FeaturedSituation[] = [
  {
    id: "new-handbook",
    title: "手帳を取得したばかりの方へ",
    description: "まず登録・申請すべき制度をチェック",
    facilityIds: [
      "osaka-metro-pass",
      "docomo-hearty",
      "medical-support",
      "tax-deduction",
    ],
  },
  {
    id: "rainy-day",
    title: "雨の日でも安心なスポット",
    description: "屋内で楽しめる割引施設",
    facilityIds: ["kaiyukan", "science-museum", "cinema", "karaoke-jankara"],
  },
  {
    id: "companion-free",
    title: "同伴者も割引になる施設",
    description: "友人・家族と一緒におトクに",
    facilityIds: ["usj", "kaiyukan", "cinema", "tennoji-zoo"],
  },
  {
    id: "save-monthly",
    title: "毎月の固定費を減らしたい",
    description: "通信・税金・公共料金の割引",
    facilityIds: ["docomo-hearty", "au-smile", "nhk-exempt", "tax-deduction"],
  },
];

// ---------------------------------------------------------------------------
// Mock Facilities (large dataset)
// ---------------------------------------------------------------------------

export const MOCK_FACILITIES: Facility[] = [
  // ── エンタメ・レジャー ──
  {
    id: "usj",
    name: "ユニバーサル・スタジオ・ジャパン",
    category: "entertainment",
    subcategory: "テーマパーク",
    discount: {
      physical: { g1: "大人4,700円", g2: "大人4,700円", g3: "大人4,700円" },
      intellectual: { g1: "大人4,700円", g2: "大人4,700円", g3: "大人4,700円" },
      mental: { g1: "大人4,700円", g2: "大人4,700円", g3: "大人4,700円" },
    },
    caregiver: "同伴者1名も同額で購入可",
    accessibility: {
      wheelchairParking: true,
      sensoryRoom: true,
      multiPurposeToilet: true,
      elevator: true,
    },
    location: "大阪市此花区",
    notes:
      "ゲストサポートパス発行可。日付指定1日券のみ。ミライロID対応。",
  },
  {
    id: "kaiyukan",
    name: "海遊館",
    category: "entertainment",
    subcategory: "水族館",
    discount: {
      physical: { g1: "半額", g2: "半額", g3: "半額" },
      intellectual: { g1: "半額", g2: "半額", g3: "半額" },
      mental: { g1: "半額", g2: "半額", g3: "半額" },
    },
    caregiver: "介護者1名も半額",
    accessibility: {
      wheelchairParking: true,
      multiPurposeToilet: true,
      elevator: true,
    },
    location: "大阪市港区",
    notes: "窓口購入のみ（Web不可）。ミライロID対応。",
  },
  {
    id: "tempozan-wheel",
    name: "天保山大観覧車",
    category: "entertainment",
    subcategory: "アトラクション",
    discount: {
      physical: { g1: "半額", g2: "半額", g3: "半額" },
      intellectual: { g1: "半額", g2: "半額", g3: "半額" },
      mental: { g1: "半額", g2: "半額", g3: "半額" },
    },
    accessibility: { wheelchairParking: true },
    location: "大阪市港区",
  },
  {
    id: "cinema",
    name: "映画館（TOHOシネマズ / イオンシネマ等）",
    category: "entertainment",
    subcategory: "映画",
    discount: {
      physical: { g1: "1,000円", g2: "1,000円", g3: "1,000円" },
      intellectual: { g1: "1,000円", g2: "1,000円", g3: "1,000円" },
      mental: { g1: "1,000円", g2: "1,000円", g3: "1,000円" },
    },
    caregiver: "同伴者1名も1,000円（イオンシネマは2名まで）",
    accessibility: {
      wheelchairParking: true,
      multiPurposeToilet: true,
    },
    notes:
      "3D・IMAX等は対象外の場合あり。同伴者は家族でなくてもOK。ミライロID対応増加中。",
  },
  {
    id: "karaoke-jankara",
    name: "ジャンボカラオケ広場（ジャンカラ）",
    category: "entertainment",
    subcategory: "カラオケ",
    discount: {
      physical: { g1: "シニア会員料金", g2: "シニア会員料金", g3: "シニア会員料金" },
      intellectual: { g1: "シニア会員料金", g2: "シニア会員料金", g3: "シニア会員料金" },
      mental: { g1: "シニア会員料金", g2: "シニア会員料金", g3: "シニア会員料金" },
    },
    caregiver: "付添2名まで同料金",
    accessibility: { elevator: true },
    notes: "手帳提示で本人+付添2名までシニア会員料金。",
  },
  {
    id: "karaoke-bigecho",
    name: "ビッグエコー",
    category: "entertainment",
    subcategory: "カラオケ",
    discount: {
      physical: { g1: "室料50%OFF", g2: "室料50%OFF", g3: "室料50%OFF" },
      intellectual: { g1: "室料50%OFF", g2: "室料50%OFF", g3: "室料50%OFF" },
      mental: { g1: "室料50%OFF", g2: "室料50%OFF", g3: "室料50%OFF" },
    },
    caregiver: "グループ全員に適用",
    accessibility: {},
  },
  {
    id: "tennoji-zoo",
    name: "天王寺動物園",
    category: "entertainment",
    subcategory: "動物園",
    discount: {
      physical: { g1: "無料", g2: "無料", g3: "無料" },
      intellectual: { g1: "無料", g2: "無料", g3: "無料" },
      mental: { g1: "無料", g2: "無料", g3: "無料" },
    },
    caregiver: "介護者1名無料",
    accessibility: {
      wheelchairParking: true,
      multiPurposeToilet: true,
    },
    location: "大阪市天王寺区",
  },
  {
    id: "osaka-castle",
    name: "大阪城天守閣",
    category: "entertainment",
    subcategory: "歴史・観光",
    discount: {
      physical: { g1: "無料", g2: "無料", g3: "無料" },
      intellectual: { g1: "無料", g2: "無料", g3: "無料" },
      mental: { g1: "無料", g2: "無料", g3: "無料" },
    },
    caregiver: "介護者1名無料",
    accessibility: {
      wheelchairParking: true,
      elevator: true,
      multiPurposeToilet: true,
    },
    location: "大阪市中央区",
    notes: "通常大人1,200円。ミライロID対応。",
  },
  {
    id: "science-museum",
    name: "大阪市立科学館",
    category: "entertainment",
    subcategory: "博物館・科学館",
    discount: {
      physical: { g1: "無料", g2: "無料", g3: "無料" },
      intellectual: { g1: "無料", g2: "無料", g3: "無料" },
      mental: { g1: "無料", g2: "無料", g3: "無料" },
    },
    caregiver: "介護者1名無料",
    accessibility: {
      wheelchairParking: true,
      elevator: true,
      multiPurposeToilet: true,
      braille: true,
    },
    location: "大阪市北区",
    notes: "プラネタリウムは1人1日1回まで。",
  },
  {
    id: "nakanoshima-art",
    name: "大阪中之島美術館",
    category: "entertainment",
    subcategory: "美術館",
    discount: {
      physical: { g1: "無料", g2: "無料", g3: "無料" },
      intellectual: { g1: "無料", g2: "無料", g3: "無料" },
      mental: { g1: "無料", g2: "無料", g3: "無料" },
    },
    caregiver: "介護者1名無料",
    accessibility: {
      wheelchairParking: true,
      elevator: true,
      multiPurposeToilet: true,
      sensoryRoom: true,
    },
    location: "大阪市北区",
  },

  // ── 通信・固定費 ──
  {
    id: "docomo-hearty",
    name: "NTTドコモ「ハーティ割引」",
    category: "telecom",
    subcategory: "携帯電話",
    discount: {
      physical: { g1: "手数料無料+通話割引", g2: "手数料無料+通話割引", g3: "手数料無料+通話割引" },
      intellectual: { g1: "手数料無料+通話割引", g2: "手数料無料+通話割引", g3: "手数料無料+通話割引" },
      mental: { g1: "手数料無料+通話割引", g2: "手数料無料+通話割引", g3: "手数料無料+通話割引" },
    },
    accessibility: {},
    notes:
      "5分かけ放題無料。かけ放題1,870円→1,100円。1名義1回線。dカードお支払割との併用不可。",
  },
  {
    id: "au-smile",
    name: "au「スマイルハート割引」",
    category: "telecom",
    subcategory: "携帯電話",
    discount: {
      physical: { g1: "基本料+通話料割引", g2: "基本料+通話料割引", g3: "基本料+通話料割引" },
      intellectual: { g1: "基本料+通話料割引", g2: "基本料+通話料割引", g3: "基本料+通話料割引" },
      mental: { g1: "基本料+通話料割引", g2: "基本料+通話料割引", g3: "基本料+通話料割引" },
    },
    accessibility: {},
    notes: "家族割との併用可。契約名義人本人のみ。",
  },
  {
    id: "softbank-heart",
    name: "ソフトバンク「ハートフレンド割引」",
    category: "telecom",
    subcategory: "携帯電話",
    discount: {
      physical: { g1: "基本料割引+手数料割引", g2: "基本料割引+手数料割引", g3: "基本料割引+手数料割引" },
      intellectual: { g1: "基本料割引+手数料割引", g2: "基本料割引+手数料割引", g3: "基本料割引+手数料割引" },
      mental: { g1: "基本料割引+手数料割引", g2: "基本料割引+手数料割引", g3: "基本料割引+手数料割引" },
    },
    accessibility: {},
    notes: "ミライロIDでの申込み対応（店舗のみ）。",
  },
  {
    id: "nhk-exempt",
    name: "NHK受信料の免除",
    category: "telecom",
    subcategory: "公共料金",
    discount: {
      physical: { g1: "半額免除", g2: "全額免除(非課税世帯)", g3: "全額免除(非課税世帯)" },
      intellectual: { g1: "全額免除(非課税世帯)", g2: "全額免除(非課税世帯)", g3: "全額免除(非課税世帯)" },
      mental: { g1: "半額免除", g2: "全額免除(非課税世帯)", g3: "全額免除(非課税世帯)" },
    },
    accessibility: {},
    notes:
      "全額免除は世帯全員が住民税非課税の場合のみ。半額免除は1級が世帯主かつ契約者の場合。",
  },
  {
    id: "tax-deduction",
    name: "所得税・住民税の障害者控除",
    category: "telecom",
    subcategory: "税金",
    discount: {
      physical: { g1: "特別障害者控除40万円", g2: "障害者控除27万円", g3: "障害者控除27万円" },
      intellectual: { g1: "特別障害者控除40万円", g2: "障害者控除27万円", g3: "障害者控除27万円" },
      mental: { g1: "特別障害者控除40万円", g2: "障害者控除27万円", g3: "障害者控除27万円" },
    },
    accessibility: {},
    notes: "住民税：1級=30万円、2・3級=26万円。同居特別障害者加算あり。",
  },

  // ── 移動・交通 ──
  {
    id: "osaka-metro-pass",
    name: "Osaka Metro・大阪シティバス",
    category: "mobility",
    subcategory: "公共交通",
    discount: {
      physical: { g1: "無料(市民)+介護者", g2: "無料(市民)", g3: "5割引(市民)" },
      intellectual: { g1: "無料(市民)+介護者", g2: "無料(市民)", g3: "5割引(市民)" },
      mental: { g1: "無料(市民)+介護者", g2: "無料(市民)", g3: "5割引(市民)" },
    },
    caregiver: "1級は介護者1名も無料",
    accessibility: {
      wheelchairParking: true,
      elevator: true,
      multiPurposeToilet: true,
      braille: true,
    },
    notes:
      "大阪市民限定の福祉措置。無料乗車証とタクシー給付券の併給不可。2027年3月末までの暫定措置。",
  },
  {
    id: "jr-west",
    name: "JR西日本（JRグループ全社共通）",
    category: "mobility",
    subcategory: "鉄道",
    discount: {
      physical: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
      intellectual: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
      mental: { g1: "5割引(介護者同乗)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
    },
    caregiver: "第1種+介護者同乗で本人・介護者ともに5割引",
    accessibility: { wheelchairParking: true, elevator: true, multiPurposeToilet: true },
    notes:
      "精神手帳は2025年4月〜。窓口・券売機のみ（ICOCA非対応）。特急料金は割引対象外。",
  },
  {
    id: "kintetsu",
    name: "近鉄（近畿日本鉄道）",
    category: "mobility",
    subcategory: "鉄道",
    discount: {
      physical: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
      intellectual: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
      mental: { g1: "5割引(介護者同乗)", g2: "5割引(101km超)", g3: "5割引(101km超)" },
    },
    accessibility: { elevator: true },
    notes: "2023年4月〜精神手帳対応。",
  },
  {
    id: "hankyu-hanshin",
    name: "阪急電鉄・阪神電気鉄道",
    category: "mobility",
    subcategory: "鉄道",
    discount: {
      physical: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "対象外" },
      intellectual: { g1: "5割引(介護者同乗/101km超)", g2: "5割引(101km超)", g3: "対象外" },
      mental: { g1: "5割引(介護者同乗)", g2: "対象外", g3: "対象外" },
    },
    accessibility: { elevator: true },
    notes:
      "2025年1月末〜精神手帳対応。路線距離が短いため実質1級の介護者同乗時のみ。",
  },
  {
    id: "taxi-osaka",
    name: "重度障がい者等タクシー料金給付",
    category: "mobility",
    subcategory: "タクシー",
    discount: {
      physical: { g1: "上限500円/回", g2: "対象外", g3: "対象外" },
      intellectual: { g1: "上限500円/回", g2: "対象外", g3: "対象外" },
      mental: { g1: "上限500円/回", g2: "対象外", g3: "対象外" },
    },
    accessibility: {},
    notes: "大阪市民限定。無料乗車証との併給不可。リフト付きタクシーは上限2,000円。",
  },

  // ── 生活支援 ──
  {
    id: "medical-support",
    name: "重度障がい者医療費助成制度",
    category: "support",
    subcategory: "医療",
    discount: {
      physical: { g1: "1日最大500円負担のみ", g2: "1日最大500円負担のみ", g3: "対象外" },
      intellectual: { g1: "1日最大500円負担のみ", g2: "対象外", g3: "対象外" },
      mental: { g1: "1日最大500円負担のみ", g2: "対象外", g3: "対象外" },
    },
    accessibility: {},
    notes:
      "月3,000円超過分は払い戻し。精神手帳は1級のみ。所得制限あり。",
  },
  {
    id: "jiritsu-shien",
    name: "自立支援医療（精神通院医療）",
    category: "support",
    subcategory: "医療",
    discount: {
      physical: { g1: "対象外", g2: "対象外", g3: "対象外" },
      intellectual: { g1: "対象外", g2: "対象外", g3: "対象外" },
      mental: { g1: "自己負担1割", g2: "自己負担1割", g3: "自己負担1割" },
    },
    accessibility: {},
    notes: "精神疾患で通院中の方（手帳不問）。所得に応じた月額上限あり。",
  },
  {
    id: "special-allowance",
    name: "特別障がい者手当",
    category: "support",
    subcategory: "手当",
    discount: {
      physical: { g1: "月額29,590円", g2: "対象外", g3: "対象外" },
      intellectual: { g1: "月額29,590円", g2: "対象外", g3: "対象外" },
      mental: { g1: "要件次第", g2: "対象外", g3: "対象外" },
    },
    accessibility: {},
    notes:
      "在宅20歳以上・常時特別介護が必要な方。施設入所者・3ヶ月以上入院者は対象外。",
  },
  {
    id: "public-housing",
    name: "大阪市営住宅の優先入居",
    category: "support",
    subcategory: "住宅",
    discount: {
      physical: { g1: "優先枠あり", g2: "優先枠あり", g3: "優先枠あり" },
      intellectual: { g1: "優先枠あり", g2: "優先枠あり", g3: "優先枠あり" },
      mental: { g1: "優先枠あり", g2: "優先枠あり", g3: "対象外が多い" },
    },
    accessibility: {},
    notes:
      "単身入居可。収入基準緩和。精神手帳3級は対象外の場合が多い。募集は年1〜2回。",
  },
  {
    id: "ur-housing",
    name: "UR賃貸住宅の家賃減額",
    category: "support",
    subcategory: "住宅",
    discount: {
      physical: { g1: "家賃減額+抽選優遇", g2: "家賃減額+抽選優遇", g3: "家賃減額+抽選優遇" },
      intellectual: { g1: "家賃減額+抽選優遇", g2: "対象外", g3: "対象外" },
      mental: { g1: "家賃減額+抽選優遇", g2: "家賃減額+抽選優遇", g3: "対象外" },
    },
    accessibility: {},
    notes: "抽選最大20倍優遇。精神手帳3級は対象外。",
  },
  {
    id: "car-tax",
    name: "自動車税・軽自動車税の減免",
    category: "support",
    subcategory: "税金",
    discount: {
      physical: { g1: "全額免除", g2: "等級・部位による", g3: "対象外" },
      intellectual: { g1: "全額免除", g2: "対象外", g3: "対象外" },
      mental: { g1: "全額免除(+自立支援医療)", g2: "対象外", g3: "対象外" },
    },
    accessibility: {},
    notes: "排気量2L以下の自家用車。精神手帳は1級+自立支援医療の両方が必要。1人1台限り。",
  },
  {
    id: "maru-yu",
    name: "少額貯蓄非課税制度（マル優）",
    category: "support",
    subcategory: "税金",
    discount: {
      physical: { g1: "350万円まで非課税", g2: "350万円まで非課税", g3: "350万円まで非課税" },
      intellectual: { g1: "350万円まで非課税", g2: "350万円まで非課税", g3: "350万円まで非課税" },
      mental: { g1: "350万円まで非課税", g2: "350万円まで非課税", g3: "350万円まで非課税" },
    },
    accessibility: {},
    notes: "預貯金等の元本350万円までの利子が非課税。",
  },
];

// ---------------------------------------------------------------------------
// Utility: filter facilities by user preferences
// ---------------------------------------------------------------------------

export function getDiscountForUser(
  facility: Facility,
  prefs: UserPreferences,
): string | null {
  if (!prefs.handbookType || !prefs.grade) return null;
  const disc = facility.discount[prefs.handbookType];
  if (!disc) return null;
  const val = disc[`g${prefs.grade}` as "g1" | "g2" | "g3"];
  if (!val || val === "対象外") return null;
  return val;
}

export function isFacilityEligible(
  facility: Facility,
  prefs: UserPreferences,
): boolean {
  if (!prefs.handbookType || !prefs.grade) return true; // show all if no prefs
  return getDiscountForUser(facility, prefs) !== null;
}

// ---------------------------------------------------------------------------
// Transit Calculator types & logic (extracted from App.tsx)
// ---------------------------------------------------------------------------

export type DisabilityType = "type1" | "type2" | "mental";

export interface RailFareInput {
  disabilityType: DisabilityType;
  hasCaregiver: boolean;
  distanceKm: number;
  ticketFare: number;
  expressFare: number;
}

export interface AirFareInput {
  hasCaregiver: boolean;
  baseFare: number;
  airlineDiscountPct: number;
  earlyBirdFare: number;
}

export interface RailFareResult {
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

export interface AirFareResult {
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

interface RouteSearchResult {
  from: string;
  to: string;
  ticketFare: number;
  expressFare: number;
  distanceKm: number;
  source: "api" | "mock";
}

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

export const DISABILITY_OPTIONS: { value: DisabilityType; label: string }[] = [
  { value: "type1", label: "第1種" },
  { value: "type2", label: "第2種" },
  { value: "mental", label: "精神" },
];

export function formatYen(n: number): string {
  return `¥${n.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Mock Route Data
// ---------------------------------------------------------------------------

export const MOCK_ROUTES: Record<string, RouteSearchResult> = {
  "東京-大阪": { from: "東京", to: "大阪", ticketFare: 8910, expressFare: 4960, distanceKm: 556, source: "mock" },
  "東京-名古屋": { from: "東京", to: "名古屋", ticketFare: 6380, expressFare: 4180, distanceKm: 366, source: "mock" },
  "東京-仙台": { from: "東京", to: "仙台", ticketFare: 6050, expressFare: 4430, distanceKm: 352, source: "mock" },
  "東京-新潟": { from: "東京", to: "新潟", ticketFare: 5720, expressFare: 4510, distanceKm: 334, source: "mock" },
  "東京-広島": { from: "東京", to: "広島", ticketFare: 12100, expressFare: 5490, distanceKm: 894, source: "mock" },
  "東京-博多": { from: "東京", to: "博多", ticketFare: 13870, expressFare: 6250, distanceKm: 1175, source: "mock" },
  "東京-金沢": { from: "東京", to: "金沢", ticketFare: 7480, expressFare: 6930, distanceKm: 450, source: "mock" },
  "大阪-博多": { from: "大阪", to: "博多", ticketFare: 9790, expressFare: 5490, distanceKm: 622, source: "mock" },
  "名古屋-大阪": { from: "名古屋", to: "大阪", ticketFare: 3410, expressFare: 3070, distanceKm: 190, source: "mock" },
  "東京-京都": { from: "東京", to: "京都", ticketFare: 8360, expressFare: 4960, distanceKm: 476, source: "mock" },
  "大阪-新潟": { from: "大阪", to: "新潟", ticketFare: 8910, expressFare: 5810, distanceKm: 638, source: "mock" },
  "東京-盛岡": { from: "東京", to: "盛岡", ticketFare: 8580, expressFare: 5040, distanceKm: 535, source: "mock" },
  "東京-秋田": { from: "東京", to: "秋田", ticketFare: 9610, expressFare: 6050, distanceKm: 663, source: "mock" },
  "東京-山形": { from: "東京", to: "山形", ticketFare: 5940, expressFare: 4430, distanceKm: 360, source: "mock" },
  "東京-新青森": { from: "東京", to: "新青森", ticketFare: 10340, expressFare: 6350, distanceKm: 714, source: "mock" },
  "東京-新函館北斗": { from: "東京", to: "新函館北斗", ticketFare: 11330, expressFare: 6530, distanceKm: 863, source: "mock" },
  "仙台-盛岡": { from: "仙台", to: "盛岡", ticketFare: 3410, expressFare: 3520, distanceKm: 183, source: "mock" },
  "東京-静岡": { from: "東京", to: "静岡", ticketFare: 3410, expressFare: 3520, distanceKm: 180, source: "mock" },
  "東京-浜松": { from: "東京", to: "浜松", ticketFare: 4510, expressFare: 4180, distanceKm: 257, source: "mock" },
  "東京-長野": { from: "東京", to: "長野", ticketFare: 4070, expressFare: 4200, distanceKm: 222, source: "mock" },
  "名古屋-金沢": { from: "名古屋", to: "金沢", ticketFare: 4510, expressFare: 2640, distanceKm: 256, source: "mock" },
  "名古屋-仙台": { from: "名古屋", to: "仙台", ticketFare: 10560, expressFare: 5280, distanceKm: 732, source: "mock" },
  "名古屋-博多": { from: "名古屋", to: "博多", ticketFare: 11000, expressFare: 5280, distanceKm: 811, source: "mock" },
  "大阪-広島": { from: "大阪", to: "広島", ticketFare: 5720, expressFare: 4180, distanceKm: 342, source: "mock" },
  "大阪-金沢": { from: "大阪", to: "金沢", ticketFare: 4840, expressFare: 2640, distanceKm: 268, source: "mock" },
  "大阪-仙台": { from: "大阪", to: "仙台", ticketFare: 11000, expressFare: 5490, distanceKm: 853, source: "mock" },
  "京都-博多": { from: "京都", to: "博多", ticketFare: 9610, expressFare: 5280, distanceKm: 612, source: "mock" },
  "京都-広島": { from: "京都", to: "広島", ticketFare: 5500, expressFare: 4180, distanceKm: 332, source: "mock" },
  "東京-熊本": { from: "東京", to: "熊本", ticketFare: 14080, expressFare: 6800, distanceKm: 1118, source: "mock" },
  "東京-鹿児島中央": { from: "東京", to: "鹿児島中央", ticketFare: 15950, expressFare: 7250, distanceKm: 1325, source: "mock" },
  "大阪-鹿児島中央": { from: "大阪", to: "鹿児島中央", ticketFare: 11000, expressFare: 5810, distanceKm: 912, source: "mock" },
  "大阪-熊本": { from: "大阪", to: "熊本", ticketFare: 10010, expressFare: 5590, distanceKm: 756, source: "mock" },
  "博多-熊本": { from: "博多", to: "熊本", ticketFare: 2170, expressFare: 2200, distanceKm: 118, source: "mock" },
  "博多-鹿児島中央": { from: "博多", to: "鹿児島中央", ticketFare: 4510, expressFare: 3740, distanceKm: 289, source: "mock" },
  "広島-博多": { from: "広島", to: "博多", ticketFare: 5720, expressFare: 3740, distanceKm: 281, source: "mock" },
  "東京-小田原": { from: "東京", to: "小田原", ticketFare: 1520, expressFare: 1760, distanceKm: 84, source: "mock" },
  "大阪-京都": { from: "大阪", to: "京都", ticketFare: 580, expressFare: 0, distanceKm: 43, source: "mock" },
  "名古屋-京都": { from: "名古屋", to: "京都", ticketFare: 2640, expressFare: 2530, distanceKm: 146, source: "mock" },
  "博多-小倉": { from: "博多", to: "小倉", ticketFare: 1310, expressFare: 1730, distanceKm: 67, source: "mock" },
  "鶴橋-新金岡": { from: "鶴橋", to: "新金岡", ticketFare: 460, expressFare: 0, distanceKm: 15, source: "mock" },
  "鶴橋-新潟": { from: "鶴橋", to: "新潟", ticketFare: 9130, expressFare: 5810, distanceKm: 641, source: "mock" },
  "鶴橋-富山": { from: "鶴橋", to: "富山", ticketFare: 5280, expressFare: 4180, distanceKm: 330, source: "mock" },
  "鶴橋-東京": { from: "鶴橋", to: "東京", ticketFare: 8910, expressFare: 4960, distanceKm: 560, source: "mock" },
  "鶴橋-名古屋": { from: "鶴橋", to: "名古屋", ticketFare: 3630, expressFare: 3070, distanceKm: 193, source: "mock" },
  "鶴橋-仙台": { from: "鶴橋", to: "仙台", ticketFare: 11220, expressFare: 5490, distanceKm: 857, source: "mock" },
  "鶴橋-広島": { from: "鶴橋", to: "広島", ticketFare: 5940, expressFare: 4180, distanceKm: 345, source: "mock" },
  "鶴橋-熊本": { from: "鶴橋", to: "熊本", ticketFare: 10230, expressFare: 5590, distanceKm: 760, source: "mock" },
  "鶴橋-新高岡": { from: "鶴橋", to: "新高岡", ticketFare: 5080, expressFare: 4180, distanceKm: 315, source: "mock" },
  "鶴橋-金沢": { from: "鶴橋", to: "金沢", ticketFare: 4840, expressFare: 2640, distanceKm: 272, source: "mock" },
  "鶴橋-芦原温泉": { from: "鶴橋", to: "芦原温泉", ticketFare: 3740, expressFare: 2530, distanceKm: 205, source: "mock" },
};

export async function searchRoute(
  from: string,
  to: string,
): Promise<RouteSearchResult> {
  const apiKey = import.meta.env.VITE_EKISPERT_API_KEY as string | undefined;

  if (apiKey) {
    const url = new URL("https://api.ekispert.jp/v1/json/search/course/light");
    url.searchParams.set("key", apiKey);
    url.searchParams.set("from", from);
    url.searchParams.set("to", to);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
    const data = await res.json();
    const course = data?.ResultSet?.Course?.[0];
    if (!course) throw new Error("経路が見つかりませんでした");
    const price = course.Price ?? [];
    const ticketFare =
      price.find((p: { kind: string }) => p.kind === "FareSummary")?.Oneway ?? 0;
    const expressFare =
      price.find((p: { kind: string }) => p.kind === "ChargeSummary")?.Oneway ?? 0;
    return {
      from,
      to,
      ticketFare: Number(ticketFare),
      expressFare: Number(expressFare),
      distanceKm: Number(course.Distance) || 0,
      source: "api",
    };
  }

  const key = `${from}-${to}`;
  const reverseKey = `${to}-${from}`;
  const found = MOCK_ROUTES[key] ?? MOCK_ROUTES[reverseKey];
  if (found) return { ...found, from, to };

  throw new Error(
    `「${from}→${to}」のモックデータがありません。対応区間: ${Object.keys(MOCK_ROUTES).join(", ")}`,
  );
}
