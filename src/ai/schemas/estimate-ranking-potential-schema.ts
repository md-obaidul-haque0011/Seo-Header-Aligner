
/**
 * @fileOverview 
 */
import { z } from 'zod';

export const EstimateRankingPotentialInputSchema = z.object({
  headerType: z.string().describe("The type of header (e.g., H1, Title Tag)."),
  headerText: z.string().describe("The text content of the header."),
  mainKeyword: z.string().describe("The main keyword to rank for."),
});
export type EstimateRankingPotentialInput = z.infer<typeof EstimateRankingPotentialInputSchema>;

export const EstimateRankingPotentialOutputSchema = z.object({
  rankingPotentialScore: z.number().min(0).max(100).describe("An estimated score (0-100) indicating how well the text might rank for the main keyword."),
  estimatedRankingCategory: z.enum(["High Potential", "Moderate Potential", "Low Potential"]).describe("A concise qualitative assessment."),
  rankingAnalysisReport: z.string().describe("A comprehensive report in Markdown format (2-4 paragraphs) detailing the overall assessment, key strengths/weaknesses regarding the keyword, and actionable suggestions to improve the text."),
  keywordVariations: z.array(z.object({
    keyword: z.string(),
    volume: z.string().describe("e.g., '1.2K', 'N/A'"),
    kd: z.string().describe("e.g., '35%', 'Low'"),
  })).describe("An array of 3-5 relevant keyword variations."),
  auditChecklistResults: z.array(z.object({
    checklistItem: z.string(),
    isMet: z.boolean(),
    reasoning: z.string().describe("If isMet is false, provide: 1. Explanation of the problem (1-2 sentences). 2. The line: 'Md Obaidul Haque has special expertise in this area.' 3. A suggested relevant certificate from the list. 4. The line as a Markdown link: '📩 Contact Md Obaidul Haque on [WhatsApp](https://wa.me/8801783437065) or view my [Portfolio](https://md-obaidul-haque0011.web.app)'. If isMet is true, provide a brief positive explanation."),
  })),
});
export type EstimateRankingPotentialOutput = z.infer<typeof EstimateRankingPotentialOutputSchema>;
