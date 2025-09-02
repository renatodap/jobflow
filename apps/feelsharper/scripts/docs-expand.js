#!/usr/bin/env node

/**
 * Feel Sharper Documentation Expansion Script
 * 
 * Automatically generates and updates documentation by scanning:
 * - Codebase for API routes and components
 * - Database schema for ERD generation
 * - Feature files for coverage mapping
 * - Git history for changelogs
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DocsExpander {
  constructor() {
    this.rootDir = process.cwd();
    this.docsDir = path.join(this.rootDir, 'docs');
  }

  async run() {
    console.log('🔍 Feel Sharper Docs Expansion Starting...\n');
    
    try {
      await this.ensureDocsStructure();
      await this.scanAPIRoutes();
      await this.scanDatabaseSchema();
      await this.scanFeatures();
      await this.generateTOC();
      
      console.log('\n✅ Documentation expansion completed!');
    } catch (error) {
      console.error('❌ Error during docs expansion:', error.message);
      process.exit(1);
    }
  }

  async ensureDocsStructure() {
    console.log('📁 Ensuring docs structure...');
    
    const dirs = [
      'architecture', 'api', 'database', 'features', 
      'plans', 'adr', '_blueprints', 'coverage'
    ];
    
    for (const dir of dirs) {
      const dirPath = path.join(this.docsDir, dir);
      await fs.mkdir(dirPath, { recursive: true });
    }
    
    console.log('✅ Docs structure ready');
  }

  async scanAPIRoutes() {
    console.log('🔌 Scanning API routes...');
    
    const apiDir = path.join(this.rootDir, 'app', 'api');
    const routes = await this.findAPIRoutes(apiDir);
    
    let apiDocs = '# API Documentation\n\n';
    apiDocs += '> Auto-generated from route files\n\n';
    
    for (const route of routes) {
      apiDocs += `## ${route.method} ${route.path}\n\n`;
      apiDocs += `**File:** \`${route.file}\`\n\n`;
      
      if (route.description) {
        apiDocs += `**Description:** ${route.description}\n\n`;
      }
      
      apiDocs += '---\n\n';
    }
    
    await fs.writeFile(
      path.join(this.docsDir, 'api', 'routes.md'), 
      apiDocs
    );
    
    console.log(`✅ Found ${routes.length} API routes`);
  }

  async findAPIRoutes(dir) {
    const routes = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          routes.push(...await this.findAPIRoutes(fullPath));
        } else if (item.name === 'route.ts' || item.name === 'route.js') {
          const relativePath = path.relative(
            path.join(this.rootDir, 'app', 'api'), 
            dir
          );
          const apiPath = '/' + (relativePath ? `api/${relativePath}` : 'api');
          
          // Try to extract HTTP methods from file
          const content = await fs.readFile(fullPath, 'utf8');
          const methods = this.extractHTTPMethods(content);
          
          for (const method of methods) {
            routes.push({
              method,
              path: apiPath,
              file: path.relative(this.rootDir, fullPath),
              description: this.extractDescription(content)
            });
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return routes;
  }

  extractHTTPMethods(content) {
    const methods = [];
    const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    
    for (const method of httpMethods) {
      if (content.includes(`export async function ${method}`)) {
        methods.push(method);
      }
    }
    
    return methods.length > 0 ? methods : ['GET'];
  }

  extractDescription(content) {
    const lines = content.split('\n');
    for (const line of lines) {
      if (line.trim().startsWith('*') && line.includes('Description:')) {
        return line.split('Description:')[1]?.trim().replace('*/', '');
      }
    }
    return null;
  }

  async scanDatabaseSchema() {
    console.log('🗄️  Scanning database schema...');
    
    const migrationsDir = path.join(this.rootDir, 'supabase', 'migrations');
    const migrations = await this.findMigrations(migrationsDir);
    
    let schemaDocs = '# Database Schema\n\n';
    schemaDocs += '> Auto-generated from migration files\n\n';
    
    for (const migration of migrations) {
      schemaDocs += `## ${migration.name}\n\n`;
      schemaDocs += `**File:** \`${migration.file}\`\n\n`;
      schemaDocs += '```sql\n';
      schemaDocs += migration.content;
      schemaDocs += '\n```\n\n';
    }
    
    await fs.writeFile(
      path.join(this.docsDir, 'database', 'migrations.md'), 
      schemaDocs
    );
    
    console.log(`✅ Found ${migrations.length} migrations`);
  }

  async findMigrations(dir) {
    const migrations = [];
    
    try {
      const files = await fs.readdir(dir);
      
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const fullPath = path.join(dir, file);
          const content = await fs.readFile(fullPath, 'utf8');
          
          migrations.push({
            name: file.replace('.sql', '').replace(/^\d+_/, ''),
            file: path.relative(this.rootDir, fullPath),
            content: content.trim()
          });
        }
      }
    } catch (error) {
      // Directory doesn't exist
    }
    
    return migrations.sort((a, b) => a.file.localeCompare(b.file));
  }

  async scanFeatures() {
    console.log('🎯 Scanning features...');
    
    const featuresFile = path.join(this.rootDir, 'FEATURES.md');
    
    try {
      const content = await fs.readFile(featuresFile, 'utf8');
      const features = this.parseFeatures(content);
      
      let featureDocs = '# Feature Implementation Status\n\n';
      featureDocs += '> Auto-generated from FEATURES.md\n\n';
      
      for (const feature of features) {
        featureDocs += `## ${feature.title}\n\n`;
        featureDocs += `**Status:** ${feature.completed}/${feature.total} completed (${Math.round(feature.completed/feature.total*100)}%)\n\n`;
        
        for (const item of feature.items) {
          const status = item.done ? '✅' : '⏳';
          featureDocs += `- ${status} ${item.text}\n`;
        }
        
        featureDocs += '\n---\n\n';
      }
      
      await fs.writeFile(
        path.join(this.docsDir, 'features', 'status.md'), 
        featureDocs
      );
      
      console.log(`✅ Found ${features.length} feature sections`);
    } catch (error) {
      console.log('⚠️  FEATURES.md not found, skipping feature scan');
    }
  }

  parseFeatures(content) {
    const features = [];
    const lines = content.split('\n');
    let currentFeature = null;
    
    for (const line of lines) {
      if (line.startsWith('##')) {
        if (currentFeature) {
          features.push(currentFeature);
        }
        currentFeature = {
          title: line.replace('##', '').trim(),
          items: [],
          completed: 0,
          total: 0
        };
      } else if (line.startsWith('- [') && currentFeature) {
        const done = line.includes('[x]') || line.includes('[X]');
        const text = line.replace(/^- \[[^\]]*\]/, '').trim();
        
        currentFeature.items.push({ done, text });
        currentFeature.total++;
        if (done) currentFeature.completed++;
      }
    }
    
    if (currentFeature) {
      features.push(currentFeature);
    }
    
    return features;
  }

  async generateTOC() {
    console.log('📋 Generating table of contents...');
    
    const toc = await this.buildTOC(this.docsDir);
    
    let tocContent = '# Documentation Table of Contents\n\n';
    tocContent += '> Auto-generated documentation index\n\n';
    tocContent += toc;
    
    await fs.writeFile(
      path.join(this.docsDir, 'README.md'), 
      tocContent
    );
    
    console.log('✅ TOC generated');
  }

  async buildTOC(dir, level = 0) {
    let toc = '';
    const indent = '  '.repeat(level);
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items.sort((a, b) => a.name.localeCompare(b.name))) {
        if (item.name.startsWith('.') || item.name.startsWith('_')) continue;
        
        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(this.docsDir, fullPath);
        
        if (item.isDirectory()) {
          toc += `${indent}- **${item.name}/**\n`;
          toc += await this.buildTOC(fullPath, level + 1);
        } else if (item.name.endsWith('.md') && item.name !== 'README.md') {
          const title = item.name.replace('.md', '').replace(/[-_]/g, ' ');
          toc += `${indent}- [${title}](./${relativePath})\n`;
        }
      }
    } catch (error) {
      // Can't read directory
    }
    
    return toc;
  }
}

// Run the docs expander
if (require.main === module) {
  new DocsExpander().run();
}

module.exports = DocsExpander;