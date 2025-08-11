import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Star, GitFork, FileText, Users, Calendar } from 'lucide-react';

interface RepoData {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  size: number;
  created_at: string;
  updated_at: string;
  topics: string[];
  license?: string;
  files_count: number;
}

interface RepoOverviewProps {
  repoData: RepoData;
}

export const RepoOverview = ({ repoData }: RepoOverviewProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {repoData.owner}/{repoData.name}
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs">
            {repoData.language}
          </Badge>
        </div>
        {repoData.description && (
          <p className="text-muted-foreground text-sm">{repoData.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Repository Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2 text-sm">
            <Star className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Stars:</span>
            <span className="font-semibold">{formatNumber(repoData.stars)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <GitFork className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">Forks:</span>
            <span className="font-semibold">{formatNumber(repoData.forks)}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="h-4 w-4 text-secondary" />
            <span className="text-muted-foreground">Files:</span>
            <span className="font-semibold">{repoData.files_count}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">Size:</span>
            <span className="font-semibold">{(repoData.size / 1024).toFixed(1)} MB</span>
          </div>
        </div>

        {/* Topics */}
        {repoData.topics && repoData.topics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Topics</h4>
            <div className="flex flex-wrap gap-2">
              {repoData.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Created:</span>
            <span>{formatDate(repoData.created_at)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <GitBranch className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Updated:</span>
            <span>{formatDate(repoData.updated_at)}</span>
          </div>
        </div>

        {repoData.license && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">License:</span>
              <Badge variant="secondary" className="text-xs">
                {repoData.license}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};