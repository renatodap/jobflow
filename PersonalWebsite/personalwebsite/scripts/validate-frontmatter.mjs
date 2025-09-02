#!/usr/bin/env node

/**
 * Validate MDX frontmatter without external dependencies
 * Usage: node validate-frontmatter.mjs [file.mdx]
 */

import fs from 'fs';
import path from 'path';

const REQUIRED_FIELDS = [
  'title',
  'slug', 
  'date',
  'briefId',
  'postType',
  'tags',
  'summary',
  'coverImage',
  'readingTime',
  'sources',
  'similarityGuardrail'
];

const POST_TYPES = ['T1', 'T2', 'T3', 'T4', 'T5'];

function extractFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  
  const frontmatter = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Handle arrays
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(v => v.trim().replace(/['"]/g, ''));
    } else {
      // Remove quotes
      value = value.replace(/^['"]|['"]$/g, '');
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

function validateFrontmatter(frontmatter, filePath) {
  const errors = [];
  const warnings = [];
  
  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }
  
  // Validate postType
  if (frontmatter.postType && !POST_TYPES.includes(frontmatter.postType)) {
    errors.push(`Invalid postType: ${frontmatter.postType}. Must be one of: ${POST_TYPES.join(', ')}`);
  }
  
  // Validate date format
  if (frontmatter.date && !/^\d{4}-\d{2}-\d{2}$/.test(frontmatter.date)) {
    errors.push(`Invalid date format: ${frontmatter.date}. Expected: YYYY-MM-DD`);
  }
  
  // Validate slug format
  if (frontmatter.slug && !/^blog\/\d{4}\/\d{2}\/[\w-]+$/.test(frontmatter.slug)) {
    warnings.push(`Unusual slug format: ${frontmatter.slug}. Expected: blog/yyyy/mm/slug-name`);
  }
  
  // Validate reading time
  if (frontmatter.readingTime && isNaN(parseInt(frontmatter.readingTime))) {
    errors.push(`Reading time must be a number, got: ${frontmatter.readingTime}`);
  }
  
  // Check similarity guardrail
  if (frontmatter.similarityGuardrail && !frontmatter.similarityGuardrail.includes('25%')) {
    warnings.push(`Similarity guardrail should mention "≤25%" limit`);
  }
  
  // Check tags is array
  if (frontmatter.tags && !Array.isArray(frontmatter.tags)) {
    errors.push(`Tags must be an array, got: ${typeof frontmatter.tags}`);
  }
  
  return { errors, warnings };
}

function validateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return false;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const frontmatter = extractFrontmatter(content);
  
  if (!frontmatter) {
    console.error(`No frontmatter found in ${filePath}`);
    return false;
  }
  
  const { errors, warnings } = validateFrontmatter(frontmatter, filePath);
  
  console.log(`\nValidating: ${filePath}`);
  console.log('=' .repeat(50));
  
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ All checks passed!');
    return true;
  }
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  return errors.length === 0;
}

// CLI usage
if (process.argv[2]) {
  const filePath = path.resolve(process.argv[2]);
  const isValid = validateFile(filePath);
  process.exit(isValid ? 0 : 1);
} else {
  // Validate all MDX files in content/posts
  const postsDir = path.join(process.cwd(), 'content', 'posts');
  
  if (fs.existsSync(postsDir)) {
    console.log('Validating all posts in content/posts/...\n');
    
    function walkDir(dir) {
      const files = fs.readdirSync(dir);
      
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          walkDir(fullPath);
        } else if (file.endsWith('.mdx')) {
          validateFile(fullPath);
        }
      }
    }
    
    walkDir(postsDir);
  } else {
    console.log('Usage: node validate-frontmatter.mjs [file.mdx]');
    console.log('\nOr run without arguments to validate all posts');
  }
}

export { extractFrontmatter, validateFrontmatter };