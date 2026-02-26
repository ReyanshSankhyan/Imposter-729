export const CATEGORIES = {
  Animals: [
    { word: "Lion", hints: ["A large cat", "King of the jungle", "Has a mane"] },
    { word: "Elephant", hints: ["Has a trunk", "Largest land mammal", "Has big ears"] },
    { word: "Giraffe", hints: ["Very tall", "Has a long neck", "Eats leaves from trees"] },
    { word: "Penguin", hints: ["A bird that swims", "Lives in the cold", "Waddles when walking"] },
    { word: "Kangaroo", hints: ["Hops around", "Has a pouch", "Native to Australia"] },
    { word: "Dolphin", hints: ["Smart marine mammal", "Uses echolocation", "Playful ocean creature"] },
    { word: "Tiger", hints: ["Striped predator", "Large orange cat", "Fierce jungle hunter"] },
    { word: "Bear", hints: ["Loves honey", "Hibernates in winter", "Large furry mammal"] },
  ],
  Food: [
    { word: "Pizza", hints: ["Round and sliced", "Has cheese and tomato sauce", "Baked in an oven"] },
    { word: "Sushi", hints: ["Raw fish and rice", "Wrapped in seaweed", "Eaten with chopsticks"] },
    { word: "Burger", hints: ["Meat in a bun", "Often served with fries", "Fast food staple"] },
    { word: "Taco", hints: ["Mexican street food", "Folded tortilla", "Filled with meat and cheese"] },
    { word: "Ice Cream", hints: ["Cold and sweet", "Served in a cone", "Melts in the heat"] },
    { word: "Pasta", hints: ["Italian noodles", "Boiled in water", "Served with sauce"] },
    { word: "Salad", hints: ["Healthy greens", "Tossed in a bowl", "Often has dressing"] },
    { word: "Steak", hints: ["Cooked meat", "Cut from beef", "Often grilled"] },
  ],
  Professions: [
    { word: "Doctor", hints: ["Heals people", "Works in a hospital", "Wears a stethoscope"] },
    { word: "Teacher", hints: ["Educates students", "Works in a school", "Writes on a board"] },
    { word: "Firefighter", hints: ["Puts out fires", "Drives a red truck", "Rescues people"] },
    { word: "Chef", hints: ["Cooks food", "Works in a kitchen", "Wears a tall white hat"] },
    { word: "Police Officer", hints: ["Enforces the law", "Wears a badge", "Drives a patrol car"] },
    { word: "Artist", hints: ["Creates art", "Paints on canvas", "Uses brushes"] },
    { word: "Musician", hints: ["Plays instruments", "Performs on stage", "Reads sheet music"] },
    { word: "Pilot", hints: ["Flies planes", "Works in a cockpit", "Travels the world"] },
  ],
  Countries: [
    { word: "Japan", hints: ["Island nation in Asia", "Known for sushi", "Has the rising sun flag"] },
    { word: "Brazil", hints: ["Largest country in South America", "Known for the Amazon", "Famous for Carnival"] },
    { word: "France", hints: ["Known for the Eiffel Tower", "Famous for wine and cheese", "Capital is Paris"] },
    { word: "Australia", hints: ["A country and a continent", "Home to kangaroos", "Has the Outback"] },
    { word: "Egypt", hints: ["Home to the Pyramids", "Has the Nile river", "Known for pharaohs"] },
    { word: "Canada", hints: ["Known for maple syrup", "Has a leaf on its flag", "North of the USA"] },
    { word: "Italy", hints: ["Boot-shaped country", "Famous for pasta", "Home to the Colosseum"] },
    { word: "India", hints: ["Famous for the Taj Mahal", "Known for spices", "Second most populous country"] },
  ],
  "Famous People": [
    { word: "Albert Einstein", hints: ["Famous physicist", "Developed the theory of relativity", "Known for E=mc²"] },
    { word: "Marilyn Monroe", hints: ["Iconic blonde actress", "Starred in 1950s movies", "Sang 'Happy Birthday' to a president"] },
    { word: "Leonardo da Vinci", hints: ["Painted the Mona Lisa", "Renaissance polymath", "Sketched flying machines"] },
    { word: "Michael Jackson", hints: ["King of Pop", "Known for the Moonwalk", "Sang 'Thriller'"] },
    { word: "Cleopatra", hints: ["Last active ruler of ancient Egypt", "Had a relationship with Julius Caesar", "Known for her beauty and intelligence"] },
    { word: "William Shakespeare", hints: ["Famous playwright", "Wrote Romeo and Juliet", "The Bard of Avon"] },
    { word: "Elvis Presley", hints: ["King of Rock and Roll", "Lived in Graceland", "Known for his hip movements"] },
    { word: "Abraham Lincoln", hints: ["16th US President", "Wore a tall top hat", "Led during the Civil War"] }
  ],
  Objects: [
    { word: "Clock", hints: ["Tells the time", "Has hands and a face", "Ticks constantly"] },
    { word: "Umbrella", hints: ["Keeps you dry", "Opens up like a canopy", "Used in the rain"] },
    { word: "Mirror", hints: ["Shows a reflection", "Made of glass", "Used to check your appearance"] },
    { word: "Key", hints: ["Unlocks doors", "Made of metal", "Fits in a lock"] },
    { word: "Scissors", hints: ["Cuts paper", "Has two blades", "Used for crafting"] },
    { word: "Chair", hints: ["Used for sitting", "Usually has four legs", "Found at a table"] },
    { word: "Telephone", hints: ["Used to call people", "Rings when someone wants you", "Has a receiver"] },
    { word: "Book", hints: ["Has pages to read", "Contains a story or information", "Found in a library"] }
  ],
  Movies: [
    { word: "The Matrix", hints: ["Features a simulated reality", "Main character is Neo", "Red pill or blue pill"] },
    { word: "Titanic", hints: ["About a sinking ship", "Jack and Rose", "Won 11 Oscars"] },
    { word: "Star Wars", hints: ["Features lightsabers", "Set in a galaxy far, far away", "Darth Vader is the villain"] },
    { word: "Jurassic Park", hints: ["Features cloned dinosaurs", "Theme park goes wrong", "Directed by Steven Spielberg"] },
    { word: "Avatar", hints: ["Set on Pandora", "Features blue aliens", "Highest-grossing film"] },
    { word: "The Lion King", hints: ["Animated film about animals", "Simba's journey", "Features 'Hakuna Matata'"] },
    { word: "Jaws", hints: ["About a giant shark", "Set in Amity Island", "Has a famous two-note theme"] },
    { word: "Harry Potter", hints: ["About a boy wizard", "Goes to Hogwarts", "Fights Voldemort"] }
  ]
};

export type Category = keyof typeof CATEGORIES;

export const getRandomWord = (category: Category) => {
  const words = CATEGORIES[category];
  const randomWordObj = words[Math.floor(Math.random() * words.length)];
  const randomHint = randomWordObj.hints[Math.floor(Math.random() * randomWordObj.hints.length)];
  return { word: randomWordObj.word, hint: randomHint };
};
