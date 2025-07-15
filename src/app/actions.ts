
"use server";

import { analyzeSeoHeaders, estimateRankingPotential } from "@/ai/flows/analyze-seo-headers";
import type { AnalyzeSeoHeadersOutput } from "@/ai/schemas/analyze-seo-headers-schema";
import type { EstimateRankingPotentialInput, EstimateRankingPotentialOutput } from "@/ai/schemas/estimate-ranking-potential-schema";
import { z } from "zod";

const UrlSchema = z.string().url({ message: "Please enter a valid URL." });

export async function getHtmlFromUrl(url: string) {
  try {
    const validation = UrlSchema.safeParse(url);
    if (!validation.success) {
      return { success: false, error: validation.error.errors[0].message };
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL. Status: ${response.status}`,
      };
    }
    const html = await response.text();
    return { success: true, html };
  } catch (error) {
    if (error instanceof Error && error.message.includes('fetch failed')) {
      return { success: false, error: 'Network error or invalid URL. Please check the URL and your connection.' };
    }
    return { success: false, error: "An unexpected error occurred while fetching the URL." };
  }
}

export async function getOptimizedHeaders(htmlContent: string): Promise<{success: true, data: AnalyzeSeoHeadersOutput} | {success: false, error: string}> {
  if (!htmlContent.trim()) {
    return { success: false, error: "HTML content cannot be empty." };
  }
  
  try {
    const result = await analyzeSeoHeaders({ htmlContent });
    return { success: true, data: result };
  } catch (error) {
    console.error("AI analysis failed:", error);
    return { success: false, error: "Failed to analyze headers with AI. Please try again." };
  }
}

export async function getRankingPotential(input: EstimateRankingPotentialInput): Promise<{success: true, data: EstimateRankingPotentialOutput} | {success: false, error: string}> {
    if (!input.headerText.trim() || !input.mainKeyword.trim()) {
        return { success: false, error: "Header text and main keyword cannot be empty." };
    }

    try {
        const result = await estimateRankingPotential(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("AI ranking potential estimation failed:", error);
        return { success: false, error: "Failed to estimate ranking potential with AI. Please try again."};
    }
}
