
/**
 * @fileOverview 
 */
import { z } from 'zod';

export const AnalyzeSeoHeadersInputSchema = z.object({
  htmlContent: z
    .string()
    .describe('The HTML content to analyze for header optimization.'),
});
export type AnalyzeSeoHeadersInput = z.infer<typeof AnalyzeSeoHeadersInputSchema>;

export const HeaderDetailSchema = z.object({
  tag: z.string().describe("The header tag, e.g., 'H1'"),
  content: z.string().describe("The text content of the header tag."),
});

export const AnalysisIssueSchema = z.object({
  severity: z.enum(["Critical", "Warning", "Info"]),
  message: z.string().describe("A description of the SEO issue found."),
  recommendation: z.string().describe("An actionable recommendation to fix the issue."),
});

export const AnalyzeSeoHeadersOutputSchema = z.object({
  seoScore: z.number().min(0).max(100).describe("An overall SEO score for the header structure, from 0 to 100."),
  detectedHeaders: z.array(HeaderDetailSchema).describe("A list of all detected H1-H6 headers."),
  analysis: z.array(AnalysisIssueSchema).describe("A list of SEO issues found in the headers, with recommendations."),
  optimizedHtml: z
    .string()
    .describe('The AI-optimized HTML snippet with improved header tags.'),
});
export type AnalyzeSeoHeadersOutput = z.infer<typeof AnalyzeSeoHeadersOutputSchema>;
