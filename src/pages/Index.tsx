import { useState, useEffect } from 'react';
import { RepoInput } from '@/components/RepoInput';
import { RepoOverview } from '@/components/RepoOverview';
import { ChatInterface } from '@/components/ChatInterface';
import { ApiKeySetup } from '@/components/ApiKeySetup';
import { githubService, type RepoData } from '@/services/githubService';
import { aiService } from '@/services/aiService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);
  const { toast } = useToast();

  useEffect(() => {
    const apiKey = aiService.getApiKey();
    setHasApiKey(!!apiKey);
  }, []);

  const handleApiKeySet = () => {
    setHasApiKey(true);
  };

  const handleRepoSubmit = async (url: string) => {
    setIsLoading(true);
    try {
      const data = await githubService.getRepoData(url);
      setRepoData(data);
      setConversationHistory([]); // Reset conversation for new repo
      
      toast({
        title: "Repository Analyzed",
        description: `Successfully analyzed ${data.owner}/${data.name}`,
      });
    } catch (error) {
      console.error('Error analyzing repository:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string): Promise<string> => {
    if (!repoData) {
      throw new Error('No repository data available');
    }

    const repoContext = githubService.getRepoContext(repoData);
    
    try {
      const response = await aiService.generateResponse(message, repoContext, conversationHistory);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  };

  const handleStartOver = () => {
    setRepoData(null);
    setConversationHistory([]);
  };

  if (!hasApiKey) {
    return <ApiKeySetup onApiKeySet={handleApiKeySet} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-card p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            GitHub Buddy AI
          </h1>
          <p className="text-muted-foreground">
            Understand any GitHub repository through intelligent conversation
          </p>
        </div>

        {!repoData ? (
          /* Repository Input */
          <div className="max-w-2xl mx-auto">
            <RepoInput onRepoSubmit={handleRepoSubmit} isLoading={isLoading} />
          </div>
        ) : (
          /* Repository Analysis View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Repository Overview */}
            <div className="lg:col-span-1 space-y-4">
              <RepoOverview repoData={repoData} />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleStartOver}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border/50 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  Analyze Different Repository
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <ChatInterface
                repoName={`${repoData.owner}/${repoData.name}`}
                repoData={repoData}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;