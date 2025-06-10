/**
 * GRID OS: Claude API Endpoint
 * 
 * This endpoint handles Claude API requests from the GRID OS Claude Network system.
 */

import type { APIRoute } from 'astro';

interface ClaudeAPIRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  model: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  currentMood?: string;
  context?: string[];
}

interface ClaudeAPIResponse {
  message: {
    role: 'assistant';
    content: string;
  };
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  sentiment?: {
    type: string;
    score: number;
  };
  intent?: {
    type: string;
    confidence: number;
  };
  suggestedResponses?: string[];
  mood?: string;
  confidence?: number;
  emotions?: Record<string, number>;
  effects?: Array<{
    type: string;
    intensity: number;
    color?: string;
  }>;
  bpm?: number;
  nextBeat?: number;
  safe?: boolean;
  intervention?: string | null;
  ideas?: string[];
  creativity?: number;
  traits?: Record<string, number>;
  preferences?: Record<string, any>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body: ClaudeAPIRequest = await request.json();
    
    // Validate required fields
    if (!body.messages || !Array.isArray(body.messages)) {
      return new Response(JSON.stringify({ error: 'Messages array is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!body.model) {
      return new Response(JSON.stringify({ error: 'Model is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get Claude API key from environment
    const claudeApiKey = process.env.CLAUDE_API_KEY || import.meta.env.CLAUDE_API_KEY;
    if (!claudeApiKey) {
      console.error('Claude API key not found in environment variables');
      return new Response(JSON.stringify({ error: 'Claude API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prepare the request to Claude API
    const claudeRequest = {
      model: body.model,
      max_tokens: body.maxTokens || 1000,
      temperature: body.temperature || 0.7,
      messages: body.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    };

    // Add system message if provided
    if (body.systemPrompt) {
      claudeRequest.messages.unshift({
        role: 'system',
        content: body.systemPrompt
      });
    }

    // Make request to Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(claudeRequest)
    });

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      
      return new Response(JSON.stringify({ 
        error: `Claude API error: ${claudeResponse.status}`,
        details: errorText
      }), {
        status: claudeResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const claudeData = await claudeResponse.json();
    
    // Extract the response content
    const responseContent = claudeData.content?.[0]?.text || claudeData.message?.content || '';
    
    // Create enhanced response with additional analysis
    const response: ClaudeAPIResponse = {
      message: {
        role: 'assistant',
        content: responseContent
      },
      usage: {
        inputTokens: claudeData.usage?.input_tokens || 0,
        outputTokens: claudeData.usage?.output_tokens || 0
      }
    };

    // Add context-specific enhancements based on current mood and content
    if (body.currentMood) {
      response.sentiment = analyzeSentiment(responseContent, body.currentMood);
      response.intent = analyzeIntent(responseContent);
      response.suggestedResponses = generateSuggestedResponses(responseContent, body.currentMood);
    }

    // Add agent-specific analysis based on system prompt
    if (body.systemPrompt) {
      if (body.systemPrompt.includes('mood analyzer')) {
        response.mood = extractMood(responseContent);
        response.confidence = 0.8;
        response.emotions = extractEmotions(responseContent);
      } else if (body.systemPrompt.includes('beat matcher')) {
        response.bpm = extractBPM(responseContent);
        response.nextBeat = Date.now() + (60000 / (response.bpm || 120));
        response.confidence = 0.7;
      } else if (body.systemPrompt.includes('effects director')) {
        response.effects = extractEffects(responseContent);
      } else if (body.systemPrompt.includes('vibe protector')) {
        response.safe = !containsUnsafeContent(responseContent);
        response.intervention = response.safe ? null : 'Content may need moderation';
      } else if (body.systemPrompt.includes('creative spark')) {
        response.ideas = extractIdeas(responseContent);
        response.creativity = 0.8;
      } else if (body.systemPrompt.includes('personality core')) {
        response.traits = extractPersonalityTraits(responseContent);
        response.preferences = extractPreferences(responseContent);
      }
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in Claude API endpoint:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Helper functions for content analysis

function analyzeSentiment(content: string, mood: string): { type: string; score: number } {
  const positiveWords = ['happy', 'great', 'awesome', 'love', 'amazing', 'wonderful', 'excellent'];
  const negativeWords = ['sad', 'bad', 'terrible', 'hate', 'awful', 'horrible', 'disgusting'];
  
  const lowerContent = content.toLowerCase();
  let score = 0;
  
  positiveWords.forEach(word => {
    if (lowerContent.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerContent.includes(word)) score -= 0.1;
  });
  
  // Adjust based on current mood
  if (mood === 'euphoric') score += 0.2;
  else if (mood === 'sad') score -= 0.2;
  
  score = Math.max(-1, Math.min(1, score));
  
  let type = 'neutral';
  if (score > 0.3) type = 'positive';
  else if (score < -0.3) type = 'negative';
  
  return { type, score };
}

function analyzeIntent(content: string): { type: string; confidence: number } {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('?')) return { type: 'question', confidence: 0.8 };
  if (lowerContent.includes('play') || lowerContent.includes('music')) return { type: 'music_request', confidence: 0.7 };
  if (lowerContent.includes('color') || lowerContent.includes('effect')) return { type: 'visual_request', confidence: 0.7 };
  if (lowerContent.includes('beat') || lowerContent.includes('drop')) return { type: 'beat_request', confidence: 0.7 };
  
  return { type: 'general', confidence: 0.5 };
}

function generateSuggestedResponses(content: string, mood: string): string[] {
  const responses = [];
  
  if (mood === 'euphoric') {
    responses.push('The energy is incredible! 🔥');
    responses.push('Let\'s keep this vibe going! ⚡');
  } else if (mood === 'zen') {
    responses.push('Finding the perfect flow 🌊');
    responses.push('Harmony in motion ✨');
  }
  
  responses.push('What would you like to see next?');
  responses.push('The grid is responding beautifully! 💫');
  
  return responses.slice(0, 3);
}

function extractMood(content: string): string {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('euphoric') || lowerContent.includes('ecstatic')) return 'euphoric';
  if (lowerContent.includes('chaotic') || lowerContent.includes('frenzied')) return 'chaotic';
  if (lowerContent.includes('sad') || lowerContent.includes('melancholy')) return 'sad';
  if (lowerContent.includes('aggressive') || lowerContent.includes('intense')) return 'aggressive';
  if (lowerContent.includes('zen') || lowerContent.includes('peaceful')) return 'zen';
  
  return 'neutral';
}

function extractEmotions(content: string): Record<string, number> {
  const emotions: Record<string, number> = {
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    neutral: 0.5
  };
  
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('happy') || lowerContent.includes('joy')) emotions.happy = 0.8;
  if (lowerContent.includes('sad') || lowerContent.includes('sorrow')) emotions.sad = 0.8;
  if (lowerContent.includes('angry') || lowerContent.includes('rage')) emotions.angry = 0.8;
  if (lowerContent.includes('surprise') || lowerContent.includes('shock')) emotions.surprised = 0.8;
  
  return emotions;
}

function extractBPM(content: string): number {
  const bpmMatch = content.match(/(\d+)\s*bpm/i);
  if (bpmMatch) return parseInt(bpmMatch[1]);
  
  // Default BPM based on content hints
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('fast') || lowerContent.includes('quick')) return 140;
  if (lowerContent.includes('slow') || lowerContent.includes('chill')) return 80;
  
  return 120; // Default
}

function extractEffects(content: string): Array<{ type: string; intensity: number; color?: string }> {
  const effects: Array<{ type: string; intensity: number; color?: string }> = [];
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('ripple')) {
    effects.push({ type: 'ripple', intensity: 0.7 });
  }
  if (lowerContent.includes('flash') || lowerContent.includes('strobe')) {
    effects.push({ type: 'flash', intensity: 0.8 });
  }
  if (lowerContent.includes('wave')) {
    effects.push({ type: 'wave', intensity: 0.6 });
  }
  
  // Extract colors
  const colorMatch = content.match(/#[0-9a-f]{6}/i);
  if (colorMatch && effects.length > 0) {
    effects[0].color = colorMatch[0];
  }
  
  return effects;
}

function containsUnsafeContent(content: string): boolean {
  const unsafeWords = ['spam', 'scam', 'phishing', 'malware', 'virus'];
  const lowerContent = content.toLowerCase();
  
  return unsafeWords.some(word => lowerContent.includes(word));
}

function extractIdeas(content: string): string[] {
  const ideas: string[] = [];
  const sentences = content.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    const trimmed = sentence.trim();
    if (trimmed.length > 10 && (
      trimmed.includes('could') || 
      trimmed.includes('might') || 
      trimmed.includes('suggest') ||
      trimmed.includes('idea')
    )) {
      ideas.push(trimmed);
    }
  });
  
  return ideas.slice(0, 3);
}

function extractPersonalityTraits(content: string): Record<string, number> {
  const traits: Record<string, number> = {
    extraversion: 0.5,
    agreeableness: 0.5,
    conscientiousness: 0.5,
    neuroticism: 0.5,
    openness: 0.5
  };
  
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('outgoing') || lowerContent.includes('social')) traits.extraversion = 0.8;
  if (lowerContent.includes('kind') || lowerContent.includes('helpful')) traits.agreeableness = 0.8;
  if (lowerContent.includes('organized') || lowerContent.includes('careful')) traits.conscientiousness = 0.8;
  if (lowerContent.includes('anxious') || lowerContent.includes('worried')) traits.neuroticism = 0.8;
  if (lowerContent.includes('creative') || lowerContent.includes('curious')) traits.openness = 0.8;
  
  return traits;
}

function extractPreferences(content: string): Record<string, any> {
  const preferences: Record<string, any> = {};
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('techno')) preferences.musicGenre = 'techno';
  if (lowerContent.includes('house')) preferences.musicGenre = 'house';
  if (lowerContent.includes('trance')) preferences.musicGenre = 'trance';
  
  if (lowerContent.includes('blue')) preferences.favoriteColor = 'blue';
  if (lowerContent.includes('red')) preferences.favoriteColor = 'red';
  if (lowerContent.includes('green')) preferences.favoriteColor = 'green';
  
  return preferences;
}
