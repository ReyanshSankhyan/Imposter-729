export const CATEGORIES = {
  Animals: [
    { word: "Lion", hint: "A large cat" },
    { word: "Elephant", hint: "Has a trunk" },
    { word: "Giraffe", hint: "Very tall" },
    { word: "Penguin", hint: "A bird that swims" },
    { word: "Kangaroo", hint: "Hops around" },
    { word: "Dolphin", hint: "Smart marine mammal" },
    { word: "Tiger", hint: "Striped predator" },
    { word: "Bear", hint: "Loves honey" },
  ],
  Food: [
    { word: "Pizza", hint: "Round and sliced" },
    { word: "Sushi", hint: "Raw fish and rice" },
    { word: "Burger", hint: "Meat in a bun" },
    { word: "Taco", hint: "Mexican street food" },
    { word: "Ice Cream", hint: "Cold and sweet" },
    { word: "Pasta", hint: "Italian noodles" },
    { word: "Salad", hint: "Healthy greens" },
    { word: "Steak", hint: "Cooked meat" },
  ],
  Professions: [
    { word: "Doctor", hint: "Heals people" },
    { word: "Teacher", hint: "Educates students" },
    { word: "Firefighter", hint: "Puts out fires" },
    { word: "Chef", hint: "Cooks food" },
    { word: "Police Officer", hint: "Enforces the law" },
    { word: "Artist", hint: "Creates art" },
    { word: "Musician", hint: "Plays instruments" },
    { word: "Pilot", hint: "Flies planes" },
  ],
  Countries: [
    { word: "Japan", hint: "Island nation in Asia" },
    { word: "Brazil", hint: "Largest country in South America" },
    { word: "France", hint: "Known for the Eiffel Tower" },
    { word: "Australia", hint: "A country and a continent" },
    { word: "Egypt", hint: "Home to the Pyramids" },
    { word: "Canada", hint: "Known for maple syrup" },
    { word: "Italy", hint: "Boot-shaped country" },
    { word: "India", hint: "Famous for the Taj Mahal" },
  ]
};

export type Category = keyof typeof CATEGORIES;

export const getRandomWord = (category: Category) => {
  const words = CATEGORIES[category];
  return words[Math.floor(Math.random() * words.length)];
};
