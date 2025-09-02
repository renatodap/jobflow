#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(process.cwd(), 'docs');
const TOC_FILE = path.join(DOCS_DIR, 'README.md');

function getAllMarkdownFiles(dir, baseDir = dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath, baseDir));
    } else if (item.endsWith('.md') && item !== 'README.md') {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }
  
  return files;
}

function extractFrontMatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!frontMatterMatch) {
    return {};
  }
  
  const frontMatter = {};
  frontMatterMatch[1].split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length > 0) {
      frontMatter[key.trim()] = valueParts.join(':').trim();
    }
  });
  
  return frontMatter;
}

function extractTitle(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Try to extract from front matter first
  const frontMatter = extractFrontMatter(filePath);
  if (frontMatter.title) {
    return frontMatter.title.replace(/['"]/g, '');
  }
  
  // Fall back to first H1
  const titleMatch = content.match(/^# (.+)$/m);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  // Fall back to filename
  return path.basename(filePath, '.md').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function groupFilesByDirectory(files) {
  const groups = {};
  
  files.forEach(file => {
    const dir = path.dirname(file);
    const dirName = dir === '.' ? 'Root' : path.basename(dir);
    
    if (!groups[dirName]) {
      groups[dirName] = [];
    }
    
    groups[dirName].push(file);
  });
  
  return groups;
}

function generateTOC() {
  if (!fs.existsSync(DOCS_DIR)) {
    console.error('❌ docs/ directory not found');
    process.exit(1);
  }
  
  const files = getAllMarkdownFiles(DOCS_DIR);
  console.log(`📚 Found ${files.length} documentation files`);
  
  const groups = groupFilesByDirectory(files);
  const sortedDirNames = Object.keys(groups).sort();
  
  let toc = `# StudySharper Documentation\n\n`;
  toc += `*Auto-generated table of contents - ${new Date().toISOString().split('T')[0]}*\n\n`;
  toc += `## Overview\n\n`;
  toc += `This documentation provides comprehensive guidance for developing and using StudySharper, `;
  toc += `an AI-powered study assistant that helps students optimize their learning through `;
  toc += `personalized study plans, spaced repetition, and intelligent recommendations.\n\n`;
  
  let totalFiles = 0;
  
  sortedDirNames.forEach(dirName => {
    const dirFiles = groups[dirName].sort();
    
    if (dirFiles.length === 0) return;
    
    // Create section header
    const sectionTitle = dirName.replace(/^\d+-/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    toc += `## ${sectionTitle}\n\n`;
    
    dirFiles.forEach(file => {
      const fullPath = path.join(DOCS_DIR, file);
      const title = extractTitle(fullPath);
      const relativePath = file.replace(/\\/g, '/'); // Ensure forward slashes for URLs
      
      toc += `- [${title}](./${relativePath})\n`;
      totalFiles++;
    });
    
    toc += `\n`;
  });
  
  toc += `## Documentation Statistics\n\n`;
  toc += `- **Total files**: ${totalFiles}\n`;
  toc += `- **Categories**: ${sortedDirNames.length}\n`;
  toc += `- **Last updated**: ${new Date().toISOString()}\n\n`;
  
  toc += `## Contributing\n\n`;
  toc += `To add or update documentation:\n\n`;
  toc += `1. Create or edit Markdown files in the appropriate \`docs/\` subdirectory\n`;
  toc += `2. Use front matter to specify metadata (optional):\n`;
  toc += `   \`\`\`yaml\n`;
  toc += `   ---\n`;
  toc += `   title: "Your Document Title"\n`;
  toc += `   id: unique-id\n`;
  toc += `   status: draft|accepted|deprecated\n`;
  toc += `   ---\n`;
  toc += `   \`\`\`\n`;
  toc += `3. Run \`pnpm docs:toc\` to regenerate this table of contents\n\n`;
  
  toc += `## Quick Navigation\n\n`;
  toc += `- **Getting Started**: See [Next Steps](./16-autonomy/next-steps.md)\n`;
  toc += `- **Architecture**: Review [ERD](./06-domain-model/erd.md) and [AI Architecture](./08-ai/architecture.md)\n`;
  toc += `- **Development**: Check [Stack Decisions](./02-decisions/stack.md) and [Testing Strategy](./12-testing/strategy.md)\n`;
  toc += `- **Security**: Read [RLS Policies](./07-rls/policies.md)\n`;
  
  fs.writeFileSync(TOC_FILE, toc);
  
  console.log(`✅ Generated table of contents with ${totalFiles} files`);
  console.log(`📄 Saved to: ${TOC_FILE}`);
}

generateTOC();