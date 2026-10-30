// data/curriculum.ts

export type ManipulativeType = 'five-frame' | 'ten-frame' | 'array-grid' | 'fraction-bar' | 'number-line';

export interface FiveFrameQuestion {
  id: string;
  title: string;
  targetCount: number;
  flashMode?: boolean; // If true, flashes dots for 1.5 seconds for subitising
  correctAnswer: number;
  hint: string;
}

export interface TenFrameQuestion {
  id: string;
  title: string;
  initialBase: number;
  toAdd: number;
  correctAnswer: number;
  hintBridge: string;
}

export interface ArrayQuestion {
  id: string;
  title: string;
  rows: number;
  cols: number;
  correctAnswer: number;
  hint: string;
}

export interface FractionQuestion {
  id: string;
  title: string;
  targetFraction: string;
  targetNumerator: number;
  targetDenominator: number;
  percentageEquivalent: number;
  hint: string;
}

export interface NumberLineQuestion {
  id: string;
  title: string;
  startNumber: number;
  toAdd: number;
  correctAnswer: number;
  hint: string;
}

export interface OutcomeCurriculum {
  outcomeCode: string;
  stage: string;
  strand: string;
  focusArea: string;
  title: string;
  manipulativeType: ManipulativeType;
  questions: (FiveFrameQuestion | TenFrameQuestion | ArrayQuestion | FractionQuestion | NumberLineQuestion)[];
}

