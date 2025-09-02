/**
 * SuperMemo 2 (SM-2) Algorithm Implementation
 * 
 * The SM-2 algorithm calculates the optimal intervals for spaced repetition
 * based on the user's performance on each review.
 */

export interface SM2Parameters {
  repetitions: number // Number of consecutive correct responses
  easeFactor: number // Difficulty rating (1.3 to 2.5+)
  interval: number // Days until next review
}

export interface SM2Result extends SM2Parameters {
  dueDate: Date
  state: 'new' | 'learning' | 'review' | 'relearning'
}

export enum ReviewRating {
  Again = 1, // Complete blackout
  Hard = 2, // Struggled but correct
  Good = 3, // Correct with moderate effort
  Easy = 4 // Perfect response
}

export class SM2Algorithm {
  // Default configuration
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly DEFAULT_EASE_FACTOR = 2.5
  private static readonly EASE_FACTOR_DELTA = 0.08
  private static readonly HARD_INTERVAL_MULTIPLIER = 1.2
  private static readonly EASY_INTERVAL_MULTIPLIER = 1.3
  private static readonly EASY_BONUS = 1.3

  /**
   * Calculate the next review interval using the SM-2 algorithm
   */
  static calculate(
    rating: ReviewRating,
    params: SM2Parameters
  ): SM2Result {
    let { repetitions, easeFactor, interval } = params

    // Handle failure case (rating = Again)
    if (rating === ReviewRating.Again) {
      repetitions = 0
      interval = 1
      easeFactor = Math.max(
        this.MIN_EASE_FACTOR,
        easeFactor - 0.2
      )
    } else {
      // Successful review
      repetitions += 1

      // Adjust ease factor based on rating
      easeFactor = this.adjustEaseFactor(easeFactor, rating)

      // Calculate new interval
      interval = this.calculateInterval(
        repetitions,
        interval,
        easeFactor,
        rating
      )
    }

    // Determine state
    const state = this.determineState(repetitions, rating)

    // Calculate due date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + interval)
    dueDate.setHours(0, 0, 0, 0) // Reset to start of day

    return {
      repetitions,
      easeFactor,
      interval,
      dueDate,
      state
    }
  }

  /**
   * Adjust ease factor based on review performance
   */
  private static adjustEaseFactor(
    currentEase: number,
    rating: ReviewRating
  ): number {
    let newEase = currentEase

    switch (rating) {
      case ReviewRating.Hard:
        newEase -= 0.15
        break
      case ReviewRating.Good:
        // No change
        break
      case ReviewRating.Easy:
        newEase += 0.1
        break
    }

    // Ensure ease factor stays within bounds
    return Math.max(this.MIN_EASE_FACTOR, newEase)
  }

  /**
   * Calculate the next interval based on repetitions and ease
   */
  private static calculateInterval(
    repetitions: number,
    previousInterval: number,
    easeFactor: number,
    rating: ReviewRating
  ): number {
    let interval: number

    if (repetitions === 1) {
      interval = 1 // 1 day
    } else if (repetitions === 2) {
      interval = 6 // 6 days
    } else {
      // Apply SM-2 formula: I(n) = I(n-1) * EF
      interval = Math.round(previousInterval * easeFactor)
    }

    // Apply rating modifiers
    if (rating === ReviewRating.Hard) {
      interval = Math.max(1, Math.round(interval * this.HARD_INTERVAL_MULTIPLIER))
    } else if (rating === ReviewRating.Easy) {
      interval = Math.round(interval * this.EASY_INTERVAL_MULTIPLIER)
    }

    // Ensure minimum interval
    return Math.max(1, interval)
  }

  /**
   * Determine the card's learning state
   */
  private static determineState(
    repetitions: number,
    rating: ReviewRating
  ): SM2Result['state'] {
    if (rating === ReviewRating.Again) {
      return repetitions === 0 ? 'learning' : 'relearning'
    }

    if (repetitions <= 2) {
      return 'learning'
    }

    return 'review'
  }

  /**
   * Get initial parameters for a new card
   */
  static getInitialParams(): SM2Parameters {
    return {
      repetitions: 0,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      interval: 0
    }
  }

  /**
   * Calculate retention statistics
   */
  static calculateRetention(
    totalReviews: number,
    correctReviews: number
  ): number {
    if (totalReviews === 0) return 0
    return (correctReviews / totalReviews) * 100
  }

  /**
   * Estimate time until card becomes mature (21+ day interval)
   */
  static estimateMaturityTime(params: SM2Parameters): number {
    const simulations = 10
    let totalDays = 0

    for (let i = 0; i < simulations; i++) {
      let currentParams = { ...params }
      let days = 0

      while (currentParams.interval < 21) {
        // Simulate "Good" ratings
        const result = this.calculate(ReviewRating.Good, currentParams)
        days += result.interval
        currentParams = result

        // Prevent infinite loop
        if (days > 365) break
      }

      totalDays += days
    }

    return Math.round(totalDays / simulations)
  }

