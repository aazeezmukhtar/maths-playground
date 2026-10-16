/* Reusable module content model. Add new module definitions here as content is authored. */
window.LEARNING_MODULES = {
  fractions: {
    id: "fractions",
    title: "Fraction Fun",
    subjectId: "mathematics",
    ageRange: { min: 7, max: 12, label: "7–12" },
    learningStages: ["lower-primary", "upper-primary"],
    curriculumTags: ["Mathematics", "Number", "Fractions"],
    overview: "Understand fractions as equal parts of a whole, then use visual models to read, shade, and compare them.",
    learningGoals: [
      "Explain the numerator and denominator.",
      "Represent a fraction using equal parts of a shape.",
      "Read and compare simple fractions."
    ],
    lessons: [
      {
        id: "fraction-basics",
        title: "Meet a fraction",
        summary: "Learn how a whole can be split into equal parts and what the top and bottom numbers tell us.",
        tab: "learn",
        kind: "guided-lesson",
        concepts: ["Whole", "Equal parts", "Numerator", "Denominator"]
      },
      {
        id: "fraction-practice",
        title: "Show what you know",
        summary: "Answer questions, shade visual models, and use hints when you need them.",
        tab: "practice",
        kind: "guided-practice",
        concepts: ["Representing fractions", "Reading fraction models"]
      },
      {
        id: "fraction-challenge",
        title: "Try a challenge",
        summary: "Use what you have learned to compare fractions and solve mixed puzzles.",
        tab: "challenge",
        kind: "challenge",
        concepts: ["Comparing fractions", "Reasoning"]
      }
    ],
    progress: {
      storageKey: "maths-playground-progress-v1",
      pointsAreSharedAcrossModules: true,
      accountRequired: false
    }
  }
};