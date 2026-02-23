import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  getDashboard,
  getWorkday,
  getReminders,
  doneReminder,
  getTasks,
  doneTask,
  getEvents,
  ttsSpeak,
  aiRespond,
  aiSchedule,
  aiResolve,
  aiReclassify,
  aiReclassifyConfirm,
  aiPriority,
  getFoodHub,
  getFoodHubAll,
  markFoodHubAccessed,
  sttTranscribe,
} from "./api";
import burgersImg from "./assets/burgers.jpeg";
import chickenChorizoImg from "./assets/chicken_and_chorizo.jpg";
import chickenCasseroleImg from "./assets/chicken_casserole.jpeg";
import chickenCurryImg from "./assets/chicken_curry.jpg";
import chilliJacketImg from "./assets/chilli_con_carne_with_jacket_potato.jpg";
import fajitasImg from "./assets/fajitas.webp";
import pizzaImg from "./assets/homemade_pizza.jpg";
import lasagnaImg from "./assets/lasagna.jpeg";
import risottoImg from "./assets/risotto.jpg";
import roastImg from "./assets/roast.avif";
import sausageMashImg from "./assets/sausage_mash_beans.jpg";
import tomatoCasseroleImg from "./assets/tomato_and_sausage_casserole.jpg";
import chickenFriedRiceImg from "./assets/foodhub/chicken-fried-rice-1c502f1.webp";
import chilliConCarneImg from "./assets/foodhub/chilli.png";
import creamyCarbonaraImg from "./assets/foodhub/recipe-image-legacy-id-338497_12-05fada5.webp";
import gnocchiCreamyTomatoImg from "./assets/foodhub/recipe-image-legacy-id-338653_11-d3975ea.webp";
import lemonSalmonImg from "./assets/foodhub/lemon-dressed-salmon-with-leek-and-broad-bean-puree-440-400-ba91990.webp";
import sausageKaleGnocchiImg from "./assets/foodhub/sausage-kale-gnocchi-one-pot-e890b33.webp";
import tunaPastaImg from "./assets/foodhub/recipe-image-legacy-id-1234451_8-536a6f2.webp";
import veggieFajitasImg from "./assets/foodhub/fajitas.png";
import fishTacosImg from "./assets/foodhub/Fish-Tacos-1337495.webp";
import chickpeaCurryImg from "./assets/foodhub/chickpea curry.png";
import eggFriedRiceImg from "./assets/foodhub/egg rice.png";
import macAndCheeseImg from "./assets/foodhub/mac and cheese.webp";
import pestoPastaImg from "./assets/foodhub/pestopasta.webp";
import sausagePastaImg from "./assets/foodhub/sausage pasta.png";
import shakshukaImg from "./assets/foodhub/shaksuka.png";
import tomatoSoupImg from "./assets/foodhub/tomato-soup-with-cheese-marmite-toast-879c026.webp";
import roastSeaBassImg from "./assets/foodhub/roast sea bass.webp";
import roastSweetPotatoImg from "./assets/foodhub/roast sweet pot feta butter bean.avif";
import roastChickenTraybakeImg from "./assets/foodhub/roast-chicken-tray-bake-440-400-6bb8cf6.webp";
import spicedSalmonTomatoImg from "./assets/foodhub/spiced-salmon-tomato-traybake-e6664f7.webp";
import sausageTraybakeImg from "./assets/foodhub/summer-sausage-traybake-b2f648e.webp";
import puttanescaHakeImg from "./assets/foodhub/Puttanesca-hake-traybake-686fcb1.webp";
import halloumiTraybakeImg from "./assets/foodhub/halloumi tray bake.webp";
import honeyMustardSalmonImg from "./assets/foodhub/honey mustard salmon broc tray bake.webp";
import lasagneImg from "./assets/foodhub/Lasagne-d4cb438.jpg";
import cottagePieImg from "./assets/foodhub/cottage pie.jpg";
import chickenBaconPieImg from "./assets/foodhub/Chicken-and-bacon-pie-f26cc35.webp";
import roastChickenVegImg from "./assets/foodhub/roast-chicken-tray-bake-440-400-6bb8cf6.webp";
import cauliflowerChickenCurryImg from "./assets/foodhub/Roasted-cauliflower-and-chicken-curry-6e24c52.webp";
import butternutRisottoImg from "./assets/foodhub/butternut squash and sage risotto.jpg";
import leekTartImg from "./assets/foodhub/leek tart.webp";
import mustardTarragonChickenImg from "./assets/foodhub/mustard taragon chick.webp";
import cauliflowerCheeseFiloImg from "./assets/foodhub/Roasted-cauliflower-cheese-filo-pie-b28df09.webp";
import luxeFishPieImg from "./assets/foodhub/luxe-fish-pie-f016e12.webp";
import miniWellingtonImg from "./assets/foodhub/AirFryerMiniBeefWellington-c256b41.webp";
import roastHakeButterImg from "./assets/foodhub/roast hake with caper anchovy butter.avif";
import spicedLambPieImg from "./assets/foodhub/spiced-lamb-pie-68e5198.webp";
import coqAuVinImg from "./assets/foodhub/Slow-cooker-coq-au-vin-28c6490.webp";
import panFriedSalmonImg from "./assets/foodhub/panfriedsalmon.jpg";
import shreddedLambImg from "./assets/foodhub/slow-cooked shredded lamb shoulder.avif";
import fishFingersImg from "./assets/foodhub/fishfingers mushy peas.webp";
import veggieBurgerSlawImg from "./assets/foodhub/Recipe_veggie-burger.jpg";
import salmonTraybakeImg from "./assets/foodhub/salmon-traybake_800x600.jpg";
import cowboyPieImg from "./assets/foodhub/Cowboy-pie-cef67be.webp";
import gyozaStirFryImg from "./assets/foodhub/teriyaki_gyoza_stir_fry_a661c60b80.png";
import halloumiCouscousImg from "./assets/foodhub/Halloumi-Couscous-Salad-Walder-Wellness-4-1365x2048.jpg";
import cheatsPizzaImg from "./assets/foodhub/22063_EP5_CheatsPizza_full.jpg";
import chickenGoujonsImg from "./assets/foodhub/chicken-katsu-dippers-faff4ff.webp";
import DarkVeil from "./components/DarkVeil";
import GradientText from "./components/GradientText";
import Orb from "./components/Orb";
import FunFactCard from "./components/FunFactCard";
import TextType from "./components/TextType";
import "./App.css";

type Dashboard = {
  now: string;
  today_summary: string;
  alerts: { message: string }[];
  next_task: string | null;
};

type ReminderStatus = "active" | "done" | "missed";

type TaskPriority = "trivial" | "medium" | "vital";

type Task = {
  id: number;
  title: string;
  priority: TaskPriority;
};

type EventItem = {
  id: number;
  title: string;
  event_date: string;
  start_hhmm: string | null;
  end_hhmm: string | null;
  all_day: number | boolean;
};

type Reminder = {
  id: number;
  reminder_key: string;
  label: string;
  speak_text: string;
  dose_date: string;
  scheduled_hhmm: string;
  next_fire_at: string;
  status: ReminderStatus;
  due_now: boolean;
};

type FoodHubRecipe = {
  id: number;
  category_id: number;
  sort_order: number;
  name: string;
  tagline: string | null;
  time_prep_min: number | null;
  time_cook_min: number | null;
  time_total_min: number | null;
  link: string | null;
  image_url: string | null;
  image_local?: string;
  cuisine_region?: string | null;
  time_band?: string | null;
  activity_level?: string | null;
  health_vibe?: string | null;
  weight_class?: string | null;
  last_accessed_at?: string | null;
  tags: string[];
  ingredients: string[];
  steps: string[];
};

type RemindersResp = {
  date: string;
  now: string;
  reminders: Reminder[];
};

type HelpDecidePrefs = {
  time_band: string | null;
  activity_level: string | null;
  health_vibe: string | null;
  weight_class: string | null;
  cuisine_region: string | null;
};

type HelpDecideOption = {
  key: keyof HelpDecidePrefs;
  label: string;
  options: { value: string | null; label: string }[];
};

const FOOD_HUB_DISHES = [
  { id: 1, name: "Risotto", image: risottoImg },
  { id: 2, name: "Homemade pizza", image: pizzaImg },
  { id: 3, name: "Chicken curry", image: chickenCurryImg },
  { id: 4, name: "Chicken & chorizo", image: chickenChorizoImg },
  { id: 5, name: "Sausage casserole", image: tomatoCasseroleImg },
  { id: 6, name: "Roast Dinner", image: roastImg },
  { id: 7, name: "Burgers", image: burgersImg },
  { id: 8, name: "Fajitas", image: fajitasImg },
  { id: 9, name: "Chilli jacket", image: chilliJacketImg },
  { id: 10, name: "Chicken casserole", image: chickenCasseroleImg },
  { id: 11, name: "Lasagna", image: lasagnaImg },
  { id: 12, name: "Sausage mash & beans", image: sausageMashImg },
];

const FOOD_HUB_VISIBLE = 6;
const FOOD_HUB_EXTRAS = [
  { id: 1, name: "10–15 Minute\nWins" },
  { id: 2, name: "30-Minute Staples" },
  { id: 3, name: "Zero-Brain Dinners" },
  { id: 4, name: "One-Pan, No\nPlan" },
  { id: 5, name: "Project\nMeals" },
  { id: 6, name: "Show-Off\nBut Easy" },
  { id: 8, name: "Freezer\nFirst" },
  { id: 7, name: "Help Me\nDecide" },
];

const HELP_DECIDE_OPTIONS: HelpDecideOption[] = [
  {
    key: "time_band",
    label: "Time",
    options: [
      { value: null, label: "Any" },
      { value: "15-30", label: "15–30" },
      { value: "30-45", label: "30–45" },
      { value: "45-60", label: "45–60" },
      { value: "60+", label: "60+" },
    ],
  },
  {
    key: "activity_level",
    label: "Effort",
    options: [
      { value: null, label: "Any" },
      { value: "hands-off", label: "Hands-off" },
      { value: "mixed", label: "Mixed" },
      { value: "high-active", label: "High-active" },
    ],
  },
  {
    key: "health_vibe",
    label: "Health vibe",
    options: [
      { value: null, label: "Any" },
      { value: "light", label: "Light" },
      { value: "balanced", label: "Balanced" },
      { value: "indulgent", label: "Indulgent" },
    ],
  },
  {
    key: "weight_class",
    label: "Heaviness",
    options: [
      { value: null, label: "Any" },
      { value: "light", label: "Light" },
      { value: "medium", label: "Medium" },
      { value: "heavy", label: "Heavy" },
    ],
  },
  {
    key: "cuisine_region",
    label: "Cuisine",
    options: [
      { value: null, label: "Any" },
      { value: "Italian", label: "Italian" },
      { value: "British", label: "British" },
      { value: "Mediterranean", label: "Mediterranean" },
      { value: "Mexican", label: "Mexican" },
      { value: "Indian", label: "Indian" },
      { value: "Chinese", label: "Chinese" },
      { value: "Japanese", label: "Japanese" },
      { value: "French", label: "French" },
      { value: "American", label: "American" },
      { value: "Middle Eastern", label: "Middle Eastern" },
    ],
  },
];

const WINS_MENU = [
  {
    id: 1,
    title: "Tahini noodles with red cabbage & Sichuan peppercorn slaw",
    time: "10 min",
    note: "Toss noodles in tahini, add crunchy slaw and zing.",
    tags: ["High-fibre", "Low calorie", "Vegetarian"],
  },
  {
    id: 2,
    title: "Lemon pepper chicken wraps",
    time: "12 min",
    note: "Quick sear strips, toss with lemon and yogurt.",
    tags: ["wrap", "protein", "zesty"],
  },
  {
    id: 3,
    title: "Pesto gnocchi skillet",
    time: "15 min",
    note: "Crisp gnocchi, stir in pesto and cherry tomatoes.",
    tags: ["greens", "saucy", "Vegetarian"],
  },
  {
    id: 4,
    title: "Garlic parmesan white beans",
    time: "15 min",
    note: "Warm beans with garlic, parmesan, and olive oil.",
    tags: ["greens", "pantry"],
  },
  {
    id: 5,
    title: "Garlic butter prawns",
    time: "12 min",
    note: "Sizzle prawns with garlic, finish with lemon.",
    tags: ["seafood", "bright"],
  },
  {
    id: 6,
    title: "Yaki udon (stir-fried udon noodles)",
    time: "15 min",
    note: "Stir-fry udon with veggies, soy, and sesame.",
    tags: ["Vegetarian", "saucy"],
  },
  {
    id: 7,
    title: "Pan-seared sea bass",
    time: "15 min",
    note: "Crisp skin, lemon butter, quick sauteed greens.",
    tags: ["seafood", "bright"],
  },
  {
    id: 8,
    title: "Halloumi honey pita",
    time: "12 min",
    note: "Sear halloumi, add honey and a quick salad.",
    tags: ["sweet-salty", "Vegetarian"],
  },
];

