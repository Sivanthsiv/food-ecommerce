import type { Product } from "./cart-context"

export const products: Product[] = [
  {
    id: "1",
    name: "Hyderabadi Veg Biryani Rice",
    price: 199,
    originalPrice: 249,
    image: "/products/biryani.jpg",
    category: "lunch",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "12 months",
    weight: "250g",
    description: "Authentic Hyderabadi flavors with aromatic basmati rice, mixed vegetables, and traditional spices. Ready in just 5 minutes.",
    ingredients: ["Basmati Rice", "Mixed Vegetables", "Onions", "Tomatoes", "Ginger-Garlic Paste", "Biryani Masala", "Saffron", "Mint", "Coriander"],
    nutritionalInfo: {
      calories: "340 kcal",
      protein: "8g",
      carbs: "58g",
      fat: "8g",
      fiber: "4g"
    },
    cookingInstructions: ["Open the pack and transfer contents to a microwave-safe bowl", "Add 2 tablespoons of water", "Microwave for 3-4 minutes on high", "Let it rest for 1 minute and serve hot"],
    storageInstructions: "Store in a cool, dry place away from direct sunlight. Refrigerate after opening."
  },
  {
    id: "2",
    name: "Vegetable Pulao",
    price: 149,
    originalPrice: 179,
    image: "/products/pulao.jpg",
    category: "lunch",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "250g",
    description: "Fragrant basmati rice cooked with fresh vegetables and aromatic spices. A wholesome meal ready in minutes.",
    ingredients: ["Basmati Rice", "Mixed Vegetables", "Onions", "Green Peas", "Whole Spices", "Ghee", "Salt"],
    nutritionalInfo: {
      calories: "290 kcal",
      protein: "8g",
      carbs: "48g",
      fat: "8g",
      fiber: "4g"
    },
    cookingInstructions: ["Transfer contents to a microwave-safe bowl", "Add 2 tablespoons of water", "Microwave for 3-4 minutes", "Serve hot with raita"],
    storageInstructions: "Store in a cool, dry place away from direct sunlight."
  },
  {
    id: "3",
    name: "Dal Makhani",
    price: 179,
    originalPrice: 219,
    image: "/products/dal-makhani.jpg",
    category: "dinner",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "9 months",
    weight: "300g",
    description: "Creamy black lentils slow-cooked with butter and aromatic spices. A North Indian delicacy that pairs perfectly with rice or roti.",
    ingredients: ["Black Lentils", "Kidney Beans", "Butter", "Cream", "Tomatoes", "Ginger-Garlic", "Kashmiri Chilli", "Cumin"],
    nutritionalInfo: {
      calories: "320 kcal",
      protein: "14g",
      carbs: "38g",
      fat: "14g",
      fiber: "8g"
    },
    cookingInstructions: ["Heat contents in a pan for 4-5 minutes", "Alternatively, microwave for 2-3 minutes", "Garnish with cream and serve"],
    storageInstructions: "Store in a cool, dry place. Refrigerate after opening and consume within 3 days."
  },
  {
    id: "4",
    name: "Paneer Butter Masala",
    price: 219,
    originalPrice: 269,
    image: "/products/paneer-butter.jpg",
    category: "dinner",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "9 months",
    weight: "300g",
    description: "Soft paneer cubes in a rich, creamy tomato-based gravy. A restaurant-style dish ready at home in minutes.",
    ingredients: ["Paneer", "Tomatoes", "Cashew Paste", "Cream", "Butter", "Kashmiri Chilli", "Garam Masala", "Kasuri Methi"],
    nutritionalInfo: {
      calories: "380 kcal",
      protein: "16g",
      carbs: "22g",
      fat: "26g",
      fiber: "3g"
    },
    cookingInstructions: ["Heat the gravy in a pan", "Add paneer cubes and simmer for 2 minutes", "Serve hot with naan or rice"],
    storageInstructions: "Keep refrigerated. Best consumed within 2 days of opening."
  },
  {
    id: "5",
    name: "Upma Mix",
    price: 89,
    originalPrice: 109,
    image: "/products/upma.jpg",
    category: "breakfast",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "200g",
    description: "Traditional South Indian breakfast made easy. Just add water and cook for a nutritious, filling breakfast.",
    ingredients: ["Semolina", "Roasted Gram", "Cashews", "Mustard Seeds", "Curry Leaves", "Green Chillies", "Salt"],
    nutritionalInfo: {
      calories: "220 kcal",
      protein: "6g",
      carbs: "38g",
      fat: "5g",
      fiber: "2g"
    },
    cookingInstructions: ["Boil 400ml water with salt", "Add the mix gradually while stirring", "Cook for 3-4 minutes on low flame", "Add ghee and serve hot"],
    storageInstructions: "Store in an airtight container in a cool, dry place."
  },
  {
    id: "6",
    name: "Poha Mix",
    price: 79,
    originalPrice: 99,
    image: "/products/poha.jpg",
    category: "breakfast",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "200g",
    description: "Light and fluffy flattened rice with the perfect blend of spices. A quick and healthy breakfast option.",
    ingredients: ["Flattened Rice", "Peanuts", "Mustard Seeds", "Turmeric", "Curry Leaves", "Green Chillies", "Onion Flakes"],
    nutritionalInfo: {
      calories: "180 kcal",
      protein: "5g",
      carbs: "32g",
      fat: "4g",
      fiber: "2g"
    },
    cookingInstructions: ["Soak poha in water for 2 minutes", "Drain and add the seasoning mix", "Heat in pan for 3 minutes", "Garnish with coriander and serve"],
    storageInstructions: "Store in a cool, dry place away from moisture."
  },
  {
    id: "7",
    name: "Chana Masala",
    price: 249,
    originalPrice: 299,
    image: "/products/chicken-curry.jpg",
    category: "dinner",
    isVeg: true,
    spiceLevel: "hot",
    shelfLife: "9 months",
    weight: "300g",
    description: "Hearty chickpeas in a spicy, aromatic tomato gravy. Authentic home-style taste with a bold masala blend.",
    ingredients: ["Chickpeas", "Onions", "Tomatoes", "Ginger-Garlic", "Red Chilli", "Coriander", "Turmeric", "Garam Masala"],
    nutritionalInfo: {
      calories: "300 kcal",
      protein: "12g",
      carbs: "40g",
      fat: "8g",
      fiber: "10g"
    },
    cookingInstructions: ["Heat contents in a pan for 5-6 minutes", "Alternatively, microwave for 3-4 minutes", "Serve hot with rice or roti"],
    storageInstructions: "Store in a cool, dry place. Refrigerate after opening and consume within 3 days."
  },
  {
    id: "8",
    name: "Millet Khichdi",
    price: 129,
    originalPrice: 159,
    image: "/products/millet-khichdi.jpg",
    category: "lunch",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "200g",
    description: "Nutritious millet-based khichdi with lentils and vegetables. A healthy, fiber-rich meal for the health-conscious.",
    ingredients: ["Foxtail Millet", "Moong Dal", "Mixed Vegetables", "Cumin", "Turmeric", "Ghee", "Salt"],
    nutritionalInfo: {
      calories: "240 kcal",
      protein: "10g",
      carbs: "42g",
      fat: "4g",
      fiber: "6g"
    },
    cookingInstructions: ["Add 2 cups water to the mix", "Pressure cook for 2 whistles", "Or microwave for 8 minutes", "Serve with ghee and pickle"],
    storageInstructions: "Store in an airtight container in a cool, dry place."
  },
  {
    id: "9",
    name: "Masala Oats",
    price: 99,
    originalPrice: 119,
    image: "/products/masala-oats.jpg",
    category: "breakfast",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "12 months",
    weight: "200g",
    description: "Savory oats with Indian spices and vegetables. A healthy, filling breakfast that keeps you energized all morning.",
    ingredients: ["Rolled Oats", "Dehydrated Vegetables", "Onion Flakes", "Tomato Powder", "Green Chilli", "Cumin", "Salt"],
    nutritionalInfo: {
      calories: "160 kcal",
      protein: "6g",
      carbs: "28g",
      fat: "3g",
      fiber: "4g"
    },
    cookingInstructions: ["Add mix to 300ml boiling water", "Stir and cook for 3 minutes", "Cover and let it rest for 1 minute", "Serve hot"],
    storageInstructions: "Store in a cool, dry place. Seal after opening."
  },
  {
    id: "10",
    name: "Rajma Masala",
    price: 169,
    originalPrice: 199,
    image: "/products/rajma.jpg",
    category: "dinner",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "12 months",
    weight: "300g",
    description: "Hearty kidney beans in a thick, spiced tomato gravy. A Punjabi favorite that pairs perfectly with steamed rice.",
    ingredients: ["Red Kidney Beans", "Tomatoes", "Onions", "Ginger-Garlic", "Kashmiri Chilli", "Garam Masala", "Cumin"],
    nutritionalInfo: {
      calories: "280 kcal",
      protein: "14g",
      carbs: "42g",
      fat: "6g",
      fiber: "12g"
    },
    cookingInstructions: ["Heat contents in a pan for 4-5 minutes", "Or microwave for 3 minutes", "Serve hot with rice"],
    storageInstructions: "Store in a cool, dry place. Refrigerate after opening."
  },
  {
    id: "11",
    name: "Murukku",
    price: 129,
    originalPrice: 149,
    image: "/products/murukku.jpg",
    category: "snacks",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "6 months",
    weight: "200g",
    description: "Crispy, spiral-shaped South Indian snack made with rice flour and spices. Perfect tea-time companion.",
    ingredients: ["Rice Flour", "Urad Dal Flour", "Cumin Seeds", "Sesame Seeds", "Asafoetida", "Salt", "Oil"],
    nutritionalInfo: {
      calories: "480 kcal",
      protein: "6g",
      carbs: "52g",
      fat: "28g",
      fiber: "2g"
    },
    cookingInstructions: ["Ready to eat", "For best taste, consume within a week of opening"],
    storageInstructions: "Store in an airtight container. Keep away from moisture."
  },
  {
    id: "12",
    name: "Mixture",
    price: 119,
    originalPrice: 139,
    image: "/products/mixture.jpg",
    category: "snacks",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "6 months",
    weight: "200g",
    description: "Crunchy mix of sev, peanuts, and savory bites. A classic Indian snack for any occasion.",
    ingredients: ["Gram Flour", "Rice Flakes", "Peanuts", "Curry Leaves", "Red Chilli", "Salt", "Oil"],
    nutritionalInfo: {
      calories: "520 kcal",
      protein: "12g",
      carbs: "48g",
      fat: "32g",
      fiber: "4g"
    },
    cookingInstructions: ["Ready to eat", "Serve as a snack or with tea"],
    storageInstructions: "Store in an airtight container in a cool, dry place."
  },
  {
    id: "15",
    name: "Coconut Chutney Powder",
    price: 129,
    originalPrice: 159,
    image: "/products/chutney-powder.jpg",
    category: "powders",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "200g",
    description: "Homemade coconut chutney powder with roasted lentils and gentle spices. Perfect with idli, dosa, or rice.",
    ingredients: ["Coconut", "Urad Dal", "Chana Dal", "Red Chilli", "Curry Leaves", "Salt"],
    nutritionalInfo: {
      calories: "110 kcal",
      protein: "3g",
      carbs: "8g",
      fat: "7g",
      fiber: "2g"
    },
    cookingInstructions: ["Ready to use", "Mix 2 tbsp with warm water and a tsp of oil", "Serve fresh"],
    storageInstructions: "Store in a cool, dry place. Keep sealed after opening."
  },
  {
    id: "16",
    name: "Sambar Masala Powder",
    price: 149,
    originalPrice: 189,
    image: "/products/masala-powder.jpg",
    category: "powders",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "12 months",
    weight: "200g",
    description: "Homemade sambar masala powder with roasted spices for a rich, aromatic sambar.",
    ingredients: ["Coriander Seeds", "Red Chilli", "Fenugreek", "Cumin", "Black Pepper", "Turmeric", "Curry Leaves", "Salt"],
    nutritionalInfo: {
      calories: "90 kcal",
      protein: "3g",
      carbs: "14g",
      fat: "2g",
      fiber: "5g"
    },
    cookingInstructions: ["Use 1-2 tsp per serving while cooking sambar", "Adjust to taste"],
    storageInstructions: "Store in a cool, dry place. Keep sealed after opening."
  },
  {
    id: "13",
    name: "Weekly Meal Combo",
    price: 999,
    originalPrice: 1299,
    image: "/products/combo-weekly.jpg",
    category: "combos",
    isVeg: true,
    spiceLevel: "medium",
    shelfLife: "9 months",
    weight: "1.5kg",
    description: "Complete meal solution for a week. Includes 3 breakfast items, 4 lunch options, and 4 dinner choices.",
    ingredients: ["Assorted meal packs as described"],
    nutritionalInfo: {
      calories: "Varies",
      protein: "Varies",
      carbs: "Varies",
      fat: "Varies",
      fiber: "Varies"
    },
    cookingInstructions: ["Follow individual pack instructions"],
    storageInstructions: "Store individual packs as per their instructions."
  },
  {
    id: "14",
    name: "Breakfast Bundle",
    price: 349,
    originalPrice: 449,
    image: "/products/combo-breakfast.jpg",
    category: "combos",
    isVeg: true,
    spiceLevel: "mild",
    shelfLife: "12 months",
    weight: "600g",
    description: "Start your mornings right with our breakfast bundle. Includes Upma, Poha, and Masala Oats mixes.",
    ingredients: ["Upma Mix", "Poha Mix", "Masala Oats"],
    nutritionalInfo: {
      calories: "Varies",
      protein: "Varies",
      carbs: "Varies",
      fat: "Varies",
      fiber: "Varies"
    },
    cookingInstructions: ["Follow individual pack instructions"],
    storageInstructions: "Store in a cool, dry place."
  }
]

export const categories = [
  { id: "all", name: "All Products", count: products.length },
  { id: "breakfast", name: "Breakfast", count: products.filter(p => p.category === "breakfast").length },
  { id: "lunch", name: "Lunch", count: products.filter(p => p.category === "lunch").length },
  { id: "dinner", name: "Dinner", count: products.filter(p => p.category === "dinner").length },
  { id: "snacks", name: "Snacks", count: products.filter(p => p.category === "snacks").length },
  { id: "powders", name: "Powders", count: products.filter(p => p.category === "powders").length },
  { id: "combos", name: "Combos", count: products.filter(p => p.category === "combos").length },
]

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products
  return products.filter(p => p.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter(p => ["1", "3", "5", "7", "13"].includes(p.id))
}

export function getBestSellers(): Product[] {
  return products.filter(p => ["1", "2", "4", "6", "10"].includes(p.id))
}
