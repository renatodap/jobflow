import { addDays } from 'date-fns';

export interface SRSState {
  interval: number;
  repetitions: number;
  easeFactor: number;
}

export interface ReviewResult {
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * SM-2 Algorithm Implementation
 * Based on the original SuperMemo SM-2 algorithm
 */
export class SM2Algorithm {
  static review(currentState: SRSState, rating: number, reviewDate = new Date()): ReviewResult {
    const { interval, repetitions, easeFactor } = currentState;
    
    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number;

    // Update ease factor
    newEaseFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));

    if (rating >= 3) {
      // Correct response
      if (repetitions === 0) {
        newInterval = 1;
      } else if (repetitions === 1) {
        newInterval = 6;
      } else {
        newInterval = Math.round(interval * newEaseFactor);
      }
      newRepetitions = repetitions + 1;
    } else {
      // Incorrect response - restart
      newInterval = 1;
      newRepetitions = 0;
      // Don't change ease factor for incorrect responses
      newEaseFactor = easeFactor;
    }

    const nextReview = addDays(reviewDate, newInterval);

    return {
      nextReview,
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
    };
  }

  static getInitialState(): SRSState {
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
    };
  }
}

/**
 * FSRS Algorithm Implementation (simplified)
 * A more modern approach to spaced repetition
 */
export class FSRSAlgorithm {
  private static readonly DEFAULT_PARAMETERS = {
    requestRetention: 0.9,
    maximumInterval: 36500, // ~100 years
    weights: [
      0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61
    ],
  };

  static review(currentState: SRSState, rating: number, reviewDate = new Date()): ReviewResult {
    // Simplified FSRS implementation
    // In a full implementation, this would use the complete FSRS formula
    
    const { interval, repetitions, easeFactor } = currentState;
    
    if (rating < 1 || rating > 4) {
      throw new Error('FSRS rating must be between 1 and 4');
    }

    let newInterval: number;
    let newRepetitions: number;
    let newEaseFactor: number = easeFactor;

    if (rating >= 2) {
      // Pass (rating 2, 3, or 4)
      if (repetitions === 0) {
        newInterval = rating === 2 ? 1 : rating === 3 ? 1 : 1;
      } else {
        const factor = this.getDifficultyFactor(rating);
        newInterval = Math.min(
          Math.round(interval * factor),
          this.DEFAULT_PARAMETERS.maximumInterval
        );
      }
      newRepetitions = repetitions + 1;
    } else {
      // Fail (rating 1)
      newInterval = 1;
      newRepetitions = 0;
    }

    const nextReview = addDays(reviewDate, newInterval);

    return {
      nextReview,
      interval: newInterval,
      easeFactor: newEaseFactor,
      repetitions: newRepetitions,
    };
  }

  private static getDifficultyFactor(rating: number): number {
    // Simplified difficulty factor calculation
    switch (rating) {
      case 1: return 0.5;  // Hard
      case 2: return 1.0;  // Good
      case 3: return 1.3;  // Easy
      case 4: return 1.6;  // Very Easy
      default: return 1.0;
    }
  }

  static getInitialState(): SRSState {
    return {
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
    };
  }
}

/**
 * Main SRS service that can use different algorithms
 */
export class SRSService {
  static review(
    currentState: SRSState, 
    rating: number, 
    algorithm: 'sm2' | 'fsrs' = 'sm2',
    reviewDate = new Date()
  ): ReviewResult {
    switch (algorithm) {
      case 'sm2':
        return SM2Algorithm.review(currentState, rating, reviewDate);
      case 'fsrs':
        return FSRSAlgorithm.review(currentState, rating, reviewDate);
      default:
        throw new Error(`Unknown SRS algorithm: ${algorithm}`);
    }
  }

  static getInitialState(algorithm: 'sm2' | 'fsrs' = 'sm2'): SRSState {
    switch (algorithm) {
      case 'sm2':
        return SM2Algorithm.getInitialState();
      case 'fsrs':
        return FSRSAlgorithm.getInitialState();
      default:
        throw new Error(`Unknown SRS algorithm: ${algorithm}`);
    }
  }

  /**
   * Calculate retention probability for a card
   */
  static calculateRetention(
    daysSinceLastReview: number,
    easeFactor: number,
    repetitions: number
  ): number {
    // Simplified retention calculation
    // In practice, this would use more sophisticated models
    const stability = easeFactor * Math.pow(1.3, repetitions);
    return Math.exp(-daysSinceLastReview / stability);
  }

  /**
   * Get cards due for review
   */
  static getCardsDue(cards: Array<{
    id: string;
    nextReview: Date;
    interval: number;
    easeFactor: number;
    repetitions: number;
  }>, currentDate = new Date()): Array<{
    id: string;
    daysOverdue: number;
    priority: number;
  }> {
    return cards
      .filter(card => card.nextReview <= currentDate)
      .map(card => {
        const daysOverdue = Math.floor((currentDate.getTime() - card.nextReview.getTime()) / (1000 * 60 * 60 * 24));
        const retention = this.calculateRetention(daysOverdue + card.interval, card.easeFactor, card.repetitions);
        const priority = 1 - retention; // Lower retention = higher priority
        
        return {
          id: card.id,
          daysOverdue,
          priority,
        };
      })
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)
  }
}