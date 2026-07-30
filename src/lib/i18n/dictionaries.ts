import type { Locale } from "@/lib/i18n/config";

export type Dictionary = {
  nav: {
    home: string;
    discover: string;
    destinations: string;
    blog: string;
    features: string;
    pricing: string;
    contact: string;
    about: string;
    requestFeature: string;
    signIn: string;
    account: string;
    planner: string;
  };
  footer: {
    tagline: string;
    product: string;
    company: string;
    legal: string;
    privacy: string;
    terms: string;
    language: string;
  };
  common: {
    startPlanning: string;
    discoverTrips: string;
    readMore: string;
    days: string;
    distance: string;
    difficulty: string;
    bestSeason: string;
    submit: string;
    sending: string;
    sent: string;
    required: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    subhead: string;
    howTitle: string;
    howBody: string;
    ctaTitle: string;
    ctaBody: string;
  };
  discover: {
    title: string;
    body: string;
  };
  contact: {
    title: string;
    body: string;
    name: string;
    email: string;
    topic: string;
    message: string;
    success: string;
  };
  feature: {
    title: string;
    body: string;
    name: string;
    email: string;
    titleField: string;
    details: string;
    success: string;
  };
  blog: {
    title: string;
    body: string;
  };
  destinations: {
    title: string;
    body: string;
  };
  about: {
    title: string;
    body: string;
  };
  featuresPage: {
    title: string;
    body: string;
  };
  pricing: {
    title: string;
    body: string;
  };
};

const en: Dictionary = {
  nav: {
    home: "Home",
    discover: "Discover",
    destinations: "Destinations",
    blog: "Blog",
    features: "Features",
    pricing: "Pricing",
    contact: "Contact",
    about: "About",
    requestFeature: "Request a feature",
    signIn: "Sign in",
    account: "Account",
    planner: "Planner",
  },
  footer: {
    tagline:
      "Road trip planning for people who care how the route feels, not just how long it takes.",
    product: "Product",
    company: "Company",
    legal: "Legal",
    privacy: "Privacy",
    terms: "Terms",
    language: "Language",
  },
  common: {
    startPlanning: "Start planning",
    discoverTrips: "Discover trips",
    readMore: "Read more",
    days: "Days",
    distance: "Distance",
    difficulty: "Difficulty",
    bestSeason: "Best season",
    submit: "Send message",
    sending: "Sending…",
    sent: "Sent",
    required: "Required",
  },
  home: {
    eyebrow: "International road trips · Est. 2026",
    headline: "RoadPlan Studio",
    subhead:
      "Plan the drive like a designer: real distances, honest daylight, and a map that finally matches the trip in your head — from Canada to the Alps to Hokkaido.",
    howTitle: "Three moves between a vague idea and a trip you can actually drive.",
    howBody: "How it works",
    ctaTitle: "Your next drive deserves better than a spreadsheet.",
    ctaBody: "Start as a guest. Save it to the cloud when it starts feeling real.",
  },
  discover: {
    title: "Public itineraries worth remixing.",
    body: "Seeded templates across six continents — open one, remix the spine, invite tripmates when you are ready.",
  },
  contact: {
    title: "Contact us",
    body: "Questions about planning, partnerships, press or account help — send a note. We read every message.",
    name: "Name",
    email: "Email",
    topic: "Topic",
    message: "Message",
    success: "Thanks — your message is on its way.",
  },
  feature: {
    title: "Request a feature",
    body: "Tell us what would make your next road trip easier to plan. Template requests welcome.",
    name: "Name",
    email: "Email",
    titleField: "Feature title",
    details: "Details",
    success: "Thanks — we logged your feature request.",
  },
  blog: {
    title: "Notes from the open road",
    body: "Pacing, packing, borders and collaboration — field notes for people who plan trips on maps.",
  },
  destinations: {
    title: "Drive the world, one region at a time.",
    body: "Browse continents, then open a template built for local driving rules, seasons and overnight geometry.",
  },
  about: {
    title: "Built for the way road trips actually unfold.",
    body: "RoadPlan Studio is a map-first itinerary studio for multi-day drives — guest-friendly, tripmate-ready and designed for international routes.",
  },
  featuresPage: {
    title: "Everything between the idea and the ignition.",
    body: "Maps, days, lodging, permissions and remixable templates — without the spreadsheet fog.",
  },
  pricing: {
    title: "Plan free. Save when it matters.",
    body: "Guest planning is open. Cloud sync, sharing and collaboration unlock with an account.",
  },
};

