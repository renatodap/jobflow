import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatSalary(min: number, max?: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  if (max && max !== min) {
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }
  return formatter.format(min)
}

export function daysAgoText(days: number): string {
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days} days ago`
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600 bg-green-50 border-green-200'
  if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200'
  return 'text-gray-600 bg-gray-50 border-gray-200'
}