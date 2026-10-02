export type ScorableItem = {
  source: string;
  title?: string;
  text?: string;
  author?: string;
  engagement?: number;
  publishedAt?: string;
};

export type SentimentLabel = "positive" | "neutral" | "negative";

export type ClassifiedItem = ScorableItem & {
  sentiment: number;
  label: SentimentLabel;
  classifierConfidence: number;
  weight: number;
};

export type SourceScore = {
  source: string;
  sampleSize: number;
  uniqueAuthors: number;
  vibe: number;
  consensus: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  weightedEngagement: number;
};

export type ScoreSummary = {
  vibe: number;
  consensus: number;
  heat: number;
  bubbleGap: number | null;
  confidence: number;
  sampleSize: number;
  uniqueAuthors: number;
  classifiedPct: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  sourcesMeasured: number;
  sourceScores: SourceScore[];
  methodology: string;
};

const POSITIVE: Record<string, number> = {
  amazing: 2.2,
  awesome: 2,
  beautiful: 1.5,
  best: 1.8,
  brilliant: 2,
  excited: 1.7,
  excellent: 2.1,
  fantastic: 2.1,
  good: 1.1,
  great: 1.7,
  happy: 1.4,
  impressive: 1.8,
  incredible: 2,
  like: 1,
  liked: 1,
  love: 2.2,
  loved: 2.2,
  perfect: 2,
  relief: 1.2,
  solid: 1.1,
  strong: 0.8,
  support: 1.1,
  supported: 1.1,
  win: 1.5,
  winner: 1.6,
  worth: 1.1,
};

const NEGATIVE: Record<string, number> = {
  abuse: 2.4,
  abusive: 2.4,
  angry: 1.8,
  awful: 2.1,
  bad: 1.2,
  broken: 1.7,
  concern: 1,
  concerned: 1.2,
  corrupt: 2.2,
  crime: 1.4,
  criminal: 1.5,
  dangerous: 1.7,
  disappointed: 1.5,
  disgusting: 2.4,
  fail: 1.7,
  failed: 1.7,
  failure: 1.8,
  fraud: 2.2,
  hate: 2.1,
  horrible: 2.2,
  insane: 1.2,
  liar: 2,
  lying: 1.8,
  outrage: 2,
  outraged: 2.1,
  overpriced: 1.8,
  problem: 1,
  rape: 2.8,
  raped: 2.8,
  scam: 2.2,
  skeptical: 1,
  terrible: 2.2,
  toxic: 2,
  unacceptable: 2.1,
  upset: 1.4,
  victim: 1.2,
  victims: 1.2,
  wrong: 1.5,
  worse: 1.3,
  worst: 2,
};

const POSITIVE_PHRASES: Array<[string, number]> = [
  ["well done", 1.8],
  ["good news", 1.7],
  ["worth it", 1.8],
  ["looking good", 1.5],
  ["pleasantly surprised", 2],
  ["big improvement", 1.9],
];

const NEGATIVE_PHRASES: Array<[string, number]> = [
  ["not worth", 2],
  ["piece of shit", 2.8],
  ["what a joke", 2],
  ["mob justice", 1.7],
  ["due process", 0.8],
  ["cover up", 2.3],
  ["covered up", 2.3],
  ["sexual assault", 2.7],
  ["price increase", 1.1],
  ["too expensive", 1.8],
  ["not good", 1.7],
  ["don't like", 1.6],
  ["do not like", 1.6],
];

const NEGATORS = new Set(["not", "no", "never", "isn't", "wasn't", "aren't", "weren't", "don't", "doesn't", "didn't", "won't", "can't", "cannot", "hardly"]);

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value: number) => Math.round(value);

