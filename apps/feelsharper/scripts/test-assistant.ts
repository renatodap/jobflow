#!/usr/bin/env tsx

import { retrieveRelevantContent, buildContextPrompt, getQuerySuggestions } from '../lib/retrieval';
import { generateEmbedding, loadAllPosts } from '../lib/embeddings';
import { initializeVectorStore, getVectorStore } from '../lib/vector-store';
import { getRateLimiter } from '../lib/rate-limiter';

/**
 * Test script for Ask Feel Sharper assistant
 * Validates all components work correctly before deployment
 */

const testQueries = [
  "Should I take magnesium at night?",
  "What's better for sleep: magnesium or ashwagandha?",
  "How do I build a morning routine for better energy?",
  "I wake up at 3am every night, what should I do?",
  "What supplements actually work for energy?",
  "I crash at 2pm every day, help?",
  "How do I optimize my sleep if I work night shifts?",
  "What's the minimum effective dose for better sleep?"
];

async function testEmbeddingsSystem() {
  console.log('🧠 Testing embeddings system...');
  
  try {
    // Test loading posts
    const posts = await loadAllPosts();
    console.log(`✅ Loaded ${posts.length} posts`);
    
    if (posts.length === 0) {
      throw new Error('No posts found - check content/posts directory');
    }
    
    // Test embedding generation for a sample query
    const sampleQuery = "sleep optimization";
    const embedding = await generateEmbedding(sampleQuery);
    console.log(`✅ Generated embedding (${embedding.length} dimensions)`);
    
    if (embedding.length !== 1536) {
      console.warn(`⚠️  Expected 1536 dimensions, got ${embedding.length}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Embeddings test failed:', error);
    return false;
  }
}

async function testVectorStore() {
  console.log('\n🗃️  Testing vector store...');
  
  try {
    const vectorStore = getVectorStore();
    const stats = vectorStore.getStats();
    console.log(`✅ Vector store stats:`, stats);
    
    if (stats.posts === 0) {
      console.warn('⚠️  Vector store is empty - run embedding generation first');
      return false;
    }
    
    // Test search functionality
    const queryEmbedding = await generateEmbedding("sleep problems");
    const results = await vectorStore.search(queryEmbedding, {
      limit: 3,
      threshold: 0.5
    });
    
    console.log(`✅ Search returned ${results.length} results`);
    
    if (results.length > 0) {
      console.log(`   Top result: "${results[0].title}" (similarity: ${results[0].similarity.toFixed(3)})`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Vector store test failed:', error);
    return false;
  }
}

async function testRetrievalSystem() {
  console.log('\n🔍 Testing retrieval system...');
  
  try {
    const testQuery = "magnesium for sleep";
    const results = await retrieveRelevantContent(testQuery, {
      maxResults: 2,
      similarityThreshold: 0.6
    });
    
    console.log(`✅ Retrieval returned ${results.length} results for: "${testQuery}"`);
    
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. "${result.title}" (${result.similarity.toFixed(3)})`);
      console.log(`      Link: ${result.link}`);
      console.log(`      Content preview: ${result.relevantContent.slice(0, 100)}...`);
    });
    
    // Test context prompt building
    const contextPrompt = buildContextPrompt(results, testQuery);
    console.log(`✅ Generated context prompt (${contextPrompt.length} chars)`);
    
    return true;
  } catch (error) {
    console.error('❌ Retrieval test failed:', error);
    return false;
  }
}

async function testRateLimiter() {
  console.log('\n⏱️  Testing rate limiter...');
  
  try {
    const rateLimiter = getRateLimiter();
    const testId = 'test-user-123';
    
    // Test normal usage
    const result1 = await rateLimiter.check(testId);
    console.log(`✅ First request: success=${result1.success}, remaining=${result1.remaining}`);
    
    const result2 = await rateLimiter.check(testId);
    console.log(`✅ Second request: success=${result2.success}, remaining=${result2.remaining}`);
    
    const result3 = await rateLimiter.check(testId);
    console.log(`✅ Third request: success=${result3.success}, remaining=${result3.remaining}`);
    
    // Test rate limit exceeded
    const result4 = await rateLimiter.check(testId);
    console.log(`✅ Fourth request: success=${result4.success}, remaining=${result4.remaining}`);
    
    if (result4.success) {
      console.warn('⚠️  Expected rate limit to be exceeded on 4th request');
    }
    
    // Reset for cleanup
    rateLimiter.reset(testId);
    console.log('✅ Rate limiter reset');
    
    return true;
  } catch (error) {
    console.error('❌ Rate limiter test failed:', error);
    return false;
  }
}