const STAPLES_MENU = [
  {
    id: 1,
    title: "Creamy carbonara",
    time: "25 min",
    note: "Creamy, fast, and reliable.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 2,
    title: "Chilli con carne",
    time: "1 hr 10 min",
    note: "Big flavour, always good.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 3,
    title: "Gnocchi with creamy tomato & spinach sauce",
    time: "20 min",
    note: "Silky, simple, and calm.",
    tags: ["VEGETARIAN", "SAUCY"],
  },
  {
    id: 4,
    title: "Chicken fried rice",
    time: "15 min",
    note: "A staple that clears the fridge.",
    tags: ["PROTEIN", "PANTRY"],
  },
  {
    id: 5,
    title: "Tuna pasta",
    time: "25 min",
    note: "Zesty, light, and pantry-friendly.",
    tags: ["SEAFOOD", "SAUCY"],
  },
  {
    id: 6,
    title: "Sausage, kale & gnocchi one-pot",
    time: "20 min",
    note: "Hearty, comforting, and all in one pan.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 7,
    title: "Lemon dressed salmon with leek & broad bean puree",
    time: "30 min",
    note: "Bright salmon with a soft green base.",
    tags: ["SEAFOOD", "BRIGHT", "GREENS"],
  },
  {
    id: 8,
    title: "Vegetarian fajitas",
    time: "15 min",
    note: "Sizzling, bright, and easy to share.",
    tags: ["VEGETARIAN", "WRAP"],
  },
];

const STAPLES_STEPS = [
  { id: 1, title: "Go-to base", desc: "pasta, rice, or gnocchi first" },
  { id: 2, title: "Fast protein or veg", desc: "chicken, tuna, beans, or veg" },
  { id: 3, title: "Finish saucy", desc: "tomato, cream, or pan sauce" },
];

const ZERO_BRAIN_MENU = [
  {
    id: 1,
    title: "Sausage pasta",
    time: "30 min",
    note: "Saucy, hearty, and low-fuss.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 2,
    title: "Easy mac and cheese",
    time: "45 min",
    note: "Baked, golden, and classic.",
    tags: ["VEGETARIAN", "SAUCY"],
  },
  {
    id: 3,
    title: "Easy egg-fried rice",
    time: "20 min",
    note: "Fast and pantry-friendly.",
    tags: ["VEGETARIAN", "PANTRY"],
  },
  {
    id: 4,
    title: "Tomato soup with cheese & Marmite toast",
    time: "25 min",
    note: "Cosy soup with a crunchy top.",
    tags: ["VEGETARIAN", "PANTRY"],
  },
  {
    id: 5,
    title: "Pesto pasta",
    time: "5 min",
    note: "The fastest option in the drawer.",
    tags: ["VEGETARIAN", "PANTRY"],
  },
  {
    id: 6,
    title: "Fish tacos",
    time: "30 min",
    note: "Bright, fresh, and satisfying.",
    tags: ["SEAFOOD", "WRAP", "BRIGHT"],
  },
  {
    id: 7,
    title: "Shakshuka",
    time: "25 min",
    note: "Warm, spiced, and simple.",
    tags: ["VEGETARIAN", "PANTRY"],
  },
  {
    id: 8,
    title: "Chickpea curry",
    time: "40 min",
    note: "Low effort, big payoff.",
    tags: ["VEGETARIAN", "PANTRY", "SAUCY"],
  },
];

const ZERO_BRAIN_STEPS = [
  { id: 1, title: "Minimal steps", desc: "keep the prep to a few moves" },
  { id: 2, title: "Pantry first", desc: "pasta, rice, tinned, or jarred" },
  { id: 3, title: "Bright or cheesy", desc: "finish with citrus or cheese" },
];

const ONE_PAN_MENU = [
  {
    id: 1,
    title: "Roast sea bass & vegetable traybake",
    time: "40 min",
    note: "Bright, crisp, and herb-lifted.",
    tags: ["SEAFOOD", "BRIGHT", "GREENS"],
  },
  {
    id: 2,
    title: "Roast chicken traybake",
    time: "1 hr 15 min",
    note: "Juicy chicken, roasted veg, minimal effort.",
    tags: ["PROTEIN", "GREENS"],
  },
  {
    id: 3,
    title: "Sausage traybake",
    time: "1 hr",
    note: "Pesto, beans, and golden edges.",
    tags: ["PROTEIN", "GREENS"],
  },
  {
    id: 4,
    title: "Halloumi traybake",
    time: "1 hr 15 min",
    note: "Big tray, sizzling halloumi, soft veg.",
    tags: ["VEGETARIAN", "GREENS"],
  },
  {
    id: 5,
    title: "Honey mustard salmon traybake",
    time: "45 min",
    note: "Sweet-savoury glaze, tender salmon.",
    tags: ["SEAFOOD", "GREENS", "BRIGHT"],
  },
  {
    id: 6,
    title: "Spiced salmon & tomato traybake",
    time: "30 min",
    note: "Warm spice, saucy tomatoes.",
    tags: ["SEAFOOD", "SAUCY"],
  },
  {
    id: 7,
    title: "Puttanesca hake traybake",
    time: "55 min",
    note: "Briny, bold, and weeknight-friendly.",
    tags: ["SEAFOOD", "SAUCY"],
  },
  {
    id: 8,
    title: "Sweet potato, feta & butter bean traybake",
    time: "45 min",
    note: "Smoky, herby, and satisfying.",
    tags: ["VEGETARIAN", "HIGH FIBRE", "GREENS"],
  },
];

const ONE_PAN_STEPS = [
  { id: 1, title: "Line a tray", desc: "veg base + protein together" },
  { id: 2, title: "Season boldly", desc: "oil, salt, spices, herbs" },
  { id: 3, title: "Roast & rest", desc: "let it caramelise, serve hot" },
];

const PROJECT_MENU = [
  {
    id: 1,
    title: "Cottage pie",
    time: "1 hr 50 min",
    note: "Big batch comfort.",
    tags: ["PROTEIN", "PANTRY"],
  },
  {
    id: 2,
    title: "Chicken & bacon pie",
    time: "1 hr",
    note: "Flaky puff pastry, creamy filling.",
    tags: ["PROTEIN"],
  },
  {
    id: 3,
    title: "All-in-one roast chicken & veg",
    time: "1 hr",
    note: "Tray roast, minimal fuss.",
    tags: ["PROTEIN", "GREENS"],
  },
  {
    id: 4,
    title: "Roasted cauliflower & chicken curry",
    time: "1 hr",
    note: "Roasted veg, rich curry sauce.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 5,
    title: "Butternut squash & sage risotto",
    time: "50 min",
    note: "Creamy rice, sweet squash, crisp sage.",
    tags: ["SAUCY", "PANTRY"],
  },
  {
    id: 6,
    title: "Leek, ricotta & gruyere tart",
    time: "1 hr 10 min",
    note: "Buttery tart, sweet leeks, proper dinner-party energy.",
    tags: ["VEGETARIAN", "PANTRY"],
  },
  {
    id: 7,
    title: "Creamy mustard & tarragon chicken",
    time: "35 min",
    note: "Quick, creamy, and herby.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 8,
    title: "Roasted cauliflower cheese filo pie",
    time: "1 hr 50 min",
    note: "Golden filo, rich cheese sauce.",
    tags: ["VEGETARIAN", "SAUCY"],
  },
];

const PROJECT_STEPS = [
  { id: 1, title: "Plan the build", desc: "sauce, filling, or slow base" },
  { id: 2, title: "Cook in stages", desc: "brown, simmer, then assemble" },
  { id: 3, title: "Make it stretch", desc: "cook once, eat twice" },
];

const SHOW_OFF_MENU = [
  {
    id: 1,
    title: "Luxe fish pie",
    time: "1 hr 55 min",
    note: "Rich, glossy, and special.",
    tags: ["SEAFOOD", "SAUCY"],
  },
  {
    id: 2,
    title: "Easy mini beef wellingtons",
    time: "45 min",
    note: "Looks fancy, feels easy.",
    tags: ["PROTEIN"],
  },
  {
    id: 3,
    title: "Roast hake with caper-anchovy butter",
    time: "40 min",
    note: "Bright and bold.",
    tags: ["SEAFOOD", "BRIGHT"],
  },
  {
    id: 4,
    title: "Spiced lamb pie",
    time: "4 hr 50 min",
    note: "Deeply spiced and celebratory.",
    tags: ["PROTEIN", "SWEET SALTY"],
  },
  {
    id: 5,
    title: "Slow cooker coq au vin",
    time: "4 hr 30 min",
    note: "Slow-cooked, rich, and glossy.",
    tags: ["PROTEIN", "SAUCY"],
  },
  {
    id: 6,
    title: "Pan-fried salmon",
    time: "6 min",
    note: "Crisp skin, quick finish.",
    tags: ["SEAFOOD", "BRIGHT"],
  },
  {
    id: 7,
    title: "Slow-cooked shredded lamb shoulder",
    time: "8 hr+",
    note: "Big-feast energy, worth the wait.",
    tags: ["PROTEIN", "SWEET SALTY"],
  },
];


const SHOW_OFF_STEPS = [
  { id: 1, title: "Pick a hero", desc: "fish, pie, or a standout sauce" },
  { id: 2, title: "Add one flourish", desc: "butter, herbs, or glaze" },
  { id: 3, title: "Plate with contrast", desc: "something bright or crunchy" },
];

const FREEZER_MENU = [
  {
    id: 1,
    title: "Fish fingers & mushy peas",
    time: "25 min",
    note: "Crisp fish, minty peas.",
    tags: ["SEAFOOD", "GREENS"],
  },
  {
    id: 2,
    title: "Chicken goujons",
    time: "30 min",
    note: "Crispy strips with easy sides.",
    tags: ["PROTEIN", "PANTRY"],
  },
  {
    id: 3,
    title: "Veggie burgers + slaw",
    time: "20 min",
    note: "Zero‑brain burgers and slaw.",
    tags: ["VEGETARIAN"],
  },
  {
    id: 4,
    title: "Salmon traybake",
    time: "50 min",
    note: "Roast salmon with greens.",
    tags: ["SEAFOOD", "GREENS", "BRIGHT"],
  },
  {
    id: 5,
    title: "Cowboy pie",
    time: "1 hr",
    note: "Sausage, beans, mash top.",
    tags: ["PROTEIN", "PANTRY"],
  },
  {
    id: 6,
    title: "Teriyaki gyoza stir-fry",
    time: "25 min",
    note: "Fast veg + gyoza.",
    tags: ["PROTEIN", "GREENS", "SAUCY"],
  },
  {
    id: 7,
    title: "Halloumi salad with couscous",
    time: "25 min",
    note: "Quick halloumi, fresh salad.",
    tags: ["VEGETARIAN", "GREENS"],
  },
  {
    id: 8,
    title: "Cheats pizza + rocket salad",
    time: "30 min",
    note: "Flatbread pizza + balsamic rocket.",
    tags: ["VEGETARIAN", "GREENS"],
  },
];

const FREEZER_STEPS = [
  { id: 1, title: "Check the freezer", desc: "choose a protein or ready item" },
  { id: 2, title: "Add a simple side", desc: "rice, potatoes, or salad" },
  { id: 3, title: "Lift it up", desc: "greens, lemon, or a quick sauce" },
];

const WINS_BUILD_STEPS = [
  { id: 1, title: "Pick a protein", desc: "eggs, tinned fish, tofu, chicken" },
  { id: 2, title: "Heat a carb", desc: "pasta, noodles, wraps, potatoes, rice" },
  { id: 3, title: "Finish bright", desc: "lemon, herbs, hot sauce" },
];

const FOOD_HUB_CATEGORY_META = [
  {
    id: 1,
    eyebrow: "10-15 minute wins",
    title: "Fast, hot, done.",
    subtitle:
      "Pick one, add a side, and get back to life. Built for weeknights, low effort, high reward.",
    menu: WINS_MENU,
    steps: WINS_BUILD_STEPS,
  },
  {
    id: 2,
    eyebrow: "30-minute staples",
    title: "Reliable, repeatable, calm.",
    subtitle:
      "Comforting mains that stay consistent. The kind you can cook half-asleep.",
    menu: STAPLES_MENU,
    steps: STAPLES_STEPS,
  },
  {
    id: 3,
    eyebrow: "Zero-brain dinners",
    title: "Autopilot dinners, sorted.",
    subtitle:
      "Minimal decisions, maximum payoff. Built for tired evenings and low bandwidth.",
    menu: ZERO_BRAIN_MENU,
    steps: ZERO_BRAIN_STEPS,
  },
  {
    id: 4,
    eyebrow: "One-pan, no plan",
    title: "One tray. Done.",
    subtitle:
      "Easy clean-up, easy wins. Throw it in, walk away, and come back to dinner.",
    menu: ONE_PAN_MENU,
    steps: ONE_PAN_STEPS,
  },
  {
    id: 5,
    eyebrow: "Project meals",
    title: "Worth the simmer.",
    subtitle:
      "Slow, cozy, and a little more involved. Sunday energy, weekday payoff.",
    menu: PROJECT_MENU,
    steps: PROJECT_STEPS,
  },
  {
    id: 6,
    eyebrow: "Show-off but easy",
    title: "Looks fancy, feels simple.",
    subtitle:
      "The plates that feel like a flex without the stress. Guest-ready in a pinch.",
    menu: SHOW_OFF_MENU,
    steps: SHOW_OFF_STEPS,
  },
  {
    id: 8,
    eyebrow: "Freezer first",
    title: "Rescue what's already there.",
    subtitle:
      "Use up the freezer before it uses you. Smart, tidy, and surprisingly good.",
    menu: FREEZER_MENU,
    steps: FREEZER_STEPS,
  },
];

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatRecipeTime(recipe: FoodHubRecipe | null) {
  if (!recipe) return "";
  const parts: string[] = [];
  if (recipe.time_prep_min != null && recipe.time_prep_min > 0) {
    parts.push(`Prep ${recipe.time_prep_min} mins`);
  }
  if (recipe.time_cook_min != null && recipe.time_cook_min > 0) {
    parts.push(`Cook ${recipe.time_cook_min} mins`);
  }
  if (recipe.time_total_min != null && recipe.time_total_min > 0) {
    parts.push(`Total ${recipe.time_total_min} mins`);
  }
  if (!parts.length) return "";
  if (parts.length === 3) {
    return `${parts[0]} • ${parts[1]} (${parts[2]})`;
  }
  return parts.join(" • ");
}

