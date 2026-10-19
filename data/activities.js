/* Written lessons and reusable practice activities.
   Activity IDs are stable so saved progress remains associated with the same activity. */
window.LEARNING_ACTIVITIES = {
  fractions: {
    lessons: [
      {
        id: "fraction-basics",
        title: "Meet a fraction",
        intro: "A fraction describes equal parts of one whole. Imagine sharing one pizza fairly with friends.",
        sections: [
          { heading: "The whole and its equal parts", paragraphs: ["A whole is one complete object. When we split it into equal-sized parts, each part is a fraction of the whole.", "If a pizza is divided into 4 equal slices and you take 1 slice, you have one quarter: 1/4. The parts must be equal for the fraction to describe a fair share."] },
          { heading: "Meet the numerator and denominator", paragraphs: ["The denominator is the bottom number. It tells you how many equal parts make up the whole.", "The numerator is the top number. It tells you how many of those parts we are talking about."] },
          { heading: "Let's try an example", paragraphs: ["A chocolate bar is split into 6 equal pieces. You eat 2 pieces. The fraction you ate is 2/6: 2 pieces are counted, out of 6 equal pieces in total.", "Remember: count the parts you have for the numerator, then count all equal parts for the denominator."] }
        ],
        keyIdea: "Numerator = parts counted. Denominator = total equal parts."
      }
    ],
    activities: [
      {
        id: "fraction-quick-check",
        type: "quiz",
        title: "Fraction quick check",
        instructions: "Choose an answer for each question. You can try again if you need to.",
        pointsPerCorrect: 5,
        questions: [
          { prompt: "A shape is divided into 4 equal parts. You shade 1 part. Which fraction is shaded?", options: ["1/4", "4/1", "3/4"], answer: "1/4", hint: "The numerator is the number of shaded parts.", explanation: "1 out of 4 equal parts is 1/4." },
          { prompt: "In the fraction 3/5, what does the bottom number 5 tell you?", options: ["Parts counted", "Total equal parts", "Number of wholes"], answer: "Total equal parts", hint: "Look at the denominator.", explanation: "The denominator is the bottom number. It tells how many equal parts make up the whole." },
          { prompt: "A sandwich is cut into 8 equal pieces. You take 3. What fraction did you take?", options: ["8/3", "3/8", "3/5"], answer: "3/8", hint: "Put the pieces you took on top and all pieces on the bottom.", explanation: "You took 3 of the 8 equal pieces, so the fraction is 3/8." }
        ]
      },
      {
        id: "fraction-terms-match",
        type: "matching",
        title: "Match the fraction words",
        instructions: "Choose a word on the left, then choose the matching meaning on the right.",
        pairs: [
          { term: "Numerator", meaning: "Parts being counted" },
          { term: "Denominator", meaning: "Total number of equal parts" },
          { term: "Whole", meaning: "One complete object or amount" }
        ],
        successMessage: "Great matching! You connected every word to its meaning."
      }
    ]
  }
};