function cleanText(item: ScorableItem) {
  return `${item.title ?? ""} ${item.text ?? ""}`
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/[^\p{L}\p{N}'!?\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedKey(item: ScorableItem) {
  return cleanText(item)
    .toLowerCase()
    .replace(/\b(rt|repost|via)\b/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 220);
}

function sentimentForText(text: string) {
  const lower = text.toLowerCase();
  let raw = 0;
  let hits = 0;

  for (const [phrase, value] of POSITIVE_PHRASES) {
    if (lower.includes(phrase)) {
      raw += value;
      hits += 1;
    }
  }
  for (const [phrase, value] of NEGATIVE_PHRASES) {
    if (lower.includes(phrase)) {
      raw -= value;
      hits += 1;
    }
  }

  const tokens = lower.match(/[a-z0-9']+/g) ?? [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    const prevWindow = tokens.slice(Math.max(0, index - 3), index);
    const negated = prevWindow.some((word) => NEGATORS.has(word));

    if (POSITIVE[token]) {
      raw += POSITIVE[token] * (negated ? -0.85 : 1);
      hits += 1;
    }
    if (NEGATIVE[token]) {
      raw -= NEGATIVE[token] * (negated ? -0.8 : 1);
      hits += 1;
    }
  }

  const punctuationBoost = Math.min(1.25, (text.match(/!/g) ?? []).length * 0.12);
  if (raw > 0) raw += punctuationBoost;
  if (raw < 0) raw -= punctuationBoost;

  // Compress arbitrarily large lexical totals to a stable -1..1 interval.
  const sentiment = Math.tanh(raw / 3.5);
  const confidence = clamp(42 + hits * 11 + Math.min(18, text.length / 28), 42, 94) / 100;
  const label: SentimentLabel = sentiment > 0.12 ? "positive" : sentiment < -0.12 ? "negative" : "neutral";

  return { sentiment, confidence, label, hits };
}

function recencyWeight(publishedAt?: string) {
  if (!publishedAt) return 1;
  const timestamp = new Date(publishedAt).getTime();
  if (!Number.isFinite(timestamp)) return 1;
  const hours = Math.max(0, (Date.now() - timestamp) / 3_600_000);
  if (hours <= 2) return 1.2;
  if (hours <= 12) return 1.1;
  if (hours <= 24) return 1;
  if (hours <= 72) return 0.9;
  return 0.78;
}

function engagementWeight(engagement = 0) {
  // Log scaling means 10,000 likes matters more than 10 likes, but never 1,000x more.
  return clamp(1 + Math.log10(1 + Math.max(0, engagement)) * 0.42, 1, 2.7);
}

function consensusFromShares(positive: number, neutral: number, negative: number) {
  const dominant = Math.max(positive, neutral, negative);
  // 33/33/33 => 0 consensus, 100/0/0 => 100 consensus.
  return clamp(((dominant - 1 / 3) / (2 / 3)) * 100);
}

function summarizeClassified(items: ClassifiedItem[]): SourceScore {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0) || 1;
  const weightedSentiment = items.reduce((sum, item) => sum + item.sentiment * item.weight, 0) / totalWeight;
  const labelWeight = { positive: 0, neutral: 0, negative: 0 };
  for (const item of items) labelWeight[item.label] += item.weight;
  const positive = labelWeight.positive / totalWeight;
  const neutral = labelWeight.neutral / totalWeight;
  const negative = labelWeight.negative / totalWeight;

  return {
    source: items[0]?.source ?? "Unknown",
    sampleSize: items.length,
    uniqueAuthors: new Set(items.map((item) => item.author).filter(Boolean)).size,
    vibe: round(clamp(50 + weightedSentiment * 50)),
    consensus: round(consensusFromShares(positive, neutral, negative)),
    positivePct: round(positive * 100),
    neutralPct: round(neutral * 100),
    negativePct: round(negative * 100),
    weightedEngagement: round(items.reduce((sum, item) => sum + (item.engagement ?? 0), 0)),
  };
}

export function scoreConversation(inputItems: ScorableItem[]): ScoreSummary {
  const socialItems = inputItems.filter((item) => item.source !== "News / GDELT" && cleanText(item).length >= 3);

  const seen = new Set<string>();
  const deduped = socialItems.filter((item) => {
    const key = `${item.source}:${normalizedKey(item)}`;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const authorFrequency = new Map<string, number>();
  for (const item of deduped) {
    if (!item.author) continue;
    const key = `${item.source}:${item.author.toLowerCase()}`;
    authorFrequency.set(key, (authorFrequency.get(key) ?? 0) + 1);
  }

  const classified: ClassifiedItem[] = deduped.map((item) => {
    const text = cleanText(item);
    const classification = sentimentForText(text);
    const authorKey = item.author ? `${item.source}:${item.author.toLowerCase()}` : null;
    const repeatCount = authorKey ? authorFrequency.get(authorKey) ?? 1 : 1;
    const authorWeight = 1 / Math.sqrt(repeatCount);
    const weight = engagementWeight(item.engagement) * recencyWeight(item.publishedAt) * authorWeight * classification.confidence;

    return {
      ...item,
      sentiment: classification.sentiment,
      label: classification.label,
      classifierConfidence: classification.confidence,
      weight,
    };
  });

  if (classified.length === 0) {
    return {
      vibe: 50,
      consensus: 0,
      heat: 0,
      bubbleGap: null,
      confidence: 0,
      sampleSize: 0,
      uniqueAuthors: 0,
      classifiedPct: 0,
      positivePct: 0,
      neutralPct: 100,
      negativePct: 0,
      sourcesMeasured: 0,
      sourceScores: [],
      methodology: "V0.1 lexical classifier; no scorable social reactions were returned.",
    };
  }

  const overall = summarizeClassified(classified);
  const grouped = new Map<string, ClassifiedItem[]>();
  for (const item of classified) {
    const group = grouped.get(item.source) ?? [];
    group.push(item);
    grouped.set(item.source, group);
  }

  const sourceScores = [...grouped.values()]
    .map(summarizeClassified)
    .sort((a, b) => b.sampleSize - a.sampleSize);

  const eligibleBubbleSources = sourceScores.filter((score) => score.sampleSize >= 3);
  const bubbleGap = eligibleBubbleSources.length >= 2
    ? Math.max(...eligibleBubbleSources.map((score) => score.vibe)) - Math.min(...eligibleBubbleSources.map((score) => score.vibe))
    : null;

  const uniqueAuthors = new Set(classified.map((item) => item.author && `${item.source}:${item.author.toLowerCase()}`).filter(Boolean)).size;
  const nonNeutral = classified.filter((item) => item.label !== "neutral").length;
  const classifiedPct = nonNeutral / classified.length;
  const avgClassifierConfidence = classified.reduce((sum, item) => sum + item.classifierConfidence, 0) / classified.length;

  const sampleFactor = clamp(Math.log10(1 + classified.length) / Math.log10(501) * 100);
  const sourceFactor = clamp(sourceScores.length / 4 * 100);
  const authorFactor = classified.length ? clamp((uniqueAuthors / classified.length) * 110) : 0;
  const confidence = round(
    sampleFactor * 0.38 +
    sourceFactor * 0.24 +
    authorFactor * 0.16 +
    avgClassifierConfidence * 100 * 0.22,
  );

  const totalEngagement = classified.reduce((sum, item) => sum + Math.max(0, item.engagement ?? 0), 0);
  const veryRecent = classified.filter((item) => {
    if (!item.publishedAt) return false;
    const time = new Date(item.publishedAt).getTime();
    return Number.isFinite(time) && Date.now() - time <= 24 * 3_600_000;
  }).length;
  const recentShare = veryRecent / classified.length;
  const volumeHeat = clamp(Math.log10(1 + classified.length) / Math.log10(201) * 50);
  const engagementHeat = clamp(Math.log10(1 + totalEngagement) / Math.log10(100001) * 28);
  const breadthHeat = clamp(sourceScores.length / 4 * 14);
  const recencyHeat = recentShare * 8;
  const heat = round(clamp(volumeHeat + engagementHeat + breadthHeat + recencyHeat));

  return {
    vibe: overall.vibe,
    consensus: overall.consensus,
    heat,
    bubbleGap: bubbleGap === null ? null : round(bubbleGap),
    confidence,
    sampleSize: classified.length,
    uniqueAuthors,
    classifiedPct: round(classifiedPct * 100),
    positivePct: overall.positivePct,
    neutralPct: overall.neutralPct,
    negativePct: overall.negativePct,
    sourcesMeasured: sourceScores.length,
    sourceScores,
    methodology: "V0.1 deterministic lexical stance proxy. Near-duplicate reactions are removed; repeat authors are discounted; engagement is logarithmically weighted; recency and classifier confidence affect weight. News/GDELT is context only and never enters the sentiment score.",
  };
}
