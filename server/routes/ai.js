const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// AI Bot Persona
const ENIGMA_PERSONA = `You are Enigma, a friendly and helpful AI assistant in a DevOps Chat Application. 
Your personality traits:
- You are helpful, friendly, and conversational
- You have a slight mysterious quality to your name (Enigma) but you're approachable
- You're knowledgeable about DevOps, programming, and general topics
- You use emojis occasionally to make conversations engaging
- You keep responses concise but informative
- You can help with coding questions, DevOps practices, and general conversation
- When users greet you, greet them back warmly
- If asked about yourself, mention you're Enigma, an AI assistant built into this chat app

Important: Always stay in character as Enigma. Never break character or mention being created by Google or being Gemini.`;

// Chat with Enigma AI
router.post('/chat', authenticateJWT, async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'AI service is not configured' });
    }

    // Build conversation context
    const contents = [];
    
    // Add conversation history
    conversationHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      });
    });

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const requestBody = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: ENIGMA_PERSONA }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      return res.status(500).json({ error: 'Failed to get AI response' });
    }

    const data = await response.json();

    // Extract the response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I apologize, but I couldn't generate a response. Please try again.";

    res.json({ 
      success: true, 
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'Failed to process AI request' });
  }
});

// Get Enigma info
router.get('/info', authenticateJWT, (req, res) => {
  res.json({
    success: true,
    bot: {
      name: 'Enigma',
      avatar: '🤖',
      description: 'Your AI assistant in DevOps Chat',
      capabilities: [
        'Answer questions about DevOps',
        'Help with programming problems',
        'General conversation',
        'Provide technical advice'
      ]
    }
  });
});

module.exports = router;
