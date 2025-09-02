export const BRAND = {
  // Core Promise & Taglines
  corePromise: "Sharpened uses AI-powered analysis and proven techniques to help you learn, improve, and achieve results — in your body, mind, and skills. It's the edge you would've never discovered alone.",
  
  taglines: {
    primary: "Your edge, sharpened by AI.",
    secondary: "Measure. Improve. Achieve.",
    tertiary: "Turn technology into transformation."
  },

  // Vision & Mission
  vision: "A world where anyone can learn, improve, and achieve with precision — using the power of technology already in their hands.",
  
  mission: "Sharpened builds AI-powered systems that merge proven techniques with real data, so people can track their progress, refine their methods, and reach goals they never thought possible.",

  // Origin Story (condensed)
  origin: "At 14, you taught yourself filmmaking. At 15, you mastered guitar, singing, drums, piano, bass, and music theory — while excelling in tennis and academics. That pattern of setting high goals and achieving them became your blueprint. Now you're making it available to the world.",

  // Why Now
  whyNow: "We carry more computing power in our pockets than the Apollo missions had to reach the moon — yet most people use it to scroll, not to grow. Sharpened exists to change that. The same devices and AI systems that distract us can, when used intentionally, become personal coaches, analysts, and accelerators of our potential.",

  // Values
  values: [
    {
      title: "Self-Reliance",
      description: "The tools are in your hands — Sharpened teaches you to use them."
    },
    {
      title: "Evidence Over Hype",
      description: "Decisions are driven by data, not trends."
    },
    {
      title: "Technique Meets Technology",
      description: "Proven methods amplified by AI analysis."
    },
    {
      title: "Visible Progress",
      description: "Measurable gains you can see, track, and celebrate."
    },
    {
      title: "Universal Application",
      description: "Whether for body, mind, or skills — the framework adapts."
    }
  ],

  // Products
  products: {
    feelSharper: {
      name: "FeelSharper",
      tagline: "Body & Performance",
      description: "AI training programs, nutrition tracking, recovery optimization, performance metrics.",
      features: [
        "AI-powered training programs that adapt to your progress",
        "Nutrition tracking with smart macro optimization",
        "Recovery monitoring and sleep quality analysis"
      ],
      accentColor: "#FF4A4A"
    },
    studySharper: {
      name: "StudySharper", 
      tagline: "Mind & Learning",
      description: "AI study planning, note ingestion, spaced repetition, subject mastery tracking.",
      features: [
        "Intelligent study plan generation based on your goals",
        "Note ingestion with RAG-powered search and insights",
        "Spaced repetition system optimized for long-term retention"
      ],
      accentColor: "#00D0FF"
    }
  },

  // The Promise (3 bullets)
  promise: [
    "Data-driven insights that reveal what's actually working",
    "AI analysis that spots patterns you'd miss on your own", 
    "Measurable progress you can see, track, and celebrate"
  ],

  // Color Palette
  colors: {
    core: {
      charcoal: "#0D0D0D",
      deepGray: "#1A1A1A", 
      white: "#FFFFFF",
      electricBlue: "#1479FF"
    },
    products: {
      feelSharper: "#FF4A4A",
      studySharper: "#00D0FF",
      workSharper: "#FFC93C",
      mindSharper: "#00BFA6",
      skillSharper: "#22C55E"
    }
  },

  // Contact
  contact: {
    email: "hello@sharpened.ai",
    waitlistEmail: "waitlist@sharpened.ai"
  }
} as const;