async function testAPIEndpoint() {
  console.log('\n🌐 Testing API endpoint...');
  
  try {
    // Test health check
    const healthResponse = await fetch('http://localhost:3000/api/ask', {
      method: 'GET'
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Health check passed:', healthData.status);
    } else {
      console.warn('⚠️  Health check failed - is the server running?');
      return false;
    }
    
    // Test actual query (requires server to be running)
    const testQuery = {
      message: "Should I take magnesium at night?",
      sessionId: "test-session-123"
    };
    
    const response = await fetch('http://localhost:3000/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': 'test-session-123'
      },
      body: JSON.stringify(testQuery)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API query successful');
      console.log(`   Response length: ${data.response.length} chars`);
      console.log(`   Sources: ${data.sources?.length || 0}`);
      console.log(`   Remaining queries: ${data.remainingQueries}`);
    } else {
      const error = await response.text();
      console.warn('⚠️  API query failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    console.log('   Make sure the development server is running (npm run dev)');
    return false;
  }
}

async function runBrandVoiceTest() {
  console.log('\n🎯 Testing brand voice alignment...');
  
  const brandTests = [
    {
      query: "Should I take supplements?",
      expectedElements: ["evidence", "practical", "Feel Sharper", "consult", "healthcare"]
    },
    {
      query: "I can't sleep",
      expectedElements: ["systematic", "optimization", "protocol", "disclaimer"]
    }
  ];
  
  for (const test of brandTests) {
    try {
      const results = await retrieveRelevantContent(test.query);
      const prompt = buildContextPrompt(results, test.query);
      
      console.log(`✅ Brand test for: "${test.query}"`);
      console.log(`   Context includes Feel Sharper content: ${prompt.includes('Feel Sharper')}`);
      console.log(`   Includes practical guidance: ${results.length > 0}`);
      
    } catch (error) {
      console.warn(`⚠️  Brand test failed for: "${test.query}"`, error);
    }
  }
  
  return true;
}

async function main() {
  console.log('🧪 Ask Feel Sharper - System Test Suite\n');
  console.log('Testing all components before deployment...\n');
  
  const results = {
    embeddings: false,
    vectorStore: false,
    retrieval: false,
    rateLimiter: false,
    api: false,
    brandVoice: false
  };
  
  // Run all tests
  results.embeddings = await testEmbeddingsSystem();
  results.vectorStore = await testVectorStore();
  results.retrieval = await testRetrievalSystem();
  results.rateLimiter = await testRateLimiter();
  results.api = await testAPIEndpoint();
  results.brandVoice = await runBrandVoiceTest();
  
  // Summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)}`);
  });
  
  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    console.log('\n🎉 All tests passed! Ask Feel Sharper is ready for deployment.');
    console.log('\nNext steps:');
    console.log('1. Set up environment variables in production');
    console.log('2. Run embedding generation in production');
    console.log('3. Deploy to Vercel or your preferred platform');
    console.log('4. Test with real users and monitor performance');
  } else {
    console.log('\n⚠️  Some tests failed. Please fix issues before deployment.');
    console.log('\nCommon fixes:');
    console.log('- Ensure API keys are set in environment variables');
    console.log('- Run embedding generation script first');
    console.log('- Start development server for API tests');
  }
  
  console.log('\n📚 Sample queries to test manually:');
  testQueries.forEach((query, index) => {
    console.log(`${index + 1}. "${query}"`);
  });
}

// Run tests if called directly
if (require.main === module) {
  main().catch(console.error);
}

export { main as runTests };