const fr: Dictionary = {
  ...en,
  nav: {
    home: "Accueil",
    discover: "Découvrir",
    destinations: "Destinations",
    blog: "Blog",
    features: "Fonctionnalités",
    pricing: "Tarifs",
    contact: "Contact",
    about: "À propos",
    requestFeature: "Demander une fonctionnalité",
    signIn: "Connexion",
    account: "Compte",
    planner: "Planificateur",
  },
  footer: {
    ...en.footer,
    tagline:
      "Le road trip pour ceux qui soignent le feeling de la route, pas seulement le kilométrage.",
    product: "Produit",
    company: "Entreprise",
    legal: "Mentions",
    privacy: "Confidentialité",
    terms: "Conditions",
    language: "Langue",
  },
  common: {
    ...en.common,
    startPlanning: "Commencer à planifier",
    discoverTrips: "Découvrir des trajets",
    readMore: "Lire la suite",
    days: "Jours",
    distance: "Distance",
    difficulty: "Difficulté",
    bestSeason: "Meilleure saison",
    submit: "Envoyer",
    sending: "Envoi…",
    sent: "Envoyé",
  },
  home: {
    eyebrow: "Road trips internationaux · Est. 2026",
    headline: "RoadPlan Studio",
    subhead:
      "Planifiez comme un designer : distances réelles, lumière du jour honnête, et une carte qui colle enfin au voyage dans votre tête — du Canada aux Alpes jusqu’à Hokkaidō.",
    howTitle: "Trois gestes entre une vague idée et un trajet que vous pouvez vraiment conduire.",
    howBody: "Comment ça marche",
    ctaTitle: "Votre prochaine route mérite mieux qu’un tableur.",
    ctaBody: "Commencez en invité. Sauvegardez dans le cloud quand ça devient réel.",
  },
  discover: {
    title: "Itinéraires publics à remixer.",
    body: "Des modèles sur six continents — ouvrez, adaptez l’épine dorsale, invitez des co-voyageurs.",
  },
  contact: {
    title: "Nous contacter",
    body: "Questions sur la planification, les partenariats, la presse ou le compte — écrivez-nous.",
    name: "Nom",
    email: "E-mail",
    topic: "Sujet",
    message: "Message",
    success: "Merci — votre message est en route.",
  },
  feature: {
    title: "Demander une fonctionnalité",
    body: "Dites-nous ce qui rendrait votre prochain road trip plus simple à planifier.",
    name: "Nom",
    email: "E-mail",
    titleField: "Titre de la fonctionnalité",
    details: "Détails",
    success: "Merci — demande enregistrée.",
  },
  blog: {
    title: "Notes de route",
    body: "Rythme, bagages, frontières et collaboration — pour ceux qui planifient sur la carte.",
  },
  destinations: {
    title: "Le monde, région par région.",
    body: "Parcourez les continents, puis ouvrez un modèle pensé pour les règles locales et les nuits étapes.",
  },
  about: {
    title: "Conçu pour les road trips tels qu’ils se vivent.",
    body: "RoadPlan Studio est un studio d’itinéraires centré sur la carte — accessible en invité, prêt pour les co-voyageurs, pensé pour l’international.",
  },
  featuresPage: {
    title: "Tout entre l’idée et le contact.",
    body: "Cartes, jours, hébergements, permissions et modèles remixables.",
  },
  pricing: {
    title: "Planifiez gratuitement. Sauvegardez au bon moment.",
    body: "La planification invité est ouverte. Sync cloud et partage avec un compte.",
  },
};

