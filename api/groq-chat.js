// api/groq-chat.js
// Vercel Serverless Function for Groq API Integration

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Groq API key
    const GROQ_API_KEY = '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';

    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not set');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // System prompt for Crest Point Support
    const systemPrompt = {
      role: 'system',
      content: `You are a helpful and professional customer support assistant for Crest Point, an investment platform. Your role is to:

1. Help users understand investment plans and opportunities
2. Guide users through account management and transactions
3. Answer questions about withdrawals, deposits, and fund management
4. Explain security features and account safety measures
5. Provide information about returns, profits, and investment durations
6. Be friendly, concise, and professional

Key Information about Crest Point:
- Multiple investment plans with varying durations and returns (5%-25%)
- Secure platform with bank-level encryption and 2FA
- Withdrawals processed within 24-48 hours
- 24/7 customer support available
- Investment tracking and portfolio management features

Always be helpful, clear, and encourage users to reach out to support for account-specific issues. Keep responses concise and actionable.`
    };

    // Prepare messages for Groq API
    const messages = [
      systemPrompt,
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message }
    ];

    // Call Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast and capable model
        messages: messages,
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content;

    if (!assistantMessage) {
      throw new Error('No response from Groq API');
    }

    return res.status(200).json({
      response: assistantMessage,
      success: true
    });

  } catch (error) {
    console.error('Error in groq-chat handler:', error);
    return res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
      success: false
    });
  }
      }
