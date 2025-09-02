import { Briefcase, CheckCircle, TrendingUp, Target } from 'lucide-react'

interface StatsProps {
  stats: {
    totalJobs: number
    appliedToday: number
    responseRate: number
    topScore: number
  }
}

export default function QuickStats({ stats }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Jobs Found</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalJobs}</p>
          </div>
          <Briefcase className="w-8 h-8 text-blue-500" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Perfect matches waiting</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Applied Today</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.appliedToday}</p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Keep the momentum!</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Response Rate</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.responseRate}%</p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-500" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Above average!</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Top Match Score</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.topScore}</p>
          </div>
          <Target className="w-8 h-8 text-red-500" />
        </div>
        <p className="text-xs text-gray-500 mt-4">Perfect fit found!</p>
      </div>
    </div>
  )
}