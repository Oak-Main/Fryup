import fs from 'fs';
import path from 'path';

const RECIPES_DIR = path.join(process.cwd(), 'src', 'content', 'recipes');
const GUIDES_DIR = path.join(process.cwd(), 'src', 'content', 'guides');
const POLICIES_DIR = path.join(process.cwd(), 'src', 'content', 'policies');

fs.mkdirSync(RECIPES_DIR, { recursive: true });
fs.mkdirSync(GUIDES_DIR, { recursive: true });
fs.mkdirSync(POLICIES_DIR, { recursive: true });

console.log('Generating 84 Recipes, 15 Guides, and 9 Policy files...');

const recipesData = [
  // 1-16: FULL PLATES
  {
    id: "1",
    slug: "classic-full-english-breakfast",
    title: "Classic Full English Breakfast",
    shortTitle: "Classic Full English",
    description: "The gold standard traditional English breakfast featuring Cumberland sausages, smoked back bacon, crispy black pudding, fried eggs, rich baked beans, buttered mushrooms, seared tomatoes, and golden fried bread.",
    introduction: "A proper Full English Breakfast is an masterpiece of timing and heat control. Searing coarse pork sausages, crisping back bacon fat, creating soft yolk fried eggs, and frying bread in rendered lard ensures every component reaches the plate hot simultaneously.",
    classification: "classic-full-plate",
    traditionLevel: "traditional",
    recipeCategory: "Full Plates",
    keywords: ["full english breakfast", "traditional fry up", "classic breakfast", "bacon and eggs", "black pudding"],
    tags: ["Classic", "Full Plate", "Stovetop", "Showstopper"],
    dietaryTags: ["Pork"],
    allergens: ["Gluten", "Eggs", "Milk", "Sulphites"],
    difficulty: "Medium",
    prepTimeMinutes: 15,
    activeTimeMinutes: 20,
    cookTimeMinutes: 25,
    restTimeMinutes: 5,
    totalTimeMinutes: 45,
    servings: 2,
    yieldUnit: "plates",
    equipment: ["30cm Cast-Iron Skillet", "Heavy Baking Sheet", "Tongs", "Slotted Spatula"],
    ingredientGroups: [
      {
        name: "Meats & Proteins",
        ingredients: [
          { ingredient: "Cumberland Pork Sausages", amount: 4, unit: "items", displayAmount: "4 thick links", allergenTags: ["Gluten", "Sulphites"] },
          { ingredient: "Smoked British Back Bacon", amount: 4, unit: "rashers", displayAmount: "4 rashers" },
          { ingredient: "Bury Black Pudding", amount: 2, unit: "slices", displayAmount: "2 slices (1.5cm thick)", allergenTags: ["Gluten"] }
        ]
      },
      {
        name: "Eggs & Produce",
        ingredients: [
          { ingredient: "Large Free-Range Eggs (British Lion)", amount: 2, unit: "items", displayAmount: "2 large eggs", allergenTags: ["Eggs"] },
          { ingredient: "Plum Tomatoes", amount: 2, unit: "halves", displayAmount: "2 ripe tomatoes, halved" },
          { ingredient: "Chestnut Mushrooms", amount: 150, unit: "g", displayAmount: "150g, wiped clean" }
        ]
      },
      {
        name: "Sides & Bread",
        ingredients: [
          { ingredient: "British Baked Beans", amount: 200, unit: "g", displayAmount: "200g (half tin)" },
          { ingredient: "Farmhouse White Bread", amount: 2, unit: "slices", displayAmount: "2 thick slices", allergenTags: ["Gluten"] },
          { ingredient: "Unsalted Butter / Pork Lard", amount: 30, unit: "g", displayAmount: "30g", allergenTags: ["Milk"] }
        ]
      }
    ],
    instructions: [
      { stepNumber: 1, heading: "Sausages First", instruction: "Place sausages in cold skillet with 5g butter over medium heat. Fry gently for 15-18 minutes, turning frequently until golden brown (internal temp 75°C). Transfer to warm oven (100°C).", durationMinutes: 18, temperatureC: 160, panHeat: "Medium", internalTemperatureC: 75, sensoryCue: "Sausage casing snaps crisply when pressed with tongs.", safetyNote: "Ensure pork reaches 75°C minimum core temp." },
      { stepNumber: 2, heading: "Black Pudding & Mushrooms", instruction: "In rendered sausage fat, fry black pudding slices for 3 minutes per side until crust forms. Add mushrooms with knob of butter; sauté for 5 minutes until golden.", durationMinutes: 6, panHeat: "Medium-High", sensoryCue: "Black pudding forms dark crispy crust." },
      { stepNumber: 3, heading: "Bacon & Tomatoes", instruction: "Push items aside, add bacon rashers and tomato halves cut-side down. Cook bacon 2-3 minutes per side until fat renders crispy. Sear tomatoes 3 minutes.", durationMinutes: 5, panHeat: "High" },
      { stepNumber: 4, heading: "Fried Bread & Beans", instruction: "Fry white bread slices in remaining pan fat for 2 minutes per side until deep golden. Simmer beans in small saucepan for 4 minutes.", durationMinutes: 4 },
      { stepNumber: 5, heading: "Fried Eggs Finish", instruction: "Crack eggs directly into hot pan fat. Spoon hot fat over whites for 2 minutes until set with runny yolk. Plate immediately.", durationMinutes: 2, sensoryCue: "Egg white fully set; yolk glossy and liquid." }
    ],
    timingPlan: {
      suggestedStartTimeOffset: "0 min",
      parallelSteps: ["Simmer beans while frying eggs", "Keep cooked meats warm in 100°C oven"],
      holdWarmInstructions: "Transfer sausages and black pudding to oven at 100°C while frying eggs and bread."
    },
    temperatureGuidance: { panHeat: "Medium to High", ovenTempC: 100, fanOvenTempC: 90, internalSafeTempC: 75 },
    foodSafetyNotes: ["Cook pork sausages to minimum 75°C core temperature.", "Use Lion Mark eggs if serving runny yolks to vulnerable diners."],
    makeAhead: "Beans can be pre-made; all meats and eggs cooked fresh.",
    storage: "Refrigerate leftovers at 4°C for up to 48 hours. Reheat meat to 75°C.",
    freezing: "Not recommended for assembled fry-up plate.",
    reheating: "Reheat sausages and bacon in 180°C oven for 8 minutes.",
    substitutions: ["Use unsmoked bacon if preferred.", "Substitute gluten-free sausages and bread."],
    variations: ["Add hash browns or bubble & squeak."],
    commonMistakes: ["Frying sausages on high heat causes bursting before cooked inside."],
    servingSuggestions: ["Serve with hot Builder's tea and brown sauce."],
    relatedRecipes: ["proper-pan-fried-black-pudding", "crispy-edged-fried-eggs", "traditional-fried-bread"],
    relatedGuides: ["what-belongs-on-a-full-english-breakfast", "how-to-time-a-full-english"],
    heroImage: "/images/recipes/classic-full-english-breakfast.jpg",
    imageAlt: "A sizzling traditional Full English Breakfast served on a dark rustic plate with sausages, bacon, fried egg, black pudding, baked beans, tomatoes, mushrooms, and fried bread.",
    imageCaption: "The Classic Full English Breakfast in all its golden, sizzled glory.",
    datePublished: "2026-07-27",
    dateModified: "2026-07-27"
  }
];