export const NSW_CURRICULUM: Record<string, OutcomeCurriculum> = {
  // EARLY STAGE 1: SUBITISING & FIVE-FRAME
  'MAE-RWN-01': {
    outcomeCode: 'MAE-RWN-01',
    stage: 'early-stage-1',
    strand: 'Number and algebra',
    focusArea: 'Representing whole numbers A (Subitising)',
    title: 'Five-Frames & Instant Subitising',
    manipulativeType: 'five-frame',
    questions: [
      {
        id: 'q-ff-1',
        title: 'Make 4 on the Five-Frame',
        targetCount: 4,
        flashMode: false,
        correctAnswer: 4,
        hint: 'Tap 4 empty spots in the five-frame so 4 counters appear!',
      },
      {
        id: 'q-ff-2',
        title: 'Quick Flash: How many dots?',
        targetCount: 3,
        flashMode: true,
        correctAnswer: 3,
        hint: '3 dots flashed! Notice there were 2 empty spaces: 5 take away 2 is 3.',
      },
      {
        id: 'q-ff-3',
        title: 'Make 5 (Full Frame)',
        targetCount: 5,
        flashMode: false,
        correctAnswer: 5,
        hint: 'Fill every single box in the five-frame to make 5!',
      },
    ],
  },

  // STAGE 1: ADDITIVE RELATIONS
  'MA1-AR-01': {
    outcomeCode: 'MA1-AR-01',
    stage: 'stage-1',
    strand: 'Number and algebra',
    focusArea: 'Additive relations',
    title: 'Bridging to 10 with Additive Relations',
    manipulativeType: 'ten-frame',
    questions: [
      {
        id: 'q1',
        title: 'Bridge to 10: 8 + 5',
        initialBase: 8,
        toAdd: 5,
        correctAnswer: 13,
        hintBridge: 'Top frame has 8. Move 2 counters to make 10 first!',
      },
      {
        id: 'q2',
        title: 'Bridge to 10: 9 + 4',
        initialBase: 9,
        toAdd: 4,
        correctAnswer: 13,
        hintBridge: 'Top frame has 9. You only need 1 counter to fill 10!',
      },
    ],
  },
  'MA1-AR-02': {
    outcomeCode: 'MA1-AR-02',
    stage: 'stage-1',
    strand: 'Number and algebra',
    focusArea: 'Additive relations',
    title: 'Doubles and Near-Doubles',
    manipulativeType: 'ten-frame',
    questions: [
      {
        id: 'q3',
        title: 'Doubles Challenge: 6 + 6',
        initialBase: 6,
        toAdd: 6,
        correctAnswer: 12,
        hintBridge: 'Make 10 first! Move 4 counters up, then check what remains.',
      },
      {
        id: 'q4',
        title: 'Near Doubles: 6 + 7',
        initialBase: 6,
        toAdd: 7,
        correctAnswer: 13,
        hintBridge: 'Think of 6 + 6 = 12. How much is 1 more?',
      },
    ],
  },
  'MA1-AR-03': {
    outcomeCode: 'MA1-AR-03',
    stage: 'stage-1',
    strand: 'Number and algebra',
    focusArea: 'Additive relations',
    title: 'Friends of 10 Combinations',
    manipulativeType: 'ten-frame',
    questions: [
      {
        id: 'q5',
        title: 'Make 10: 7 + ? = 10',
        initialBase: 7,
        toAdd: 3,
        correctAnswer: 10,
        hintBridge: 'How many counters fill the remaining empty slots in the top frame?',
      },
    ],
  },

  // STAGE 2: ADDITIVE RELATIONS
  'MA2-AR-01': {
    outcomeCode: 'MA2-AR-01',
    stage: 'stage-2',
    strand: 'Number and algebra',
    focusArea: 'Additive relations A (Jump Strategy)',
    title: 'Flexible Addition: The Jump Strategy on an Empty Number Line',
    manipulativeType: 'number-line',
    questions: [
      {
        id: 'q-nl-1',
        title: 'Use the Jump Strategy: 48 + 35',
        startNumber: 48,
        toAdd: 35,
        correctAnswer: 83,
        hint: 'Start at 48. Partition 35 into 30 and 5. Jump 3 tens (+30 to 78), then jump 5 ones to reach 83!',
      },
      {
        id: 'q-nl-2',
        title: 'Use the Jump Strategy: 67 + 26',
        startNumber: 67,
        toAdd: 26,
        correctAnswer: 93,
        hint: 'Start at 67. Jump 20 (+10, +10 to 87), then jump 6 ones (+3 to reach 90, +3 to 93).',
      },
      {
        id: 'q-nl-3',
        title: 'Bridge Across 100: 85 + 38',
        startNumber: 85,
        toAdd: 38,
        correctAnswer: 123,
        hint: 'Start at 85. Jump 3 tens (+30 to 115), then jump 8 ones (+5 to 120, +3 to 123)!',
      },
    ],
  },

  // STAGE 2: MULTIPLICATIVE RELATIONS
  'MA2-MR-01': {
    outcomeCode: 'MA2-MR-01',
    stage: 'stage-2',
    strand: 'Number and algebra',
    focusArea: 'Multiplicative relations A',
    title: 'Arrays, Factors and the Distributive Property',
    manipulativeType: 'array-grid',
    questions: [
      {
        id: 'q-arr-1',
        title: 'Explore the Array: 3 rows of 6',
        rows: 3,
        cols: 6,
        correctAnswer: 18,
        hint: 'Highlight 3 rows across 6 columns. Think: 3 × 5 = 15, plus 3 more!',
      },
      {
        id: 'q-arr-2',
        title: 'Explore the Array: 4 rows of 7',
        rows: 4,
        cols: 7,
        correctAnswer: 28,
        hint: 'Partition 7 into 5 and 2: (4 × 5) + (4 × 2) = 20 + 8 = 28.',
      },
      {
        id: 'q-arr-3',
        title: 'Explore the Array: 6 rows of 6 (Square Number)',
        rows: 6,
        cols: 6,
        correctAnswer: 36,
        hint: 'Equal rows and columns make a square array! 6 × 6 = ?',
      },
      {
        id: 'q-arr-4',
        title: 'Explore the Array: 8 rows of 4',
        rows: 8,
        cols: 4,
        correctAnswer: 32,
        hint: 'Double (4 × 4) = 16 + 16 = 32, or partition into (5 × 4) + (3 × 4) = 20 + 12 = 32.',
      },
    ],
  },

  // STAGE 3: FRACTIONS & PERCENTAGES
  'MA3-RN-03': {
    outcomeCode: 'MA3-RN-03',
    stage: 'stage-3',
    strand: 'Number and algebra',
    focusArea: 'Representing numbers B (Fractions & Decimals)',
    title: 'Equivalence: Fractions, Decimals and Percentages',
    manipulativeType: 'fraction-bar',
    questions: [
      {
        id: 'q-frac-1',
        title: 'Model 3/4 and find its Percentage Equivalent',
        targetFraction: '3/4',
        targetNumerator: 3,
        targetDenominator: 4,
        percentageEquivalent: 75,
        hint: 'Divide the whole into 4 equal parts, then shade 3 of them. What percent is 3 out of 4 quarters of 100?',
      },
      {
        id: 'q-frac-2',
        title: 'Model 2/5 and find its Percentage Equivalent',
        targetFraction: '2/5',
        targetNumerator: 2,
        targetDenominator: 5,
        percentageEquivalent: 40,
        hint: 'Each fifth is 100 ÷ 5 = 20%. Shade 2 fifths to find 2 × 20%.',
      },
      {
        id: 'q-frac-3',
        title: 'Model 5/8 and find its Percentage Equivalent',
        targetFraction: '5/8',
        targetNumerator: 5,
        targetDenominator: 8,
        percentageEquivalent: 62.5,
        hint: 'Each eighth is 12.5%. 4 eighths is 50%, so 5 eighths is 50% + 12.5% = ?',
      },
    ],
  },
};