function normalizeRecipeKey(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export default function App() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [activePage, setActivePage] = useState<"dashboard" | "food-hub">(
    "dashboard"
  );
  const [foodHubMode, setFoodHubMode] = useState<"hub" | "wins">("hub");
  const [winsTransitioning, setWinsTransitioning] = useState(false);
  const [winsExiting, setWinsExiting] = useState(false);
  const [hubTransitioning, setHubTransitioning] = useState(false);
  const [hubExiting, setHubExiting] = useState(false);
  const [dashboardIntro, setDashboardIntro] = useState(false);
  const [titleMode, setTitleMode] = useState<"hub" | "wins">("hub");
  const [activeFoodHubCategory, setActiveFoodHubCategory] = useState(1);
  const [titlePhase, setTitlePhase] = useState<"out" | "in" | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<
    "to-foodhub" | "to-dashboard" | null
  >(null);
  const [trackIndex, setTrackIndex] = useState(FOOD_HUB_VISIBLE);
  const [isTrackSnapping, setIsTrackSnapping] = useState(false);
  const [pillMode, setPillMode] = useState<"work" | "mic">("work");
  const [isWork, setIsWork] = useState<boolean | null>(null);
  const [workStart, setWorkStart] = useState<string | null>(null);
  const [workEnd, setWorkEnd] = useState<string | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<number | null>(null);
  const [taskBrowseActive, setTaskBrowseActive] = useState(false);
  const [tasksViewMode, setTasksViewMode] = useState<"all" | "single">("all");
  const lastTasksDayRef = useRef<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [aiInput, setAiInput] = useState("");
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [foodHubRecipes, setFoodHubRecipes] = useState<FoodHubRecipe[]>([]);
  const [foodHubLoading, setFoodHubLoading] = useState(false);
  const [helpDecideOpen, setHelpDecideOpen] = useState(false);
  const [helpDecidePhase, setHelpDecidePhase] = useState<
    "prefs" | "bracket" | "winner"
  >("prefs");
  const [helpDecidePrefs, setHelpDecidePrefs] = useState<HelpDecidePrefs>({
    time_band: null,
    activity_level: null,
    health_vibe: null,
    weight_class: null,
    cuisine_region: null,
  });
  const [helpDecideAllRecipes, setHelpDecideAllRecipes] = useState<
    FoodHubRecipe[]
  >([]);
  const [helpDecideLoading, setHelpDecideLoading] = useState(false);
  const [helpDecideErr, setHelpDecideErr] = useState<string | null>(null);
  const [helpDecidePair, setHelpDecidePair] = useState<
    [FoodHubRecipe, FoodHubRecipe] | null
  >(null);
  const [helpDecideRound, setHelpDecideRound] = useState(1);
  const [helpDecideCurrentRound, setHelpDecideCurrentRound] = useState<
    FoodHubRecipe[]
  >([]);
  const [helpDecideNextRound, setHelpDecideNextRound] = useState<FoodHubRecipe[]>(
    []
  );
  const [helpDecidePairIndex, setHelpDecidePairIndex] = useState(0);
  const [helpDecideWinner, setHelpDecideWinner] = useState<FoodHubRecipe | null>(
    null
  );
  const [recipeOrigin, setRecipeOrigin] = useState<"wins" | "decide">("wins");
  const foodHubImageByNameRef = useRef<Record<string, string>>({
    [normalizeRecipeKey("Creamy carbonara")]: creamyCarbonaraImg,
    [normalizeRecipeKey("Chilli con carne")]: chilliConCarneImg,
    [normalizeRecipeKey("Gnocchi with creamy tomato & spinach sauce")]:
      gnocchiCreamyTomatoImg,
    [normalizeRecipeKey("Chicken fried rice")]: chickenFriedRiceImg,
    [normalizeRecipeKey("Tuna pasta")]: tunaPastaImg,
    [normalizeRecipeKey("Sausage, kale & gnocchi one-pot")]:
      sausageKaleGnocchiImg,
    [normalizeRecipeKey("Lemon dressed salmon with leek & broad bean puree")]:
      lemonSalmonImg,
    [normalizeRecipeKey("Vegetarian fajitas")]: veggieFajitasImg,
    [normalizeRecipeKey("Sausage pasta")]: sausagePastaImg,
    [normalizeRecipeKey("Easy mac and cheese")]: macAndCheeseImg,
    [normalizeRecipeKey("Easy egg-fried rice")]: eggFriedRiceImg,
    [normalizeRecipeKey("Tomato soup with cheese & Marmite toast")]:
      tomatoSoupImg,
    [normalizeRecipeKey("Pesto pasta")]: pestoPastaImg,
    [normalizeRecipeKey("Fish tacos")]: fishTacosImg,
    [normalizeRecipeKey("Shakshuka")]: shakshukaImg,
    [normalizeRecipeKey("Chickpea curry")]: chickpeaCurryImg,
    [normalizeRecipeKey("Roast sea bass & vegetable traybake")]: roastSeaBassImg,
    [normalizeRecipeKey("Roast chicken traybake")]: roastChickenTraybakeImg,
    [normalizeRecipeKey("Sausage traybake")]: sausageTraybakeImg,
    [normalizeRecipeKey("Halloumi traybake")]: halloumiTraybakeImg,
    [normalizeRecipeKey("Honey mustard salmon traybake")]: honeyMustardSalmonImg,
    [normalizeRecipeKey("Spiced salmon & tomato traybake")]: spicedSalmonTomatoImg,
    [normalizeRecipeKey("Puttanesca hake traybake")]: puttanescaHakeImg,
    [normalizeRecipeKey("Sweet potato, feta & butter bean traybake")]:
      roastSweetPotatoImg,
    [normalizeRecipeKey("Classic lasagne")]: lasagneImg,
    [normalizeRecipeKey("Cottage pie")]: cottagePieImg,
    [normalizeRecipeKey("Chicken & bacon pie")]: chickenBaconPieImg,
    [normalizeRecipeKey("All-in-one roast chicken & veg")]: roastChickenVegImg,
    [normalizeRecipeKey("Roasted cauliflower & chicken curry")]:
      cauliflowerChickenCurryImg,
    [normalizeRecipeKey("Butternut squash & sage risotto")]: butternutRisottoImg,
    [normalizeRecipeKey("Leek, ricotta & gruyere tart")]: leekTartImg,
    [normalizeRecipeKey("Creamy mustard & tarragon chicken")]:
      mustardTarragonChickenImg,
    [normalizeRecipeKey("Roasted cauliflower cheese filo pie")]:
      cauliflowerCheeseFiloImg,
    [normalizeRecipeKey("Luxe fish pie")]: luxeFishPieImg,
    [normalizeRecipeKey("Easy mini beef wellingtons")]: miniWellingtonImg,
    [normalizeRecipeKey("Roast hake with caper-anchovy butter")]:
      roastHakeButterImg,
    [normalizeRecipeKey("Spiced lamb pie")]: spicedLambPieImg,
    [normalizeRecipeKey("Slow cooker coq au vin")]: coqAuVinImg,
    [normalizeRecipeKey("Pan-fried salmon")]: panFriedSalmonImg,
    [normalizeRecipeKey("Slow-cooked shredded lamb shoulder")]: shreddedLambImg,
    [normalizeRecipeKey("Fish fingers & mushy peas")]: fishFingersImg,
    [normalizeRecipeKey("Chicken goujons")]: chickenGoujonsImg,
    [normalizeRecipeKey("Veggie burgers + slaw")]: veggieBurgerSlawImg,
    [normalizeRecipeKey("Salmon traybake")]: salmonTraybakeImg,
    [normalizeRecipeKey("Cowboy pie")]: cowboyPieImg,
    [normalizeRecipeKey("Teriyaki gyoza stir-fry")]: gyozaStirFryImg,
    [normalizeRecipeKey("Halloumi salad with couscous")]: halloumiCouscousImg,
    [normalizeRecipeKey("Cheats pizza + rocket salad")]: cheatsPizzaImg,
  });
  const [selectedRecipe, setSelectedRecipe] = useState<FoodHubRecipe | null>(
    null
  );
  const [recipeOverlayOpen, setRecipeOverlayOpen] = useState(false);
  const [recipeOverlayClosing, setRecipeOverlayClosing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingCountRef = useRef(0);
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef<Uint8Array | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioRafRef = useRef<number | null>(null);
  const audioRelaxRafRef = useRef<number | null>(null);
  const lastLevelUpdateRef = useRef(0);
  const audioEnvRef = useRef(0);
  const lastRelaxUpdateRef = useRef(0);
  const winsTransitionTimerRef = useRef<number | null>(null);
  const winsExitTimerRef = useRef<number | null>(null);
  const hubTransitionTimerRef = useRef<number | null>(null);
  const hubExitTimerRef = useRef<number | null>(null);
  const dashboardIntroTimerRef = useRef<number | null>(null);
  const titleSwapTimerRef = useRef<number | null>(null);
  const titleClearTimerRef = useRef<number | null>(null);
  const recipeCloseTimerRef = useRef<number | null>(null);

  const gate = Math.min(1, Math.max(0, (audioLevel - 0.015) / 0.12));
  const pulseLevel = audioLevel * gate * gate;
  const audioPulse = Math.min(1, Math.max(0, pulseLevel * 2.4));
  const isVisualSpeaking = isSpeaking || audioLevel > 0.005;

  function stopRelax() {
    if (audioRelaxRafRef.current != null) {
      cancelAnimationFrame(audioRelaxRafRef.current);
      audioRelaxRafRef.current = null;
    }
  }

  function stopAudioMeter() {
    if (audioRafRef.current != null) {
      cancelAnimationFrame(audioRafRef.current);
      audioRafRef.current = null;
    }
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
      audioSourceRef.current = null;
    }
    stopRelax();
    lastRelaxUpdateRef.current = 0;
    const relaxDecayPerSec = 1.6;
    const relaxTick = (t: number) => {
      audioRelaxRafRef.current = requestAnimationFrame(relaxTick);
      const last = lastRelaxUpdateRef.current || t;
      const dtSec = Math.max(0.01, (t - last) / 1000);
      lastRelaxUpdateRef.current = t;
      const env = audioEnvRef.current * Math.exp(-relaxDecayPerSec * dtSec);
      audioEnvRef.current = env;
      if (env < 0.001) {
        audioEnvRef.current = 0;
        setAudioLevel(0);
        stopRelax();
        return;
      }
      setAudioLevel(env);
    };
    audioRelaxRafRef.current = requestAnimationFrame(relaxTick);
  }

  function openRecipe(recipe: FoodHubRecipe, origin: "wins" | "decide" = "wins") {
    if (recipeOverlayClosing) return;
    if (recipeCloseTimerRef.current != null) {
      window.clearTimeout(recipeCloseTimerRef.current);
      recipeCloseTimerRef.current = null;
    }
    setRecipeOrigin(origin);
    setSelectedRecipe(recipe);
    setRecipeOverlayOpen(true);
    setRecipeOverlayClosing(false);
    if (origin === "decide") {
      setHelpDecideOpen(false);
    }
    void markFoodHubAccessed(recipe.id)
      .then((resp) => {
        setFoodHubRecipes((prev) =>
          prev.map((item) =>
            item.id === recipe.id
              ? { ...item, last_accessed_at: resp.last_accessed_at }
              : item
          )
        );
        setHelpDecideAllRecipes((prev) =>
          prev.map((item) =>
            item.id === recipe.id
              ? { ...item, last_accessed_at: resp.last_accessed_at }
              : item
          )
        );
      })
      .catch(() => {});
  }

  function closeRecipe(afterClose?: () => void) {
    if (!recipeOverlayOpen || recipeOverlayClosing) {
      if (afterClose) afterClose();
      return;
    }
    setRecipeOverlayClosing(true);
    if (recipeCloseTimerRef.current != null) {
      window.clearTimeout(recipeCloseTimerRef.current);
    }
    recipeCloseTimerRef.current = window.setTimeout(() => {
      setRecipeOverlayOpen(false);
      setRecipeOverlayClosing(false);
      setSelectedRecipe(null);
      recipeCloseTimerRef.current = null;
      if (afterClose) afterClose();
    }, 420);
  }

  function formatRecipeTime(recipe: FoodHubRecipe) {
    if (recipe.time_total_min) return `${recipe.time_total_min} mins`;
    const prep = recipe.time_prep_min ?? 0;
    const cook = recipe.time_cook_min ?? 0;
    const total = prep + cook;
    return total > 0 ? `${total} mins` : null;
  }

  function scoreHelpDecideRecipe(recipe: FoodHubRecipe, prefs: HelpDecidePrefs) {
    let score = 1;
    if (prefs.time_band && recipe.time_band === prefs.time_band) score += 2;
    if (prefs.activity_level && recipe.activity_level === prefs.activity_level) {
      score += 2;
    }
    if (prefs.health_vibe && recipe.health_vibe === prefs.health_vibe) score += 2;
    if (prefs.weight_class && recipe.weight_class === prefs.weight_class) {
      score += 2;
    }
    if (prefs.cuisine_region && recipe.cuisine_region === prefs.cuisine_region) {
      score += 3;
    }
    return score;
  }

  function buildHelpDecideBracket() {
    const source = helpDecideAllRecipes;
    if (source.length < 2) {
      setHelpDecidePair(null);
      setHelpDecideWinner(null);
      return;
    }
    const rankedAll = source
      .map((recipe) => ({
        recipe,
        score: scoreHelpDecideRecipe(recipe, helpDecidePrefs),
        tiebreak: Math.random(),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return a.tiebreak - b.tiebreak;
      })
      .map((item) => item.recipe);

    const maxSize = Math.min(16, rankedAll.length);
    const bracketSize =
      maxSize >= 16 ? 16 : maxSize >= 8 ? 8 : maxSize >= 4 ? 4 : 2;
    const ranked = rankedAll.slice(0, bracketSize);

    setHelpDecideRound(1);
    setHelpDecideCurrentRound(ranked);
    setHelpDecideNextRound([]);
    setHelpDecidePairIndex(0);
    setHelpDecideWinner(null);
    if (ranked.length >= 2) {
      setHelpDecidePair([ranked[0], ranked[1]]);
    } else {
      setHelpDecidePair(null);
    }
  }

  function advanceHelpDecide(winner: FoodHubRecipe) {
    const nextRound = [...helpDecideNextRound, winner];
    const nextPairIndex = helpDecidePairIndex + 2;
    if (nextPairIndex < helpDecideCurrentRound.length) {
      setHelpDecideNextRound(nextRound);
      setHelpDecidePairIndex(nextPairIndex);
      setHelpDecidePair([
        helpDecideCurrentRound[nextPairIndex],
        helpDecideCurrentRound[nextPairIndex + 1],
      ]);
      return;
    }
    if (nextRound.length === 1) {
      setHelpDecideWinner(nextRound[0]);
      setHelpDecidePhase("winner");
      setHelpDecidePair(null);
      setHelpDecideCurrentRound([]);
      setHelpDecideNextRound([]);
      setHelpDecidePairIndex(0);
      return;
    }
    setHelpDecideRound((prev) => prev + 1);
    setHelpDecideCurrentRound(nextRound);
    setHelpDecideNextRound([]);
    setHelpDecidePairIndex(0);
    setHelpDecidePair([nextRound[0], nextRound[1]]);
  }

  function updateHelpDecidePref(
    key: keyof HelpDecidePrefs,
    value: string | null
  ) {
    setHelpDecidePrefs((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  }

  function resetHelpDecidePrefs() {
    setHelpDecidePrefs({
      time_band: null,
      activity_level: null,
      health_vibe: null,
      weight_class: null,
      cuisine_region: null,
    });
  }

  function startHelpDecideBracket() {
    setHelpDecidePhase("bracket");
    buildHelpDecideBracket();
  }

  function closeHelpDecide() {
    setHelpDecideOpen(false);
    setHelpDecidePhase("prefs");
    setHelpDecidePair(null);
    setHelpDecideCurrentRound([]);
    setHelpDecideNextRound([]);
    setHelpDecidePairIndex(0);
    setHelpDecideWinner(null);
  }

  function startAudioMeter(audio: HTMLAudioElement) {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
      analyserRef.current = audioCtxRef.current.createAnalyser();
      analyserRef.current.fftSize = 1024;
      analyserDataRef.current = new Uint8Array(analyserRef.current.fftSize);
    }
    const ctx = audioCtxRef.current;
    const analyser = analyserRef.current;
    const data = analyserDataRef.current;
    if (!ctx || !analyser || !data) return;

    ctx.resume().catch(() => undefined);
    stopAudioMeter();
    stopRelax();
    audioSourceRef.current = ctx.createMediaElementSource(audio);
    audioSourceRef.current.connect(analyser);
    analyser.connect(ctx.destination);

    const tick = (t: number) => {
      audioRafRef.current = requestAnimationFrame(tick);
      const lastUpdate = lastLevelUpdateRef.current;
      if (t - lastUpdate < 16) return;
      lastLevelUpdateRef.current = t;
      analyser.getByteTimeDomainData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / data.length);
      const level = Math.min(1, rms * 3.0);
      const env = audioEnvRef.current;
      const dtSec = Math.max(0.01, (t - lastUpdate) / 1000);
      const attack = 0.35;
      const decayPerSec = 12.0;
      let nextEnv = env;
      if (level > env) {
        nextEnv = env + (level - env) * attack;
      } else {
        nextEnv = env * Math.exp(-decayPerSec * dtSec);
      }
      audioEnvRef.current = nextEnv;
      setAudioLevel(nextEnv);
    };
    audioRafRef.current = requestAnimationFrame(tick);
  }
  const [reclassifyOptions, setReclassifyOptions] = useState<
    { item_type: "task" | "reminder" | "event"; item_id: number; label: string; target: "task" | "reminder" | "event" }[]
  >([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sttTranscript, setSttTranscript] = useState<string | null>(null);
  const [sttStatus, setSttStatus] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const sttAudioCtxRef = useRef<AudioContext | null>(null);
  const sttProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sttSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const sttGainRef = useRef<GainNode | null>(null);
  const sttBuffersRef = useRef<Float32Array[]>([]);
  const sttSampleRateRef = useRef<number>(16000);
  const sttManualRef = useRef(false);
  const transitionTimerRef = useRef<number | null>(null);
  const pillTimerRef = useRef<number | null>(null);

  async function refresh() {
    try {
      setErr(null);

      const dash = await getDashboard();
      setData(dash);

      const dateStr = ymdLocal(new Date(dash.now));

      const wd = await getWorkday(dateStr);
      setIsWork(wd.is_work);
      setWorkStart(wd.start_hhmm ?? "08:00");
      setWorkEnd(wd.end_hhmm ?? "16:30");

      const rr: RemindersResp = await getReminders(dateStr);
      setReminders(rr.reminders ?? []);

      const ev = await getEvents(dateStr);
      setEvents(ev.events ?? []);

      const tr = await getTasks();
      const nextTasks = tr.tasks ?? [];
      setTasks(nextTasks);
      setCurrentTaskId((prevId) => {
        if (!nextTasks.length) return null;
        if (prevId && nextTasks.some((t) => t.id === prevId)) return prevId;
        return nextTasks[0].id;
      });
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  useEffect(() => {
    if (!data?.now) return;
    const day = ymdLocal(new Date(data.now));
    if (lastTasksDayRef.current && lastTasksDayRef.current !== day) {
      setTasksViewMode("all");
      setTaskBrowseActive(false);
    }
    lastTasksDayRef.current = day;
  }, [data?.now]);

  async function markDone(r: Reminder) {
    try {
      setErr(null);
      await doneReminder(r.id, r.reminder_key);
      // refresh right away so it disappears instantly
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const now = data?.now ? new Date(data.now) : null;
  const timeStr = now
    ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";
  const dateStrPretty = now
    ? now.toLocaleDateString([], {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "--";

  const workLabel = isWork === null ? "…" : isWork ? "Work day" : "Day off";
  const hasNow = Boolean(now);
  const nowForWindow = now ?? new Date();
  const nowMs = nowForWindow.getTime();
  let workStatus = "";
  let workFinished = false;
  if (isWork && hasNow && workStart && workEnd) {
    const [wsH, wsM] = workStart.split(":").map(Number);
    const [weH, weM] = workEnd.split(":").map(Number);
    const workStartDt = new Date(nowForWindow);
    workStartDt.setHours(wsH, wsM, 0, 0);
    const workEndDt = new Date(nowForWindow);
    workEndDt.setHours(weH, weM, 0, 0);
    if (nowMs < workStartDt.getTime()) {
      const diffMins = Math.round((workStartDt.getTime() - nowMs) / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      workStatus = hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins} mins`;
    } else if (nowMs <= workEndDt.getTime()) {
      workStatus = "now";
    } else {
      workFinished = true;
    }
  }
  const hasTodayItems = Boolean(isWork) || events.length > 0;
  const remindersWithWindow = reminders.map((r) => {
    const dueAt = new Date(`${r.dose_date}T${r.scheduled_hhmm}:00`);
    const windowEnd = new Date(dueAt.getTime() + 30 * 60 * 1000);
    const inWindow = hasNow ? nowForWindow >= dueAt && nowForWindow <= windowEnd : false;
    const overdue = hasNow ? nowForWindow > windowEnd : false;
    const derivedStatus: ReminderStatus =
      r.status === "active" && overdue ? "missed" : r.status;
    return { ...r, dueAt, windowEnd, inWindow, overdue, derivedStatus };
  });
  const visibleReminders = remindersWithWindow.filter((r) => {
    if (!hasNow) return true;
    if (r.status === "active") {
      return r.inWindow || r.overdue;
    }
    return true;
  });
  const sortedReminders = [...visibleReminders].sort((a, b) => {
    const aPriority = a.inWindow ? 0 : 1;
    const bPriority = b.inWindow ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.dueAt.getTime() - b.dueAt.getTime();
  });
  const visibleAlerts = sortedReminders.filter((r) => !r.reminder_key.startsWith("event:"));

  const taskIndex =
    currentTaskId === null ? -1 : tasks.findIndex((t) => t.id === currentTaskId);
  const currentTask =
    taskIndex >= 0 ? tasks[taskIndex] : tasks.length ? tasks[0] : null;

  function cycleTask() {
    if (tasks.length <= 1) return;
    const idx = taskIndex >= 0 ? taskIndex : 0;
    const nextTask = tasks[(idx + 1) % tasks.length];
    setCurrentTaskId(nextTask.id);
  }

  function advanceTaskAndGet(): string | null {
    if (!tasks.length) return null;
    if (tasks.length === 1) {
      setCurrentTaskId(tasks[0].id);
      return tasks[0].title;
    }
    const idx = taskIndex >= 0 ? taskIndex : 0;
    const nextTask = tasks[(idx + 1) % tasks.length];
    setCurrentTaskId(nextTask.id);
    return nextTask.title;
  }

  async function markTaskDone() {
    if (!currentTask) return;
    try {
      setErr(null);
      await doneTask(currentTask.id);
      await refresh();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    }
  }

  async function handleTtsClick() {
    await playTts("Time to take your meds, Sam.");
  }

  async function playTts(text: string) {
    if (!text.trim()) return;
    try {
      setErr(null);
      const blob = await ttsSpeak(text);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      const cleanup = () => URL.revokeObjectURL(url);
      audio.preload = "auto";
      const finish = () => {
        cleanup();
        speakingCountRef.current = Math.max(0, speakingCountRef.current - 1);
        if (speakingCountRef.current === 0) {
          setIsSpeaking(false);
        }
        stopAudioMeter();
        if (activeAudioRef.current === audio) {
          activeAudioRef.current = null;
        }
      };
      audio.onplaying = () => {
        speakingCountRef.current += 1;
        setIsSpeaking(true);
        startAudioMeter(audio);
      };
      audio.onended = finish;
      audio.onpause = finish;
      audio.onerror = finish;
      activeAudioRef.current = audio;
      await audio.play();
    } catch (e: any) {
      setErr(e?.message ?? "failed");
      speakingCountRef.current = 0;
      setIsSpeaking(false);
      stopAudioMeter();
    }
  }

  async function handleAiSubmit(overridePrompt?: string | React.SyntheticEvent) {
    const prompt =
      (typeof overridePrompt === "string" ? overridePrompt : aiInput).trim();
    if (!prompt) return;
    try {
      setErr(null);
      setAiLoading(true);
      if (reclassifyOptions.length) {
        const selected = Number(prompt);
        const option = reclassifyOptions[selected - 1];
        if (option) {
          const res = await aiReclassifyConfirm(
            option.target,
            option.item_type,
            option.item_id
          );
          if (res.ok) {
            const ack = `Moved: ${option.label} to ${option.target}`;
            setAiOutput(ack);
            await playTts(ack);
            setReclassifyOptions([]);
            await refresh();
            return;
          }
        }
        setAiOutput("Please reply with a valid option number.");
        return;
      }
      const nextTaskTrigger = /\b(next task|what'?s the next task|show me the next task)\b/i;
      const topPriorityTrigger =
        /\b(top priority task|top priority today|highest priority task|most important task|most important thing|most important thing i need to do|what do i need to do today|what should i do today|what'?s the most important thing i need to do today|what'?s the most important task today|what'?s the top thing today|what'?s my top task today|what should i tackle first|what do i tackle first|what should i do first|what do i do first|what'?s the highest priority thing today|what'?s the most urgent task|what is the most urgent thing)\b/i;
      const otherTasksTrigger =
        /\b(what other tasks|what else do i have|any other tasks|more tasks)\b/i;
      const continueTasksTrigger = /\b(yes|yeah|yep|next|keep going|more)\b/i;
      const stopTasksTrigger = /\b(no|nope|stop|that's all|done)\b/i;
      const singleTasksTrigger =
        /\b(one task at a time|one task at a time please|focus mode|low overwhelm mode|reduce overwhelm|show one task|single task mode)\b/i;
      const allTasksTrigger =
        /\b(show all tasks|show all my tasks|list all tasks|show tasks list|all tasks view|show me all tasks|show me all my tasks)\b/i;

      if (singleTasksTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = currentTask?.title ?? advanceTaskAndGet();
        const ack = title
          ? `Okay, one task at a time. Next task: ${title}.`
          : "Okay, one task at a time. You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (allTasksTrigger.test(prompt)) {
        setTasksViewMode("all");
        setTaskBrowseActive(false);
        const ack = "Okay, showing all tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (taskBrowseActive) {
        if (continueTasksTrigger.test(prompt)) {
          const title = advanceTaskAndGet();
          if (title) {
            const ack = `Next task: ${title}. Want to hear the next one?`;
            setAiOutput(ack);
            await playTts(ack);
          } else {
            const ack = "You have no tasks.";
            setAiOutput(ack);
            await playTts(ack);
            setTaskBrowseActive(false);
          }
          return;
        }
        if (stopTasksTrigger.test(prompt)) {
          setTaskBrowseActive(false);
          const ack = "Okay.";
          setAiOutput(ack);
          await playTts(ack);
          return;
        }
      }

      if (nextTaskTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = advanceTaskAndGet();
        const ack = title ? `Next task: ${title}.` : "You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (otherTasksTrigger.test(prompt)) {
        setTasksViewMode("single");
        const title = advanceTaskAndGet();
        if (title) {
          const ack = `Next task: ${title}. Want to hear the next one?`;
          setAiOutput(ack);
          await playTts(ack);
          setTaskBrowseActive(true);
        } else {
          const ack = "You have no tasks.";
          setAiOutput(ack);
          await playTts(ack);
        }
        return;
      }

      if (topPriorityTrigger.test(prompt)) {
        setTasksViewMode("single");
        const topTask = tasks.length ? tasks[0] : null;
        if (topTask) {
          setCurrentTaskId(topTask.id);
        }
        const ack = topTask
          ? `Top priority task: ${topTask.title}.`
          : "You have no tasks.";
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      const resolveRes = await aiResolve(prompt);
      if (resolveRes.ok) {
        const completionAcks = [
          "Ok, I'll mark it as done.",
          "Got it, marking that as done.",
          "All set, I marked it as done.",
          "Done. I've marked it.",
          "No problem, it's marked as done.",
          "Okay, marked as done.",
          "Sure, I'll mark it done.",
          "Understood. Marked as done.",
          "Got it. Marked as done.",
          "Okay, I'll mark that as done.",
          "Done. I've got it marked.",
          "All right, it's marked as done.",
          "Consider it done.",
          "Done and marked.",
          "Marked it as done.",
          "Okay, done.",
          "Yep, marking it as done now.",
          "Done. Marked it.",
          "Got it, that's done.",
          "All done. Marked.",
          "Sorted. Marked as done.",
          "Done, I'll mark it.",
          "Okay, I'll mark it.",
          "Great, it's marked as done.",
          "Got it. I'll mark it as done.",
          "All right, I'll mark it as done.",
          "Done — marked as done.",
          "No worries, I marked it done.",
          "Sure thing, it's marked as done.",
          "Okay, that's marked as done.",
        ];
        const ack =
          completionAcks[Math.floor(Math.random() * completionAcks.length)];
        setAiOutput(ack);
        await playTts(ack);
        await refresh();
        return;
      }
      const reclassifyTrigger = /(?:\bmove\b|\breclassif(?:y|y)\b|\bshould be\b|\bmake\b.*\b(task|reminder|event)\b)/i;
      if (reclassifyTrigger.test(prompt)) {
        const reclassifyRes = await aiReclassify(prompt);
        if (reclassifyRes.needs_confirmation && reclassifyRes.options?.length) {
          const target = reclassifyRes.target ?? "task";
          const nextOptions = reclassifyRes.options.map((o) => ({
            ...o,
            target,
          }));
          setReclassifyOptions(nextOptions);
          const optionsText = nextOptions
            .map((o, i) => `${i + 1}) ${o.label} (${o.item_type})`)
            .join("\n");
          setAiOutput(`Which one should I move to ${target}?\n${optionsText}`);
          return;
        }
        if (reclassifyRes.ok) {
          const ack = "Moved it.";
          setAiOutput(ack);
          await playTts(ack);
          await refresh();
          return;
        }
      }
      const priorityTrigger =
        /\b(priority|prioritis(?:e|e)|urgent|important|vital|high|low|medium)\b/i;
      if (priorityTrigger.test(prompt)) {
        const priorityRes = await aiPriority(prompt);
        if (priorityRes.ok && priorityRes.priority) {
          const priorityAcks = [
            `Okay, set it to ${priorityRes.priority}.`,
            `Got it, it’s now ${priorityRes.priority}.`,
            `Done, priority set to ${priorityRes.priority}.`,
            `All set, marked as ${priorityRes.priority}.`,
            `Okay, updated to ${priorityRes.priority}.`,
            `Got it — ${priorityRes.priority} priority.`,
            `Done — ${priorityRes.priority}.`,
            `Updated. It’s ${priorityRes.priority} now.`,
          ];
          const ack =
            priorityAcks[Math.floor(Math.random() * priorityAcks.length)];
          setAiOutput(ack);
          await playTts(ack);
          await refresh();
          return;
        }
      }
      const scheduleRes = await aiSchedule(prompt);
      if (scheduleRes.ok) {
        const action = scheduleRes.action ?? "event";
        const addAcks = [
          "Got it, I added the {type}.",
          "Okay, I added the {type}.",
          "Done — I added the {type}.",
          "All set, the {type} is added.",
          "Sorted, I added the {type}.",
          "Great, I’ve added the {type}.",
          "No problem, I added the {type}.",
          "Okay, the {type} is in.",
          "Added the {type}.",
          "That {type} is added now.",
          "Got it — added the {type}.",
          "All good, I added the {type}.",
          "Consider the {type} added.",
          "Done, the {type} is added.",
          "Noted and added the {type}.",
          "Added the {type} for you.",
          "Got it, that {type} is added.",
          "Okay, that {type} is added.",
          "Sure, I added the {type}.",
          "Done, added the {type}.",
          "Alright, I added the {type}.",
          "Okay, I’ve put the {type} in.",
          "All set — added the {type}.",
          "No worries, the {type} is added.",
          "Added the {type}, all set.",
          "Done, the {type} is in.",
          "Got it, the {type} is now added.",
          "Alright, the {type} is added.",
          "Okay, you’re set — the {type} is added.",
          "Got it — the {type} is added now.",
        ];
        const pickAddAck = (type: "event" | "task" | "tasks" | "alert") =>
          addAcks[Math.floor(Math.random() * addAcks.length)].replace(
            "{type}",
            type
          );
        const workdayAcks = [
          "Got it, I've updated your work schedule.",
          "Okay, your workdays are updated.",
          "All set, I updated your work schedule.",
          "Done — I updated your workdays.",
          "Sorted, I've updated your work schedule.",
          "Okay, I've made those workday changes.",
          "Got it, your workday changes are saved.",
          "All good, your work schedule is updated.",
        ];
        const pickWorkdayAck =
          workdayAcks[Math.floor(Math.random() * workdayAcks.length)];
        const mixedAcks = [
          "Got it, I added everything.",
          "All set, I added those.",
          "Okay, I added all of that.",
          "Done — I added everything.",
          "Sorted, I added those items.",
          "All good, I added it all.",
          "Got it, everything’s added.",
          "Okay, those are added.",
        ];
        const pickMixedAck =
          mixedAcks[Math.floor(Math.random() * mixedAcks.length)];
        let ack = "Done.";
        if (action === "task" && scheduleRes.task) {
          const totalTasks = scheduleRes.tasks?.length ?? 1;
          ack = totalTasks > 1 ? pickAddAck("tasks") : pickAddAck("task");
        } else if (action === "reminder" && scheduleRes.reminder) {
          ack = pickAddAck("alert");
        } else if (action === "workday") {
          ack = pickWorkdayAck;
        } else if (action === "mixed") {
          const mixedCounts = {
            tasks: scheduleRes.tasks?.length ?? 0,
            reminders: scheduleRes.reminders?.length ?? 0,
            events: scheduleRes.events?.length ?? 0,
            workdays: scheduleRes.workdays?.length ?? 0,
          };
          const total =
            mixedCounts.tasks +
            mixedCounts.reminders +
            mixedCounts.events +
            mixedCounts.workdays;
          if (total === 1) {
            if (mixedCounts.tasks) {
              ack = pickAddAck("task");
            } else if (mixedCounts.reminders) {
              ack = pickAddAck("alert");
            } else if (mixedCounts.events) {
              ack = pickAddAck("event");
            } else if (mixedCounts.workdays) {
              ack = pickWorkdayAck;
            } else {
              ack = pickMixedAck;
            }
          } else {
            ack = pickMixedAck;
          }
        } else if (scheduleRes.event) {
          ack = pickAddAck("event");
        }
        setAiOutput(ack);
        await playTts(ack);
        await refresh();
        return;
      }
      const res = await aiRespond(prompt);
      setAiOutput(res.text);
      await playTts(res.text);
    } catch (e: any) {
      setErr(e?.message ?? "failed");
    } finally {
      setAiLoading(false);
    }
  }

  function cleanupManualRecording() {
    if (sttProcessorRef.current) {
      try {
        sttProcessorRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    if (sttSourceRef.current) {
      try {
        sttSourceRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    if (sttGainRef.current) {
      try {
        sttGainRef.current.disconnect();
      } catch {
        // Ignore disconnect errors for already-closed nodes.
      }
    }
    sttProcessorRef.current = null;
    sttSourceRef.current = null;
    sttGainRef.current = null;
    if (sttAudioCtxRef.current) {
      try {
        void sttAudioCtxRef.current.close();
      } catch {
        // Ignore close errors for already-closed contexts.
      }
      sttAudioCtxRef.current = null;
    }
    sttManualRef.current = false;
  }

  function encodeWav(samples: Float32Array, sampleRate: number) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i += 1) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(8, "WAVE");
    writeString(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, "data");
    view.setUint32(40, samples.length * 2, true);

    let offset = 44;
    for (let i = 0; i < samples.length; i += 1) {
      const s = Math.max(-1, Math.min(1, samples[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      offset += 2;
    }

    return buffer;
  }

  function buildWavBlob(buffers: Float32Array[], sampleRate: number) {
    const totalLength = buffers.reduce((sum, b) => sum + b.length, 0);
    const merged = new Float32Array(totalLength);
    let offset = 0;
    buffers.forEach((b) => {
      merged.set(b, offset);
      offset += b.length;
    });
    const wav = encodeWav(merged, sampleRate);
    return new Blob([wav], { type: "audio/wav" });
  }

  function startManualRecording(stream: MediaStream) {
    const AudioCtx =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      return false;
    }
    try {
      const ctx = new AudioCtx();
      sttAudioCtxRef.current = ctx;
      sttSampleRateRef.current = ctx.sampleRate;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      const gain = ctx.createGain();
      gain.gain.value = 0;
      sttBuffersRef.current = [];
      processor.onaudioprocess = (evt) => {
        const input = evt.inputBuffer.getChannelData(0);
        sttBuffersRef.current.push(new Float32Array(input));
      };
      source.connect(processor);
      processor.connect(gain);
      gain.connect(ctx.destination);
      sttSourceRef.current = source;
      sttProcessorRef.current = processor;
      sttGainRef.current = gain;
      sttManualRef.current = true;
      void ctx.resume();
      setIsRecording(true);
      return true;
    } catch {
      cleanupManualRecording();
      return false;
    }
  }

  async function transcribeBlob(blob: Blob) {
    if (!blob.size) {
      setSttStatus("No audio captured.");
      return;
    }
    try {
      setSttStatus("Transcribing...");
      const res = await sttTranscribe(blob);
      const transcriptText = (res.text || "").trim();
      setSttTranscript(transcriptText || "(no text)");
      if (transcriptText) {
        setAiInput(transcriptText);
        if (!aiLoading) {
          void handleAiSubmit(transcriptText);
        }
      }
      setSttStatus(res.language ? `Language: ${res.language}` : "Done");
    } catch (e: any) {
      setErr(e?.message ?? "failed");
      setSttStatus(null);
    }
  }

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cleanupManualRecording();
    };
  }, []);

  useEffect(() => {
    return () => {
      if (transitionTimerRef.current != null) {
        window.clearTimeout(transitionTimerRef.current);
      }
      if (pillTimerRef.current != null) {
        window.clearTimeout(pillTimerRef.current);
      }
    };
  }, []);

  async function startRecording() {
    if (isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Microphone not supported in this browser.");
      return;
    }
    try {
      setErr(null);
      setSttTranscript(null);
      setSttStatus("Listening...");
      const stream =
        streamRef.current ?? (await navigator.mediaDevices.getUserMedia({ audio: true }));
      streamRef.current = stream;
      if (!stream.getAudioTracks().length) {
        setErr("No audio track available from microphone.");
        setSttStatus(null);
        return;
      }
      let recorder: MediaRecorder | null = null;
      const candidates: Array<string | null> = [
        "audio/ogg;codecs=opus",
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        null,
      ];
      const candidateErrors: string[] = [];
      for (const candidate of candidates) {
        if (candidate && !MediaRecorder.isTypeSupported(candidate)) {
          continue;
        }
        try {
          recorder = candidate
            ? new MediaRecorder(stream, { mimeType: candidate })
            : new MediaRecorder(stream);
          recorder.start();
          break;
        } catch (e: any) {
          candidateErrors.push(
            `${candidate ?? "default"}: ${e?.message ?? "unknown error"}`
          );
          recorder = null;
        }
      }
      if (!recorder) {
        const manualStarted = startManualRecording(stream);
        if (manualStarted) {
          mediaRecorderRef.current = null;
          return;
        }
        const supported = candidates
          .filter((t): t is string => Boolean(t) && MediaRecorder.isTypeSupported(t))
          .join(", ");
        const ua = navigator.userAgent || "unknown";
        setErr(
          `MediaRecorder start failed (supported: ${supported || "none"}, attempts: ${
            candidateErrors.join(" | ") || "none"
          }, ua: ${ua})`
        );
        setSttStatus(null);
        return;
      }
      chunksRef.current = [];
      recorder.ondataavailable = (evt) => {
        if (evt.data && evt.data.size > 0) {
          chunksRef.current.push(evt.data);
        }
      };
      recorder.onstop = async () => {
        setIsRecording(false);
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        chunksRef.current = [];
        await transcribeBlob(blob);
      };
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e: any) {
      setErr(e?.message ?? "Microphone failed");
      setSttStatus(null);
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (recorder) {
      if (recorder.state !== "inactive") {
        setSttStatus("Processing...");
        recorder.stop();
      }
      return;
    }
    if (sttManualRef.current) {
      setSttStatus("Processing...");
      const buffers = sttBuffersRef.current;
      sttBuffersRef.current = [];
      const sampleRate = sttSampleRateRef.current;
      cleanupManualRecording();
      setIsRecording(false);
      if (!buffers.length) {
        setSttStatus("No audio captured.");
        return;
      }
      const blob = buildWavBlob(buffers, sampleRate);
      void transcribeBlob(blob);
    }
  }

  const maxDishIndex = Math.max(
    0,
    (Math.ceil(FOOD_HUB_DISHES.length / FOOD_HUB_VISIBLE) - 1) * FOOD_HUB_VISIBLE
  );
  const trackOffset = FOOD_HUB_VISIBLE;
  const trackStart = trackOffset - FOOD_HUB_VISIBLE;
  const trackMax = trackOffset + maxDishIndex;
  const trackEnd = trackMax + FOOD_HUB_VISIBLE;
  const trackDishes = [
    ...FOOD_HUB_DISHES.slice(-FOOD_HUB_VISIBLE),
    ...FOOD_HUB_DISHES,
    ...FOOD_HUB_DISHES.slice(0, FOOD_HUB_VISIBLE),
  ];
  const pendingSnapRef = useRef<number | null>(null);
  const autoCycleRef = useRef<number | null>(null);

  const shiftDish = useCallback((delta: number) => {
    setTrackIndex((prevTrack) => {
      const step = delta > 0 ? FOOD_HUB_VISIBLE : -FOOD_HUB_VISIBLE;
      const nextTrack = prevTrack + step;
      if (nextTrack < trackStart || nextTrack > trackEnd) {
        return prevTrack;
      }
      if (nextTrack === trackEnd) {
        pendingSnapRef.current = trackOffset;
      } else if (nextTrack === trackStart) {
        pendingSnapRef.current = trackMax;
      } else {
        pendingSnapRef.current = null;
      }
      return nextTrack;
    });
  }, [trackEnd, trackStart, trackOffset, trackMax]);

  const isFoodHub = activePage === "food-hub";

  const showDashboardLayer =
    !isFoodHub ||
    dashboardIntro ||
    (foodHubMode === "hub" && !hubTransitioning && !winsExiting);
  const showHubIntroCards = isFoodHub && hubTransitioning;
  const showWins =
    (isFoodHub || isTransitioning) && (foodHubMode === "wins" || winsExiting);
  const showHub =
    (isFoodHub || isTransitioning) &&
    (foodHubMode === "hub" || hubTransitioning || hubExiting);

  const scheduleAutoCycle = useCallback(() => {
    if (autoCycleRef.current != null) {
      window.clearTimeout(autoCycleRef.current);
    }
    if (!isFoodHub) return;
    autoCycleRef.current = window.setTimeout(() => {
      shiftDish(1);
      scheduleAutoCycle();
    }, 10000);
  }, [isFoodHub, shiftDish]);

  useEffect(() => {
    scheduleAutoCycle();
    return () => {
      if (autoCycleRef.current != null) {
        window.clearTimeout(autoCycleRef.current);
      }
    };
  }, [scheduleAutoCycle]);

  useEffect(() => {
    if (activePage !== "food-hub" && helpDecideOpen) {
      closeHelpDecide();
    }
  }, [activePage, helpDecideOpen]);

  useEffect(() => {
    return () => {
      if (recipeCloseTimerRef.current != null) {
        window.clearTimeout(recipeCloseTimerRef.current);
        recipeCloseTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isFoodHub) return;
    if (!showHub) return;
    if (trackIndex !== trackStart && trackIndex !== trackEnd) return;
    pendingSnapRef.current = null;
    setIsTrackSnapping(true);
    setTrackIndex(trackOffset);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTrackSnapping(false);
      });
    });
  }, [isFoodHub, showHub, trackEnd, trackIndex, trackOffset, trackStart]);

  useEffect(() => {
    if (!showWins) {
      setFoodHubRecipes([]);
      return;
    }
    let isActive = true;
    setFoodHubLoading(true);
    getFoodHub(activeFoodHubCategory)
      .then((data) => {
        if (!isActive) return;
        const recipes = (data.recipes ?? []).map((recipe) => {
          const key = normalizeRecipeKey(recipe.name);
          const local = foodHubImageByNameRef.current[key];
          return local ? { ...recipe, image_local: local } : recipe;
        });
        setFoodHubRecipes(recipes);
      })
      .catch((e) => {
        if (!isActive) return;
        setFoodHubRecipes([]);
        setErr(e?.message ?? "Food hub recipes failed");
      })
      .finally(() => {
        if (!isActive) return;
        setFoodHubLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [activeFoodHubCategory, showWins]);

  useEffect(() => {
    if (!helpDecideOpen) return;
    let isActive = true;
    setHelpDecideLoading(true);
    setHelpDecideErr(null);
    getFoodHubAll()
      .then((data) => {
        if (!isActive) return;
        const recipes = (data.recipes ?? []).map((recipe) => {
          const key = normalizeRecipeKey(recipe.name);
          const local = foodHubImageByNameRef.current[key];
          return local ? { ...recipe, image_local: local } : recipe;
        });
        setHelpDecideAllRecipes(recipes);
      })
      .catch((e) => {
        if (!isActive) return;
        setHelpDecideAllRecipes([]);
        setHelpDecideErr(e?.message ?? "Help me decide failed");
      })
      .finally(() => {
        if (!isActive) return;
        setHelpDecideLoading(false);
      });
    return () => {
      isActive = false;
    };
  }, [helpDecideOpen]);

  useEffect(() => {
    if (!helpDecideOpen) return;
    if (helpDecidePhase !== "bracket") return;
    if (!helpDecidePair) buildHelpDecideBracket();
  }, [helpDecideOpen, helpDecidePhase, helpDecideAllRecipes, helpDecidePrefs]);

  function handleManualShift(delta: number) {
    shiftDish(delta);
    scheduleAutoCycle();
  }

  function handleTrackTransitionEnd() {
    if (pendingSnapRef.current == null) return;
    const snapIndex = pendingSnapRef.current;
    pendingSnapRef.current = null;
    setIsTrackSnapping(true);
    setTrackIndex(snapIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsTrackSnapping(false);
      });
    });
  }

  function switchPage(next: "dashboard" | "food-hub") {
    if (activePage === next) return;
    const transitionDurationMs = 1100;
    const pillFlipDelayMs = Math.round(transitionDurationMs / 2);
    setActivePage(next);
    if (next === "food-hub") {
      setFoodHubMode("hub");
      setTitleMode("hub");
      setTitlePhase(null);
    }
    setIsTransitioning(true);
    setTransitionDir(next === "food-hub" ? "to-foodhub" : "to-dashboard");
    if (transitionTimerRef.current != null) {
      window.clearTimeout(transitionTimerRef.current);
    }
    if (pillTimerRef.current != null) {
      window.clearTimeout(pillTimerRef.current);
    }
    pillTimerRef.current = window.setTimeout(() => {
      setPillMode(next === "food-hub" ? "mic" : "work");
      pillTimerRef.current = null;
    }, pillFlipDelayMs);
    transitionTimerRef.current = window.setTimeout(() => {
      setIsTransitioning(false);
      setTransitionDir(null);
      transitionTimerRef.current = null;
    }, transitionDurationMs);
  }

  function enterWins(categoryId: number) {
    setActiveFoodHubCategory(categoryId);
    setFoodHubMode("wins");
    setHubExiting(true);
    setWinsExiting(false);
    setHubTransitioning(false);
    setWinsTransitioning(true);
    transitionTitle("wins");
    if (winsTransitionTimerRef.current != null) {
      window.clearTimeout(winsTransitionTimerRef.current);
    }
    if (hubExitTimerRef.current != null) {
      window.clearTimeout(hubExitTimerRef.current);
    }
    if (winsExitTimerRef.current != null) {
      window.clearTimeout(winsExitTimerRef.current);
      winsExitTimerRef.current = null;
    }
    if (hubTransitionTimerRef.current != null) {
      window.clearTimeout(hubTransitionTimerRef.current);
      hubTransitionTimerRef.current = null;
    }
    hubExitTimerRef.current = window.setTimeout(() => {
      setHubExiting(false);
      hubExitTimerRef.current = null;
    }, 900);
    winsTransitionTimerRef.current = window.setTimeout(() => {
      setWinsTransitioning(false);
      winsTransitionTimerRef.current = null;
    }, 2200);
  }

  function exitWins() {
    if (winsExiting) return;
    setWinsTransitioning(false);
    setWinsExiting(true);
    setHubExiting(false);
    setHubTransitioning(true);
    setFoodHubMode("hub");
    transitionTitle("hub");
    if (winsTransitionTimerRef.current != null) {
      window.clearTimeout(winsTransitionTimerRef.current);
      winsTransitionTimerRef.current = null;
    }
    if (winsExitTimerRef.current != null) {
      window.clearTimeout(winsExitTimerRef.current);
    }
    if (hubTransitionTimerRef.current != null) {
      window.clearTimeout(hubTransitionTimerRef.current);
    }
    winsExitTimerRef.current = window.setTimeout(() => {
      setWinsExiting(false);
      winsExitTimerRef.current = null;
    }, 900);
    hubTransitionTimerRef.current = window.setTimeout(() => {
      setHubTransitioning(false);
      hubTransitionTimerRef.current = null;
    }, 1100);
  }

  function exitWinsToDashboard() {
    if (winsExiting) return;
    setWinsTransitioning(false);
    setWinsExiting(true);
    setHubExiting(false);
    setHubTransitioning(false);
    setDashboardIntro(true);
    setTitleMode("hub");
    setTitlePhase(null);
    if (winsTransitionTimerRef.current != null) {
      window.clearTimeout(winsTransitionTimerRef.current);
      winsTransitionTimerRef.current = null;
    }
    if (winsExitTimerRef.current != null) {
      window.clearTimeout(winsExitTimerRef.current);
    }
    if (dashboardIntroTimerRef.current != null) {
      window.clearTimeout(dashboardIntroTimerRef.current);
    }
    winsExitTimerRef.current = window.setTimeout(() => {
      setWinsExiting(false);
      winsExitTimerRef.current = null;
    }, 900);
    dashboardIntroTimerRef.current = window.setTimeout(() => {
      setDashboardIntro(false);
      dashboardIntroTimerRef.current = null;
    }, 1200);
    window.setTimeout(() => {
      switchPage("dashboard");
    }, 0);
  }

  function transitionTitle(next: "hub" | "wins") {
    if (titleSwapTimerRef.current != null) {
      window.clearTimeout(titleSwapTimerRef.current);
    }
    if (titleClearTimerRef.current != null) {
      window.clearTimeout(titleClearTimerRef.current);
    }
    setTitlePhase("out");
    titleSwapTimerRef.current = window.setTimeout(() => {
      setTitleMode(next);
      setTitlePhase("in");
      titleClearTimerRef.current = window.setTimeout(() => {
        setTitlePhase(null);
        titleClearTimerRef.current = null;
      }, 1100);
      titleSwapTimerRef.current = null;
    }, 520);
  }

  const renderTodayCard = (
    slotClass: string,
    alignClass: string,
    extraClass?: string
  ) => (
    <section
      className={`card glass-tile ${slotClass} ${alignClass}${
        extraClass ? ` ${extraClass}` : ""
      }`}
    >
      <div className="cardHeader">
        <h2>Today</h2>
      </div>
      {hasTodayItems ? (
        <ul className="list list--flush">
          {isWork ? (
            <li className={`eventRow${workFinished ? " eventRow--done" : ""}`}>
              <span>
                <strong>{workStart && workEnd ? `${workStart}-${workEnd}` : "Work"}</strong>{" "}
                Work
              </span>
              {workStatus ? (
                <span
                  className={`eventMeta${
                    workFinished ? " eventMeta--done" : " reminderStatus"
                  }${workStatus === "now" ? " reminderStatus--missed" : ""}${
                    workStatus !== "now" && !workFinished ? " reminderStatus--done" : ""
                  }`}
                >
                  {workStatus}
                </span>
              ) : null}
            </li>
          ) : null}
          {events.map((e) => {
            const isAllDay = Boolean(e.all_day);
            const timeLabel = isAllDay
              ? "All day"
              : e.start_hhmm && e.end_hhmm
                ? `${e.start_hhmm}-${e.end_hhmm}`
                : e.start_hhmm ?? "TBD";
            let relativeLabel = "";
            let isNow = false;
            let isUpcoming = false;
            let isDone = false;
            if (isAllDay) {
              relativeLabel = "now";
              isNow = true;
            } else if (e.start_hhmm) {
              const eventStart = new Date(`${e.event_date}T${e.start_hhmm}:00`);
              const eventStartMs = eventStart.getTime();
              let eventEndMs = eventStartMs;
              if (e.end_hhmm) {
                const eventEnd = new Date(`${e.event_date}T${e.end_hhmm}:00`);
                eventEndMs = eventEnd.getTime();
              }
              const diffMs = eventStartMs - nowMs;
              const diffMins = Math.round(diffMs / 60000);
              if (nowMs >= eventStartMs && nowMs <= eventEndMs) {
                relativeLabel = "now";
                isNow = true;
              } else if (diffMins >= 0) {
                const hours = Math.floor(diffMins / 60);
                const mins = diffMins % 60;
                relativeLabel = hours > 0 ? `in ${hours}h ${mins}m` : `in ${mins} mins`;
                isUpcoming = true;
              } else {
                isDone = true;
              }
            }
            return (
              <li key={e.id} className={`eventRow${isDone ? " eventRow--done" : ""}`}>
                <span>
                  <strong>{timeLabel}</strong> {e.title}
                </span>
                {relativeLabel ? (
                  <span
                    className={`eventMeta${
                      isNow || isUpcoming ? " reminderStatus" : ""
                    }${isUpcoming ? " reminderStatus--done" : ""}${
                      isNow ? " reminderStatus--missed" : ""
                    }${isDone ? " eventMeta--done" : ""}`}
                  >
                    {relativeLabel}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );

  const renderTasksCard = (slotClass: string, alignClass: string) => (
    <section className={`card glass-tile ${slotClass} ${alignClass}`}>
      <div className="cardHeader">
        <h2>Tasks</h2>
        {tasksViewMode === "single" && currentTask ? (
          <span className={`taskPriority taskPriority--${currentTask.priority}`}>
            {currentTask.priority}
          </span>
        ) : null}
      </div>
      {tasksViewMode === "all" ? (
        tasks.length ? (
          <ul className="taskList">
            {tasks.map((t) => (
              <li key={t.id} className="taskRow">
                <span className={`taskPriority taskPriority--${t.priority}`}>
                  {t.priority}
                </span>
                <span>{t.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="big">Excellent work. Congrats on completing your tasks!</p>
        )
      ) : currentTask ? (
        <>
          <p className="big">{currentTask.title}</p>
          <div className="taskControls">
            <button className="glass-pill glass-pill--small" onClick={cycleTask}>
              Next
            </button>
            <button className="glass-pill glass-pill--small" onClick={markTaskDone}>
              Done
            </button>
          </div>
        </>
      ) : (
        <p className="big">Excellent work. Congrats on completing your tasks!</p>
      )}
    </section>
  );

  const renderAlertsCard = (
    slotClass: string,
    alignClass: string,
    extraClass?: string
  ) => (
    <section
      className={`card glass-tile ${slotClass} ${alignClass}${
        extraClass ? ` ${extraClass}` : ""
      }`}
    >
      <div className="cardHeader">
        <h2>Alerts</h2>
      </div>

      {/* Med reminders (active) */}
      {visibleAlerts.length ? (
        <div className="reminders">
          {visibleAlerts.map((r) => {
            const isMedReminder = ["lanny_zee", "morning_meds", "lunch_meds", "evening_meds"].includes(
              r.reminder_key
            );
            const statusLabel =
              r.derivedStatus === "done"
                ? isMedReminder
                  ? "Taken"
                  : "Done"
                : r.derivedStatus === "missed"
                  ? "Missed"
                  : null;
            const showDone = r.derivedStatus === "active" && r.inWindow;
            return (
              <div
                key={r.id}
                className={`reminderRow${r.inWindow ? " reminderRow--due" : ""}${
                  r.derivedStatus !== "active" ? " reminderRow--inactive" : ""
                }${r.derivedStatus === "missed" ? " reminderRow--missed" : ""}${
                  r.derivedStatus === "done" ? " reminderRow--done" : ""
                }`}
              >
                <div className="reminderText">
                  <div className="reminderTop">
                    <strong>{r.label}</strong>{" "}
                    <span className="subtle">due {r.scheduled_hhmm}</span>
                    {statusLabel ? (
                      <span
                        className={`reminderStatus reminderStatus--${r.derivedStatus}`}
                      >
                        {statusLabel}
                      </span>
                    ) : null}
                  </div>
                </div>

                {showDone ? (
                  <button
                    className="glass-pill glass-pill--small"
                    onClick={() => markDone(r)}
                  >
                    Done
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Normal alerts */}
      {data?.alerts?.length ? (
        <ul className="list list--pills">
          {data.alerts.map((a, i) => (
            <li key={i}>{a.message}</li>
          ))}
        </ul>
      ) : (
        <p className="big">{visibleAlerts.length ? "" : "None"}</p>
      )}
    </section>
  );

  const renderPushToTalkCard = (slotClass: string, alignClass: string) => (
    <section className={`card glass-tile ${slotClass} ${alignClass}`}>
      <div className="cardHeader">
        <h2>Push to talk</h2>
      </div>
      <button
        className={`glass-pill micPill${isRecording ? " micPill--recording" : ""}`}
        onMouseDown={(e) => {
          e.preventDefault();
          startRecording();
        }}
        onMouseUp={(e) => {
          e.preventDefault();
          stopRecording();
        }}
        onMouseLeave={() => {
          if (isRecording) stopRecording();
        }}
        onTouchStart={(e) => {
          e.preventDefault();
          startRecording();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopRecording();
        }}
      >
        {isRecording ? "Listening..." : "Hold to talk"}
      </button>
      <p className="subtle">v1: button only (no hotword)</p>
      <div className="aiBlock">
        <div className="aiLabel">Ask Sam</div>
        <textarea
          className="aiInput"
          rows={3}
          placeholder="Type a prompt..."
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
        />
        <div className="aiActions">
          <button
            className="glass-pill glass-pill--small"
            onClick={handleAiSubmit}
            disabled={aiLoading}
          >
            {aiLoading ? "Thinking..." : "Ask"}
          </button>
        </div>
      </div>
    </section>
  );

  const activeFoodHubMeta =
    FOOD_HUB_CATEGORY_META.find((item) => item.id === activeFoodHubCategory) ??
    FOOD_HUB_CATEGORY_META[0];

  return (
    <div
      className={`page${isFoodHub ? " page--foodhub" : ""}${
        isTransitioning ? " page--transitioning" : ""
      }${transitionDir ? ` page--${transitionDir}` : ""}${
        winsTransitioning ? " page--wins-transitioning" : ""
      }${winsExiting ? " page--wins-exiting" : ""}${
        hubTransitioning ? " page--hub-transitioning" : ""
      }${hubExiting ? " page--hub-exiting" : ""}${
        dashboardIntro ? " page--dashboard-intro" : ""
      }`}
    >
      <div className="bg">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0}
          scanlineIntensity={0}
          speed={2}
          scanlineFrequency={0}
          warpAmount={0}
          resolutionScale={1}
        />
      </div>

      <header className="top">
        <div className="topLeft">
          <div className="time">{timeStr}</div>
          <div className="dateRow">
            <div className="date">{dateStrPretty}</div>
            <div className="pillMorphWrap">
              <button
                className={`glass-pill glass-pill--small pillMorph${
                  pillMode === "mic"
                    ? " pillMorph--mic micPill micPill--compact"
                    : " pillMorph--work"
                }${isRecording ? " micPill--recording" : ""}`}
                disabled={pillMode !== "mic"}
                onMouseDown={(e) => {
                  if (pillMode !== "mic") return;
                  e.preventDefault();
                  startRecording();
                }}
                onMouseUp={(e) => {
                  if (pillMode !== "mic") return;
                  e.preventDefault();
                  stopRecording();
                }}
                onMouseLeave={() => {
                  if (pillMode === "mic" && isRecording) stopRecording();
                }}
                onTouchStart={(e) => {
                  if (pillMode !== "mic") return;
                  e.preventDefault();
                  startRecording();
                }}
                onTouchEnd={(e) => {
                  if (pillMode !== "mic") return;
                  e.preventDefault();
                  stopRecording();
                }}
              >
                {pillMode === "mic"
                  ? isRecording
                    ? "Listening..."
                    : "Push to talk"
                  : workLabel}
              </button>
            </div>
          </div>
        </div>

        {isFoodHub || isTransitioning ? (
          <div className="topCenter">
            <div
              className={`foodHubTitle funFactTitle foodHubTitle--center${
                titlePhase ? ` foodHubTitle--${titlePhase}` : ""
              }`}
            >
              {titleMode === "wins" ? activeFoodHubMeta.eyebrow : "foodhub"}
            </div>
          </div>
        ) : null}

        <div className="topRight">
          <button
            type="button"
            className={`glass-pill glass-pill--small navPill${
              !isFoodHub ? " navPill--active" : ""
            }`}
            onClick={() => {
              if (isFoodHub && foodHubMode === "wins") {
                exitWinsToDashboard();
              } else {
                switchPage("dashboard");
              }
            }}
            aria-current={!isFoodHub ? "page" : undefined}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`glass-pill glass-pill--small navPill${
              isFoodHub ? " navPill--active" : ""
            }`}
            onClick={() => {
              if (isFoodHub && foodHubMode === "wins") {
                exitWins();
              } else {
                switchPage("food-hub");
              }
            }}
            aria-current={isFoodHub ? "page" : undefined}
          >
            Food Hub
          </button>
        </div>
      </header>
      {aiOutput ? (
        <div className="aiResponse">
          <TextType
            key={aiOutput}
            text={aiOutput}
            typingSpeed={30}
            pauseDuration={600}
            deletingSpeed={20}
            loop={false}
            showCursor
            cursorCharacter="_"
            cursorBlinkDuration={0.6}
          />
        </div>
      ) : null}

      {err && <div className="err glass-soft">Backend error: {err}</div>}

      <main className="grid">
        {showDashboardLayer ? (
          <>
            {renderTodayCard("slot-l1", "card--left", "card--merge")}
            {renderTasksCard("slot-r1", "card--right card--exit-up")}

            {/* Middle column: Orb (no tile/background) */}
            <div className="orbSlot merge-off" aria-hidden="true">
              <div className={`orbWrap${isVisualSpeaking ? " orbWrap--speaking" : ""}`}>
                <Orb
                  hue={0}
                  hoverIntensity={isVisualSpeaking ? audioPulse * 2.2 : 0.35}
                  rotateOnHover
                  forceHoverState={false}
                  pulse={0}
                  pulseSpeed={16.5}
                  autoHover={isVisualSpeaking}
                  autoHoverIntensity={isVisualSpeaking ? audioPulse * 1.1 : 1.0}
                  autoHoverSpeed={6.0}
                  speaking={isVisualSpeaking}
                />
              </div>
            </div>

            <div className="funFactDock merge-off">
              <FunFactCard />
            </div>

            {renderAlertsCard("slot-l2", "card--left", "card--merge")}
            {renderPushToTalkCard("slot-r2", "card--right card--exit-down")}
          </>
        ) : showHubIntroCards ? (
          <>
            {renderTodayCard(
              "slot-l1",
              "card--left card--hub-intro",
              "card--merge"
            )}
            {renderAlertsCard(
              "slot-l2",
              "card--left card--hub-intro card--hub-intro--delay",
              "card--merge"
            )}
          </>
        ) : null}

        {showWins ? (
          <section
            className="winsPage"
            aria-label={`${activeFoodHubMeta.eyebrow} recipes`}
          >
              <div className="winsHero glass-tile">
                <div className="winsHeroTop">
                  <div className="winsEyebrow">{activeFoodHubMeta.eyebrow}</div>
                  <button
                    type="button"
                    className="glass-pill glass-pill--small winsBack"
                    onClick={exitWins}
                  >
                    Back to hub
                  </button>
                </div>
                <h2 className="winsTitle">{activeFoodHubMeta.title}</h2>
                <p className="winsSubtitle">{activeFoodHubMeta.subtitle}</p>
                <div className="winsSteps" role="list">
                  {activeFoodHubMeta.steps.map((step) => (
                    <div key={step.id} className="winsStep" role="listitem">
                      <div className="winsStepTitle">{step.title}</div>
                      <div className="winsStepDesc">{step.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="winsGrid" role="list">
                {activeFoodHubMeta.menu.map((item) => (
                  <article
                    key={item.id}
                    className="winsCard glass-tile"
                    role="listitem"
                    data-win-id={item.id}
                    onClick={() => {
                      const match = foodHubRecipes.find(
                        (recipe) =>
                          normalizeRecipeKey(recipe.name) ===
                          normalizeRecipeKey(item.title)
                      );
                      if (match) openRecipe(match);
                    }}
                  >
                    <div className="winsCardTop">
                      <span className="winsTime">{item.time}</span>
                    </div>
                    <h3 className="winsCardTitle">{item.title}</h3>
                    <p className="winsCardNote">{item.note}</p>
                    <div className="winsTags">
                      {item.tags.map((tag) => {
                        const words = tag.replace(/-/g, " ");
                        const tagKey = tag
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/(^-|-$)/g, "");
                        return (
                          <span key={tag} className="winsTag" data-tag={tagKey}>
                            {words}
                          </span>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>

            </section>
        ) : null}

        {showHub ? (
          <div className="foodHubStack">
              <section className="foodHubPanel" aria-label="Food hub classics">
                <div className="foodHubPanelHeader">
                  <div className="foodHubPanelTitle">classics</div>
                </div>
                <div className="foodHubCarousel">
                  <ul
                    className={`foodHubTrack${isTrackSnapping ? " foodHubTrack--snap" : ""}`}
                    style={{ "--dish-index": trackIndex } as CSSProperties}
                    onTransitionEnd={handleTrackTransitionEnd}
                  >
                    {trackDishes.map((dish, index) => (
                      <li key={`${dish.id}-${index}`} className="foodHubTile">
                        <div className="foodHubTileImage" aria-hidden={!dish.image}>
                          {dish.image ? (
                            <img
                              className="foodHubTileImg"
                              src={dish.image}
                              alt={dish.name}
                              loading="lazy"
                            />
                          ) : (
                            <span>Image</span>
                          )}
                        </div>
                        <div className="foodHubTileName">{dish.name}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
              <section className="foodHubExtras" aria-label="Food hub categories">
                <div className="foodHubExtrasGrid" role="list">
                  {FOOD_HUB_EXTRAS.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      className={`foodHubExtraTile glass-tile${
                        dish.id === 7 ? " foodHubExtraTile--decide" : ""
                      }`}
                      role="listitem"
                      onClick={() => {
                        if (dish.id === 7) {
                          setHelpDecideOpen(true);
                          setHelpDecidePhase("prefs");
                          setHelpDecidePair(null);
                          setHelpDecideCurrentRound([]);
                          setHelpDecideNextRound([]);
                          setHelpDecidePairIndex(0);
                          setHelpDecideWinner(null);
                          return;
                        }
                        enterWins(dish.id);
                      }}
                    >
                      <div className="foodHubTileImage">
                        <GradientText
                          colors={["#9463e9", "#ffffff"]}
                          animationSpeed={8}
                          showBorder={false}
                          className="foodHubCategoryText"
                        >
                          {dish.name}
                        </GradientText>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
          </div>
        ) : null}

        {helpDecideOpen ? (
          <div className="decideOverlay decideOverlay--open">
            <div className="decideOverlayBackdrop" onClick={closeHelpDecide} />
            <div className="decideCard glass-tile" role="dialog" aria-modal="true">
              <div className="decideTop">
                <div>
                  <div className="decideTitle">Help me decide</div>
                  <div className="decideSubtitle">
                    Head-to-head picks with soft matching.
                  </div>
                </div>
                <div className="decideActions">
                  <button
                    type="button"
                    className="glass-pill glass-pill--small"
                    onClick={closeHelpDecide}
                  >
                    Back to food hub
                  </button>
                </div>
              </div>

              {helpDecideErr ? (
                <div className="decideError">{helpDecideErr}</div>
              ) : null}

              {helpDecideLoading ? (
                <div className="decideLoading">Loading recipes…</div>
              ) : helpDecidePhase === "prefs" ? (
                <div className="decidePrefs">
                  {HELP_DECIDE_OPTIONS.map((group) => (
                    <div key={group.key} className="decideRow">
                      <div className="decideRowLabel">{group.label}</div>
                      <div className="decidePills">
                        {group.options.map((option) => {
                          const isActive = helpDecidePrefs[group.key] === option.value;
                          return (
                            <button
                              key={`${group.key}-${option.label}`}
                              type="button"
                              className={`glass-pill glass-pill--small decidePill${
                                isActive ? " decidePill--active" : ""
                              }`}
                              onClick={() =>
                                updateHelpDecidePref(group.key, option.value)
                              }
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div className="decideFooter">
                    <button
                      type="button"
                      className="glass-pill"
                      onClick={startHelpDecideBracket}
                      disabled={!helpDecideAllRecipes.length}
                    >
                      Start bracket
                    </button>
                    <button
                      type="button"
                      className="glass-pill glass-pill--small"
                      onClick={resetHelpDecidePrefs}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : helpDecidePhase === "bracket" ? (
                <div className="decideBattle">
                  <div className="decideRound">
                    Round {helpDecideRound} · {helpDecideCurrentRound.length} recipes
                  </div>
                  {helpDecidePair ? (
                    <div className="decidePair">
                      {helpDecidePair.map((recipe) => {
                        const timeLabel = formatRecipeTime(recipe);
                        return (
                          <article key={recipe.id} className="decideOption">
                            <div className="decideOptionImage">
                              {recipe.image_local ? (
                                <img src={recipe.image_local} alt={recipe.name} />
                              ) : (
                                <div className="decideOptionPlaceholder">Image</div>
                              )}
                            </div>
                            <div className="decideOptionBody">
                              <div className="decideOptionTitle">{recipe.name}</div>
                              {recipe.tagline ? (
                                <div className="decideOptionTagline">
                                  {recipe.tagline}
                                </div>
                              ) : null}
                              {timeLabel ? (
                                <div className="decideOptionTime">{timeLabel}</div>
                              ) : null}
                              <div className="decideOptionTags">
                                {recipe.tags.slice(0, 3).map((tag) => (
                                  <span key={tag} className="decideTag">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <button
                                type="button"
                                className="glass-pill"
                                onClick={() => advanceHelpDecide(recipe)}
                              >
                                Choose
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="decideEmpty">No matches yet.</div>
                  )}
                  <div className="decideFooter decideFooter--battle">
                    <button
                      type="button"
                      className="glass-pill"
                      onClick={startHelpDecideBracket}
                      disabled={!helpDecideAllRecipes.length}
                    >
                      Restart bracket
                    </button>
                  </div>
                </div>
              ) : (
                <div className="decideWinner">
                  <div className="decideWinnerLabel">Winner</div>
                  {helpDecideWinner ? (
                    <div className="decideWinnerCard">
                      <div className="decideOptionImage">
                        {helpDecideWinner.image_local ? (
                          <img
                            src={helpDecideWinner.image_local}
                            alt={helpDecideWinner.name}
                          />
                        ) : (
                          <div className="decideOptionPlaceholder">Image</div>
                        )}
                      </div>
                      <div className="decideOptionBody">
                        <div className="decideOptionTitle">
                          {helpDecideWinner.name}
                        </div>
                        {helpDecideWinner.tagline ? (
                          <div className="decideOptionTagline">
                            {helpDecideWinner.tagline}
                          </div>
                        ) : null}
                        <button
                          type="button"
                          className="glass-pill"
                          onClick={() => openRecipe(helpDecideWinner, "decide")}
                        >
                          Open recipe
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="decideEmpty">No winner yet.</div>
                  )}
                  <div className="decideFooter decideFooter--battle">
                    <button
                      type="button"
                      className="glass-pill glass-pill--small"
                      onClick={() => setHelpDecidePhase("prefs")}
                    >
                      Back to filters
                    </button>
                    <button
                      type="button"
                      className="glass-pill"
                      onClick={startHelpDecideBracket}
                    >
                      Restart bracket
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {recipeOverlayOpen ? (
          <div
            className={`recipeOverlay${
              recipeOverlayClosing ? " recipeOverlay--closing" : " recipeOverlay--open"
            }`}
          >
            <div
              className="recipeOverlayBackdrop"
              onClick={() => closeRecipe()}
              aria-hidden="true"
            />
            <div className="recipeOverlayCard glass-tile" role="dialog" aria-modal="true">
              <div className="recipeOverlayTop">
                <div className="recipeOverlayTitle">
                  {selectedRecipe?.name ?? "Recipe"}
                </div>
                <div className="recipeOverlayActions">
                  {recipeOrigin === "decide" ? (
                    <button
                      type="button"
                      className="glass-pill glass-pill--small"
                      onClick={() => closeRecipe(() => setHelpDecideOpen(true))}
                    >
                      Back to help me decide
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="glass-pill glass-pill--small"
                      onClick={() => closeRecipe()}
                    >
                      Back to {activeFoodHubMeta.eyebrow}
                    </button>
                  )}
                  {recipeOrigin === "decide" ? (
                    <>
                      <button
                        type="button"
                        className="glass-pill glass-pill--small"
                        onClick={() => closeRecipe()}
                      >
                        Back to food hub
                      </button>
                      <button
                        type="button"
                        className="glass-pill glass-pill--small"
                        onClick={() => closeRecipe(() => switchPage("dashboard"))}
                      >
                        Back to dashboard
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="glass-pill glass-pill--small"
                        onClick={() => closeRecipe(exitWins)}
                      >
                        Back to food hub
                      </button>
                      <button
                        type="button"
                        className="glass-pill glass-pill--small"
                        onClick={() => closeRecipe(exitWinsToDashboard)}
                      >
                        Back to dashboard
                      </button>
                    </>
                  )}
                </div>
              </div>

              {selectedRecipe?.image_local || selectedRecipe?.image_url ? (
                <div className="recipeOverlayImage">
                  <img
                    src={
                      selectedRecipe.image_local ??
                      `/api/foodhub/image?url=${encodeURIComponent(
                        selectedRecipe.image_url ?? ""
                      )}`
                    }
                    alt={selectedRecipe.name}
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="recipeOverlayImage recipeOverlayImage--placeholder">
                  <div className="recipeOverlayImageText">Recipe image</div>
                </div>
              )}

              <div className="recipeOverlayMeta">
                {selectedRecipe?.tagline ? (
                  <p className="recipeOverlayTagline">{selectedRecipe.tagline}</p>
                ) : null}
                {formatRecipeTime(selectedRecipe) ? (
                  <div className="recipeOverlayTime">
                    {formatRecipeTime(selectedRecipe)}
                  </div>
                ) : null}
              </div>

              <div className="recipeOverlaySection recipeOverlaySection--ingredients">
                <div className="recipeOverlayLabel">Ingredients</div>
                <ul className="recipeOverlayList">
                  {(selectedRecipe?.ingredients ?? []).map((ingredient) => (
                    <li key={ingredient}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div className="recipeOverlaySection recipeOverlaySection--steps">
                <div className="recipeOverlayLabel">Steps</div>
                <ol className="recipeOverlayList recipeOverlayList--steps">
                  {(selectedRecipe?.steps ?? []).map((step, index) => (
                    <li key={`${selectedRecipe?.id ?? "recipe"}-step-${index}`}>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

            </div>
          </div>
        ) : null}
      </main>

    </div>
  );
}
