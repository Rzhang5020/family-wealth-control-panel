import { GoogleGenAI } from "@google/genai";
import type { FinancialItem, AppSettings } from "../types";

// Declare process to satisfy TypeScript in the browser environment
declare const process: {
  env: {
    API_KEY: string;
  };
};

// Note: Ensure your build tool injects the API key via process.env.API_KEY or import.meta.env
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateFinancialAdvice = async (
  items: FinancialItem[],
  settings: AppSettings
): Promise<string> => {
  try {
    const assets = items.filter((i) => i.type === 'asset');
    const liabilities = items.filter((i) => i.type === 'liability');
    const totalAssets = assets.reduce((sum, i) => sum + i.amount, 0);
    const totalLiabilities = liabilities.reduce((sum, i) => sum + i.amount, 0);
    const netWorth = totalAssets - totalLiabilities;

    const dataSummary = {
      totalAssets,
      totalLiabilities,
      netWorth,
      settings,
      assets: assets.map(a => ({ name: a.name, val: a.amount, cat: a.category, rate: a.interestRate })),
      liabilities: liabilities.map(l => ({ name: l.name, val: l.amount, cat: l.category, rate: l.interestRate }))
    };

    const prompt = `
      Act as a high-net-worth family office wealth advisor. 
      Analyze the following financial data for a client:
      ${JSON.stringify(dataSummary, null, 2)}

      Please provide a concise, actionable "Wealth Control Report" covering:
      1. **Health Check**: Brief assessment of the current Net Worth and Debt-to-Asset ratio.
      2. **Risk Analysis**: Are they too concentrated in one asset class (e.g., Real Estate)?
      3. **Growth Opportunities**: Suggestions to optimize growth based on the interest rates provided.
      4. **Liability Management**: Advice on handling the debts.
      
      Format the response in Markdown. Use bold headings and bullet points. Keep it professional but encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Error generating advice:", error);
    return "Error: Unable to connect to the Family Office AI. Please check your API key.";
  }
};