const es: Dictionary = {
  ...en,
  nav: {
    home: "Inicio",
    discover: "Descubrir",
    destinations: "Destinos",
    blog: "Blog",
    features: "Funciones",
    pricing: "Precios",
    contact: "Contacto",
    about: "Nosotros",
    requestFeature: "Pedir una función",
    signIn: "Iniciar sesión",
    account: "Cuenta",
    planner: "Planificador",
  },
  footer: {
    ...en.footer,
    tagline:
      "Planificación de road trips para quienes importan cómo se siente la ruta, no solo cuánto dura.",
    product: "Producto",
    company: "Empresa",
    legal: "Legal",
    privacy: "Privacidad",
    terms: "Términos",
    language: "Idioma",
  },
  common: {
    ...en.common,
    startPlanning: "Empezar a planear",
    discoverTrips: "Descubrir viajes",
    readMore: "Leer más",
    days: "Días",
    distance: "Distancia",
    difficulty: "Dificultad",
    bestSeason: "Mejor temporada",
    submit: "Enviar",
    sending: "Enviando…",
    sent: "Enviado",
  },
  home: {
    eyebrow: "Road trips internacionales · Est. 2026",
    headline: "RoadPlan Studio",
    subhead:
      "Planifica como un diseñador: distancias reales, luz de día honesta y un mapa que por fin coincide con el viaje en tu cabeza — de Canadá a los Alpes y Hokkaidō.",
    howTitle: "Tres pasos entre una idea vaga y un viaje que sí puedes conducir.",
    howBody: "Cómo funciona",
    ctaTitle: "Tu próxima ruta merece más que una hoja de cálculo.",
    ctaBody: "Empieza como invitado. Guarda en la nube cuando sea real.",
  },
  discover: {
    title: "Itinerarios públicos para remixear.",
    body: "Plantillas en seis continentes — ábrelas, adapta el eje y invita a compañeros.",
  },
  contact: {
    title: "Contáctanos",
    body: "Preguntas sobre planificación, alianzas, prensa o tu cuenta — escríbenos.",
    name: "Nombre",
    email: "Correo",
    topic: "Tema",
    message: "Mensaje",
    success: "Gracias — tu mensaje está en camino.",
  },
  feature: {
    title: "Pedir una función",
    body: "Cuéntanos qué haría más fácil planear tu próximo road trip.",
    name: "Nombre",
    email: "Correo",
    titleField: "Título de la función",
    details: "Detalles",
    success: "Gracias — registramos tu solicitud.",
  },
  blog: {
    title: "Notas desde la carretera",
    body: "Ritmo, equipaje, fronteras y colaboración — para quienes planean en el mapa.",
  },
  destinations: {
    title: "Recorre el mundo, región a región.",
    body: "Explora continentes y abre plantillas pensadas para normas locales y pernoctas.",
  },
  about: {
    title: "Hecho para cómo se viven los road trips.",
    body: "RoadPlan Studio es un estudio de itinerarios centrado en el mapa — para invitados, compañeros e itinerarios internacionales.",
  },
  featuresPage: {
    title: "Todo entre la idea y el encendido.",
    body: "Mapas, días, alojamiento, permisos y plantillas remixables.",
  },
  pricing: {
    title: "Planea gratis. Guarda cuando importe.",
    body: "El modo invitado está abierto. Sincronización y compartir con una cuenta.",
  },
};

const de: Dictionary = {
  ...en,
  nav: {
    home: "Start",
    discover: "Entdecken",
    destinations: "Reiseziele",
    blog: "Blog",
    features: "Funktionen",
    pricing: "Preise",
    contact: "Kontakt",
    about: "Über uns",
    requestFeature: "Feature vorschlagen",
    signIn: "Anmelden",
    account: "Konto",
    planner: "Planer",
  },
  footer: {
    ...en.footer,
    tagline:
      "Roadtrip-Planung für Menschen, denen sich die Strecke anfühlen soll — nicht nur die Dauer.",
    product: "Produkt",
    company: "Unternehmen",
    legal: "Rechtliches",
    privacy: "Datenschutz",
    terms: "AGB",
    language: "Sprache",
  },
  common: {
    ...en.common,
    startPlanning: "Planung starten",
    discoverTrips: "Trips entdecken",
    readMore: "Weiterlesen",
    days: "Tage",
    distance: "Distanz",
    difficulty: "Schwierigkeit",
    bestSeason: "Beste Reisezeit",
    submit: "Senden",
    sending: "Senden…",
    sent: "Gesendet",
  },
  home: {
    eyebrow: "Internationale Roadtrips · Est. 2026",
    headline: "RoadPlan Studio",
    subhead:
      "Plane die Fahrt wie ein Designer: echte Distanzen, ehrliches Tageslicht und eine Karte, die endlich zur Reise in deinem Kopf passt — von Kanada über die Alpen bis Hokkaidō.",
    howTitle: "Drei Schritte von der vagen Idee zur fahrbaren Route.",
    howBody: "So funktioniert’s",
    ctaTitle: "Deine nächste Tour verdient mehr als eine Tabelle.",
    ctaBody: "Starte als Gast. Speichere in der Cloud, wenn es ernst wird.",
  },
  discover: {
    title: "Öffentliche Itinerare zum Remixen.",
    body: "Vorlagen auf sechs Kontinenten — öffnen, Gerüst anpassen, Mitreisende einladen.",
  },
  contact: {
    title: "Kontakt",
    body: "Fragen zu Planung, Partnerschaften, Presse oder Konto — schreib uns.",
    name: "Name",
    email: "E-Mail",
    topic: "Thema",
    message: "Nachricht",
    success: "Danke — deine Nachricht ist unterwegs.",
  },
  feature: {
    title: "Feature vorschlagen",
    body: "Sag uns, was deine nächste Roadtrip-Planung leichter macht.",
    name: "Name",
    email: "E-Mail",
    titleField: "Feature-Titel",
    details: "Details",
    success: "Danke — Vorschlag gespeichert.",
  },
  blog: {
    title: "Notizen von der Straße",
    body: "Tempo, Packen, Grenzen und Zusammenarbeit — für Menschen, die auf Karten planen.",
  },
  destinations: {
    title: "Die Welt, Region für Region.",
    body: "Kontinente erkunden und Vorlagen mit lokalen Regeln und Übernachtungslogik öffnen.",
  },
  about: {
    title: "Gebaut für Roadtrips, wie sie wirklich laufen.",
    body: "RoadPlan Studio ist ein kartenbasiertes Itinerar-Studio — gastfreundlich, teamfähig, international.",
  },
  featuresPage: {
    title: "Alles zwischen Idee und Zündung.",
    body: "Karten, Tage, Unterkünfte, Rechte und remixbare Vorlagen.",
  },
  pricing: {
    title: "Kostenlos planen. Speichern, wenn’s zählt.",
    body: "Gastmodus ist offen. Cloud-Sync und Teilen mit Konto.",
  },
};

