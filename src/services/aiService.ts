class AIService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.groq.com/openai/v1';

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    localStorage.setItem('groq_api_key', apiKey);
  }

  getApiKey(): string | null {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('groq_api_key');
    }
    return this.apiKey;
  }

  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  async generateResponse(
    prompt: string, 
    repoContext: string, 
    conversationHistory: Array<{ role: string; content: string }> = []
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set');
    }

    const systemPrompt = `You are GitHub Buddy AI, an expert assistant that helps developers understand GitHub repositories. You have been provided with context about a specific repository including its structure, key files, and metadata.

Repository Context:
${repoContext}

Your role is to:
1. Answer questions about the repository's architecture, functionality, and purpose
2. Explain code snippets and their functionality
3. Help beginners understand how to get started with the project
4. Provide insights about best practices used in the code
5. Suggest improvements or point out interesting patterns

Be conversational, helpful, and provide code examples when relevant. If you're not sure about something, say so rather than guessing.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: prompt }
    ];

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response. Please try again.';
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error('Failed to generate response. Please check your API key and try again.');
    }
  }
}

export const aiService = new AIService();