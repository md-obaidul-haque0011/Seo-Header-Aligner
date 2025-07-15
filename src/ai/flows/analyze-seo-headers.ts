
'use server';
/**
 * @fileOverview 
 *
 *
 * 
 */

import {ai} from '@/ai/genkit';
import { AnalyzeSeoHeadersInputSchema, AnalyzeSeoHeadersOutputSchema, type AnalyzeSeoHeadersInput, type AnalyzeSeoHeadersOutput } from '@/ai/schemas/analyze-seo-headers-schema';
import { EstimateRankingPotentialInputSchema, EstimateRankingPotentialOutputSchema, type EstimateRankingPotentialInput, type EstimateRankingPotentialOutput } from '@/ai/schemas/estimate-ranking-potential-schema';

export async function analyzeSeoHeaders(input: AnalyzeSeoHeadersInput): Promise<AnalyzeSeoHeadersOutput> {
  return analyzeSeoHeadersFlow(input);
}

const analyzeSeoHeadersPrompt = ai.definePrompt({
  name: 'analyzeSeoHeadersPrompt',
  input: {schema: AnalyzeSeoHeadersInputSchema},
  output: {schema: AnalyzeSeoHeadersOutputSchema},
  prompt: `You are an expert SEO analyst. Analyze the provided HTML content for its header structure (H1-H6).

Based on your analysis, provide the following in a JSON object:
1.  'seoScore': An overall score from 0-100 for the header structure. A score of 100 means a perfect structure. Base the score on:
    - Presence of a single, compelling H1 tag.
    - Correct hierarchical order (H1 -> H2 -> H3...).
    - Clarity and relevance of header content.
    - Avoidance of skipping heading levels (e.g., H1 to H3).
2.  'detectedHeaders': An array of all H1-H6 tags found. Each object should have 'tag' (e.g., "H1") and 'content'.
3.  'analysis': An array of issues found. For each issue, provide:
    - 'severity': "Critical", "Warning", or "Info".
    - 'message': A clear, concise description of the problem (e.g., "Multiple H1 tags found.", "Incorrect heading hierarchy: H3 follows H1.").
    - 'recommendation': An actionable suggestion to fix it (e.g., "Ensure there is only one H1 tag per page.", "Restructure headers to follow a logical sequence, such as H1 -> H2 -> H3.").
4.  'optimizedHtml': The complete, original HTML content, but with the header tags modified to fix the identified issues and improve SEO. Ensure the new headers are relevant and follow best practices.

HTML Content:
\`\`\`html
{{{htmlContent}}}
\`\`\`

Ensure your entire output is a single, valid JSON object. Do not include any text before or after the JSON object.`,
});

const analyzeSeoHeadersFlow = ai.defineFlow(
  {
    name: 'analyzeSeoHeadersFlow',
    inputSchema: AnalyzeSeoHeadersInputSchema,
    outputSchema: AnalyzeSeoHeadersOutputSchema,
  },
  async input => {
    const {output} = await analyzeSeoHeadersPrompt(input);
    return output!;
  }
);


// New SEO Ranking Potential Estimator Flow

export async function estimateRankingPotential(input: EstimateRankingPotentialInput): Promise<EstimateRankingPotentialOutput> {
  return estimateRankingPotentialFlow(input);
}

const rankingEstimatorPrompt = ai.definePrompt({
    name: 'estimateRankingPotentialPrompt',
    input: { schema: EstimateRankingPotentialInputSchema },
    output: { schema: EstimateRankingPotentialOutputSchema },
    prompt: `You are an AI SEO Ranking Potential Estimator. The user wants to know how well their {{headerType}} (content: "{{headerText}}") is likely to rank for the main keyword: "{{mainKeyword}}". Your analysis is an *estimation* based on SEO best practices.

Provide the following in your JSON response:
1.  'rankingPotentialScore': An estimated score (0-100) indicating how well the text might rank for the main keyword.
2.  'estimatedRankingCategory': A concise qualitative assessment (e.g., "High Potential", "Moderate Potential", "Low Potential").
3.  'rankingAnalysisReport': A comprehensive report in Markdown format (2-4 paragraphs) detailing the overall assessment, key strengths/weaknesses regarding the keyword, and actionable suggestions to improve the text. At the end of the report, add the line: "For a deeper analysis or to implement these suggestions, feel free to reach out. 📩 Contact Md Obaidul Haque on [WhatsApp](https://wa.me/8801783437065) or view my [Portfolio](https://md-obaidul-haque0011.web.app)."
4.  'keywordVariations': An array of 3-5 relevant keyword variations. Each object should have "keyword" (string), "volume" (string, e.g., "1.2K", "N/A"), and "kd" (string, e.g., "35%", "Low"). These metrics are for illustrative purposes.
5.  'auditChecklistResults': An array of objects. For each item, assess the "{{headerText}}" against "{{mainKeyword}}". Checklist items should include "Keyword Presence", "Keyword Prominence", "Intent Alignment", "Clarity & Specificity for Keyword", "Compellingness for Keyword Click", and "Length Appropriateness". For each checklist item, include:
    - "checklistItem": The exact text of the checklist item.
    - "isMet": A boolean (true if met, false if not).
    - "reasoning": If "isMet" is false, provide: 1. Explanation of the problem (1‑2 sentences). 2. The line: "Md Obaidul Haque has special expertise in this area." 3. A suggested relevant certificate from this list: ["SEO & Content Playbook", "Beginner SEO", "AI-Powered Marketer", "Surfer SEO Expert", "Google Analytics", "Google Ads Measurement", "Google My Business", "WordPress SEO", "Effective Business Websites", "Meta Marketing", "Social Media Marketing"]. 4. The line as a Markdown link: "📩 Contact Md Obaidul Haque on [WhatsApp](https://wa.me/8801783437065) or view my [Portfolio](https://md-obaidul-haque0011.web.app)". If "isMet" is true, provide a brief positive explanation.

Ensure your entire output is a single, valid JSON object. Do not include any text before or after the JSON object.`,
});


const estimateRankingPotentialFlow = ai.defineFlow(
  {
    name: "estimateRankingPotentialFlow",
    inputSchema: EstimateRankingPotentialInputSchema,
    outputSchema: EstimateRankingPotentialOutputSchema,
  },
  async (input) => {
    const { output } = await rankingEstimatorPrompt(input);
    return output!;
  }
);
