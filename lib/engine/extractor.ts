import {
  SKILL_ALIASES,
  canonicalizeSkill,
  areSkillsEquivalent,
} from "./matcher";

export interface ExtractedSkill {
  skillName: string;
  canonicalName: string;
  category: "Frontend" | "Backend" | "Database" | "Cloud/DevOps" | "AI/Data" | "General";
  inferredProficiency: number; // 1 - 4
  proficiencyLabel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  isRequired: boolean;
  mentionContext: string;
}

export interface SkillExtractionResult {
  rawTextLength: number;
  extractedSkills: ExtractedSkill[];
  totalSkillsFound: number;
  categoryBreakdown: Record<string, number>;
  summary: string;
}

// Category keyword mappings
const CATEGORY_MAP: Record<string, ExtractedSkill["category"]> = {
  javascript: "Frontend",
  typescript: "Frontend",
  react: "Frontend",
  "react native": "Frontend",
  "next.js": "Frontend",
  "vue.js": "Frontend",
  "tailwind css": "Frontend",
  css: "Frontend",
  html: "Frontend",

  "node.js": "Backend",
  go: "Backend",
  python: "Backend",
  graphql: "Backend",
  rest: "Backend",
  java: "Backend",

  postgresql: "Database",
  mongodb: "Database",
  redis: "Database",
  kafka: "Database",
  mysql: "Database",
  prisma: "Database",
  drizzle: "Database",

  kubernetes: "Cloud/DevOps",
  docker: "Cloud/DevOps",
  aws: "Cloud/DevOps",
  gcp: "Cloud/DevOps",
  azure: "Cloud/DevOps",
  terraform: "Cloud/DevOps",
  ci: "Cloud/DevOps",

  "artificial intelligence": "AI/Data",
  "machine learning": "AI/Data",
  "deep learning": "AI/Data",
  rag: "AI/Data",
  "vector databases": "AI/Data",
  langchain: "AI/Data",
  pytorch: "AI/Data",
  pandas: "AI/Data",
};

/**
 * Parses freeform job specifications or candidate resume text to extract structured skills.
 */
export function extractSkillsFromText(rawText: string): SkillExtractionResult {
  if (!rawText || !rawText.trim()) {
    return {
      rawTextLength: 0,
      extractedSkills: [],
      totalSkillsFound: 0,
      categoryBreakdown: {},
      summary: "No text provided.",
    };
  }

  const textLower = rawText.toLowerCase();
  const foundMap = new Map<string, ExtractedSkill>();

  // Check section context for must-have vs bonus
  const mustHaveSectionRegex = /(?:must have|requirements|qualifications|required skills|essential):?([\s\S]*?)(?:nice to have|preferred|bonus|plus|\n\n|$)/i;
  const niceToHaveSectionRegex = /(?:nice to have|preferred|bonus|plus|desirable):?([\s\S]*?)(?:\n\n|$)/i;

  const mustHaveMatch = rawText.match(mustHaveSectionRegex);
  const niceToHaveMatch = rawText.match(niceToHaveSectionRegex);

  const mustHaveText = mustHaveMatch ? mustHaveMatch[1].toLowerCase() : "";
  const niceToHaveText = niceToHaveMatch ? niceToHaveMatch[1].toLowerCase() : "";

  // Get all known skill keys sorted by length descending so longer phrases match first (e.g. 'react native' before 'react')
  const allKeys = Object.keys(SKILL_ALIASES).sort((a, b) => b.length - a.length);

  for (const alias of allKeys) {
    const escaped = alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Boundary check: either word boundary or punctuation/space
    const regex = new RegExp(`(?:^|[\\s,;:.()\\[\\]/])${escaped}(?=[\\s,;:.()\\[\\]/]|$)`, "i");

    const match = textLower.match(regex);
    if (!match) continue;

    const canon = SKILL_ALIASES[alias];
    if (foundMap.has(canon)) continue;

    // Extract surrounding window for proficiency inference
    const matchIndex = match.index || 0;
    const windowStart = Math.max(0, matchIndex - 60);
    const windowEnd = Math.min(rawText.length, matchIndex + alias.length + 60);
    const contextSnippet = rawText.slice(windowStart, windowEnd).trim();
    const contextLower = contextSnippet.toLowerCase();

    // Infer proficiency
    let proficiency = 2; // default intermediate
    let label: ExtractedSkill["proficiencyLabel"] = "Intermediate";

    if (
      /(?:expert|principal|architect|lead|staff|7\+?\s*years?|8\+?\s*years?|10\+?\s*years?)/.test(
        contextLower
      )
    ) {
      proficiency = 4;
      label = "Expert";
    } else if (
      /(?:senior|advanced|proficient|in-depth|deep|strong|4\+?\s*years?|5\+?\s*years?|6\+?\s*years?)/.test(
        contextLower
      )
    ) {
      proficiency = 3;
      label = "Advanced";
    } else if (
      /(?:junior|beginner|familiarity|knowledge of|basic|exposure|learning)/.test(
        contextLower
      )
    ) {
      proficiency = 1;
      label = "Beginner";
    }

    // Infer requirement type
    let isRequired = true;
    if (niceToHaveText && niceToHaveText.includes(alias)) {
      isRequired = false;
    } else if (mustHaveText && mustHaveText.includes(alias)) {
      isRequired = true;
    } else if (/(?:nice to have|preferred|bonus|optional|plus)/.test(contextLower)) {
      isRequired = false;
    }

    const category = CATEGORY_MAP[canon] || "General";

    // Format clean display name (capitalize words)
    const displayName = canon
      .split(" ")
      .map((w) => (w.length <= 3 && !w.includes(".") ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
      .join(" ");

    foundMap.set(canon, {
      skillName: displayName,
      canonicalName: canon,
      category,
      inferredProficiency: proficiency,
      proficiencyLabel: label,
      isRequired,
      mentionContext: contextSnippet,
    });
  }

  const extractedSkills = Array.from(foundMap.values());

  // Category tally
  const categoryBreakdown: Record<string, number> = {};
  for (const s of extractedSkills) {
    categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + 1;
  }

  const summary =
    extractedSkills.length > 0
      ? `Extracted ${extractedSkills.length} technical competencies across ${
          Object.keys(categoryBreakdown).length
        } domains.`
      : "No recognized technical skills found. Try pasting a technical job description or resume summary.";

  return {
    rawTextLength: rawText.length,
    extractedSkills,
    totalSkillsFound: extractedSkills.length,
    categoryBreakdown,
    summary,
  };
}
