import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import IFlowchartGenerator from "../../core/ports/flowchart-generator.port";
import { FlowchartData } from "../../core/domain/flowchart.entity";
import { NEWS_PROMPT, GENERAL_PROMPT } from "./prompts";
import { GeminiClientFactory } from "./gemini.client";

/**
 * GeminiAdapter
 *
 * General-purpose adapter for interacting with Gemini API to generate structured flowchart data.
 * Designed to be reusable and cleaner by separating prompts and logic.
 */
export class GeminiAdapter implements IFlowchartGenerator {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private defaultModelName: string = "gemini-2.0-flash-exp";

  /**
   * @param apiKey - API Key for Google Generative AI
   * @param modelName - Optional model name override
   */
  constructor(apiKey: string, modelName?: string) {
    this.genAI = GeminiClientFactory.create(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: modelName || this.defaultModelName,
    });
  }

  /**
   * Generates a flowchart and annotations based on the provided text.
   *
   * @param text - The source text to analyze.
   * @param mode - The analysis mode ('news' or 'general').
   * @returns A promise resolving to FlowchartData.
   */
  async generate(
    text: string,
    mode: "news" | "general" = "news"
  ): Promise<FlowchartData> {
    const systemPrompt = this.getSystemPrompt(mode);
    const prompt = `${systemPrompt}\n\nUser Input:\n${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const textResponse = response.text();

      return this.parseResponse(textResponse);
    } catch (error) {
      console.error("Gemini generation failed:", error);
      throw new Error(
        `Gemini generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Selects the appropriate system prompt based on the mode.
   */
  private getSystemPrompt(mode: "news" | "general"): string {
    return mode === "general" ? GENERAL_PROMPT : NEWS_PROMPT;
  }

  /**
   * Parses and cleans the AI response to ensure valid JSON.
   *
   * @param textResponse - The raw text response from the AI.
   * @returns The parsed FlowchartData object.
   */
  private parseResponse(textResponse: string): FlowchartData {
    // Clean up markdown code blocks if present
    let cleanedText = textResponse
      .replace(/^```json\s*/, "")
      .replace(/\s*```$/, "")
      .replace(/^```\s*/, "");

    // Trim whitespace
    cleanedText = cleanedText.trim();

    try {
      const data = JSON.parse(cleanedText) as FlowchartData;
      return data;
    } catch (error) {
      console.error("Failed to parse Gemini response:", cleanedText, error);
      throw new Error("Failed to parse AI response as JSON");
    }
  }
}
