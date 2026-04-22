export async function POST(request) {
  // 1. Guard: ensure API key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ reply: "GEMINI_API_KEY is not set in .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages, supplyChainContext } = await request.json();
    const userQuestion = messages[messages.length - 1].content;

    // Build conversation history (last 6 exchanges max)
    const recentHistory = messages.slice(-7, -1);
    const historyText =
      recentHistory.length > 0
        ? `\nRecent conversation:\n${recentHistory
            .map(
              (m) =>
                `${m.role === "user" ? "User" : "Advisor"}: ${m.content}`
            )
            .join("\n")}\n`
        : "";

    // 2. Call Gemini API — using v1beta with gemini-2.0-flash
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are SupplyGuard AI, a professional supply chain risk advisor.

Current supply chain data:
${supplyChainContext}
${historyText}
Rules for your responses:
- Always respond in clear bullet points
- Keep responses under 120 words
- Be specific (mention actual city names, route names from the data)
- End with one actionable recommendation
- Never say "I am an AI" or "As an AI"
- Sound like a real logistics expert

User question: ${userQuestion}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
        },
      }),
    });

    // 3. Handle non-OK responses with detailed logging
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || "Unknown error";
      const errorCode = errorData?.error?.code || response.status;

      console.error(`Gemini API error [${errorCode}]:`, errorMsg);

      // Provide user-friendly messages based on error type
      let userReply = "Connection issue. Please try again.";
      if (errorCode === 429 || errorMsg.includes("RESOURCE_EXHAUSTED")) {
        userReply =
          "API quota exceeded. The free tier has limited requests per minute. Please wait 30 seconds and try again.";
      } else if (errorCode === 400) {
        userReply = "Invalid request format. Please try a different question.";
      } else if (errorCode === 403 || errorMsg.includes("API_KEY")) {
        userReply =
          "API key is invalid or disabled. Check your key at aistudio.google.com/apikey";
      }

      return new Response(
        JSON.stringify({ reply: userReply }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    // 4. Parse the successful response
    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Unable to get response. Please try again.";

    return new Response(
      JSON.stringify({ reply: text }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Gemini fetch error:", error.message);

    return new Response(
      JSON.stringify({
        reply: "Network error connecting to Gemini. Check your internet connection.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}