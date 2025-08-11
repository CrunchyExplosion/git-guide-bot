import { Octokit } from '@octokit/rest';

export interface RepoData {
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
  files: FileData[];
}

export interface FileData {
  name: string;
  path: string;
  content?: string;
  type: 'file' | 'dir';
  size?: number;
}

class GitHubService {
  private octokit: Octokit;

  constructor() {
    // Initialize without token for public repos
    this.octokit = new Octokit();
  }

  parseRepoUrl(url: string): { owner: string; repo: string } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub URL');
    }
    return { owner: match[1], repo: match[2] };
  }

  async getRepoData(url: string): Promise<RepoData> {
    const { owner, repo } = this.parseRepoUrl(url);
    
    try {
      // Get repository information
      const { data: repoInfo } = await this.octokit.rest.repos.get({
        owner,
        repo,
      });

      // Get repository files
      const files = await this.getRepoFiles(owner, repo);

      return {
        name: repoInfo.name,
        owner: repoInfo.owner.login,
        description: repoInfo.description || '',
        language: repoInfo.language || 'Unknown',
        stars: repoInfo.stargazers_count,
        forks: repoInfo.forks_count,
        size: repoInfo.size,
        created_at: repoInfo.created_at,
        updated_at: repoInfo.updated_at,
        topics: repoInfo.topics || [],
        license: repoInfo.license?.name,
        files_count: files.length,
        files,
      };
    } catch (error) {
      console.error('Error fetching repository data:', error);
      throw new Error('Failed to fetch repository data. Make sure the repository exists and is public.');
    }
  }

  private async getRepoFiles(owner: string, repo: string, path = ''): Promise<FileData[]> {
    try {
      const { data: contents } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });

      const files: FileData[] = [];
      const items = Array.isArray(contents) ? contents : [contents];

      for (const item of items) {
        if (item.type === 'file') {
          // Only get content for important/readable files
          const shouldGetContent = this.shouldProcessFile(item.name);
          let content: string | undefined;

          if (shouldGetContent && item.size && item.size < 100000) { // Max 100KB
            try {
              const { data: fileData } = await this.octokit.rest.repos.getContent({
                owner,
                repo,
                path: item.path,
              });

              if ('content' in fileData && fileData.content) {
                content = atob(fileData.content);
              }
            } catch (error) {
              console.warn(`Failed to get content for ${item.path}:`, error);
            }
          }

          files.push({
            name: item.name,
            path: item.path,
            content,
            type: 'file',
            size: item.size,
          });
        } else if (item.type === 'dir' && this.shouldProcessDirectory(item.name)) {
          // Recursively get files from important directories
          try {
            const subFiles = await this.getRepoFiles(owner, repo, item.path);
            files.push(...subFiles);
          } catch (error) {
            console.warn(`Failed to get contents of directory ${item.path}:`, error);
          }
        }
      }

      return files;
    } catch (error) {
      console.error(`Error getting repository files from path ${path}:`, error);
      return [];
    }
  }

  private shouldProcessFile(filename: string): boolean {
    const importantExtensions = [
      '.md', '.txt', '.json', '.yml', '.yaml',
      '.js', '.ts', '.jsx', '.tsx', '.py', '.go',
      '.java', '.cpp', '.c', '.h', '.php', '.rb',
      '.rs', '.swift', '.kt', '.scala', '.sh',
      '.dockerfile', '.toml', '.ini', '.cfg'
    ];
    
    const importantFiles = [
      'README', 'LICENSE', 'CHANGELOG', 'CONTRIBUTING',
      'package.json', 'requirements.txt', 'Cargo.toml',
      'pom.xml', 'build.gradle', 'Makefile', 'Dockerfile'
    ];

    const lowerFilename = filename.toLowerCase();
    
    return (
      importantFiles.some(file => lowerFilename.includes(file.toLowerCase())) ||
      importantExtensions.some(ext => lowerFilename.endsWith(ext))
    );
  }

  private shouldProcessDirectory(dirname: string): boolean {
    const importantDirs = ['src', 'lib', 'components', 'pages', 'utils', 'services', 'api', 'tests', 'docs'];
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'target', 'vendor'];
    
    const lowerDirname = dirname.toLowerCase();
    
    return (
      !skipDirs.some(skip => lowerDirname.includes(skip)) &&
      (importantDirs.some(important => lowerDirname.includes(important)) || lowerDirname.length < 20)
    );
  }

  getRepoContext(repoData: RepoData): string {
    const context = `
Repository: ${repoData.owner}/${repoData.name}
Description: ${repoData.description}
Language: ${repoData.language}
Stars: ${repoData.stars}, Forks: ${repoData.forks}
Topics: ${repoData.topics.join(', ')}

Key Files:
${repoData.files
  .filter(file => file.content && file.content.length < 5000)
  .slice(0, 10)
  .map(file => `${file.path}:\n${file.content?.substring(0, 1000)}${file.content && file.content.length > 1000 ? '...' : ''}`)
  .join('\n\n---\n\n')}
    `;
    
    return context;
  }
}

export const githubService = new GitHubService();