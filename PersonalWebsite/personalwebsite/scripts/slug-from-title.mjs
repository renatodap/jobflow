#!/usr/bin/env node

/**
 * Generate URL-safe slugs from titles
 * Usage: node slug-from-title.mjs "Your Blog Post Title"
 */

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start
    .replace(/-+$/, '');          // Trim - from end
}

function generateDatePath() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
}

function generateFullPath(title) {
  const slug = slugify(title);
  const datePath = generateDatePath();
  return {
    slug,
    datePath,
    fullPath: `blog/${datePath}/${slug}`,
    fileName: `${slug}.mdx`,
    contentPath: `content/posts/${datePath}/${slug}.mdx`
  };
}

// CLI usage
if (process.argv[2]) {
  const title = process.argv[2];
  const paths = generateFullPath(title);
  
  console.log('Generated paths:');
  console.log('================');
  console.log(`Slug:         ${paths.slug}`);
  console.log(`URL:          /${paths.fullPath}`);
  console.log(`File:         ${paths.contentPath}`);
  console.log(`\nFront-matter slug field:`);
  console.log(`slug: "${paths.fullPath}"`);
} else {
  console.log('Usage: node slug-from-title.mjs "Your Blog Post Title"');
  console.log('\nExamples:');
  console.log('  node slug-from-title.mjs "How to Use AI Tools Effectively"');
  console.log('  node slug-from-title.mjs "The 10-Minute Stop Rule"');
}

export { slugify, generateDatePath, generateFullPath };