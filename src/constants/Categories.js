export const Categories = [
{
id: 1,
name: "Fresh Food",
details: "Fruits, vegetables, and fresh meat & seafood",
icon: "🥬",
subcategories: ["Fruits", "Vegetables", "Fresh Herbs", "Salad Mixes", "Beef", "Poultry", "Pork", "Fish", "Shellfish"]
},
{
id: 2,
name: "Bakery",
details: "Fresh bread, pastries, and baked goods",
icon: "🍞",
subcategories: ["Bread", "Bagels & English Muffins", "Pastries", "Tortillas & Wraps"]
},
{
id: 3,
name: "Pantry",
details: "Dry goods, cooking essentials, and canned foods",
icon: "🫙",
subcategories: ["Rice & Grains", "Pasta & Noodles", "Canned Vegetables", "Canned Fruits", "Soups", "Broths", "Baking Supplies", "Cooking Oils", "Jams & Jellies"]
},
{
id: 4,
name: "Beverage",
details: "Drinks and non-alcoholic beverages",
icon: "🧃",
subcategories: ["Water", "Juices", "Soda & Soft Drinks", "Coffee", "Tea", "Sports Drinks", "Beer", "Wine", "Spirits", "Seltzers", "Mixers"]
},
{
id: 5,
name: "Frozen",
details: "Frozen foods and desserts",
icon: "❄️",
subcategories: ["Frozen Vegetables", "Frozen Meals", "Ice Cream", "Frozen Fruits", "Frozen Snacks"]
},
{
id: 6,
name: "Snacks",
details: "Chips, cookies, crackers, and other snacks",
icon: "🍿",
subcategories: ["Chips", "Cookies", "Crackers", "Nuts & Seeds", "Granola Bars"]
},
{
id: 7,
name: "Candy & Chocolate",
details: "Confectionery and sweet treats",
icon: "🍫",
subcategories: ["Chocolate Bars", "Gummy Candy", "Hard Candy", "Mints", "Gum"]
},
{
id: 8,
name: "HouseHold",
details: "Cleaning supplies and household essentials",
icon: "🧴",
subcategories: ["Laundry", "Dish Soap", "Cleaning Supplies", "Paper Products", "Trash Bags"]
},
{
id: 9,
name: "Personal Care",
details: "Toiletries and personal hygiene products",
icon: "🧼",
subcategories: ["Shampoo & Conditioner", "Soap & Body Wash", "Oral Care", "Skincare", "Feminine Care", "Deodorant", "Hair Care", "Shaving"]
},
{
id: 10,
name: "Health",
details: "Health-focused and wellness items",
icon: "🌿",
subcategories: ["Vitamins & Supplements", "Pain Relief", "Cold & Flu", "First Aid", "Digestive Health", "Allergy Relief"]
},
{
id: 11,
name: "Baby & Toddle",
details: "Products for babies and young children",
icon: "👶",
subcategories: ["Baby Food", "Diapers", "Baby Formula", "Baby Care", "Kids Snacks", "Baby Toiletries"]
},
{
id: 12,
name: "Electronics & Office",
details: "Electronics and office supplies",
icon: "💻",
subcategories: ["Batteries", "Light Bulbs", "Cables", "Office Paper", "Pens & Markers", "Notebooks", "Folders & Binders", "Desk Accessories"]
},
{
id: 13,
name: "Miscellaneous",
details: "Pet supplies and other various items",
icon: "📦",
subcategories: ["Dog Food", "Cat Food", "Pet Treats", "Litter", "Pet Care", "Party Supplies", "Gift Wrap", "Candles"]
}
];

// Unit types
export const UnitTypes = [
  { id: "g", name: "Grams", symbol: "g", category: "weight" },
  { id: "kg", name: "Kilograms", symbol: "kg", category: "weight" },
  { id: "ml", name: "Milliliters", symbol: "ml", category: "volume" },
  { id: "l", name: "Liters", symbol: "L", category: "volume" },
  { id: "piece", name: "Piece", symbol: "pc", category: "count" },
  { id: "pack", name: "Pack", symbol: "pack", category: "count" },
  { id: "bottle", name: "Bottle", symbol: "bottle", category: "count" },
  { id: "box", name: "Box", symbol: "box", category: "count" },
  { id: "dozen", name: "Dozen", symbol: "dozen", category: "count" }
];