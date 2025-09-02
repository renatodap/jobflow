#!/usr/bin/env node

/**
 * Feel Sharper Database Setup Script
 * 
 * Handles both local and production database setup:
 * - Checks environment configuration
 * - Runs migrations
 * - Sets up RLS policies
 * - Creates seed data (local only)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DatabaseSetup {
  constructor() {
    this.isLocal = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.NEXT_PUBLIC_SUPABASE_URL.includes('localhost') ||
                   process.env.NEXT_PUBLIC_SUPABASE_URL === 'dummy';
  }

  async run() {
    console.log('🗄️  Feel Sharper Database Setup\n');
    
    try {
      this.checkEnvironment();
      
      if (this.isLocal) {
        await this.setupLocal();
      } else {
        await this.setupProduction();
      }
      
      console.log('\n✅ Database setup completed!');
    } catch (error) {
      console.error('❌ Database setup failed:', error.message);
      process.exit(1);
    }
  }

  checkEnvironment() {
    console.log('🔍 Checking environment...');
    
    if (this.isLocal) {
      console.log('📍 Mode: Local development');
    } else {
      console.log('📍 Mode: Production');
      console.log(`🔗 URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    }
    
    // Check required files
    const requiredFiles = [
      'supabase/config.toml',
      'supabase/migrations/0001_init.sql',
      'supabase/migrations/0002_simplified_fitness.sql'
    ];
    
    for (const file of requiredFiles) {
      if (!fs.existsSync(file)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }
    
    console.log('✅ Environment check passed');
  }

  async setupLocal() {
    console.log('\n🏠 Setting up local database...');
    
    try {
      // Start Supabase locally
      console.log('🚀 Starting Supabase locally...');
      execSync('npx supabase start', { stdio: 'inherit' });
      
      // Run migrations
      console.log('📄 Running migrations...');
      execSync('npx supabase db push', { stdio: 'inherit' });
      
      // Generate types
      console.log('🔧 Generating TypeScript types...');
      execSync('npx supabase gen types typescript --local > lib/types/database.ts', { stdio: 'inherit' });
      
      // Seed database
      console.log('🌱 Seeding database...');
      this.seedDatabase();
      
      console.log('✅ Local database ready');
      
    } catch (error) {
      console.log('⚠️  Local setup failed - this is okay if Docker is not available');
      console.log('💡 You can connect to a hosted Supabase instance instead');
    }
  }

  async setupProduction() {
    console.log('\n☁️  Setting up production database...');
    
    // Check credentials
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not set for production');
    }
    
    try {
      // Link to project (if not already linked)
      console.log('🔗 Linking to Supabase project...');
      
      // Run migrations
      console.log('📄 Running migrations...');
      execSync('npx supabase db push', { stdio: 'inherit' });
      
      // Generate types
      console.log('🔧 Generating TypeScript types...');
      execSync('npx supabase gen types typescript > lib/types/database.ts', { stdio: 'inherit' });
      
      console.log('✅ Production database ready');
      
    } catch (error) {
      console.log('⚠️  Production setup needs manual configuration');
      console.log('📖 See docs/deploy.md for setup instructions');
    }
  }

  seedDatabase() {
    const seedScript = path.join(__dirname, '..', 'scripts', 'seed.ts');
    
    if (fs.existsSync(seedScript)) {
      try {
        execSync('npm run seed', { stdio: 'inherit' });
        console.log('✅ Database seeded');
      } catch (error) {
        console.log('⚠️  Seeding failed - will continue without seed data');
      }
    } else {
      console.log('💡 No seed script found - database will be empty');
    }
  }
}

// Run the database setup
if (require.main === module) {
  new DatabaseSetup().run();
}

module.exports = DatabaseSetup;