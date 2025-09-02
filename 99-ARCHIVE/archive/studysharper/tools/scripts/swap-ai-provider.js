#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE = path.join(process.cwd(), '.env.local');

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE)) {
    console.log('No .env.local file found. Creating one...');
    return {};
  }
  
  const content = fs.readFileSync(ENV_FILE, 'utf8');
  const env = {};
  
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=');
      }
    }
  });
  
  return env;
}

function writeEnvFile(env) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n');
}

function getCurrentProvider(env) {
  return env.AI_PROVIDER || 'openrouter';
}

function swapProvider() {
  const env = readEnvFile();
  const currentProvider = getCurrentProvider(env);
  
  console.log(`Current AI provider: ${currentProvider}`);
  
  const newProvider = currentProvider === 'openrouter' ? 'ollama' : 'openrouter';
  env.AI_PROVIDER = newProvider;
  
  writeEnvFile(env);
  
  console.log(`✅ Switched AI provider to: ${newProvider}`);
  
  if (newProvider === 'ollama') {
    console.log('\n📝 Ollama Setup Instructions:');
    console.log('1. Install Ollama: https://ollama.ai/download');
    console.log('2. Pull required models:');
    console.log('   ollama pull llama3.1:8b');
    console.log('   ollama pull nomic-embed-text');
    console.log('3. Start Ollama server: ollama serve');
    console.log('4. Restart your development server');
  } else {
    console.log('\n📝 OpenRouter Setup Instructions:');
    console.log('1. Get API key from: https://openrouter.ai/keys');
    console.log('2. Add to .env.local: OPENROUTER_API_KEY=your_key_here');
    console.log('3. Restart your development server');
  }
}

function showStatus() {
  const env = readEnvFile();
  const currentProvider = getCurrentProvider(env);
  
  console.log(`Current AI provider: ${currentProvider}`);
  
  if (currentProvider === 'openrouter') {
    const hasKey = env.OPENROUTER_API_KEY && env.OPENROUTER_API_KEY !== 'your_openrouter_api_key';
    console.log(`OpenRouter API key: ${hasKey ? '✅ Set' : '❌ Missing'}`);
  } else {
    console.log('Ollama status: Check if running on http://localhost:11434');
  }
}

const command = process.argv[2];

switch (command) {
  case 'status':
    showStatus();
    break;
  case 'swap':
  case undefined:
    swapProvider();
    break;
  default:
    console.log('Usage: node swap-ai-provider.js [status|swap]');
    console.log('  status: Show current provider status');
    console.log('  swap:   Switch between openrouter and ollama');
    process.exit(1);
}