import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, ExternalLink, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { aiService } from '@/services/aiService';

interface ApiKeySetupProps {
  onApiKeySet: () => void;
}

export const ApiKeySetup = ({ onApiKeySet }: ApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const { toast } = useToast();

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter your Groq API key",
        variant: "destructive",
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const isValidKey = await aiService.testApiKey(apiKey);
      
      if (isValidKey) {
        aiService.setApiKey(apiKey);
        setIsValid(true);
        toast({
          title: "Success",
          description: "API key validated and saved successfully!",
        });
        setTimeout(() => {
          onApiKeySet();
        }, 1000);
      } else {
        toast({
          title: "Invalid API Key",
          description: "The API key you entered is not valid. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      toast({
        title: "Validation Error",
        description: "Failed to validate API key. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-card">
      <Card className="w-full max-w-md glow-on-hover border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent">
              <Key className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Setup Required
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Enter your Groq API key to enable AI-powered repository analysis
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-border/50 bg-muted/50">
            <AlertDescription className="text-sm">
              Get your free API key from{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline inline-flex items-center"
              >
                Groq Console
                <ExternalLink className="ml-1 h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span>Groq API Key</span>
            </div>
            <Input
              type="password"
              placeholder="gsk_..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm bg-input/50 border-border/50 focus:border-primary/50"
              disabled={isValidating || isValid}
            />
          </div>

          <Button
            onClick={handleValidateAndSave}
            disabled={isValidating || !apiKey.trim() || isValid}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : isValid ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Valid! Starting...
              </>
            ) : (
              'Validate & Continue'
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>Your API key is stored locally and never shared.</p>
            <p>Groq offers free API access with generous rate limits.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};