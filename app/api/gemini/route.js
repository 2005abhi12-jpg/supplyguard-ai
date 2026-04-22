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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
            maxOutputTokens: 300
          }
        })
      }
    )
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', response.status, errorData)
      return Response.json(
        { error: `API error: ${errorData.error?.message || 'Unknown error'}` },
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