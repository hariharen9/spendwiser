import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const smsText = "INR 1,234.00 credited to your account from SWIGGY on 05-04-2026";

const prompt = `Extract from this bank SMS — amount (number), merchant (string), 
type ("income" or "expense"). Reply in JSON only, no markdown. SMS: "${smsText}"`;

const result = await model.generateContent(prompt);
console.log(result.response.text());