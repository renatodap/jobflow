#!/usr/bin/env tsx

// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { generateAllEmbeddings, loadAllPosts } from '../lib/embeddings';
import { initializeVectorStore } from '../lib/vector-store';
import fs from 'fs';
import path from 'path';

/**
 * Build-time script to generate embeddings for all MDX content
 * Run this script during build or deployment to populate the vector store
 */
async function main() {
  console.log('🚀 Starting embedding generation for Feel Sharper content...\n');

  try {
    // Check for required environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OPENAI_API_KEY not found - skipping embedding generation');
      console.log('💡 Embeddings can be generated later when API key is available');
      console.log('✅ Build can continue without embeddings for now\n');
      process.exit(0);
    }

    // Load all posts
    console.log('📚 Loading MDX posts...');
    const posts = await loadAllPosts();
    console.log(`✅ Loaded ${posts.length} posts\n`);

    if (posts.length === 0) {
      console.warn('⚠️  No posts found in content/posts directory');
      return;
    }

    // Generate embeddings
    console.log('🧠 Generating embeddings...');
    const postsWithEmbeddings = await generateAllEmbeddings();
    
    // Calculate total chunks
    const totalChunks = postsWithEmbeddings.reduce((sum, post) => sum + post.chunks.length, 0);
    console.log(`✅ Generated embeddings for ${postsWithEmbeddings.length} posts and ${totalChunks} chunks\n`);

    // Initialize vector store
    console.log('🗃️  Initializing vector store...');
    await initializeVectorStore(postsWithEmbeddings);
    console.log('✅ Vector store initialized\n');

    // Save embeddings to file for persistence (optional)
    const embeddingsPath = path.join(process.cwd(), 'data', 'embeddings.json');
    const dataDir = path.dirname(embeddingsPath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(embeddingsPath, JSON.stringify(postsWithEmbeddings, null, 2));
    console.log(`💾 Embeddings saved to: ${embeddingsPath}`);

    // Print summary
    console.log('\n📊 Summary:');
    console.log(`   Posts processed: ${postsWithEmbeddings.length}`);
    console.log(`   Total chunks: ${totalChunks}`);
    console.log(`   Total embeddings: ${postsWithEmbeddings.length + totalChunks}`);
    
    const avgChunksPerPost = totalChunks / postsWithEmbeddings.length;
    console.log(`   Average chunks per post: ${avgChunksPerPost.toFixed(1)}`);

    console.log('\n🎉 Embedding generation complete!');
    console.log('   Your Ask Feel Sharper assistant is ready to serve users.\n');

  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    
    if (error instanceof Error) {
      console.error('   Error details:', error.message);
      
      if (error.message.includes('OPENAI_API_KEY')) {
        console.error('   💡 Make sure your OpenAI API key is set correctly');
      }
      
      if (error.message.includes('rate limit')) {
        console.error('   💡 Consider adding delays between API calls or upgrading your OpenAI plan');
      }
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as generateEmbeddings };
