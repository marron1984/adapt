import {
  Train,
  Building2,
  Landmark,
  Ticket,
  Heart,
  Receipt,
  Home,
  Smartphone,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CircleAlert,
  Info,
  CheckCircle2,
  XCircle,
  MinusCircle,
  ArrowLeft,
  Filter,
  TableProperties,
} from "lucide-react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Grade = "all" | "1" | "12" | "1only" | "none" | "note";

interface BenefitItem {
  name: string;
  target: string;
  detail: string;
  notes?: string;
  mentalGrade?: { g1: Grade; g2: Grade; g3: Grade };
}

interface BenefitCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  colorClass: {
    badge: string;
    iconBg: string;
    iconFg: string;
    ring: string;
  };
  items: BenefitItem[];
}

// ---------------------------------------------------------------------------
// Data — unchanged content, new color token structure
// ---------------------------------------------------------------------------

const CATEGORIES: BenefitCategory[] = [
  {
    id: "transport",
    title: "交通機関",
    icon: <Train size={22} aria-hidden />,
    colorClass: {
      badge: "bg-brand-100 text-brand-800",
      iconBg: "bg-brand-100",
      iconFg: "text-brand-700",
      ring: "ring-brand-200",
    },
    items: [
      {
        name: "Osaka Metro（地下鉄・ニュートラム）",
        target: "全手帳",
        detail:
          "【Osaka Metro自社制度】精神手帳1級＝「第1種」扱いで本人+介護者ともに5割引（介護者同乗時のみ）。2級・3級＝「第2種」扱い（小児のみ適用）。\n【大阪市の福祉措置（市民限定）】1級：無料（介護者1名含む）／2級：無料（本人のみ）／3級：5割引（本人のみ）。",
        notes:
          "大阪市民は市の福祉措置のほうが手厚い。無料乗車証とタクシー給付券の併給は不可。ミライロID対応。2027年3月31日までの暫定措置。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪シティバス・いまざとライナー",
        target: "全手帳",
        detail:
          "【自社制度】精神手帳1級＝本人+介護者ともに5割引。バスは本人単独乗車でも割引適用。2・3級は第2種扱い（小児のみ）。\n【大阪市福祉措置（市民限定）】1級：無料+介護者 ／ 2級：無料 ／ 3級：5割引。",
        notes: "空港バスは対象外。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "JR西日本（JRグループ全社共通）",
        target: "全手帳（2025年4月〜精神手帳対応）",
        detail:
          "第1種（1級）＋介護者同乗時：距離制限なく普通乗車券・回数券・急行券・定期券が5割引（本人+介護者とも）。\n単独乗車時：片道101km以上の普通乗車券のみ5割引。",
        notes:
          "手帳の「旅客鉄道株式会社等旅客運賃減額」欄にスタンプが必要（未記載は区役所で手続き）。ICOCAの障害者割引には非対応。特急料金は割引対象外。e5489では購入不可（みどりの窓口・券売機のみ）。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "近鉄（近畿日本鉄道）",
        target: "全手帳（2023年4月〜精神手帳対応）",
        detail:
          "JRと同様の枠組み。第1種＋介護者：5割引。単独乗車：101km以上の普通乗車券のみ5割引。",
        notes: "手帳に顔写真の貼付が必要な場合あり。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "南海電気鉄道",
        target: "全手帳",
        detail:
          "JR・近鉄と同様の枠組み。第1種＋介護者：5割引。単独101km以上：5割引。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "阪急電鉄・阪神電気鉄道",
        target: "全手帳（2025年1月末〜精神手帳対応）",
        detail:
          "手帳の1級を「第1種」、2級・3級を「第2種」と読み替えて適用。第1種＋介護者：5割引。単独乗車：101km以上の普通乗車券のみ5割引。",
        notes:
          "阪急・阪神の路線で単独101km以上の乗車は現実的にほぼ発生しないため、実質的には1級の方が介護者と乗車する場合に限られる。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "京阪電気鉄道",
        target: "全手帳（2025年4月〜精神手帳対応）",
        detail: "他の大手私鉄と同様の枠組み。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "タクシー（全国共通の障害者割引）",
        target: "全手帳 ※精神手帳は対応事業者が限定的",
        detail: "乗車時に手帳提示で運賃1割引。",
        notes:
          "精神障害者保健福祉手帳は対応していないタクシー会社が多い。乗車前に確認推奨。",
        mentalGrade: { g1: "note", g2: "note", g3: "note" },
      },
      {
        name: "重度障がい者等タクシー料金給付（大阪市民限定）",
        target: "身体（重度）/知的（重度）/精神1級",
        detail:
          "1回あたり上限500円のタクシー給付券。リフト付きタクシーは上限2,000円。",
        notes:
          "無料乗車証との併給不可（どちらかを選択）。区の保健福祉センターで申請。",
        mentalGrade: { g1: "all", g2: "none", g3: "none" },
      },
    ],
  },
  {
    id: "public",
    title: "公共施設",
    icon: <Landmark size={22} aria-hidden />,
    colorClass: {
      badge: "bg-accent-100 text-accent-600",
      iconBg: "bg-accent-100",
      iconFg: "text-accent-600",
      ring: "ring-accent-100",
    },
    items: [
      {
        name: "大阪城天守閣",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料（通常大人1,200円）",
        notes: "ミライロID対応",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "天王寺動物園",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪市立美術館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪市立自然史博物館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪市立東洋陶磁美術館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪市立科学館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        notes: "プラネタリウムは1人1日1回まで",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪歴史博物館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "大阪中之島美術館",
        target: "全手帳（等級不問）",
        detail: "本人+介護者1名 無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "長居植物園",
        target: "全手帳（等級不問）",
        detail: "無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "咲くやこの花館",
        target: "全手帳（等級不問）",
        detail: "無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "キッズプラザ大阪",
        target: "全手帳（等級不問）",
        detail: "無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "天王寺公園・大阪城西の丸庭園・城北菖蒲園・鶴見緑地展望塔 ほか",
        target: "全手帳（等級不問）",
        detail: "無料",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
    ],
  },
  {
    id: "leisure",
    title: "レジャー・娯楽",
    icon: <Ticket size={22} aria-hidden />,
    colorClass: {
      badge: "bg-rose-100 text-rose-700",
      iconBg: "bg-rose-100",
      iconFg: "text-rose-600",
      ring: "ring-rose-100",
    },
    items: [
      {
        name: "ユニバーサル・スタジオ・ジャパン（USJ）",
        target: "全手帳（等級不問）",
        detail:
          "障がい者向け割引スタジオ・パス：大人4,700円・子ども3,200円の一律料金（通常の約半額）。同伴者1名も同額で購入可。",
        notes:
          "日付指定の1日券のみ対象。年パス・エクスプレスパス・トワイライトパスは対象外。入場時に手帳原本またはミライロID提示必須。ゲストサポートパスも手帳提示で発行可。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "海遊館",
        target: "全手帳（等級不問）",
        detail: "入館料半額。介護者1名も半額。",
        notes:
          "チケットカウンターでの購入のみ（Web購入不可）。ミライロID対応。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "天保山大観覧車",
        target: "全手帳（等級不問）",
        detail: "半額",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "映画館（TOHOシネマズ、イオンシネマ、109シネマズ等）",
        target: "全手帳（等級不問）",
        detail:
          "本人1,000円。同伴者1名（イオンシネマは2名まで）も1,000円。",
        notes:
          "3D・4DX・IMAX等の特別上映や特別席は対象外の場合あり。同伴者は家族でなくても可。ミライロID対応の映画館が増加中。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "ジャンボカラオケ広場（ジャンカラ）",
        target: "全手帳",
        detail: "本人+付添2名までシニア会員料金で利用可",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "ビッグエコー",
        target: "全手帳",
        detail: "室料50%OFF（グループ全員に適用）",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "カラオケ館",
        target: "全手帳",
        detail: "室料30%OFF（本人+付添1名）",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "ラウンドワン",
        target: "全手帳",
        detail: "ビジター料金→クラブ会員料金に割引",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
    ],
  },
  {
    id: "medical",
    title: "医療・福祉",
    icon: <Heart size={22} aria-hidden />,
    colorClass: {
      badge: "bg-red-100 text-red-700",
      iconBg: "bg-red-100",
      iconFg: "text-red-600",
      ring: "ring-red-100",
    },
    items: [
      {
        name: "重度障がい者医療費助成制度（大阪市）",
        target: "身体1・2級 / 知的A / 精神1級",
        detail:
          "医療機関ごとに1日最大500円の自己負担のみ。同一月の自己負担合計が3,000円を超えた場合は超過分を払い戻し。",
        notes:
          "精神手帳は1級のみ対象（2級・3級は対象外）。所得制限あり（単身で479万4千円程度）。国の公費負担医療（自立支援医療等）が優先適用。",
        mentalGrade: { g1: "all", g2: "none", g3: "none" },
      },
      {
        name: "自立支援医療（精神通院医療）",
        target: "精神疾患で通院治療中の方（手帳不問）",
        detail: "精神科の通院医療費の自己負担が原則1割に軽減。",
        notes: "精神手帳と同時申請可能。所得に応じた月額上限あり。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "特別障がい者手当（国制度・大阪市で申請）",
        target: "精神・身体に著しく重度の障がいがある在宅の20歳以上の方",
        detail:
          "月額29,590円（令和7年4月〜）。年4回（2月・5月・8月・11月）に前3ヶ月分を支給。",
        notes:
          "施設入所者・3ヶ月以上の入院者は対象外。所得制限あり。手帳の所持は要件ではなく、障がいの状態で判定。",
        mentalGrade: { g1: "note", g2: "none", g3: "none" },
      },
      {
        name: "障がい児福祉手当",
        target: "精神・身体に重度の障がいがある在宅の20歳未満の方",
        detail: "月額15,690円程度（年度により改定）。",
        mentalGrade: { g1: "note", g2: "none", g3: "none" },
      },
    ],
  },
  {
    id: "tax",
    title: "税金・公共料金",
    icon: <Receipt size={22} aria-hidden />,
    colorClass: {
      badge: "bg-warn-100 text-warn-700",
      iconBg: "bg-warn-100",
      iconFg: "text-warn-700",
      ring: "ring-warn-100",
    },
    items: [
      {
        name: "所得税の障害者控除",
        target: "全手帳",
        detail:
          "精神1級：特別障害者控除40万円 ／ 精神2級・3級：障害者控除27万円。同居特別障害者加算は+35万円。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "住民税の障害者控除",
        target: "全手帳",
        detail:
          "精神1級：特別障害者控除30万円 ／ 精神2級・3級：障害者控除26万円。同居特別障害者加算は+23万円。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "住民税の非課税",
        target: "全手帳",
        detail:
          "障がい者で前年の合計所得金額が135万円以下の場合、住民税が非課税。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "自動車税・軽自動車税の減免",
        target: "身体（等級・部位による） / 知的A / 精神1級+自立支援医療",
        detail:
          "排気量2L以下の自家用車は全額免除。2L超は一定額を限度に減免。",
        notes:
          "精神手帳は1級+自立支援医療の両方が必要（2級・3級は対象外）。1人1台限り。",
        mentalGrade: { g1: "note", g2: "none", g3: "none" },
      },
      {
        name: "NHK受信料の免除",
        target: "全手帳",
        detail:
          "全額免除：全手帳いずれかの所持者がいる世帯で、世帯全員が住民税非課税の場合。\n半額免除：精神手帳1級の方が世帯主かつ受信契約者の場合。",
        notes:
          "精神手帳2級・3級の場合、半額免除の対象外。全額免除は世帯全員が非課税の場合のみ。",
        mentalGrade: { g1: "all", g2: "note", g3: "note" },
      },
      {
        name: "水道料金・下水道使用料",
        target: "—",
        detail:
          "大阪市では障害者向け福祉減免は2013年に廃止済み。現在は割引なし。",
        notes:
          "大阪府内の他市（枚方市など）では精神1級を含む減免制度が残存している自治体もある。",
        mentalGrade: { g1: "none", g2: "none", g3: "none" },
      },
      {
        name: "少額貯蓄非課税制度（マル優）",
        target: "全手帳",
        detail: "預貯金等の元本350万円までの利子が非課税。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
    ],
  },
  {
    id: "housing",
    title: "住宅",
    icon: <Home size={22} aria-hidden />,
    colorClass: {
      badge: "bg-sky-100 text-sky-700",
      iconBg: "bg-sky-100",
      iconFg: "text-sky-700",
      ring: "ring-sky-100",
    },
    items: [
      {
        name: "大阪市営住宅（公営住宅）の優先入居",
        target: "身体1〜4級 / 知的 / 精神1級・2級",
        detail:
          "障がい者世帯向けの優先枠で申込可。単身入居も可能。収入基準の緩和（一般の収入上限より高い基準を適用）。車椅子常用者向け住宅もあり。",
        notes:
          "精神手帳3級は優先入居の対象外となることが多い。募集時期は年1〜2回（概ね5月頃）。",
        mentalGrade: { g1: "all", g2: "all", g3: "none" },
      },
      {
        name: "UR賃貸住宅",
        target: "身体1〜4級 / 知的（重度） / 精神1級・2級",
        detail:
          "家賃減額制度（特別減額）の対象。新規募集時の抽選倍率優遇（最大20倍）。収入要件の特例措置。",
        notes:
          "精神手帳3級は対象外。倍率優遇は主に身体手帳1〜4級が対象で、精神手帳での適用範囲は要確認。",
        mentalGrade: { g1: "all", g2: "all", g3: "none" },
      },
    ],
  },
  {
    id: "telecom",
    title: "携帯電話・通信",
    icon: <Smartphone size={22} aria-hidden />,
    colorClass: {
      badge: "bg-violet-100 text-violet-700",
      iconBg: "bg-violet-100",
      iconFg: "text-violet-700",
      ring: "ring-violet-100",
    },
    items: [
      {
        name: "NTTドコモ「ハーティ割引」",
        target: "全手帳（等級不問）",
        detail:
          "各種事務手数料（新規・機種変更・名義変更等）が無料。5分かけ放題オプションが無料。かけ放題オプションが1,870円→1,100円。",
        notes:
          "1名義1回線まで。dカードお支払割・みんなドコモ割等の他割引との併用不可（ドコモ光セット割は併用可）。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "au「スマイルハート割引」",
        target: "全手帳（等級不問）",
        detail:
          "基本料金・通話料・SMS送信料の割引（プランにより金額が異なる）。",
        notes: "家族割との併用可。契約名義人本人のみ適用。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
      {
        name: "ソフトバンク「ハートフレンド割引」",
        target: "全手帳（等級不問）",
        detail:
          "基本プランとの組み合わせで通常より安い料金。機種変更等の手数料割引あり。",
        notes: "ミライロIDでの申込み対応（店舗のみ）。",
        mentalGrade: { g1: "all", g2: "all", g3: "all" },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Summary table data
// ---------------------------------------------------------------------------

interface SummaryRow {
  label: string;
  g1: string;
  g2: string;
  g3: string;
}

const SUMMARY_ROWS: SummaryRow[] = [
  {
    label: "大阪メトロ・シティバス（市の福祉措置）",
    g1: "無料+介護者",
    g2: "無料（本人のみ）",
    g3: "5割引",
  },
  {
    label: "JR・大手私鉄",
    g1: "介護者同乗で5割引",
    g2: "101km超のみ5割引",
    g3: "101km超のみ5割引",
  },
  {
    label: "公共施設（美術館・動物園等）",
    g1: "無料",
    g2: "無料",
    g3: "無料",
  },
  { label: "USJ", g1: "約半額", g2: "約半額", g3: "約半額" },
  { label: "映画館", g1: "1,000円", g2: "1,000円", g3: "1,000円" },
  { label: "携帯電話割引", g1: "対象", g2: "対象", g3: "対象" },
  {
    label: "重度障がい者医療費助成",
    g1: "対象",
    g2: "対象外",
    g3: "対象外",
  },
  {
    label: "自動車税減免",
    g1: "対象（+自立支援医療）",
    g2: "対象外",
    g3: "対象外",
  },
  {
    label: "NHK全額免除",
    g1: "世帯全員非課税で可",
    g2: "世帯全員非課税で可",
    g3: "世帯全員非課税で可",
  },
  {
    label: "NHK半額免除",
    g1: "対象",
    g2: "対象外",
    g3: "対象外",
  },
  {
    label: "所得税控除",
    g1: "特別障害者40万円",
    g2: "障害者27万円",
    g3: "障害者27万円",
  },
  {
    label: "住民税控除",
    g1: "特別障害者30万円",
    g2: "障害者26万円",
    g3: "障害者26万円",
  },
  {
    label: "公営住宅優先入居",
    g1: "対象",
    g2: "対象",
    g3: "対象外が多い",
  },
  {
    label: "UR家賃減額",
    g1: "対象",
    g2: "対象",
    g3: "対象外",
  },
];

// ---------------------------------------------------------------------------
// Small helper components
// ---------------------------------------------------------------------------

function GradeIcon({ grade }: { grade: Grade }) {
  switch (grade) {
    case "all":
      return (
        <CheckCircle2
          size={16}
          className="text-accent-600 shrink-0"
          aria-label="対象"
        />
      );
    case "none":
      return (
        <XCircle
          size={16}
          className="text-gray-400 shrink-0"
          aria-label="対象外"
        />
      );
    default:
      return (
        <MinusCircle
          size={16}
          className="text-warn-600 shrink-0"
          aria-label="条件付き"
        />
      );
  }
}

function GradeBadge({ grade }: { grade: Grade }) {
  const map: Record<
    Grade,
    { cls: string; label: string }
  > = {
    all: { cls: "bg-accent-100 text-accent-600", label: "対象" },
    "1": { cls: "bg-brand-100 text-brand-800", label: "1級のみ" },
    "12": { cls: "bg-brand-100 text-brand-800", label: "1・2級" },
    "1only": { cls: "bg-brand-100 text-brand-800", label: "1級のみ" },
    none: { cls: "bg-gray-100 text-gray-400", label: "対象外" },
    note: { cls: "bg-warn-100 text-warn-700", label: "条件付き" },
  };
  const { cls, label } = map[grade];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold leading-tight ${cls}`}
    >
      <GradeIcon grade={grade} />
      {label}
    </span>
  );
}

/** Summary table cell badge */
function CellBadge({ text }: { text: string }) {
  const neg = text === "対象外";
  const pos =
    text.includes("対象") ||
    text.includes("無料") ||
    text.includes("割引") ||
    text.includes("半額") ||
    text.includes("1,000円") ||
    text.includes("万円");
  return (
    <span
      className={`inline-block rounded-md px-2.5 py-1 text-xs font-bold leading-tight ${
        neg
          ? "bg-gray-100 text-gray-400"
          : pos
            ? "bg-accent-50 text-accent-600"
            : "bg-gray-100 text-gray-600"
      }`}
    >
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Category section — accordion with Bento-style cards inside
// ---------------------------------------------------------------------------

function CategorySection({ category }: { category: BenefitCategory }) {
  const [isOpen, setIsOpen] = useState(true);
  const c = category.colorClass;

  return (
    <section className="card-soft overflow-hidden" aria-label={category.title}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left min-h-[48px]"
      >
        <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800">
          <span
            className={`inline-flex items-center justify-center rounded-xl p-2 ${c.iconBg} ${c.iconFg}`}
          >
            {category.icon}
          </span>
          {category.title}
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.badge}`}>
            {category.items.length}件
          </span>
        </h2>
        {isOpen ? (
          <ChevronUp size={22} className="shrink-0 text-gray-400" aria-hidden />
        ) : (
          <ChevronDown size={22} className="shrink-0 text-gray-400" aria-hidden />
        )}
      </button>

      {isOpen && (
        <div className="expand-enter grid gap-3 px-5 pb-5 sm:grid-cols-2">
          {category.items.map((item, i) => (
            <BenefitCard key={i} item={item} />
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Benefit card — Soft UI depth, Bento-sized
// ---------------------------------------------------------------------------

function BenefitCard({ item }: { item: BenefitItem }) {
  return (
    <article className="group flex flex-col gap-2.5 rounded-xl border border-gray-200 bg-white p-4 hover-lift">
      {/* Title row */}
      <h3 className="text-base font-bold leading-snug text-slate-900">
        {item.name}
      </h3>

      {/* Grade badges */}
      {item.mentalGrade && (
        <div className="flex flex-wrap items-center gap-1.5" aria-label="精神手帳の等級別適用状況">
          <span className="text-xs font-semibold text-gray-500">精神 :</span>
          <span className="inline-flex items-center gap-1 text-xs">
            1級 <GradeBadge grade={item.mentalGrade.g1} />
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            2級 <GradeBadge grade={item.mentalGrade.g2} />
          </span>
          <span className="inline-flex items-center gap-1 text-xs">
            3級 <GradeBadge grade={item.mentalGrade.g3} />
          </span>
        </div>
      )}

      {/* Target */}
      <p className="text-sm leading-relaxed text-slate-600">
        <span className="font-semibold text-slate-700">対象：</span>
        {item.target}
      </p>

      {/* Detail */}
      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
        {item.detail}
      </p>

      {/* Notes callout */}
      {item.notes && (
        <div
          className="flex gap-2 rounded-lg border border-warn-100 bg-warn-50 p-3 text-sm text-warn-700"
          role="note"
        >
          <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
          <span>{item.notes}</span>
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------------------
// Bento Grid — quick-access cards at the top
// ---------------------------------------------------------------------------

function BentoNav({
  categories,
  onJump,
}: {
  categories: BenefitCategory[];
  onJump: (id: string) => void;
}) {
  return (
    <nav aria-label="カテゴリへジャンプ">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const c = cat.colorClass;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onJump(cat.id)}
              className={`card-soft hover-lift flex flex-col items-center gap-2 px-4 py-5 text-center min-h-[72px]`}
            >
              <span
                className={`inline-flex items-center justify-center rounded-xl p-2.5 ${c.iconBg} ${c.iconFg}`}
              >
                {cat.icon}
              </span>
              <span className="text-sm font-bold text-slate-700">
                {cat.title}
              </span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${c.badge}`}>
                {cat.items.length}件
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ---------------------------------------------------------------------------
// Main exported page component
// ---------------------------------------------------------------------------

export default function OsakaBenefits({
  onBack,
}: {
  onBack: () => void;
}) {
  const [filterGrade, setFilterGrade] = useState<"all" | "1" | "2" | "3">(
    "all",
  );

  const handleJump = (id: string) => {
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-surface text-slate-800">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        本文へスキップ
      </a>

      {/* ── Header ── */}
      <header className="bg-brand-800 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <nav aria-label="パンくず">
            <button
              type="button"
              onClick={onBack}
              className="mb-3 inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-brand-100 transition-colors hover:bg-brand-700 hover:text-white"
            >
              <ArrowLeft size={18} aria-hidden />
              運賃シミュレーターに戻る
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center justify-center rounded-2xl bg-white/10 p-3">
              <Building2 size={32} aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                大阪の制度情報
              </h1>
              <p className="mt-1 text-base text-brand-100">
                大阪府・大阪市で使える障害者手帳の割引・優待制度
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="space-y-8">
          {/* ── Bento Grid: Category Navigation ── */}
          <section aria-label="カテゴリ一覧">
            <BentoNav categories={CATEGORIES} onJump={handleJump} />
          </section>

          {/* ── Filter ── */}
          <section
            className="card-soft p-5"
            aria-label="精神手帳等級フィルター"
          >
            <p className="mb-3 flex items-center gap-2 text-base font-bold text-slate-700">
              <Filter size={18} aria-hidden className="text-brand-700" />
              精神障害者保健福祉手帳の等級で絞り込み
            </p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="等級フィルター">
              {(
                [
                  { v: "all", l: "すべて表示" },
                  { v: "1", l: "1級" },
                  { v: "2", l: "2級" },
                  { v: "3", l: "3級" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  role="radio"
                  aria-checked={filterGrade === opt.v}
                  onClick={() => setFilterGrade(opt.v)}
                  className={`min-h-[44px] min-w-[44px] rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${
                    filterGrade === opt.v
                      ? "bg-brand-800 text-white shadow-md"
                      : "border border-gray-200 bg-white text-slate-600 hover:border-brand-600 hover:text-brand-800"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          </section>

          {/* ── Summary table ── */}
          <section
            className="card-soft overflow-x-auto p-5"
            aria-label="精神手帳 等級別まとめ"
          >
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <TableProperties size={20} aria-hidden className="text-brand-700" />
              精神障害者保健福祉手帳 等級別まとめ
            </h2>
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b-2 border-brand-100 bg-brand-50">
                  <th
                    scope="col"
                    className="p-3 text-left font-bold text-slate-700"
                  >
                    制度
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap p-3 text-center font-bold text-slate-700"
                  >
                    1級
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap p-3 text-center font-bold text-slate-700"
                  >
                    2級
                  </th>
                  <th
                    scope="col"
                    className="whitespace-nowrap p-3 text-center font-bold text-slate-700"
                  >
                    3級
                  </th>
                </tr>
              </thead>
              <tbody>
                {SUMMARY_ROWS.map((row, i) => {
                  if (
                    filterGrade !== "all" &&
                    row[`g${filterGrade}` as "g1" | "g2" | "g3"] === "対象外"
                  ) {
                    return null;
                  }
                  return (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 transition-colors hover:bg-brand-50/50 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                      }`}
                    >
                      <td className="p-3 font-medium text-slate-700">
                        {row.label}
                      </td>
                      <td className="whitespace-nowrap p-3 text-center">
                        <CellBadge text={row.g1} />
                      </td>
                      <td className="whitespace-nowrap p-3 text-center">
                        <CellBadge text={row.g2} />
                      </td>
                      <td className="whitespace-nowrap p-3 text-center">
                        <CellBadge text={row.g3} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* ── Category detail sections ── */}
          {CATEGORIES.map((cat) => {
            let items = cat.items;
            if (filterGrade !== "all") {
              const gk = `g${filterGrade}` as "g1" | "g2" | "g3";
              items = cat.items.filter(
                (item) => !item.mentalGrade || item.mentalGrade[gk] !== "none",
              );
            }
            if (items.length === 0) return null;
            return (
              <div key={cat.id} id={`cat-${cat.id}`}>
                <CategorySection category={{ ...cat, items }} />
              </div>
            );
          })}

          {/* ── Important notice (transport) ── */}
          <section
            className="rounded-xl border border-warn-100 bg-warn-50 p-5"
            aria-label="精神手帳の交通機関割引に関する重要注意事項"
          >
            <h3 className="mb-3 flex items-center gap-2 text-base font-bold text-warn-700">
              <CircleAlert size={20} aria-hidden />
              精神手帳の交通機関割引に関する重要注意事項
            </h3>
            <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-slate-700">
              <li>
                大手私鉄・JRの割引は「介護者同乗 or
                101km以上の単独乗車」が基本条件であり、
                <strong className="text-slate-900">
                  日常の短距離通勤・通学には割引が適用されにくい
                </strong>
                のが最大の課題です。
              </li>
              <li>
                精神手帳は
                <strong className="text-slate-900">
                  障害者割引用ICカード（スルッとKANSAI・ICOCA等）に非対応
                </strong>
                。窓口での切符購入が必要です。
              </li>
              <li>
                <strong className="text-slate-900">
                  大阪市民であれば、大阪市の福祉措置（無料乗車証）が最も有利
                </strong>
                。Osaka Metro・大阪シティバスが2級で無料、3級でも5割引になります。
              </li>
            </ul>
          </section>

          {/* ── Sources ── */}
          <section className="card-soft p-5" aria-label="情報源・参考リンク">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-800">
              <ExternalLink size={20} aria-hidden className="text-brand-700" />
              情報源・参考リンク
            </h2>
            <ul className="space-y-2">
              {[
                {
                  text: "大阪市 精神障がい者保健福祉手帳による各種の支援サービス",
                  url: "https://www.city.osaka.lg.jp/kenko/page/0000561605.html",
                },
                {
                  text: "Osaka Metro 障がい者手帳による割引",
                  url: "https://subway.osakametro.co.jp/guide/fare/various_fares/fare_discount/josya-ryokin_waribiki.php",
                },
                {
                  text: "大阪市 交通機関乗車料金福祉措置",
                  url: "https://www.city.osaka.lg.jp/fukushi/page/0000007635.html",
                },
                {
                  text: "大阪市 重度障がい者医療費の助成",
                  url: "https://www.city.osaka.lg.jp/fukushi/page/0000369437.html",
                },
                {
                  text: "大阪市 特別障がい者手当等",
                  url: "https://www.city.osaka.lg.jp/fukushi/page/0000007154.html",
                },
                {
                  text: "大阪市 重度障がい者等タクシー料金給付",
                  url: "https://www.city.osaka.lg.jp/fukushi/page/0000007578.html",
                },
                {
                  text: "大阪府 精神障害者に対する旅客運賃の割引について",
                  url: "https://www.pref.osaka.lg.jp/o100220/mtetyo/ryokaku.html",
                },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-brand-700 underline decoration-brand-200 underline-offset-2 transition-colors hover:bg-brand-50 hover:text-brand-800 hover:decoration-brand-700"
                  >
                    {link.text}
                    <ExternalLink size={14} aria-hidden className="shrink-0" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Disclaimer ── */}
          <section
            className="rounded-xl border border-gray-200 bg-gray-50 p-5"
            aria-label="免責事項"
          >
            <h3 className="mb-2 flex items-center gap-2 text-base font-bold text-slate-700">
              <Info size={18} aria-hidden />
              ご利用にあたって
            </h3>
            <ul className="list-inside list-disc space-y-1 text-sm leading-relaxed text-slate-600">
              <li>
                本ページの情報は2025年〜2026年初頭の調査時点のものです。制度は随時変更される可能性があります。
              </li>
              <li>
                実際にご利用の際は各機関の公式サイトまたは窓口で最新情報をご確認ください。
              </li>
              <li>
                Osaka Metroの精神手帳割引は2027年3月31日までの暫定措置とされており、今後の動向に注意が必要です。
              </li>
              <li>
                「大阪市民限定」の制度は大阪市に住民登録がある方のみ対象です。
              </li>
            </ul>
          </section>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200 bg-white py-6 text-center text-sm text-slate-500">
        <p>生活支援ガイド &copy; 2025</p>
      </footer>
    </div>
  );
}
