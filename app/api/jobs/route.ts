import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    // Read jobs from CSV file
    const csvPath = join(process.cwd(), 'data', 'tracking', 'jobs_master.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Parse CSV (simple parser for our specific format)
    const lines = csvContent.split('\n')
    const headers = lines[0].split(',')
    
    const jobs = lines.slice(1)
      .filter(line => line.trim()) // Remove empty lines
      .map((line, index) => {
        const values = line.split(',')
        
        // Handle quoted values and commas within quotes
        const cleanValues = []
        let currentValue = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i]
          if (char === '"') {
            inQuotes = !inQuotes
          } else if (char === ',' && !inQuotes) {
            cleanValues.push(currentValue.trim())
            currentValue = ''
          } else {
            currentValue += char
          }
        }
        cleanValues.push(currentValue.trim()) // Add the last value
        
        return {
          id: (index + 1).toString(),
          job_hash: cleanValues[0] || '',
          score: parseInt(cleanValues[1]) || 0,
          title: cleanValues[2]?.replace(/"/g, '') || 'No Title',
          company: cleanValues[3]?.replace(/"/g, '') || 'Unknown Company',
          location: cleanValues[4]?.replace(/"/g, '') || 'Unknown Location',
          salary_min: parseInt(cleanValues[5]) || 0,
          salary_max: parseInt(cleanValues[6]) || 0,
          days_old: parseInt(cleanValues[7]) || 0,
          resume_version: cleanValues[8] || '',
          url: cleanValues[9] || '',
          contract_type: cleanValues[10] || '',
          category: cleanValues[11] || '',
          description: cleanValues[12]?.replace(/"/g, '') || 'No description available',
          discovered_at: cleanValues[13] || new Date().toISOString(),
          applied: cleanValues[14] === 'Yes',
          application_date: cleanValues[15] || null,
          status: cleanValues[16] || 'New',
          notes: cleanValues[17] || ''
        }
      })
      .filter(job => job.score >= 80) // Only show high-scoring jobs
      .sort((a, b) => b.score - a.score || a.days_old - b.days_old) // Sort by score desc, then freshness
      .slice(0, 50) // Limit to top 50 jobs
    
    return NextResponse.json({
      jobs,
      total: jobs.length,
      stats: {
        totalJobs: jobs.length,
        appliedToday: jobs.filter(j => j.applied && j.application_date === new Date().toISOString().split('T')[0]).length,
        responseRate: 0, // TODO: Calculate from application tracking
        topScore: jobs.length > 0 ? Math.max(...jobs.map(j => j.score)) : 0
      }
    })
    
  } catch (error) {
    console.error('Error loading jobs:', error)
    return NextResponse.json(
      { error: 'Failed to load jobs', jobs: [], total: 0 },
      { status: 500 }
    )
  }
}