  /**
   * Get recommended daily new cards based on workload
   */
  static getRecommendedNewCards(
    currentReviewCount: number,
    targetDailyTime: number = 30, // minutes
    averageTimePerCard: number = 0.5 // minutes
  ): number {
    const reviewTime = currentReviewCount * averageTimePerCard
    const remainingTime = Math.max(0, targetDailyTime - reviewTime)
    const newCards = Math.floor(remainingTime / (averageTimePerCard * 2)) // New cards take longer

    return Math.max(0, Math.min(20, newCards)) // Cap at 20 new cards
  }

  /**
   * Calculate optimal review time based on forgetting curve
   */
  static getOptimalReviewTime(interval: number): {
    optimal: Date
    acceptable: { start: Date; end: Date }
  } {
    const now = new Date()
    const optimal = new Date(now)
    optimal.setDate(optimal.getDate() + interval)
    optimal.setHours(9, 0, 0, 0) // 9 AM is often optimal

    // Acceptable window is ±20% of interval
    const windowSize = Math.max(1, Math.round(interval * 0.2))
    const start = new Date(optimal)
    start.setDate(start.getDate() - windowSize)
    const end = new Date(optimal)
    end.setDate(end.getDate() + windowSize)

    return {
      optimal,
      acceptable: { start, end }
    }
  }

  /**
   * Analyze card difficulty based on review history
   */
  static analyzeDifficulty(
    lapses: number,
    totalReviews: number,
    easeFactor: number
  ): {
    difficulty: 'easy' | 'medium' | 'hard' | 'very-hard'
    isLeech: boolean
    recommendation: string
  } {
    const lapseRate = totalReviews > 0 ? lapses / totalReviews : 0
    const isLeech = lapses >= 8 // Card failed 8+ times

    let difficulty: 'easy' | 'medium' | 'hard' | 'very-hard'
    let recommendation: string

    if (easeFactor >= 2.5 && lapseRate < 0.1) {
      difficulty = 'easy'
      recommendation = 'This card is well-learned. Consider increasing intervals.'
    } else if (easeFactor >= 2.0 && lapseRate < 0.2) {
      difficulty = 'medium'
      recommendation = 'Card is progressing normally.'
    } else if (easeFactor >= 1.5 || lapseRate < 0.4) {
      difficulty = 'hard'
      recommendation = 'Consider breaking this into smaller cards.'
    } else {
      difficulty = 'very-hard'
      recommendation = 'This card needs reformulation or additional context.'
    }

    if (isLeech) {
      recommendation = 'Leech detected! Suspend and reformulate this card.'
    }

    return { difficulty, isLeech, recommendation }
  }
}

/**
 * Deck scheduling utilities
 */
export class DeckScheduler {
  /**
   * Get cards due for review, ordered by priority
   */
  static prioritizeCards(cards: Array<{
    id: string
    state: SM2Result['state']
    interval: number
    dueDate: Date
    lapses: number
  }>): string[] {
    return cards
      .sort((a, b) => {
        // Priority order: learning > relearning > due reviews > new
        const statePriority = {
          learning: 0,
          relearning: 1,
          review: 2,
          new: 3
        }

        const aPriority = statePriority[a.state] ?? 3
        const bPriority = statePriority[b.state] ?? 3

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        // Within same state, prioritize by due date
        return a.dueDate.getTime() - b.dueDate.getTime()
      })
      .map(card => card.id)
  }

  /**
   * Calculate study load forecast
   */
  static forecastWorkload(
    cards: Array<{ interval: number; dueDate: Date }>,
    days: number = 30
  ): Map<string, number> {
    const forecast = new Map<string, number>()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Initialize forecast
    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      const key = date.toISOString().split('T')[0]
      forecast.set(key, 0)
    }

    // Count cards due each day
    cards.forEach(card => {
      const dueDate = new Date(card.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      const key = dueDate.toISOString().split('T')[0]
      
      if (forecast.has(key)) {
        forecast.set(key, forecast.get(key)! + 1)
      }
    })

    return forecast
  }

  /**
   * Suggest optimal study time based on workload
   */
  static suggestStudyTime(
    dueCount: number,
    newCardsTarget: number,
    averageTimePerCard: number = 0.5 // minutes
  ): {
    estimatedMinutes: number
    sessions: Array<{ start: string; duration: number }>
  } {
    const totalCards = dueCount + newCardsTarget
    const estimatedMinutes = totalCards * averageTimePerCard

    // Break into sessions if needed
    const sessions: Array<{ start: string; duration: number }> = []
    
    if (estimatedMinutes <= 30) {
      sessions.push({ start: '09:00', duration: estimatedMinutes })
    } else if (estimatedMinutes <= 60) {
      sessions.push({ start: '09:00', duration: 30 })
      sessions.push({ start: '14:00', duration: estimatedMinutes - 30 })
    } else {
      // Split into multiple 30-minute sessions
      const sessionCount = Math.ceil(estimatedMinutes / 30)
      const times = ['09:00', '11:00', '14:00', '16:00', '19:00']
      
      for (let i = 0; i < Math.min(sessionCount, times.length); i++) {
        sessions.push({
          start: times[i],
          duration: Math.min(30, estimatedMinutes - (i * 30))
        })
      }
    }

    return { estimatedMinutes, sessions }
  }
}