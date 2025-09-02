#!/usr/bin/env node

/**
 * Content Scheduler - Manages the publishing queue
 * Reads queue JSON and generates optimal schedule
 */

import fs from 'fs';
import path from 'path';

class ContentScheduler {
  constructor(bufferTarget = 3) {
    this.bufferTarget = bufferTarget;
    this.schedule = [];
    this.timezone = 'America/Indiana/Indianapolis';
    
    // Platform-specific timing
    this.publishTimes = {
      blog: { hour: 8, minute: 0 },      // 8:00 AM
      instagram: { hour: 12, minute: 30 }, // 12:30 PM
      twitter: { hour: 15, minute: 0 },   // 3:00 PM
      linkedin: { hour: 9, minute: 0 },   // 9:00 AM
      youtube: { hour: 10, minute: 0 }    // 10:00 AM
    };
    
    // Platform constraints
    this.platformRules = {
      linkedin: { days: [2, 5] }, // Tuesday, Friday only
      youtube: { days: [3] }       // Wednesday only
    };
  }
  
  /**
   * Load content queue from JSON
   */
  loadQueue(filePath) {
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading queue: ${error.message}`);
      return { items: [] };
    }
  }
  
  /**
   * Calculate next available slot for platform
   */
  getNextSlot(platform, afterDate = new Date()) {
    const rules = this.platformRules[platform];
    const timing = this.publishTimes[platform];
    
    let nextDate = new Date(afterDate);
    nextDate.setHours(timing.hour, timing.minute, 0, 0);
    
    // If time has passed today, move to tomorrow
    if (nextDate <= afterDate) {
      nextDate.setDate(nextDate.getDate() + 1);
    }
    
    // Apply day-of-week constraints
    if (rules && rules.days) {
      while (!rules.days.includes(nextDate.getDay())) {
        nextDate.setDate(nextDate.getDate() + 1);
      }
    }
    
    return nextDate;
  }
  
  /**
   * Check for scheduling conflicts
   */
  hasConflict(proposedTime, existingSchedule, minGapMinutes = 30) {
    const proposed = new Date(proposedTime).getTime();
    
    return existingSchedule.some(item => {
      const existing = new Date(item.publishTime).getTime();
      const gap = Math.abs(proposed - existing);
      return gap < (minGapMinutes * 60 * 1000);
    });
  }
  
  /**
   * Generate optimal schedule
   */
  generateSchedule(queue) {
    const schedule = [];
    const now = new Date();
    
    // Sort queue by priority and score
    const sorted = queue.items.sort((a, b) => {
      // Priority levels: urgent=1, high=2, normal=3, low=4
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return b.score - a.score; // Higher score first
    });
    
    // Schedule each item
    for (const item of sorted) {
      const platforms = item.platforms || ['blog'];
      
      for (const platform of platforms) {
        let proposedTime = this.getNextSlot(platform, now);
        
        // Avoid conflicts
        let attempts = 0;
        while (this.hasConflict(proposedTime, schedule) && attempts < 10) {
          proposedTime = new Date(proposedTime.getTime() + 24 * 60 * 60 * 1000);
          attempts++;
        }
        
        schedule.push({
          id: item.id,
          title: item.title,
          platform,
          publishTime: proposedTime.toISOString(),
          priority: item.priority,
          score: item.score,
          status: 'scheduled'
        });
      }
    }
    
    return schedule;
  }
  
  /**
   * Calculate buffer status
   */
  calculateBuffer(schedule) {
    const now = new Date();
    const futureItems = schedule.filter(item => 
      new Date(item.publishTime) > now && item.platform === 'blog'
    );
    
    // Group by day
    const dayMap = {};
    futureItems.forEach(item => {
      const day = new Date(item.publishTime).toDateString();
      dayMap[day] = (dayMap[day] || 0) + 1;
    });
    
    const daysWithContent = Object.keys(dayMap).length;
    
    return {
      days: daysWithContent,
      items: futureItems.length,
      status: daysWithContent >= this.bufferTarget ? 'healthy' : 'low',
      warning: daysWithContent < 2
    };
  }
  
  /**
   * Format schedule for display
   */
  formatSchedule(schedule) {
    const grouped = {};
    
    schedule.forEach(item => {
      const date = new Date(item.publishTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
    });
    
    // Sort within each day
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => 
        new Date(a.publishTime) - new Date(b.publishTime)
      );
    });
    
    return grouped;
  }
  
  /**
   * Export schedule to various formats
   */
  exportSchedule(schedule, format = 'json') {
    switch (format) {
      case 'csv':
        return this.toCSV(schedule);
      case 'ical':
        return this.toICal(schedule);
      case 'markdown':
        return this.toMarkdown(schedule);
      default:
        return JSON.stringify(schedule, null, 2);
    }
  }
  
  toCSV(schedule) {
    const headers = ['Date', 'Time', 'Platform', 'Title', 'Priority', 'Score'];
    const rows = schedule.map(item => {
      const date = new Date(item.publishTime);
      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        item.platform,
        `"${item.title}"`,
        item.priority,
        item.score
      ].join(',');
    });
    
    return [headers.join(','), ...rows].join('\n');
  }
  
  toMarkdown(schedule) {
    const grouped = this.formatSchedule(schedule);
    let markdown = '# Content Schedule\n\n';
    
    Object.keys(grouped).sort().forEach(date => {
      markdown += `## ${date}\n\n`;
      grouped[date].forEach(item => {
        const time = new Date(item.publishTime).toLocaleTimeString();
        markdown += `- **${time}** - ${item.platform}: ${item.title}\n`;
      });
      markdown += '\n';
    });
    
    return markdown;
  }
  
  toICal(schedule) {
    // Simplified iCal format
    let ical = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AI-Daily//Content Schedule//EN\n';
    
    schedule.forEach(item => {
      const start = new Date(item.publishTime);
      const end = new Date(start.getTime() + 30 * 60 * 1000); // 30 min duration
      
      ical += 'BEGIN:VEVENT\n';
      ical += `DTSTART:${start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += `DTEND:${end.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\n`;
      ical += `SUMMARY:${item.platform}: ${item.title}\n`;
      ical += `UID:${item.id}@aidaily\n`;
      ical += 'END:VEVENT\n';
    });
    
    ical += 'END:VCALENDAR';
    return ical;
  }
}

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const scheduler = new ContentScheduler();
  
  // Demo queue
  const demoQueue = {
    items: [
      {
        id: 'brief_001',
        title: 'The 10-Minute Stop Rule',
        platforms: ['blog', 'instagram', 'twitter'],
        priority: 2,
        score: 85
      },
      {
        id: 'brief_002',
        title: 'Free vs Paid AI Tools',
        platforms: ['blog', 'linkedin'],
        priority: 3,
        score: 78
      },
      {
        id: 'brief_003',
        title: 'Weekly Compilation',
        platforms: ['youtube'],
        priority: 3,
        score: 80
      }
    ]
  };
  
  console.log('Content Scheduler Demo\n');
  console.log('======================\n');
  
  const schedule = scheduler.generateSchedule(demoQueue);
  const buffer = scheduler.calculateBuffer(schedule);
  
  console.log('Generated Schedule:\n');
  console.log(scheduler.toMarkdown(schedule));
  
  console.log('\nBuffer Status:');
  console.log(`- Days of content: ${buffer.days}`);
  console.log(`- Total items: ${buffer.items}`);
  console.log(`- Status: ${buffer.status}`);
  if (buffer.warning) {
    console.log('⚠️  WARNING: Buffer below minimum!');
  }
  
  // Export options
  console.log('\nExport Formats Available:');
  console.log('- JSON: node schedule-content.mjs > schedule.json');
  console.log('- CSV: node schedule-content.mjs csv > schedule.csv');
  console.log('- iCal: node schedule-content.mjs ical > schedule.ics');
  console.log('- Markdown: node schedule-content.mjs md > schedule.md');
}

export default ContentScheduler;