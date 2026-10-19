/* Gamification catalogue for Al-Jaleel Academy Learning Playground.
   Stable IDs and local-only state keep existing learner records independent. */
window.PLAYGROUND_GAMIFICATION = {
  version: 1,
  levels: [
    { id: "fraction-1", number: 1, title: "Meet the Fractions", subtitle: "Spot the biggest and smallest fractions.", questionIndexes: [0, 1] },
    { id: "fraction-2", number: 2, title: "Equivalent Explorers", subtitle: "Find fractions that name the same amount.", questionIndexes: [2, 7] },
    { id: "fraction-3", number: 3, title: "Fraction Detectives", subtitle: "Solve missing numbers and spot mistakes.", questionIndexes: [4, 5] },
    { id: "fraction-4", number: 4, title: "Compare Champions", subtitle: "Compare fractions with confidence.", questionIndexes: [3, 9] },
    { id: "fraction-5", number: 5, title: "Fraction Master", subtitle: "Finish the number-line and mixed challenge.", questionIndexes: [6, 8] }
  ],
  rewards: [
    { id: "avatar-lion", category: "Avatars", name: "Brave Lion", icon: "🦁", price: 100, kind: "avatar" },
    { id: "avatar-rabbit", category: "Avatars", name: "Happy Rabbit", icon: "🐰", price: 100, kind: "avatar" },
    { id: "avatar-robot", category: "Avatars", name: "Little Robot", icon: "🤖", price: 150, kind: "avatar" },
    { id: "avatar-astronaut", category: "Avatars", name: "Space Explorer", icon: "👩‍🚀", price: 200, kind: "avatar" },
    { id: "background-rainbow", category: "Backgrounds", name: "Rainbow Sky", icon: "🌈", price: 150, kind: "background" },
    { id: "background-space", category: "Backgrounds", name: "Starry Space", icon: "🌌", price: 200, kind: "background" },
    { id: "sticker-star", category: "Stickers", name: "Shining Star", icon: "🌟", price: 50, kind: "sticker" },
    { id: "sticker-book", category: "Stickers", name: "Book Buddy", icon: "📚", price: 50, kind: "sticker" },
    { id: "outfit-glasses", category: "Outfits", name: "Cool Glasses", icon: "🕶️", price: 100, kind: "outfit" },
    { id: "outfit-crown", category: "Outfits", name: "Little Crown", icon: "👑", price: 150, kind: "outfit" },
    { id: "decoration-gold-frame", category: "Profile Decorations", name: "Golden Frame", icon: "🟨", price: 150, kind: "decoration" },
    { id: "decoration-trophy", category: "Profile Decorations", name: "Trophy Badge", icon: "🏆", price: 200, kind: "decoration" }
  ]
};
