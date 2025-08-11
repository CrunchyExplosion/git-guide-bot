import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GitBranch, Github, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RepoInputProps {
  onRepoSubmit: (url: string) => void;
  isLoading: boolean;
}

export const RepoInput = ({ onRepoSubmit, isLoading }: RepoInputProps) => {
  const [repoUrl, setRepoUrl] = useState('');
  const { toast } = useToast();

  const validateGitHubUrl = (url: string) => {
    const githubPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubPattern.test(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a GitHub repository URL",
        variant: "destructive",
      });
      return;
    }

    if (!validateGitHubUrl(repoUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid GitHub repository URL (e.g., https://github.com/user/repo)",
        variant: "destructive",
      });
      return;
    }

    onRepoSubmit(repoUrl);
  };

  return (
    <Card className="glow-on-hover border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary to-accent">
            <Github className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          GitHub Buddy AI
        </CardTitle>
        <p className="text-muted-foreground">
          Understand any GitHub repository through intelligent conversation
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <GitBranch className="h-4 w-4" />
              <span>Repository URL</span>
            </div>
            <Input
              type="url"
              placeholder="https://github.com/user/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="font-mono text-sm bg-input/50 border-border/50 focus:border-primary/50 transition-colors"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading || !repoUrl.trim()}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing Repository...
              </>
            ) : (
              'Analyze Repository'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};