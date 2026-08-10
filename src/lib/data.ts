import shopZuzu from "@/assets/shop-zuzu.jpg";
import shopCake from "@/assets/shop-cake-stories.jpg";
import shopBites from "@/assets/shop-bites.jpg";
import shopShakers from "@/assets/shop-shakers.jpg";
import imgChickenBurger from "@/assets/food-chicken-burger.jpg";
import imgVegBurger from "@/assets/food-veg-burger.jpg";
import imgFries from "@/assets/food-fries.jpg";
import imgColdCoffee from "@/assets/food-cold-coffee.jpg";
import imgCake from "@/assets/food-chocolate-cake.jpg";
import imgPizza from "@/assets/food-pizza.jpg";
import imgSandwich from "@/assets/food-sandwich.jpg";
import imgMaggi from "@/assets/food-maggi.jpg";
import imgJuice from "@/assets/food-juice.jpg";

/**
 * Mock data layer.
 * Every read below is exposed through a small async-ready accessor so it can be
 * swapped for a real backend query later without touching UI components.
 */

export type Category =
  | "All"
  | "Burgers"
  | "Meals"
  | "Snacks"
  | "Drinks"
  | "Desserts"
  | "Coffee";

export const CATEGORIES: Category[] = [
  "All",
  "Burgers",
  "Meals",
  "Snacks",
  "Drinks",
  "Desserts",
  "Coffee",
];

export interface Shop {
  id: string;
  name: string;
  image: string;
  description: string;
  isOpen: boolean;
  prepTime: string;
  rating: number;
  counter: string;
}

export interface FoodItem {
  id: string;
  shopId: string;
  name: string;
  description: string;
  ingredients?: string;
  price: number;
  image: string;
  category: Exclude<Category, "All">;
  available: boolean;
  popular?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
}

export const MOCK_USER: User = {
  id: "u_1",
  name: "Ramveer",
  email: "ramveer@campus.edu",
  initials: "R",
};

export const SHOPS: Shop[] = [
  {
    id: "zuzu",
    name: "Zuzu",
    image: shopZuzu,
    description: "Burgers, fries and everything crispy.",
    isOpen: true,
    prepTime: "10–15 min",
    rating: 4.6,
    counter: "Zuzu Counter",
  },
  {
    id: "cake-stories",
    name: "Cake Stories",
    image: shopCake,
    description: "Fresh bakes, cakes and sweet things.",
    isOpen: true,
    prepTime: "5–10 min",
    rating: 4.8,
    counter: "Cake Stories Counter",
  },
  {
    id: "bites-and-bites",
    name: "Bites & Bites",
    image: shopBites,
    description: "Quick campus snacks between classes.",
    isOpen: true,
    prepTime: "8–12 min",
    rating: 4.4,
    counter: "Bites & Bites Counter",
  },
  {
    id: "shakers-and-movers",
    name: "Shakers & Movers",
    image: shopShakers,
    description: "Shakes, juices and cold coffee.",
    isOpen: false,
    prepTime: "6–10 min",
    rating: 4.5,
    counter: "Shakers & Movers Counter",
  },
];

export const FOODS: FoodItem[] = [
  {
    id: "f_chicken_burger",
    shopId: "zuzu",
    name: "Chicken Burger",
    description: "Crispy chicken, lettuce & special sauce",
    ingredients: "Chicken patty, lettuce, onion, cheddar, house sauce, sesame bun",
    price: 129,
    image: imgChickenBurger,
    category: "Burgers",
    available: true,
    popular: true,
  },
  {
    id: "f_veg_burger",
    shopId: "zuzu",
    name: "Veg Burger",
    description: "Garden patty, tomato & creamy mayo",
    ingredients: "Veg patty, tomato, lettuce, onion, mayo, wheat bun",
    price: 99,
    image: imgVegBurger,
    category: "Burgers",
    available: true,
    popular: true,
  },
  {
    id: "f_fries",
    shopId: "zuzu",
    name: "French Fries",
    description: "Salted, golden and always hot",
    ingredients: "Potato, sea salt, sunflower oil",
    price: 79,
    image: imgFries,
    category: "Snacks",
    available: true,
    popular: true,
  },
  {
    id: "f_pizza",
    shopId: "zuzu",
    name: "Margherita Pizza",
    description: "Stone-baked with mozzarella & basil",
    ingredients: "Wheat base, tomato sauce, mozzarella, basil",
    price: 189,
    image: imgPizza,
    category: "Meals",
    available: true,
  },
  {
    id: "f_cold_coffee",
    shopId: "shakers-and-movers",
    name: "Cold Coffee",
    description: "Slow-brewed, chilled and frothy",
    ingredients: "Arabica coffee, milk, ice, cane sugar",
    price: 89,
    image: imgColdCoffee,
    category: "Coffee",
    available: true,
    popular: true,
  },
  {
    id: "f_juice",
    shopId: "shakers-and-movers",
    name: "Fresh Orange Juice",
    description: "Cold pressed, nothing added",
    ingredients: "Oranges, mint",
    price: 69,
    image: imgJuice,
    category: "Drinks",
    available: true,
  },
  {
    id: "f_cake",
    shopId: "cake-stories",
    name: "Chocolate Cake",
    description: "Dense chocolate sponge with ganache",
    ingredients: "Cocoa, butter, eggs, dark chocolate ganache",
    price: 119,
    image: imgCake,
    category: "Desserts",
    available: true,
    popular: true,
  },
  {
    id: "f_sandwich",
    shopId: "bites-and-bites",
    name: "Grilled Sandwich",
    description: "Veggies & cheese, grilled to order",
    ingredients: "Bread, cheese, tomato, capsicum, butter",
    price: 89,
    image: imgSandwich,
    category: "Snacks",
    available: true,
  },
  {
    id: "f_maggi",
    shopId: "bites-and-bites",
    name: "Masala Maggi",
    description: "Classic hostel comfort bowl",
    ingredients: "Noodles, masala mix, onion, chilli",
    price: 59,
    image: imgMaggi,
    category: "Meals",
    available: true,
    popular: true,
  },
  {
    id: "f_cheese_maggi",
    shopId: "bites-and-bites",
    name: "Cheese Maggi",
    description: "Masala maggi loaded with cheese",
    price: 79,
    image: imgMaggi,
    category: "Meals",
    available: false,
  },
];

export const getShops = () => SHOPS;
export const getShop = (id: string) => SHOPS.find((s) => s.id === id);
export const getFoods = () => FOODS;
export const getFood = (id: string) => FOODS.find((f) => f.id === id);
export const getShopFoods = (shopId: string) => FOODS.filter((f) => f.shopId === shopId);
export const getPopularFoods = () => FOODS.filter((f) => f.popular);

export const formatPrice = (value: number) => `₹${value}`;
