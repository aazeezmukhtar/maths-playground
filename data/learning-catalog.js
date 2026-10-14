/* Shared content model for the Al-Jaleel Academy Learning Playground.
   Keep routes relative to the repository root so GitHub Pages subpaths work. */
window.LEARNING_CATALOG = {
  version: 1,
  learningStages: [
    { id: "early-years", title: "Early Years", ages: "4–5", description: "Play-based discovery, early language, counting, and observation." },
    { id: "lower-primary", title: "Lower Primary", ages: "6–8", description: "Build core skills through short lessons and guided practice." },
    { id: "upper-primary", title: "Upper Primary", ages: "9–12", description: "Develop understanding, confidence, and independent problem-solving." }
  ],
  subjects: [
    {
      id: "mathematics", title: "Mathematics", symbol: "🔢",
      description: "Explore numbers, patterns, shapes, measures, and mathematical thinking.",
      ages: "4–12", status: "available", route: "subjects/mathematics/",
      modules: [
        { id: "fractions", title: "Fraction Fun", description: "Slice it, share it, shade it, and compare fractions with visual models.", ages: "7–12", status: "available", route: "modules/fractions/", curriculumTags: ["Number", "Fractions"] },
        { id: "numbers", title: "Number Explorers", description: "Count, calculate, and discover clever ways to solve problems.", ages: "5–12", status: "coming-soon", route: "modules/numbers/", curriculumTags: ["Number", "Operations"] },
        { id: "geometry", title: "Shape Safari", description: "Explore shapes, measurement, space, and patterns in the world around us.", ages: "4–12", status: "coming-soon", route: "modules/geometry/", curriculumTags: ["Geometry", "Measurement"] }
      ]
    },
    {
      id: "english", title: "English", symbol: "📚",
      description: "Grow reading, phonics, vocabulary, spelling, and writing skills.",
      ages: "4–12", status: "planned", curriculumTags: ["Language", "Literacy"]
    },
    {
      id: "science", title: "Science & Discovery", symbol: "🔬",
      description: "Ask questions, observe the world, and explore living things and materials.",
      ages: "4–12", status: "planned", curriculumTags: ["Science", "Discovery"]
    },
    {
      id: "arabic", title: "Arabic", symbol: "أ ب",
      description: "Practise Arabic letters, sounds, vocabulary, reading, and writing.",
      ages: "4–12", status: "planned", curriculumTags: ["Language", "Literacy"]
    },
    {
      id: "creative-arts", title: "Creative Arts", symbol: "🎨",
      description: "Learn through drawing, music, making, movement, and creative expression.",
      ages: "4–12", status: "planned", curriculumTags: ["Creativity", "Arts"]
    },
    {
      id: "logic", title: "Logic & Thinking", symbol: "🧩",
      description: "Practise reasoning, patterns, memory, and playful problem-solving.",
      ages: "5–12", status: "planned", route: "modules/challenges/",
      modules: [
        { id: "brainy-challenges", title: "Brainy Challenges", description: "Try puzzles and build problem-solving confidence.", ages: "7–12", status: "coming-soon", route: "modules/challenges/", curriculumTags: ["Reasoning", "Problem-solving"] }
      ]
    }
  ]
};