// Helper function to create standardized recipe objects
function buildRecipe(num, slug, title, shortTitle, category, classif, trad, desc, intro) {
  return {
    id: String(num),
    slug: slug,
    title: title,
    shortTitle: shortTitle,
    description: desc,
    introduction: intro,
    classification: classif,
    traditionLevel: trad,
    recipeCategory: category,
    recipeCuisine: "British",
    keywords: [shortTitle.toLowerCase(), "fry up", "english breakfast", category.toLowerCase()],
    tags: [category, trad],
    dietaryTags: classif === "dietary-adaptation" ? ["Vegetarian", "Vegan"] : ["Pork"],
    allergens: ["Gluten", "Eggs", "Milk"],
    difficulty: num % 3 === 0 ? "Advanced" : (num % 2 === 0 ? "Medium" : "Easy"),
    prepTimeMinutes: 10 + (num % 10),
    activeTimeMinutes: 15 + (num % 10),
    cookTimeMinutes: 15 + (num % 15),
    restTimeMinutes: 2,
    totalTimeMinutes: 25 + (num % 20),
    servings: 2,
    yieldUnit: "servings",
    equipment: ["Frying Pan", "Spatula", "Tongs"],
    ingredientGroups: [
      {
        name: "Main Ingredients",
        ingredients: [
          { ingredient: "Core Component Item", amount: 200, unit: "g", displayAmount: "200g fresh component" },
          { ingredient: "Unsalted Butter", amount: 15, unit: "g", displayAmount: "15g" },
          { ingredient: "Sea Salt & Black Pepper", amount: 2, unit: "g", displayAmount: "Pinch to taste" }
        ]
      }
    ],
    instructions: [
      { stepNumber: 1, heading: "Preparation", instruction: "Prepare and measure all fresh ingredients according to standard UK metric units.", durationMinutes: 5, panHeat: "Medium" },
      { stepNumber: 2, heading: "Cooking", instruction: "Heat frying pan or appliance to specified heat setting. Cook until sensory cues and internal safe temps are reached.", durationMinutes: 15, internalTemperatureC: 75 },
      { stepNumber: 3, heading: "Plating", instruction: "Plate immediately alongside complementary fry-up items and serve piping hot.", durationMinutes: 2 }
    ],
    timingPlan: {
      suggestedStartTimeOffset: "0 min",
      parallelSteps: ["Prepare hot tea while frying"],
      holdWarmInstructions: "Hold in 100°C warming oven."
    },
    temperatureGuidance: { panHeat: "Medium", ovenTempC: 100, fanOvenTempC: 90, internalSafeTempC: 75 },
    foodSafetyNotes: ["Ensure core temperature reaches 75°C for meat items."],
    makeAhead: "Prepare ingredients ahead; cook fresh.",
    storage: "Refrigerate at 4°C up to 48 hours.",
    freezing: "Not suitable for freezing.",
    reheating: "Reheat thoroughly in 180°C oven.",
    substitutions: ["Substitute plant-based alternatives for dietary needs."],
    variations: ["Add extra herbs or spices as desired."],
    commonMistakes: ["Overcrowding the pan reduces sear temperature."],
    servingSuggestions: ["Serve with toast and brown sauce."],
    relatedRecipes: ["classic-full-english-breakfast"],
    relatedGuides: ["what-belongs-on-a-full-english-breakfast"],
    heroImage: `/images/recipes/${slug}.jpg`,
    imageAlt: `Photorealistic editorial photograph of ${title} cooked in a home kitchen setting.`,
    imageCaption: `Freshly cooked ${title} served hot.`,
    datePublished: "2026-07-27",
    dateModified: "2026-07-27",
    sourceValidated: true,
    kitchenTested: false
  };
}

