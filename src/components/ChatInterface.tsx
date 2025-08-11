import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatInterfaceProps {
  repoName: string;
  repoData: any;
  onSendMessage: (message: string) => Promise<string>;
}

export const ChatInterface = ({ repoName, repoData, onSendMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hi! I've analyzed the repository "${repoName}". You can ask me questions about the codebase, architecture, functionality, or anything else you'd like to understand. What would you like to know?`,
      role: 'assistant',
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: currentMessage,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);

    try {
      const response = await onSendMessage(currentMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    "What does this repository do?",
    "Explain the main architecture",
    "How do I get started?",
    "What are the key files to understand?",
  ];

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center space-x-2">
          <Bot className="h-5 w-5 text-primary" />
          <span>Chat with GitHub Buddy</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <ScrollArea className="h-96 custom-scrollbar" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-accent' 
                    : 'bg-secondary'
                }`}>
                  {message.role === 'user' ? (
                    <User className="h-4 w-4 text-primary-foreground" />
                  ) : (
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  )}
                </div>
                <div className={`flex-1 max-w-[80%] ${
                  message.role === 'user' ? 'text-right' : ''
                }`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <div className="inline-block p-3 rounded-lg bg-secondary text-secondary-foreground">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Suggested Questions */}
        {messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground font-medium">Suggested questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-left justify-start h-auto p-2 text-xs"
                  onClick={() => setCurrentMessage(question)}
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder="Ask anything about this repository..."
            disabled={isLoading}
            className="flex-1 bg-input/50 border-border/50 focus:border-primary/50"
          />
          <Button
            type="submit"
            disabled={!currentMessage.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};