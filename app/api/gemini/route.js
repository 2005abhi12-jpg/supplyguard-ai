export async function POST(request) {
  try {
    const { messages, supplyChainContext } = await request.json()
    
    const apiKey = process.env.GEMINI_API_KEY
    
    if (!apiKey || apiKey === 'your_key_here') {
      return Response.json(
        { error: 'GEMINI_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const lastMessage = messages[messages.length - 1]
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{
                text: `You are SupplyGuard AI, a professional 
supply chain risk advisor.
              
Current supply chain data:
${supplyChainContext}

Rules:
- Respond in clear bullet points
- Keep responses under 120 words
- Mention actual city names from the data
- End with one actionable recommendation
- Sound like a real logistics expert

User question: ${lastMessage.content}`
              }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Gemini API error:', response.status, errorData)
      const errMsg = errorData?.error?.message || `API returned status ${response.status}`
      return Response.json(
        { error: errMsg },
        { status: 502 }
      )
    }
    
    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      'Unable to get response. Please try again.'
    
    return Response.json({ reply: text })
    
  } catch (error) {
    console.error('Route error:', error)
    return Response.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}