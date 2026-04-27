const MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash',
  'gemini-2.5-flash',
]

const MAX_RETRIES = 2
const RETRY_DELAY_MS = 5000

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

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
    
    const requestBody = JSON.stringify({
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

    let lastError = null

    // Retry loop — tries all models, then waits and tries again
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt}, waiting ${RETRY_DELAY_MS}ms...`)
        await delay(RETRY_DELAY_MS)
      }

      for (const model of MODELS) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: requestBody
            }
          )

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            const errMsg = errorData?.error?.message || `Status ${response.status}`
            console.error(`Model ${model} failed (attempt ${attempt}):`, errMsg)
            
            // If quota/rate limited or service unavailable, try next model
            if (response.status === 429 || response.status === 503 ||
                errMsg.includes('quota') || errMsg.includes('limit') || 
                errMsg.includes('unavailable') || errMsg.includes('demand')) {
              lastError = errMsg
              continue
            }
            
            // For other errors, return immediately
            return Response.json({ error: errMsg }, { status: 502 })
          }

          const data = await response.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 
            'Unable to get response. Please try again.'
          
          return Response.json({ reply: text })
          
        } catch (fetchError) {
          console.error(`Model ${model} fetch error (attempt ${attempt}):`, fetchError.message)
          lastError = fetchError.message
          continue
        }
      }
    }

    // All retries exhausted
    return Response.json(
      { error: 'All AI models are temporarily busy. Please wait 30 seconds and try again.' },
      { status: 429 }
    )
    
  } catch (error) {
    console.error('Route error:', error)
    return Response.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    )
  }
}