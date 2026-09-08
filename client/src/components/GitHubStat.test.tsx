import { describe, expect, it } from 'vitest';
import { parseRepoUrl } from './GitHubStat';

describe('parseRepoUrl', () => {
  it('extracts owner and repo from a normal URL', () => {
    expect(parseRepoUrl('https://github.com/Bryantooyah/50003Project')).toEqual({
      owner: 'Bryantooyah',
      repo: '50003Project',
    });
  });

  it('tolerates a trailing slash and a .git suffix', () => {
    expect(parseRepoUrl('https://github.com/Bryantooyah/SaveNow-Mobile-App/')).toEqual({
      owner: 'Bryantooyah',
      repo: 'SaveNow-Mobile-App',
    });
    // The old site linked repos this way.
    expect(parseRepoUrl('https://github.com/Bryantooyah/Bryan-and-Tan-Pang-Topic-2.git')).toEqual({
      owner: 'Bryantooyah',
      repo: 'Bryan-and-Tan-Pang-Topic-2',
    });
  });

  it('returns null for anything that is not a GitHub repo URL', () => {
    expect(parseRepoUrl(null)).toBeNull();
    expect(parseRepoUrl('')).toBeNull();
    expect(parseRepoUrl('https://gitlab.com/someone/thing')).toBeNull();
    expect(parseRepoUrl('https://github.com/Bryantooyah')).toBeNull();
  });
});
