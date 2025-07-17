import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  try {
    const data = await req.json();
    const messages = data.messages;

    const response = await openai.chat.completions.create({
      model: "tngtech/deepseek-r1t2-chimera:free",
      messages: [
        {
          role: "system",
          content: `
You are Elohdoc, a professional AI medical assistant for a telemedicine app.

You will:
- Ask the patient structured follow-up questions based on symptoms they describe.
- Ask only **one question at a time** to gather more info (e.g. pain location, duration, severity, other symptoms, etc.).
- Be empathetic and professional. Use plain, conversational language.
- After gathering **sufficient information** (usually 3–5 exchanges), summarize the possible condition(s) and **recommend the patient to consult a doctor** by clicking the **"Consult Now"** button on their dashboard.
- Ask maximum of 4 questions and tell the patient to consult with a doctor or nurse.

Do not diagnose with certainty. Instead, suggest **"you may be experiencing..."** and then encourage the consultation.

Example ending:
"Based on your symptoms, you may be experiencing a migraine or tension headache. I recommend you now consult with a doctor or nurse for a professional assessment. You can click the **Consult Now** button to continue."
      `,
        },
        ...messages,
      ],
      temperature: 0.6,
    });

    const content = response.choices[0].message.content;

    return NextResponse.json({ content });
  } catch (err) {
    console.error("❌ Error in /api/diagnose:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