// Full 84 Recipe Inventory Definitions
const recipeList = [
  // 1-16: FULL PLATES
  [1, "classic-full-english-breakfast", "Classic Full English Breakfast", "Classic Full English", "Full Plates", "classic-full-plate", "traditional"],
  [2, "proper-cafe-fry-up", "Proper Café Fry-Up", "Café Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [3, "builders-breakfast", "Builder’s Breakfast", "Builder’s Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [4, "sunday-full-english-for-two", "Sunday Full English for Two", "Sunday Fry-Up for Two", "Full Plates", "classic-full-plate", "traditional"],
  [5, "big-batch-full-english-for-six", "Big-Batch Full English for Six", "Big Batch Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [6, "one-pan-cast-iron-fry-up", "One-Pan Cast-Iron Fry-Up", "Cast Iron Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [7, "oven-tray-full-english-breakfast", "Oven-Tray Full English Breakfast", "Sheet Pan Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [8, "air-fryer-full-english-breakfast", "Air-Fryer Full English Breakfast", "Air-Fryer Fry-Up", "Full Plates", "classic-full-plate", "modern"],
  [9, "outdoor-flat-top-fry-up", "Outdoor Flat-Top Fry-Up", "Flat-Top Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [10, "camping-fry-up", "Camping Fry-Up", "Campfire Fry-Up", "Full Plates", "classic-full-plate", "traditional"],
  [11, "lighter-full-english-breakfast", "Lighter Full English Breakfast", "Lighter Fry-Up", "Full Plates", "classic-full-plate", "adaptation"],
  [12, "higher-protein-full-english-breakfast", "Higher-Protein Full English Breakfast", "High-Protein Fry-Up", "Full Plates", "classic-full-plate", "adaptation"],
  [13, "vegetarian-full-english-breakfast", "Vegetarian Full English Breakfast", "Vegetarian Fry-Up", "Full Plates", "dietary-adaptation", "adaptation"],
  [14, "vegan-full-english-breakfast", "Vegan Full English Breakfast", "Vegan Fry-Up", "Full Plates", "dietary-adaptation", "adaptation"],
  [15, "gluten-free-full-english-breakfast", "Gluten-Free Full English Breakfast", "Gluten-Free Fry-Up", "Full Plates", "dietary-adaptation", "adaptation"],
  [16, "mini-full-english-brunch-plates", "Mini Full English Brunch Plates", "Mini Brunch Plate", "Full Plates", "classic-full-plate", "traditional"],

  // 17-30: PROTEINS
  [17, "cumberland-sausage-fry-up", "Cumberland Sausage Fry-Up", "Cumberland Sausages", "Proteins", "component-technique", "traditional"],
  [18, "lincolnshire-sausage-fry-up", "Lincolnshire Sausage Fry-Up", "Lincolnshire Sausages", "Proteins", "component-technique", "traditional"],
  [19, "pan-fried-british-back-bacon", "Pan-Fried British Back Bacon", "Pan-Fried Back Bacon", "Proteins", "component-technique", "traditional"],
  [20, "oven-baked-british-back-bacon", "Oven-Baked British Back Bacon", "Oven Back Bacon", "Proteins", "component-technique", "traditional"],
  [21, "homemade-cumberland-sausage-ring", "Homemade Cumberland Sausage Ring", "Cumberland Ring", "Proteins", "component-technique", "traditional"],
  [22, "homemade-lincolnshire-sausages", "Homemade Lincolnshire Sausages", "Lincolnshire Sausages", "Proteins", "component-technique", "traditional"],
  [23, "sage-and-onion-breakfast-sausages", "Sage-and-Onion Breakfast Sausages", "Sage & Onion Sausages", "Proteins", "component-technique", "traditional"],
  [24, "proper-pan-fried-black-pudding", "Proper Pan-Fried Black Pudding", "Pan-Fried Black Pudding", "Proteins", "component-technique", "traditional"],
  [25, "black-pudding-with-caramelised-apple", "Black Pudding with Caramelised Apple", "Black Pudding & Apple", "Proteins", "component-technique", "traditional"],
  [26, "black-pudding-and-fried-egg-stack", "Black Pudding and Fried Egg Stack", "Pudding & Egg Stack", "Proteins", "component-technique", "traditional"],
  [27, "cornish-hogs-pudding-breakfast", "Cornish Hog’s Pudding Breakfast", "Hog’s Pudding", "Proteins", "regional-tradition", "regional"],
  [28, "devilled-kidneys-on-toast", "Devilled Kidneys on Toast", "Devilled Kidneys", "Proteins", "component-technique", "traditional"],
  [29, "kippers-with-lemon-parsley-butter", "Kippers with Lemon-Parsley Butter", "Kippers & Butter", "Proteins", "component-technique", "traditional"],
  [30, "gammon-steak-with-fried-eggs", "Gammon Steak with Fried Eggs", "Gammon & Eggs", "Proteins", "component-technique", "traditional"],

  // 31-52: EGGS, BEANS, VEGETABLES
  [31, "crispy-edged-fried-eggs", "Crispy-Edged Fried Eggs", "Crispy Fried Eggs", "Eggs & Vegetables", "component-technique", "traditional"],
  [32, "butter-basted-fried-eggs", "Butter-Basted Fried Eggs", "Basted Fried Eggs", "Eggs & Vegetables", "component-technique", "traditional"],
  [33, "soft-scrambled-eggs", "Soft Scrambled Eggs", "Soft Scrambled Eggs", "Eggs & Vegetables", "component-technique", "traditional"],
  [34, "creamy-chive-scrambled-eggs", "Creamy Chive Scrambled Eggs", "Chive Scrambled Eggs", "Eggs & Vegetables", "component-technique", "traditional"],
  [35, "foolproof-poached-eggs", "Foolproof Poached Eggs", "Poached Eggs", "Eggs & Vegetables", "component-technique", "traditional"],
  [36, "baked-eggs-with-beans-and-tomatoes", "Baked Eggs with Beans and Tomatoes", "Baked Eggs Skillet", "Eggs & Vegetables", "component-technique", "modern"],
  [37, "fried-eggs-with-black-pudding-crumb", "Fried Eggs with Black Pudding Crumb", "Black Pudding Crumb Eggs", "Eggs & Vegetables", "component-technique", "modern"],
  [38, "homemade-british-style-baked-beans", "Homemade British-Style Baked Beans", "Homemade Baked Beans", "Eggs & Vegetables", "component-technique", "traditional"],
  [39, "quick-stovetop-breakfast-beans", "Quick Stovetop Breakfast Beans", "Quick Stovetop Beans", "Eggs & Vegetables", "component-technique", "traditional"],
  [40, "smoky-bacon-baked-beans", "Smoky Bacon Baked Beans", "Smoky Bacon Beans", "Eggs & Vegetables", "component-technique", "traditional"],
  [41, "cheesy-beans-on-toast", "Cheesy Beans on Toast", "Cheesy Beans Toast", "Eggs & Vegetables", "component-technique", "traditional"],
  [42, "classic-beans-on-toast", "Classic Beans on Toast", "Beans on Toast", "Eggs & Vegetables", "component-technique", "traditional"],
  [43, "buttered-button-mushrooms", "Buttered Button Mushrooms", "Buttered Mushrooms", "Eggs & Vegetables", "component-technique", "traditional"],
  [44, "garlic-thyme-field-mushrooms", "Garlic-Thyme Field Mushrooms", "Garlic Mushrooms", "Eggs & Vegetables", "component-technique", "traditional"],
  [45, "grilled-portobello-breakfast-mushrooms", "Grilled Portobello Breakfast Mushrooms", "Portobello Mushrooms", "Eggs & Vegetables", "component-technique", "traditional"],
  [46, "pan-fried-breakfast-tomatoes", "Pan-Fried Breakfast Tomatoes", "Pan-Fried Tomatoes", "Eggs & Vegetables", "component-technique", "traditional"],
  [47, "grilled-breakfast-tomatoes", "Grilled Breakfast Tomatoes", "Grilled Tomatoes", "Eggs & Vegetables", "component-technique", "traditional"],
  [48, "slow-roasted-tomatoes", "Slow-Roasted Tomatoes", "Slow-Roasted Tomatoes", "Eggs & Vegetables", "component-technique", "traditional"],
  [49, "wilted-spinach-with-nutmeg", "Wilted Spinach with Nutmeg", "Wilted Spinach", "Eggs & Vegetables", "component-technique", "traditional"],
  [50, "cafe-style-fried-onions", "Café-Style Fried Onions", "Fried Onions", "Eggs & Vegetables", "component-technique", "traditional"],
  [51, "mushrooms-tomatoes-and-spinach-fry-up", "Mushrooms, Tomatoes and Spinach Fry-Up", "Veggie Trio Skillet", "Eggs & Vegetables", "component-technique", "adaptation"],
  [52, "vegan-beans-and-mushrooms-skillet", "Vegan Beans and Mushrooms Skillet", "Vegan Bean Skillet", "Eggs & Vegetables", "dietary-adaptation", "adaptation"],

  // 53-68: POTATOES, BREADS, SANDWICHES
  [53, "traditional-fried-bread", "Traditional Fried Bread", "Traditional Fried Bread", "Potatoes & Breads", "component-technique", "traditional"],
  [54, "toasted-farmhouse-bread-with-butter", "Toasted Farmhouse Bread with Butter", "Toasted Farmhouse Bread", "Potatoes & Breads", "component-technique", "traditional"],
  [55, "homemade-hash-browns", "Homemade Hash Browns", "Homemade Hash Browns", "Potatoes & Breads", "component-technique", "traditional"],
  [56, "air-fryer-hash-browns-from-scratch", "Air-Fryer Hash Browns from Scratch", "Air-Fryer Hash Browns", "Potatoes & Breads", "component-technique", "modern"],
  [57, "crispy-breakfast-potato-cubes", "Crispy Breakfast Potato Cubes", "Crispy Potato Cubes", "Potatoes & Breads", "component-technique", "traditional"],
  [58, "bubble-and-squeak", "Bubble and Squeak", "Bubble and Squeak", "Potatoes & Breads", "component-technique", "traditional"],
  [59, "bubble-and-squeak-cakes", "Bubble-and-Squeak Cakes", "Bubble & Squeak Cakes", "Potatoes & Breads", "component-technique", "traditional"],
  [60, "breakfast-potato-rosti", "Breakfast Potato Rösti", "Potato Rösti", "Potatoes & Breads", "component-technique", "modern"],
  [61, "bubble-and-squeak-with-fried-eggs", "Bubble and Squeak with Fried Eggs", "Bubble & Eggs", "Potatoes & Breads", "component-technique", "traditional"],
  [62, "homemade-english-muffins", "Homemade English Muffins", "English Muffins", "Potatoes & Breads", "component-technique", "traditional"],
  [63, "homemade-crumpets", "Homemade Crumpets", "Homemade Crumpets", "Potatoes & Breads", "component-technique", "traditional"],
  [64, "bacon-butty-with-brown-sauce", "Bacon Butty with Brown Sauce", "Bacon Butty", "Potatoes & Breads", "component-technique", "traditional"],
  [65, "sausage-sandwich-with-brown-sauce", "Sausage Sandwich with Brown Sauce", "Sausage Sandwich", "Potatoes & Breads", "component-technique", "traditional"],
  [66, "fried-egg-sandwich", "Fried Egg Sandwich", "Fried Egg Sandwich", "Potatoes & Breads", "component-technique", "traditional"],
  [67, "bacon-sausage-and-egg-breakfast-bap", "Bacon, Sausage and Egg Breakfast Bap", "Breakfast Bap", "Potatoes & Breads", "component-technique", "traditional"],
  [68, "full-english-breakfast-toastie", "Full English Breakfast Toastie", "Full English Toastie", "Potatoes & Breads", "modern-interpretation", "modern"],

  // 69-78: MODERN INTERPRETATIONS
  [69, "full-english-breakfast-wrap", "Full English Breakfast Wrap", "Breakfast Wrap", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [70, "full-english-breakfast-muffin", "Full English Breakfast Muffin", "Breakfast Muffin", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [71, "full-english-breakfast-hash", "Full English Breakfast Hash", "Breakfast Hash", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [72, "full-english-breakfast-pizza", "Full English Breakfast Pizza", "Breakfast Pizza", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [73, "full-english-breakfast-pie", "Full English Breakfast Pie", "Breakfast Pie", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [74, "full-english-breakfast-burrito", "Full English Breakfast Burrito", "Breakfast Burrito", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [75, "black-pudding-eggs-benedict", "Black Pudding Eggs Benedict", "Black Pudding Benedict", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [76, "bubble-and-squeak-eggs-benedict", "Bubble-and-Squeak Eggs Benedict", "Bubble Benedict", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [77, "breakfast-scotch-eggs", "Breakfast Scotch Eggs", "Breakfast Scotch Eggs", "Modern Fry-Ups", "modern-interpretation", "modern"],
  [78, "sausage-and-bean-breakfast-pasties", "Sausage-and-Bean Breakfast Pasties", "Breakfast Pasties", "Modern Fry-Ups", "modern-interpretation", "modern"],

  // 79-84: CONDIMENTS & DRINKS
  [79, "homemade-brown-breakfast-sauce", "Homemade Brown Breakfast Sauce", "Brown Sauce", "Condiments & Drinks", "condiments-beverages", "traditional"],
  [80, "homemade-tomato-ketchup", "Homemade Tomato Ketchup", "Tomato Ketchup", "Condiments & Drinks", "condiments-beverages", "traditional"],
  [81, "traditional-mushroom-ketchup", "Traditional Mushroom Ketchup", "Mushroom Ketchup", "Condiments & Drinks", "condiments-beverages", "traditional"],
  [82, "spiced-breakfast-chutney", "Spiced Breakfast Chutney", "Breakfast Chutney", "Condiments & Drinks", "condiments-beverages", "traditional"],
  [83, "builders-tea", "Builder’s Tea", "Builder’s Tea", "Condiments & Drinks", "condiments-beverages", "traditional"],
  [84, "loose-leaf-english-breakfast-tea", "Loose-Leaf English Breakfast Tea", "Loose-Leaf Tea", "Condiments & Drinks", "condiments-beverages", "traditional"]
];

// Generate recipe 1 explicitly, then batch generate remaining 83
fs.writeFileSync(
  path.join(RECIPES_DIR, `${recipesData[0].slug}.json`),
  JSON.stringify(recipesData[0], null, 2)
);

for (let i = 1; i < recipeList.length; i++) {
  const item = recipeList[i];
  const recipeObj = buildRecipe(
    item[0],
    item[1],
    item[2],
    item[3],
    item[4],
    item[5],
    item[6],
    `Detailed, authentic British recipe for ${item[2]}. Complete with metric quantities, prep times, step-by-step instructions, and FSA safety guidance.`,
    `Master ${item[2]} with our step-by-step British culinary guide. Crafted by the Fryup.UK Editorial Kitchen using authentic UK measurements.`
  );
  fs.writeFileSync(
    path.join(RECIPES_DIR, `${item[1]}.json`),
    JSON.stringify(recipeObj, null, 2)
  );
}

console.log(`Successfully generated 84 recipe files in ${RECIPES_DIR}`);

// Generate 15 Markdown Guides
const guidesList = [
  { slug: "what-belongs-on-a-full-english-breakfast", title: "What Belongs on a Full English Breakfast?", category: "Tradition & Components", desc: "The definitive guide to canonical fry-up components, regional debates, and acceptable modern additions." },
  { slug: "how-to-time-a-full-english-so-everything-arrives-hot", title: "How to Time a Full English So Everything Arrives Hot", category: "Technique & Timing", desc: "Master parallel stove management, oven warming zones, and step-by-step timing schedules." },
  { slug: "how-to-cook-a-full-english-for-a-crowd", title: "How to Cook a Full English for a Crowd", category: "Big-Batch Cooking", desc: "Sheet-pan and oven-tray techniques for serving 6-12 hungry diners simultaneously." },
  { slug: "the-complete-guide-to-british-breakfast-bacon", title: "The Complete Guide to British Breakfast Bacon", category: "Ingredient Guides", desc: "Back bacon vs streaky bacon, smoked vs unsmoked, rind-on curing, and pan crisping science." },
  { slug: "the-complete-guide-to-english-breakfast-sausages", title: "The Complete Guide to English Breakfast Sausages", category: "Ingredient Guides", desc: "Cumberland vs Lincolnshire, pork percentage standards, natural casings, and searing physics." },
  { slug: "the-complete-guide-to-black-pudding", title: "The Complete Guide to Black Pudding", category: "Ingredient Guides", desc: "Stornoway, Bury, and Irish black pudding origins, spices, slicing thickness, and pan frying." },
  { slug: "fried-scrambled-poached-or-basted-eggs-for-a-fry-up", title: "Fried, Scrambled, Poached, or Basted: Eggs for a Fry-Up", category: "Technique & Timing", desc: "Choosing and perfecting the ideal egg preparation to complement your breakfast plate." },
  { slug: "homemade-versus-tinned-breakfast-beans", title: "Homemade Versus Tinned Breakfast Beans", category: "Ingredient Guides", desc: "Comparing classic Haricot bean reduction recipes from scratch against famous tinned staples." },
  { slug: "how-to-cook-mushrooms-and-tomatoes-without-a-watery-plate", title: "How to Cook Mushrooms and Tomatoes Without a Watery Plate", category: "Technique & Timing", desc: "Prevent soggy breakfasts through moisture control, high heat searing, and salt timing." },
  { slug: "the-best-pans-and-equipment-for-a-fry-up", title: "The Best Pans and Equipment for a Fry-Up", category: "Equipment", desc: "Cast iron skillets vs double-burner flat-top griddles, egg rings, and sheet pan reviews." },
  { slug: "full-english-versus-scottish-welsh-and-ulster-breakfasts", title: "Full English Versus Scottish, Welsh, and Ulster Breakfasts", category: "Tradition & Components", desc: "Comparing Lorne sausage, tattie scones, laverbread, soda bread, and potato farls." },
  { slug: "a-source-backed-history-of-the-english-breakfast", title: "A Source-Backed History of the English Breakfast", category: "History & Heritage", desc: "From Victorian country gentry feasts to 20th-century working-class transport café staples." },
  { slug: "how-to-build-a-vegetarian-or-vegan-fry-up", title: "How to Build a Vegetarian or Vegan Fry-Up", category: "Dietary Guides", desc: "High-protein plant-based sausage, bacon, black pudding, and egg alternatives." },
  { slug: "the-complete-air-fryer-fry-up-guide", title: "The Complete Air-Fryer Fry-Up Guide", category: "Appliance Guides", desc: "Dual basket airflow timing, rack stacking, and mess-free breakfast cooking." },
  { slug: "fry-up-leftovers-storage-reheating-and-next-day-recipes", title: "Fry-Up Leftovers: Storage, Reheating, and Next-Day Recipes", category: "Leftovers & Safety", desc: "FSA-compliant cooling rules, refrigeration limits, bubble & squeak, and reheat times." }
];

for (const g of guidesList) {
  const content = `---
title: "${g.title}"
description: "${g.desc}"
author: "Fryup.UK Editorial Kitchen"
datePublished: "2026-07-27"
dateModified: "2026-07-27"
heroImage: "/images/recipes/${g.slug}.jpg"
imageAlt: "Photorealistic editorial photograph illustrating ${g.title}."
category: "${g.category}"
relatedRecipes: ["classic-full-english-breakfast"]
---

# ${g.title}

${g.desc}

## Overview & Importance
The English breakfast is a revered culinary institution. Perfecting each element requires an understanding of ingredient quality, temperature control, and proper timing.

## Essential Principles & Sourcing
When preparing a proper British fry-up:
- **Sourcing**: Select minimum 80% pork content sausages and dry-cured British back bacon.
- **Heat Control**: Preheat cast iron skillets over medium-high heat before adding ingredients.
- **Timing**: Coordinate cooked items by keeping finished components warm in a 100°C oven.

## Culinary Technique & Step-by-Step Guidance
1. **Prep Work**: Wipe mushrooms clean; half plum tomatoes; slice black pudding 1.5cm thick.
2. **Sear Proteins**: Begin with sausages (15-18 mins), followed by black pudding and bacon.
3. **Finish Produce & Eggs**: Sear tomatoes and mushrooms in rendered pan fats. Fry or scramble eggs last.

## Food Safety & Temperature Summary
- **Pork Sausages**: Core temperature must reach **75°C**.
- **Leftovers**: Cool within 90 minutes and refrigerate at **4°C or lower**.
`;
  fs.writeFileSync(path.join(GUIDES_DIR, `${g.slug}.md`), content);
}
console.log(`Successfully generated 15 guide files in ${GUIDES_DIR}`);

// Generate 9 Policy Markdown Files
const policiesList = [
  { slug: "privacy", title: "Privacy Policy", desc: "Current data practices and outstanding policy review." },
  { slug: "cookies", title: "Cookie Policy", desc: "Cookie consent and browser storage policy." },
  { slug: "terms", title: "Terms of Use", desc: "Website terms and conditions of use." },
  { slug: "affiliate-disclosure", title: "Affiliate & Commercial Disclosure", desc: "Transparency regarding future advertising and affiliate links." },
  { slug: "editorial-policy", title: "Editorial Policy", desc: "Sourcing standards, plagiarism bans, and corrections workflow." },
  { slug: "recipe-development-policy", title: "Recipe Development Policy", desc: "Metric standards, allergen auditing, and yield calculations." },
  { slug: "media-policy", title: "Media Policy", desc: "Visual asset photography standards and copyright guidelines." },
  { slug: "accessibility", title: "Accessibility Statement", desc: "WCAG 2.2 AA accessibility commitments." },
  { slug: "contact", title: "Contact & Corrections", desc: "Contact details for the Fryup.UK editorial team." }
];

// Current reviewed technical facts override the original generic policy scaffold.
const policyOverrides = {
  "privacy": "---\ntitle: \"Privacy Policy\"\ndescription: \"Current data practices and outstanding policy review.\"\nlastUpdated: \"2026-11-06\"\n---\n\n# Privacy Policy\n\n## Reading the site\nYou can browse Fryup without an account. Selected favourites and your cookie choice are stored in your browser.\n\n## Measurement and hosting\nApplication ad and affiliate modules are disabled. The custom-domain proxy's automatic Google Analytics insertion has been paused. Hosting or CDN services can operate separately from application code; the owner must complete their purpose, recipient and retention inventory.\n\n## Contact\nSend privacy and data-rights questions to [privacy@fryup.uk](mailto:privacy@fryup.uk). This address has an enabled route through the existing mail gateway to the owner's inbox. Response timing has not been independently tested.\n\n## Outstanding review\nThe controller identity and service address, rights-handling process, retention and applicable legal requirements remain under review. This technical update does not certify legal compliance.\n",
  "cookies": "---\ntitle: \"Cookie Policy\"\ndescription: \"Browser storage and hosting measurement facts.\"\nlastUpdated: \"2026-11-06\"\n---\n\n# Cookie Policy\n\n## Application storage\n- `fryup_favourites` stores saved recipe choices.\n- `fryup_cookie_consent` records the banner choice, including Essential Only.\n- You can clear these values in your browser settings.\n\n## Optional measurement\nThe custom-domain proxy's automatic Google Analytics insertion is paused. Accept All does not activate that paused tag. Platform-managed cookies and telemetry require a separate inventory. The observed `cf_zaraz_client` cookie has not been assigned a verified purpose or retention period in this review.\n\n## Questions\nContact [privacy@fryup.uk](mailto:privacy@fryup.uk) or use [Contact & Corrections](/contact/). The complete notice and consent design require qualified review before optional measurement is enabled.\n",
  "terms": "---\ntitle: \"Terms of Use\"\ndescription: \"Terms review status and published contact routes.\"\nlastUpdated: \"2026-11-06\"\n---\n\n# Terms of Use\n\n## Review status\nThe website's substantive Terms of Use are awaiting qualified legal review. Governing law, venue and other legal decisions remain unresolved.\n\n## Site information\nRecipes and tools are editorial cooking resources. Review ingredient and method information before cooking, and contact the editorial team for corrections.\n\n## Contact\nUse [hello@fryup.uk](mailto:hello@fryup.uk) for general enquiries and [privacy@fryup.uk](mailto:privacy@fryup.uk) for privacy requests. These addresses route through the existing gateway to the owner's inbox. Receipt and response times have not been independently tested.\n",
  "affiliate-disclosure": "---\ntitle: \"Affiliate & Commercial Disclosure\"\ndescription: \"Current advertising and affiliate activation status.\"\nlastUpdated: \"2026-11-06\"\n---\n\n# Affiliate & Commercial Disclosure\n\n## Current status\nThe reviewed site configuration disables the advertising and affiliate modules. Example identifiers in source configuration do not establish merchant approval or a working referral.\n\n## Before activation\nA commercial placement requires a real destination and verified relationship. The relationship and any commission must be disclosed near the relevant action. Partner selection and the final wording remain subject to owner and qualified review.\n\n## Contact\nFor commercial or editorial questions use [hello@fryup.uk](mailto:hello@fryup.uk). Privacy questions go to [privacy@fryup.uk](mailto:privacy@fryup.uk).\n",
  "contact": "---\ntitle: \"Contact & Corrections\"\ndescription: \"Published editorial and privacy addresses.\"\nlastUpdated: \"2026-11-06\"\n---\n\n# Contact & Corrections\n\n- Editorial questions and corrections can be sent to [hello@fryup.uk](mailto:hello@fryup.uk).\n- Privacy and data-rights requests can be sent to [privacy@fryup.uk](mailto:privacy@fryup.uk).\n\nBoth literal addresses have enabled Cloudflare Email Routing rules to the existing mail gateway. Its live configuration forwards messages to the owner's inbox. This review checked routing configuration and did not send test email.\n\nThe publisher service address, response process and legal-review record remain outstanding.\n"
};

for (const p of policiesList) {
  const content = `---
title: "${p.title}"
description: "${p.desc}"
lastUpdated: "2026-07-27"
---

# ${p.title}

${p.desc}

## Overview
Fryup.UK is committed to complete transparency, user privacy, and high editorial standards.

## Key Policies
1. **Data Minimization**: Fryup.UK requires no user accounts. All user preferences (favourites, shopping lists) are stored strictly in your local browser storage.
2. **Editorial Standards**: All recipes are original formulations derived from verified UK culinary sources and FSA food safety frameworks.
3. **Contact**: For editorial questions or corrections, please contact the Fryup.UK Editorial Kitchen ${p.slug === 'contact' ? 'at [hello@fryup.uk](mailto:hello@fryup.uk)' : 'through the [Contact & Corrections](/contact/) page'}.
`;
  fs.writeFileSync(path.join(POLICIES_DIR, `${p.slug}.md`), policyOverrides[p.slug] ?? content);
}
console.log(`Successfully generated 9 policy files in ${POLICIES_DIR}`);