const ja: Dictionary = {
  ...en,
  nav: {
    home: "ホーム",
    discover: "探す",
    destinations: "目的地",
    blog: "ブログ",
    features: "機能",
    pricing: "料金",
    contact: "お問い合わせ",
    about: "について",
    requestFeature: "機能リクエスト",
    signIn: "ログイン",
    account: "アカウント",
    planner: "プランナー",
  },
  footer: {
    ...en.footer,
    tagline:
      "所要時間だけでなく、道の手触りまで大切にする人のためのロードトリップ計画。",
    product: "プロダクト",
    company: "会社",
    legal: "法務",
    privacy: "プライバシー",
    terms: "利用規約",
    language: "言語",
  },
  common: {
    ...en.common,
    startPlanning: "計画を始める",
    discoverTrips: "旅程を見る",
    readMore: "続きを読む",
    days: "日数",
    distance: "距離",
    difficulty: "難易度",
    bestSeason: "ベストシーズン",
    submit: "送信",
    sending: "送信中…",
    sent: "送信済み",
  },
  home: {
    eyebrow: "国際ロードトリップ · Est. 2026",
    headline: "RoadPlan Studio",
    subhead:
      "デザイナーのようにドライブを設計。実距離・日照・頭の中の旅に合う地図を — カナダからアルプス、北海道まで。",
    howTitle: "ぼんやりしたアイデアから、実際に走れる旅までの3ステップ。",
    howBody: "使い方",
    ctaTitle: "次のドライブに、表計算はいらない。",
    ctaBody: "ゲストで開始。本気になったらクラウドに保存。",
  },
  discover: {
    title: "リミックスできる公開旅程。",
    body: "6大陸のテンプレート — 開いて骨組みを調整し、仲間を招待。",
  },
  contact: {
    title: "お問い合わせ",
    body: "計画・提携・取材・アカウントについて — メッセージをお送りください。",
    name: "お名前",
    email: "メール",
    topic: "件名",
    message: "メッセージ",
    success: "送信しました。ありがとうございます。",
  },
  feature: {
    title: "機能リクエスト",
    body: "次のロードトリップ計画を楽にするアイデアを教えてください。",
    name: "お名前",
    email: "メール",
    titleField: "機能タイトル",
    details: "詳細",
    success: "リクエストを受け付けました。",
  },
  blog: {
    title: "オープンロードからのノート",
    body: "ペース配分、パッキング、国境、共同計画 — 地図で旅を組む人へ。",
  },
  destinations: {
    title: "世界を、地域ごとに走る。",
    body: "大陸を選び、現地の運転ルールと泊まりの幾何学に沿ったテンプレートを開く。",
  },
  about: {
    title: "実際のロードトリップの進み方のために。",
    body: "RoadPlan Studioは地図ファーストの旅程スタジオ。ゲスト利用・同行者・国際ルートに対応。",
  },
  featuresPage: {
    title: "アイデアからエンジン始動まで。",
    body: "地図、日ごと、宿、権限、リミックス可能なテンプレート。",
  },
  pricing: {
    title: "無料で計画。必要なとき保存。",
    body: "ゲスト計画はオープン。クラウド同期と共有はアカウントで。",
  },
};

const dictionaries: Record<Locale, Dictionary> = { en, fr, es, de, ja };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}
