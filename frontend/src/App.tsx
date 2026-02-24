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
import ElectricBorder from "./components/ElectricBorder";
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
const FOOD_HUB_TRIGGER_PHRASES: string[] = [
  "Take me to the food hub",
  "Open the food hub",
  "Go to the food hub",
  "Bring up the food hub",
  "Launch the food hub",
  "Start the food hub",
  "Pull up the food hub",
  "Show me the food hub",
  "Load the food hub",
  "Food hub, please",
  "Let’s go to the food hub",
  "Can you take me to the food hub",
  "I want the food hub",
  "I need the food hub",
  "Navigate to the food hub",
  "Switch to the food hub",
  "Head to the food hub",
  "Jump to the food hub",
  "Open food hub",
  "Take me to food hub",
  "Show food hub",
  "Bring me to the food hub",
  "Take us to the food hub",
  "Put me in the food hub",
  "Send me to the food hub",
  "Enter the food hub",
  "Take me into the food hub",
  "Go into the food hub",
  "Visit the food hub",
  "Get me to the food hub",
  "Get us to the food hub",
  "Food hub time",
  "I’m going to the food hub",
  "Let’s open the food hub",
  "Let’s launch the food hub",
  "Let’s load the food hub",
  "Let’s start the food hub",
  "Take me to cooking",
  "Take me to the cooking hub",
  "Open the cooking hub",
  "Let’s cook dinner",
  "Let’s make dinner",
  "Let’s get dinner started",
  "Let’s start dinner",
  "Let’s do dinner",
  "Time to cook dinner",
  "Time to make dinner",
  "I want to cook dinner",
  "I’m cooking dinner",
  "Help me cook dinner",
  "Help me make dinner",
  "Start cooking dinner",
  "Start dinner prep",
  "Let’s prep dinner",
  "Let’s sort dinner",
  "Let’s cook tea",
  "Let’s make tea",
  "Let’s get tea started",
  "Let’s start tea",
  "Time to cook tea",
  "Time to make tea",
  "I want to cook tea",
  "I’m making tea",
  "Help me cook tea",
  "Help me make tea",
  "Let’s make food",
  "Let’s cook food",
  "Let’s cook something",
  "Let’s make something to eat",
  "Let’s make a meal",
  "Let’s cook a meal",
  "Let’s make dinner now",
  "Let’s cook dinner now",
  "Start making dinner",
  "Start cooking tea",
  "Start making tea",
  "Put dinner on",
  "Get dinner on",
  "Get tea on",
  "Put tea on",
  "It’s dinner time",
  "It’s tea time",
  "Dinner time",
  "Tea time",
  "Let’s eat",
  "Let’s make dinner tonight",
  "Let’s cook dinner tonight",
  "Let’s do tea",
  "Let’s do dinner",
  "Let’s get cooking",
  "Let’s get dinner going",
  "Let’s get tea going",
  "Time to cook",
  "Time to make food",
  "What’s for dinner",
  "What’s for tea",
  "What are we cooking",
  "What should we cook tonight",
  "I need to make dinner",
  "I need to cook dinner",
  "I have to make dinner",
  "I have to cook dinner",
];

function normalizeTriggerText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isFoodHubTrigger(prompt: string) {
  const normalizedPrompt = normalizeTriggerText(prompt);
  if (!normalizedPrompt) return false;
  return FOOD_HUB_TRIGGER_PHRASES.some((phrase) => {
    const normalizedPhrase = normalizeTriggerText(phrase);
    return normalizedPhrase.length > 0 && normalizedPrompt.includes(normalizedPhrase);
  });
}

type FoodHubCategoryCommand = {
  id: number;
  label: string;
  aliases: string[];
  action?: "help-decide";
};

const FOOD_HUB_NAV_TEMPLATES = [
  "take me to {label}",
  "go to {label}",
  "open {label}",
  "show me {label}",
  "switch to {label}",
  "navigate to {label}",
  "bring me to {label}",
  "jump to {label}",
  "load {label}",
  "start {label}",
  "launch {label}",
  "pull up {label}",
  "enter {label}",
  "head to {label}",
  "let's go to {label}",
  "let's open {label}",
  "let's head to {label}",
  "let's do {label}",
  "let's make {label}",
  "let's cook {label}",
  "show {label}",
  "show {label} recipes",
  "open the {label} category",
  "go to the {label} section",
  "show the {label} menu",
];

const FOOD_HUB_DECIDE_TEMPLATES = [
  "help me decide",
  "decide for me",
  "pick for me",
  "choose for me",
  "help me pick",
  "can you help me pick",
  "can you help me choose",
  "help me choose",
  "you decide",
  "i can't decide",
  "make the choice",
  "pick a recipe",
  "choose a recipe",
  "pick dinner",
  "choose dinner",
  "decide dinner",
  "decide dinner for me",
  "decide what to cook",
  "decide what we eat",
  "what should we cook",
  "surprise me",
  "make the call",
  "choose something for me",
  "pick something for me",
];

const FOOD_HUB_SEARCH_ACKS = [
  "Here are your options.",
  "Here’s what I found.",
  "Here’s what I’ve got.",
  "Here are some options.",
  "I found these.",
  "These should work.",
  "Here are a few picks.",
  "Here are some ideas.",
  "Here are a few you can make.",
  "Here are some good matches.",
  "Here are the matches I found.",
  "Here’s a set to choose from.",
  "Here are some that fit.",
  "Here are the results.",
  "Here you go.",
  "Here’s a shortlist.",
  "These look right.",
  "These are the options.",
  "Here are the best fits.",
  "Found a few options.",
  "I pulled these up.",
  "Here’s what matches.",
  "Here’s what fits.",
  "Here’s the list.",
  "Here’s what came up.",
  "Here are your results.",
  "Here are some that match.",
  "Here’s a set of matches.",
  "Here’s a few to try.",
  "Here’s a few to pick from.",
  "Here’s what you can cook.",
  "Here’s what you can make.",
  "Here are some quick options.",
  "Here’s a handful of ideas.",
  "Here are some choices.",
  "Here’s a couple of options.",
  "Here’s what I could find.",
  "Here’s what I found.",
  "Here are some good options.",
  "Here are some good picks.",
  "These should fit.",
  "Here’s a few recipes.",
  "Here are some recipes.",
  "Here are some dishes.",
  "Here’s a few dishes.",
  "Here are some meals.",
  "Here’s a few meals.",
  "Here are some results.",
  "Here are a few results.",
  "Here are the options I found.",
  "Here are the recipes I found.",
  "Here are the dishes I found.",
  "Here are the meals I found.",
  "Here’s what I pulled up.",
  "Here’s what I dug up.",
  "Here’s what I surfaced.",
  "Here’s what I turned up.",
  "Here’s what I’ve found.",
  "Here’s what’s available.",
  "Here’s what’s on offer.",
  "Here’s what’s in the mix.",
  "Here’s the spread.",
  "Here are a few ideas for you.",
  "Here are a few options for you.",
  "Here are some options for you.",
  "Here’s a few options for you.",
  "Here’s what I’d suggest.",
  "Here are a few suggestions.",
  "Here are some suggestions.",
  "Here’s a few suggestions.",
  "Here’s what I’ve got for you.",
  "Here are the picks.",
  "Here are the choices.",
  "Here are the suggestions.",
  "Here are the ideas.",
  "Here are the dishes.",
  "Here are the meals.",
  "Here are the recipes.",
  "Here are the results I found.",
  "Here’s what matched.",
  "Here’s what came back.",
  "Here’s what popped up.",
  "Here’s what showed up.",
  "Here’s what turned up.",
  "Here’s what I found for you.",
  "Here’s what I pulled together.",
  "Here’s what I’ve pulled together.",
  "Here’s what I lined up.",
  "Here’s what I gathered.",
  "Here’s a set of options.",
  "Here’s a set of results.",
  "Here’s a set of choices.",
  "Here’s a set of ideas.",
  "Here’s a set of recipes.",
  "Here’s a set of dishes.",
  "Here’s a set of meals.",
  "Here’s what I can offer.",
  "Here’s what I can suggest.",
  "Here’s what I can recommend.",
  "Here are some that should work.",
  "Here are some that look good.",
  "Here are some that fit the brief.",
  "Here are some that match the brief.",
  "Here are some that hit the mark.",
  "Here are some that make sense.",
  "Here are some that line up.",
  "Here are some that fit.",
  "Here’s a few that fit.",
  "Here’s a few that match.",
  "Here’s a few that work.",
  "Here’s a few that look right.",
  "Here’s a few that should work.",
];

const SEARCH_ACK_OPENERS = [
  "Here are",
  "Here’s",
  "I’ve pulled up",
  "I found",
  "I dug up",
  "I queued up",
  "I rounded up",
  "I lined up",
  "I’ve got",
  "I’ve gathered",
  "I’ve picked out",
];

const SEARCH_ACK_DESCRIPTORS = [
  "options",
  "choices",
  "ideas",
  "picks",
  "recipes",
  "dishes",
  "meals",
  "results",
  "matches",
  "contenders",
  "shortlist",
  "lineup",
  "hits",
  "good fits",
];

const SEARCH_ACK_TAILS = [
  "for you",
  "to try",
  "to choose from",
  "that fit",
  "that should work",
  "that match",
  "that hit the brief",
  "that make sense",
  "that line up",
  "that should hit the spot",
];

const SEARCH_ACK_SPEEDY_WORDS = [
  "speedy",
  "quick",
  "fast",
  "rapid",
  "zippy",
  "express",
  "swift",
  "snappy",
  "blink-and-done",
];

const FOOD_HUB_TIME_ACK_TEMPLATES = [
  "Here are some {speed} recipes.",
  "Here are some {speed} picks.",
  "Here are some {speed} options.",
  "Here are some {speed} meals.",
  "Here are some {speed} dishes.",
  "Fast lane cooking: here’s what I found.",
  "Speed mode on. Here are your options.",
  "Here’s a {speed} lineup.",
  "Here’s a {speed} shortlist.",
  "Here’s what you can make {speed}.",
  "Here’s a set of {speed} recipes.",
  "Here’s a set of {speed} ideas.",
];

const TAG_ACK_OPENERS = [
  "Here are",
  "Here’s",
  "I’ve pulled up",
  "I found",
  "I lined up",
  "I rounded up",
  "I queued up",
  "I’ve got",
  "I’ve gathered",
  "I’ve picked out",
];

const TAG_ACK_NOUNS = [
  "options",
  "choices",
  "ideas",
  "picks",
  "recipes",
  "dishes",
  "meals",
  "results",
  "matches",
  "contenders",
  "shortlist",
  "lineup",
];

const TAG_ACK_TAILS = [
  "for you",
  "to try",
  "to choose from",
  "that fit",
  "that should work",
  "that match",
  "that hit the brief",
  "that make sense",
  "that line up",
  "that should hit the spot",
];

const TAG_ACK_ADJECTIVES: Record<string, string[]> = {
  vegetarian: [
    "veg-based",
    "vegetarian",
    "meat-free",
    "plant-forward",
    "veggie",
    "green",
  ],
  vegan: ["vegan", "plant-based", "dairy-free", "egg-free", "plant-powered"],
  pescatarian: ["pescatarian", "fish-forward", "seafood-friendly"],
  "gluten free": ["gluten-free", "wheat-free"],
  "gluten-free": ["gluten-free", "wheat-free"],
  "dairy free": ["dairy-free", "no-dairy"],
  "dairy-free": ["dairy-free", "no-dairy"],
  "low carb": ["low-carb", "carb-light"],
  "low-carb": ["low-carb", "carb-light"],
  "high protein": ["high-protein", "protein-forward"],
  "high-protein": ["high-protein", "protein-forward"],
  healthy: ["healthy", "fresh", "wholesome"],
  light: ["light", "lighter", "easygoing"],
  balanced: ["balanced", "well-rounded", "steady"],
  indulgent: ["indulgent", "rich", "treat-yourself"],
  italian: ["Italian", "trattoria-style", "pasta-forward"],
  french: ["French", "bistro-style", "Parisian"],
  mexican: ["Mexican", "taco-shop", "spicy"],
  indian: ["Indian", "curry-friendly", "spiced"],
  chinese: ["Chinese", "wok-friendly", "stir-fry"],
  japanese: ["Japanese", "rice-forward", "umami-rich"],
  british: ["British", "classic", "pub-style"],
  mediterranean: ["Mediterranean", "olive-oil", "sunny"],
  american: ["American", "classic", "comfort"],
  "middle eastern": ["Middle Eastern", "herby", "spiced"],
  korean: ["Korean", "gochujang-ready", "bold"],
  thai: ["Thai", "sweet-sour-spicy", "aromatic"],
  greek: ["Greek", "lemony", "taverna-style"],
  spanish: ["Spanish", "tapas-friendly", "bold"],
  turkish: ["Turkish", "warm-spice", "hearty"],
  caribbean: ["Caribbean", "island", "bright"],
  moroccan: ["Moroccan", "tagine-style", "warm-spice"],
  lebanese: ["Lebanese", "bright", "herby"],
  vietnamese: ["Vietnamese", "fresh", "punchy"],
  asian: ["Asian-inspired", "flavor-packed", "pan-Asian"],
};

const TAG_ACK_JOKES: Record<string, string[]> = {
  italian: [
    "Get the pasta water on.",
    "Nonna would approve.",
    "Mangia time.",
  ],
  french: [
    "Get your baguettes out.",
    "Bonjour. Bistro vibes ahead.",
  ],
  mexican: ["Taco time.", "Spice it up."],
  japanese: ["Get the rice on.", "Umami incoming."],
  british: ["Kettle on.", "Proper comfort incoming."],
  greek: ["Opa.", "Feta energy."],
  spanish: ["Paella vibes.", "Tapas energy."],
  korean: ["Get the gochujang ready."],
  thai: ["Sweet, sour, spicy."],
  mediterranean: ["Olive oil energy."],
  caribbean: ["Island flavors ahead."],
  moroccan: ["Tagine energy."],
  indian: ["Curry night?"],
  asian: ["Big flavor, quick wins."],
  vegetarian: ["Veggie vibes only."],
  vegan: ["Plant power mode."],
};

function buildTagAckPool(tag: string) {
  const pool: string[] = [];
  const adjectives = TAG_ACK_ADJECTIVES[tag] ?? [tag];
  for (const adjective of adjectives) {
    for (const opener of TAG_ACK_OPENERS) {
      for (const noun of TAG_ACK_NOUNS) {
        pool.push(`${opener} ${adjective} ${noun}.`);
        for (const tail of TAG_ACK_TAILS) {
          pool.push(`${opener} ${adjective} ${noun} ${tail}.`);
        }
      }
    }
  }
  const jokes = TAG_ACK_JOKES[tag] ?? [];
  for (const joke of jokes) {
    for (const noun of TAG_ACK_NOUNS) {
      pool.push(`${joke} Here are your ${noun}.`);
      pool.push(`${joke} Here’s the ${noun}.`);
    }
  }
  return pool;
}

const FOOD_HUB_TAG_ACKS = FOOD_HUB_SEARCH_LABEL_TAGS.reduce<Record<string, string[]>>(
  (acc, tag) => {
    acc[tag] = buildTagAckPool(tag);
    return acc;
  },
  {}
);

function getTagAckPool(rawQuery: string, normalizedQuery: string) {
  const pool: string[] = [];
  const normalized = normalizeTriggerText(rawQuery || normalizedQuery);
  for (const tag of FOOD_HUB_SEARCH_LABEL_TAGS) {
    const normTag = normalizeTriggerText(tag);
    if (normTag && normalized.includes(normTag)) {
      const tagPool = FOOD_HUB_TAG_ACKS[tag];
      if (tagPool?.length) pool.push(...tagPool);
    }
  }
  return pool;
}

function buildSearchAckPool(
  rawQuery: string,
  normalizedQuery: string,
  time: { min: number; max: number } | null
) {
  const pool: string[] = [];
  pool.push(...FOOD_HUB_SEARCH_ACKS);
  for (const opener of SEARCH_ACK_OPENERS) {
    for (const desc of SEARCH_ACK_DESCRIPTORS) {
      pool.push(`${opener} ${desc}.`);
      for (const tail of SEARCH_ACK_TAILS) {
        pool.push(`${opener} ${desc} ${tail}.`);
      }
    }
  }
  if (time) {
    for (const word of SEARCH_ACK_SPEEDY_WORDS) {
      for (const template of FOOD_HUB_TIME_ACK_TEMPLATES) {
        pool.push(template.replace("{speed}", word));
      }
    }
    if (Number.isFinite(time.max ?? Infinity)) {
      pool.push(`Under ${Math.round(time.max)} minutes? Say less.`);
      pool.push(`Keeping it under ${Math.round(time.max)}. Here you go.`);
      pool.push(`Under ${Math.round(time.max)} minutes, sorted.`);
      pool.push(`Quick clock: ${Math.round(time.max)} minutes max. Here’s what fits.`);
    }
  }
  pool.push(...getTagAckPool(rawQuery, normalizedQuery));
  if (pool.length === 0) {
    pool.push("Here are your options.");
  }
  return pool;
}

function pickSearchAck(
  rawQuery: string,
  normalizedQuery: string,
  time: { min: number; max: number } | null
) {
  const tagPool = getTagAckPool(rawQuery, normalizedQuery);
  if (tagPool.length) {
    return tagPool[Math.floor(Math.random() * tagPool.length)];
  }
  if (time) {
    const timePool = buildSearchAckPool("", "", time).filter((item) =>
      /speedy|quick|fast|rapid|zippy|express|swift|snappy|blink-and-done|Under \d+ minutes|Keeping it under|Quick clock/i.test(
        item
      )
    );
    if (timePool.length) {
      return timePool[Math.floor(Math.random() * timePool.length)];
    }
  }
  const pool = buildSearchAckPool(rawQuery, normalizedQuery, time);
  return pool[Math.floor(Math.random() * pool.length)];
}

const FOOD_HUB_SEARCH_LABEL_TAGS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten free",
  "gluten-free",
  "dairy free",
  "dairy-free",
  "low carb",
  "low-carb",
  "high protein",
  "high-protein",
  "healthy",
  "light",
  "balanced",
  "indulgent",
  "italian",
  "mexican",
  "indian",
  "chinese",
  "japanese",
  "french",
  "british",
  "mediterranean",
  "american",
  "middle eastern",
  "korean",
  "thai",
  "greek",
  "spanish",
  "turkish",
  "caribbean",
  "moroccan",
  "lebanese",
  "vietnamese",
  "asian",
];

const FOOD_HUB_SEARCH_LABEL_PREFIXES = new Set([
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten free",
  "gluten-free",
  "dairy free",
  "dairy-free",
  "low carb",
  "low-carb",
  "high protein",
  "high-protein",
  "healthy",
  "light",
  "balanced",
  "indulgent",
]);

function buildFoodHubAliases(base: string[], extras: string[] = []) {
  const out = new Set<string>();
  for (const phrase of [...base, ...extras]) {
    if (phrase.trim()) out.add(phrase);
  }
  for (const label of base) {
    for (const template of FOOD_HUB_NAV_TEMPLATES) {
      const phrase = template.replace("{label}", label).trim();
      if (phrase) out.add(phrase);
    }
  }
  return Array.from(out);
}

const FOOD_HUB_CATEGORY_COMMANDS: FoodHubCategoryCommand[] = [
  {
    id: 1,
    label: "Quick wins",
    aliases: buildFoodHubAliases(
      [
        "quick wins",
        "quick wins",
        "fast wins",
        "quick dinners",
        "fast dinners",
        "weeknight wins",
      ],
      [
        "speedy wins",
        "rapid wins",
        "quick tea",
        "fast tea",
        "quick supper",
        "fast supper",
        "weeknight dinners",
        "weeknight meals",
        "fast meals",
        "quick meals",
        "quick weeknights",
        "fast weeknights",
      ]
    ),
  },
  {
    id: 2,
    label: "Reliable mains",
    aliases: buildFoodHubAliases(
      [
        "reliable mains",
        "reliable main dishes",
        "reliable dinners",
        "reliable meals",
        "main dishes",
        "go to mains",
        "go-to mains",
      ],
      [
        "reliable staples",
        "regular staples",
        "weekday staples",
        "midweek staples",
        "weekday mains",
        "midweek mains",
        "family mains",
        "everyday mains",
      ]
    ),
  },
  {
    id: 3,
    label: "Zero-brain dinners",
    aliases: buildFoodHubAliases(
      [
        "zero-brain dinners",
        "zero brain dinners",
        "no-brain dinners",
        "no brain dinners",
        "autopilot dinners",
        "low effort dinners",
      ],
      [
        "low brain dinners",
        "minimal effort dinners",
        "easy dinners",
        "easy meals",
        "tired night dinners",
        "tired night meals",
        "autopilot meals",
        "no-think dinners",
      ]
    ),
  },
  {
    id: 4,
    label: "One-pan, no plan",
    aliases: buildFoodHubAliases(
      [
        "one-pan no plan",
        "one pan no plan",
        "one-pan dinners",
        "one pan dinners",
        "tray bake",
        "traybake",
        "sheet pan",
        "one pan meals",
      ],
      [
        "sheet-pan dinners",
        "sheet pan dinners",
        "traybake dinners",
        "tray bake dinners",
        "one tray meals",
        "single pan meals",
        "one pot meals",
        "one-pot meals",
        "no plan dinners",
      ]
    ),
  },
  {
    id: 5,
    label: "Project meals",
    aliases: buildFoodHubAliases(
      [
        "project meals",
        "project meal",
        "slow meals",
        "weekend meals",
        "sunday meals",
        "long cook",
      ],
      [
        "slow cook",
        "slow cooked meals",
        "weekend cooking",
        "sunday cooking",
        "big cook",
        "long meals",
        "low and slow",
        "simmer meals",
        "comfort projects",
      ]
    ),
  },
  {
    id: 6,
    label: "Show-off but easy",
    aliases: buildFoodHubAliases(
      [
        "show-off but easy",
        "show off but easy",
        "show-off",
        "show off",
        "impress me",
        "fancy but easy",
        "guest ready",
      ],
      [
        "impress dinner",
        "impressing meals",
        "date night meals",
        "company dinners",
        "guest dinners",
        "fancy dinners",
        "fancy meals",
        "elevated meals",
        "special meals",
      ]
    ),
  },
  {
    id: 8,
    label: "Freezer first",
    aliases: buildFoodHubAliases(
      [
        "freezer first",
        "from the freezer",
        "freezer meals",
        "use the freezer",
        "freezer friendly",
      ],
      [
        "freezer stash",
        "freezer raid",
        "use up the freezer",
        "cook from the freezer",
        "freezer cooking",
        "freezer dinners",
        "freezer suppers",
        "freezer picks",
        "freezer rescue",
      ]
    ),
  },
  {
    id: 7,
    label: "Help me decide",
    aliases: buildFoodHubAliases(
      ["help me decide", "decide for me", "pick for me", "choose for me"],
      FOOD_HUB_DECIDE_TEMPLATES
    ),
    action: "help-decide",
  },
];

function matchFoodHubCategoryCommand(prompt: string) {
  const normalizedPrompt = normalizeTriggerText(prompt);
  if (!normalizedPrompt) return null;
  for (const command of FOOD_HUB_CATEGORY_COMMANDS) {
    for (const alias of command.aliases) {
      const normalizedAlias = normalizeTriggerText(alias);
      if (normalizedAlias && normalizedPrompt.includes(normalizedAlias)) {
        return command;
      }
    }
  }
  return null;
}

const FOOD_HUB_EXTRAS = [
  { id: 1, name: "Quick\nWins" },
  { id: 2, name: "Reliable\nMains" },
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
    eyebrow: "Quick wins",
    title: "Fast, hot, done.",
    subtitle:
      "Pick one, add a side, and get back to life. Built for weeknights, low effort, high reward.",
    menu: WINS_MENU,
    steps: WINS_BUILD_STEPS,
  },
  {
    id: 2,
    eyebrow: "Reliable mains",
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

const RECIPE_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "with",
  "of",
  "for",
  "to",
  "in",
  "on",
  "style",
  "recipe",
  "recipes",
  "dinner",
  "tea",
  "supper",
  "meal",
  "meals",
  "one",
]);

const SEARCH_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "the",
  "with",
  "of",
  "for",
  "to",
  "in",
  "on",
  "style",
  "recipe",
  "recipes",
  "dinner",
  "tea",
  "supper",
  "meal",
  "meals",
  "dish",
  "dishes",
  "something",
  "anything",
  "make",
  "cook",
  "cooking",
  "show",
  "find",
  "search",
  "list",
  "give",
  "want",
  "need",
  "lets",
  "let s",
  "please",
  "me",
  "us",
  "some",
  "kind",
  "type",
  "types",
  "like",
  "more",
  "only",
  "just",
  "maybe",
  "maybe",
  "maybe",
  "sort",
  "sorts",
  "sorta",
  "kinda",
  "looking",
  "looking for",
  "show us",
  "show me",
  "bring up",
  "pull up",
  "filter",
  "filter to",
  "filter by",
  "options",
  "ideas",
  "in the mood",
  "minute",
  "minutes",
  "mins",
  "min",
  "under",
  "below",
  "within",
  "over",
  "more",
  "less",
  "than",
  "at",
  "most",
  "least",
  "around",
  "about",
  "roughly",
  "approx",
  "approximately",
  "takes",
  "taking",
  "into",
  "up",
]);

const TIME_SEARCH_NUMBERS = [
  5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 90, 100,
  110, 120,
];

const TIME_SEARCH_TEMPLATES = [
  "what can i make in {n} minutes",
  "what can we make in {n} minutes",
  "what can i cook in {n} minutes",
  "what can we cook in {n} minutes",
  "what can i make in under {n} minutes",
  "what can we make in under {n} minutes",
  "what can i cook in under {n} minutes",
  "what can we cook in under {n} minutes",
  "what can i make in less than {n} minutes",
  "what can we make in less than {n} minutes",
  "what can i cook in less than {n} minutes",
  "what can we cook in less than {n} minutes",
  "what can i make within {n} minutes",
  "what can we make within {n} minutes",
  "what can i cook within {n} minutes",
  "what can we cook within {n} minutes",
  "show me recipes under {n} minutes",
  "show me meals under {n} minutes",
  "show me dishes under {n} minutes",
  "show me recipes in {n} minutes",
  "show me meals in {n} minutes",
  "show me dishes in {n} minutes",
  "find recipes under {n} minutes",
  "find meals under {n} minutes",
  "find dishes under {n} minutes",
  "find recipes in {n} minutes",
  "find meals in {n} minutes",
  "find dishes in {n} minutes",
  "list recipes under {n} minutes",
  "list meals under {n} minutes",
  "list dishes under {n} minutes",
  "give me recipes under {n} minutes",
  "give me meals under {n} minutes",
  "give me dishes under {n} minutes",
  "anything under {n} minutes",
  "something under {n} minutes",
  "anything in {n} minutes",
  "something in {n} minutes",
  "meals under {n} minutes",
  "dishes under {n} minutes",
  "recipes under {n} minutes",
  "meals in {n} minutes",
  "dishes in {n} minutes",
  "recipes in {n} minutes",
  "what can i make in {n} mins",
  "what can we make in {n} mins",
  "what can i cook in {n} mins",
  "what can we cook in {n} mins",
  "what can i make in under {n} mins",
  "what can we make in under {n} mins",
  "what can i cook in under {n} mins",
  "what can we cook in under {n} mins",
  "what can i make in less than {n} mins",
  "what can we make in less than {n} mins",
  "what can i cook in less than {n} mins",
  "what can we cook in less than {n} mins",
  "what can i make within {n} mins",
  "what can we make within {n} mins",
  "what can i cook within {n} mins",
  "what can we cook within {n} mins",
  "show me recipes under {n} mins",
  "show me meals under {n} mins",
  "show me dishes under {n} mins",
  "show me recipes in {n} mins",
  "show me meals in {n} mins",
  "show me dishes in {n} mins",
  "find recipes under {n} mins",
  "find meals under {n} mins",
  "find dishes under {n} mins",
  "find recipes in {n} mins",
  "find meals in {n} mins",
  "find dishes in {n} mins",
  "list recipes under {n} mins",
  "list meals under {n} mins",
  "list dishes under {n} mins",
  "give me recipes under {n} mins",
  "give me meals under {n} mins",
  "give me dishes under {n} mins",
  "anything under {n} mins",
  "something under {n} mins",
  "anything in {n} mins",
  "something in {n} mins",
  "meals under {n} mins",
  "dishes under {n} mins",
  "recipes under {n} mins",
  "meals in {n} mins",
  "dishes in {n} mins",
  "recipes in {n} mins",
];

function buildTimeSearchPhrases() {
  const out: string[] = [];
  for (const n of TIME_SEARCH_NUMBERS) {
    for (const template of TIME_SEARCH_TEMPLATES) {
      out.push(template.replace("{n}", String(n)));
    }
  }
  const named = [
    ["half an hour", "30"],
    ["half hour", "30"],
    ["half-hour", "30"],
    ["a half hour", "30"],
    ["around half an hour", "30"],
    ["about half an hour", "30"],
    ["within half an hour", "30"],
    ["under half an hour", "30"],
    ["less than half an hour", "30"],
    ["under half hour", "30"],
    ["less than half hour", "30"],
    ["in half an hour", "30"],
    ["in half hour", "30"],
    ["in a half hour", "30"],
    ["twenty minutes", "20"],
    ["fifteen minutes", "15"],
    ["ten minutes", "10"],
    ["five minutes", "5"],
  ] as const;
  for (const [phrase, num] of named) {
    for (const template of TIME_SEARCH_TEMPLATES) {
      out.push(template.replace("{n}", num).replace(/\b\d+\b minutes\b/g, phrase));
    }
    out.push(`recipes in ${phrase}`);
    out.push(`recipes under ${phrase}`);
    out.push(`meals in ${phrase}`);
    out.push(`meals under ${phrase}`);
    out.push(`dishes in ${phrase}`);
    out.push(`dishes under ${phrase}`);
    out.push(`anything in ${phrase}`);
    out.push(`anything under ${phrase}`);
    out.push(`something in ${phrase}`);
    out.push(`something under ${phrase}`);
  }
  return out;
}

const FOOD_HUB_SEARCH_TIME_PHRASES = buildTimeSearchPhrases();

const FOOD_HUB_SEARCH_PHRASES = [
  "show me",
  "find",
  "search",
  "look for",
  "look up",
  "list",
  "give me",
  "show us",
  "bring up",
  "pull up",
  "filter to",
  "filter by",
  "only show",
  "only",
  "just",
  "i want",
  "i need",
  "i feel like",
  "i am in the mood for",
  "i'm in the mood for",
  "in the mood for",
  "something with",
  "something using",
  "something made with",
  "something containing",
  "anything with",
  "anything using",
  "anything made with",
  "anything containing",
  "recipes with",
  "meals with",
  "dishes with",
  "recipes for",
  "meals for",
  "dishes for",
  "something like",
  "anything like",
  "ideas for",
  "options for",
  "show me some",
  "show me a",
  "show me any",
  "show me all",
  "what can i make with",
  "what can we make with",
  "what can i cook with",
  "what can we cook with",
  "what recipes use",
  "what can i make in",
  "what can we make in",
  "what can i cook in",
  "what can we cook in",
  "what can i make under",
  "what can we make under",
  "what can i cook under",
  "what can we cook under",
  "what can i make in under",
  "what can we make in under",
  "what can i cook in under",
  "what can we cook in under",
  ...FOOD_HUB_SEARCH_TIME_PHRASES,
];

const FOOD_HUB_SEARCH_TAG_WORDS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten free",
  "gluten-free",
  "dairy free",
  "dairy-free",
  "low carb",
  "low-carb",
  "high protein",
  "high-protein",
  "healthy",
  "light",
  "balanced",
  "indulgent",
  "italian",
  "mexican",
  "indian",
  "chinese",
  "japanese",
  "french",
  "british",
  "mediterranean",
  "american",
  "middle eastern",
  "korean",
  "thai",
  "greek",
  "spanish",
  "turkish",
  "caribbean",
  "moroccan",
  "lebanese",
  "vietnamese",
  "asian",
  "seafood",
  "fish",
  "chicken",
  "beef",
  "pork",
  "lamb",
  "tofu",
  "halloumi",
  "pasta",
  "rice",
  "noodles",
  "salad",
  "soup",
];

const RECIPE_INTENT_PREFIXES = [
  "open",
  "show",
  "show me",
  "show me the",
  "show the",
  "go to",
  "take me to",
  "bring me to",
  "navigate to",
  "switch to",
  "jump to",
  "load",
  "start",
  "launch",
  "pull up",
  "enter",
  "head to",
  "let s go to",
  "let s open",
  "let s head to",
  "let s do",
  "let s make",
  "let s cook",
  "make",
  "cook",
  "recipe for",
  "how to make",
  "how do i make",
  "i want to make",
  "i want to cook",
  "i want",
  "i need",
  "give me",
  "show me a",
  "show me some",
  "open the",
  "go to the",
];

function stripStopWords(text: string) {
  return text
    .split(" ")
    .filter((word) => word && !RECIPE_STOP_WORDS.has(word))
    .join(" ");
}

function normalizeSearchQuery(text: string) {
  return normalizeRecipeKey(text)
    .split(" ")
    .filter((word) => word && !SEARCH_STOP_WORDS.has(word))
    .join(" ")
    .trim();
}

function isFoodHubSearchIntent(prompt: string) {
  const normalized = normalizeTriggerText(prompt);
  if (!normalized) return false;
  const timeConstraint = parseSearchTimeConstraint(prompt);
  if (timeConstraint) {
    const categorySignal =
      /\b(staples|wins|mains|zero brain|zero-brain|one pan|one-pan|project meals|show off|freezer)\b/i.test(
        normalized
      );
    if (!categorySignal) return true;
  }
  if (
    /\b(show me|show us|find|search|look for|look up|list|give me|bring up|pull up)\b.*\b(recipes|meals|dishes)\b/i.test(
      prompt
    )
  ) {
    return true;
  }
  if (
    /\b(something|anything)\b.*\b(with|using|made with|containing)\b/i.test(prompt)
  ) {
    return true;
  }
  if (
    /\b(with|using|made with|containing)\b\s+[a-z0-9]{3,}/i.test(prompt) &&
    /\b(something|anything|recipes|meals|dishes|make|cook)\b/i.test(prompt)
  ) {
    return true;
  }
  if (/\b(make|cook|recipes|meals|dishes|something|anything)\b/i.test(prompt)) {
    for (const tag of FOOD_HUB_SEARCH_TAG_WORDS) {
      if (normalized.includes(normalizeTriggerText(tag))) return true;
    }
  }
  for (const phrase of FOOD_HUB_SEARCH_PHRASES) {
    if (normalized.includes(normalizeTriggerText(phrase))) return true;
  }
  return false;
}

function extractSearchQuery(prompt: string) {
  let query = normalizeTriggerText(prompt);
  for (const phrase of FOOD_HUB_SEARCH_PHRASES) {
    const norm = normalizeTriggerText(phrase);
    if (norm && query.startsWith(`${norm} `)) {
      query = query.slice(norm.length).trim();
      break;
    }
  }
  query = query
    .replace(/\b(recipes?|meals?|dishes?)\b/gi, " ")
    .replace(/\b(something|anything)\b/gi, " ")
    .replace(/\b(with|using|made with|containing|like)\b/gi, " ")
    .replace(
      /\b(in\s+)?(under|less than|below|within|at most|max|no more than)\s+\d{1,3}\s*(mins?|minutes?)\b/gi,
      " "
    )
    .replace(
      /\b(in\s+)?\d{1,3}\s*(mins?|minutes?)\s+or\s+less\b/gi,
      " "
    )
    .replace(/\b(in\s+)?\d{1,3}\s*(mins?|minutes?)\b/gi, " ")
    .replace(
      /\b(takes|taking|take)\s+\d{1,3}\s*(mins?|minutes?)\b/gi,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
  return query;
}

function parseSearchTimeConstraint(prompt: string) {
  const normalized = normalizeTriggerText(prompt);
  if (!normalized) return null;
  const betweenMatch = normalized.match(
    /\bbetween\s+(\d{1,3})\s*(?:mins?|minutes?)\s+and\s+(\d{1,3})\s*(?:mins?|minutes?)\b/
  );
  if (betweenMatch) {
    const min = Number(betweenMatch[1]);
    const max = Number(betweenMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max) && min <= max) {
      return { min, max };
    }
  }
  const underMatch = normalized.match(
    /\b(under|less than|below|within|at most|max|no more than)\s+(\d{1,3})\s*(?:mins?|minutes?)\b/
  );
  if (underMatch) {
    const max = Number(underMatch[2]);
    if (Number.isFinite(max)) return { min: 0, max };
  }
  const overMatch = normalized.match(
    /\b(over|more than|above|at least|min|no less than)\s+(\d{1,3})\s*(?:mins?|minutes?)\b/
  );
  if (overMatch) {
    const min = Number(overMatch[2]);
    if (Number.isFinite(min)) return { min, max: Infinity };
  }
  const inMatch = normalized.match(
    /\b(in|within|around|about|roughly|approx|approximately)\s+(\d{1,3})\s*(?:mins?|minutes?)\b/
  );
  if (inMatch) {
    const max = Number(inMatch[2]);
    if (Number.isFinite(max)) return { min: 0, max };
  }
  const withinMatch = normalized.match(
    /\b(\d{1,3})\s*(?:mins?|minutes?)\s+or\s+less\b/
  );
  if (withinMatch) {
    const max = Number(withinMatch[1]);
    if (Number.isFinite(max)) return { min: 0, max };
  }
  return null;
}

function formatSearchLabel(
  rawQuery: string,
  normalizedQuery: string,
  time: { min: number; max: number } | null
) {
  const normalized = normalizeTriggerText(rawQuery || normalizedQuery);
  let label = "";
  for (const tag of FOOD_HUB_SEARCH_LABEL_TAGS) {
    const normTag = normalizeTriggerText(tag);
    if (normalized.includes(normTag)) {
      label = `${tag} recipes`;
      break;
    }
  }
  if (!label) {
    const cleaned = (rawQuery || normalizedQuery).trim();
    if (cleaned) {
      label = `recipes with ${cleaned}`;
    }
  }
  if (time) {
    const min = time.min ?? 0;
    const max = time.max ?? Infinity;
    if (min <= 0 && Number.isFinite(max)) {
      label = `${label || "recipes"} under ${Math.round(max)} mins`;
    } else if (Number.isFinite(max) && Number.isFinite(min)) {
      label = `${label || "recipes"} ${Math.round(min)}–${Math.round(max)} mins`;
    } else if (Number.isFinite(min) && max === Infinity) {
      label = `${label || "recipes"} over ${Math.round(min)} mins`;
    }
  }
  return label || "recipes";
}

function formatSearchTime(recipe: FoodHubRecipe) {
  const total = getRecipeTotalTime(recipe);
  if (!total) return "";
  return `Total ${Math.round(total)} mins`;
}

function extractRecipeQuery(prompt: string) {
  let query = normalizeTriggerText(prompt);
  for (const prefix of RECIPE_INTENT_PREFIXES) {
    const prefixNorm = normalizeTriggerText(prefix);
    if (query.startsWith(`${prefixNorm} `)) {
      query = query.slice(prefixNorm.length).trim();
      break;
    }
  }
  if (query.startsWith("the ")) query = query.slice(4);
  return query.trim();
}

type RecipeIndexEntry = {
  recipe: FoodHubRecipe;
  full: string;
  simple: string;
  tokens: Set<string>;
};

function buildRecipeIndex(recipes: FoodHubRecipe[]) {
  return recipes.map((recipe) => {
    const full = normalizeRecipeKey(recipe.name);
    const simple = stripStopWords(full);
    const tokens = new Set(simple.split(" ").filter(Boolean));
    return { recipe, full, simple, tokens };
  });
}

type RecipeSearchEntry = {
  recipe: FoodHubRecipe;
  tokens: Set<string>;
  blob: string;
  tagTokens: Set<string>;
  tagBlob: string;
};

function buildRecipeSearchIndex(recipes: FoodHubRecipe[]) {
  return recipes.map((recipe) => {
    const fields = [
      recipe.name,
      recipe.tagline ?? "",
      ...(recipe.ingredients ?? []),
      ...(recipe.tags ?? []),
      recipe.cuisine_region ?? "",
      recipe.health_vibe ?? "",
      recipe.weight_class ?? "",
      recipe.activity_level ?? "",
      recipe.time_band ?? "",
    ];
    const tagFields = [
      ...(recipe.tags ?? []),
      recipe.cuisine_region ?? "",
      recipe.health_vibe ?? "",
      recipe.weight_class ?? "",
      recipe.activity_level ?? "",
      recipe.time_band ?? "",
    ];
    const blob = normalizeRecipeKey(fields.join(" "));
    const tokens = new Set(
      blob
        .split(" ")
        .map((word) => word.trim())
        .filter(Boolean)
    );
    const tagBlob = normalizeRecipeKey(tagFields.join(" "));
    const tagTokens = new Set(
      tagBlob
        .split(" ")
        .map((word) => word.trim())
        .filter(Boolean)
    );
    return { recipe, tokens, blob, tagTokens, tagBlob };
  });
}

function getRecipeTotalTime(recipe: FoodHubRecipe) {
  if (recipe.time_total_min != null && recipe.time_total_min > 0) {
    return recipe.time_total_min;
  }
  const prep = recipe.time_prep_min ?? 0;
  const cook = recipe.time_cook_min ?? 0;
  const total = prep + cook;
  return total > 0 ? total : null;
}

function scoreRecipeMatch(query: string, entry: RecipeIndexEntry) {
  const normalized = normalizeRecipeKey(query);
  const simpleQuery = stripStopWords(normalized);
  if (!simpleQuery) return 0;
  if (normalized === entry.full || simpleQuery === entry.simple) return 1;
  if (
    entry.full.includes(normalized) ||
    normalized.includes(entry.full) ||
    entry.simple.includes(simpleQuery) ||
    simpleQuery.includes(entry.simple)
  ) {
    return 0.85;
  }
  const queryTokens = new Set(simpleQuery.split(" ").filter(Boolean));
  if (!queryTokens.size || !entry.tokens.size) return 0;
  let overlap = 0;
  queryTokens.forEach((token) => {
    if (entry.tokens.has(token)) overlap += 1;
  });
  const denom = Math.max(queryTokens.size, entry.tokens.size);
  return (overlap / denom) * 0.7;
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
  const recipeIndexRef = useRef<RecipeIndexEntry[]>([]);
  const recipeSearchIndexRef = useRef<RecipeSearchEntry[]>([]);
  const foodHubSearchCloseTimerRef = useRef<number | null>(null);
  const [foodHubSearchOpen, setFoodHubSearchOpen] = useState(false);
  const [foodHubSearchVisible, setFoodHubSearchVisible] = useState(false);
  const [foodHubSearchResults, setFoodHubSearchResults] = useState<
    FoodHubRecipe[]
  >([]);
  const [foodHubSearchQuery, setFoodHubSearchQuery] = useState("");
  const [foodHubSearchLabel, setFoodHubSearchLabel] = useState("");
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
  const [recipePickOptions, setRecipePickOptions] = useState<FoodHubRecipe[]>(
    []
  );
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

      if (recipePickOptions.length) {
        if (/\b(cancel|nevermind|never mind|stop)\b/i.test(prompt)) {
          setRecipePickOptions([]);
          const ack = "Okay, cancelled.";
          setAiOutput(ack);
          await playTts(ack);
          return;
        }
        if (
          recipePickOptions.length === 1 &&
          /\b(yes|yep|yeah|ok|okay|sure)\b/i.test(prompt)
        ) {
          const option = recipePickOptions[0];
          if (activePage !== "food-hub") {
            switchPage("food-hub");
          }
          if (foodHubMode !== "wins" || activeFoodHubCategory !== option.category_id) {
            enterWins(option.category_id);
          }
          openRecipe(option);
          const ack = `Opening ${option.name}.`;
          setAiOutput(ack);
          await playTts(ack);
          setRecipePickOptions([]);
          return;
        }
        const promptKey = stripStopWords(normalizeRecipeKey(prompt));
        if (promptKey) {
          const pickIndex = recipePickOptions
            .map((option, index) => {
              const optionKey = stripStopWords(normalizeRecipeKey(option.name));
              if (optionKey === promptKey) return { index, score: 1 };
              if (optionKey.includes(promptKey) || promptKey.includes(optionKey)) {
                return { index, score: 0.9 };
              }
              const optionTokens = new Set(optionKey.split(" ").filter(Boolean));
              const promptTokens = new Set(promptKey.split(" ").filter(Boolean));
              let overlap = 0;
              promptTokens.forEach((token) => {
                if (optionTokens.has(token)) overlap += 1;
              });
              const denom = Math.max(promptTokens.size, 1);
              return { index, score: overlap / denom };
            })
            .sort((a, b) => b.score - a.score);
          const best = pickIndex[0];
          const second = pickIndex[1];
          if (
            best &&
            best.score >= 0.55 &&
            (!second || best.score - second.score >= 0.15)
          ) {
            const option = recipePickOptions[best.index];
            if (activePage !== "food-hub") {
              switchPage("food-hub");
            }
            if (foodHubMode !== "wins" || activeFoodHubCategory !== option.category_id) {
              enterWins(option.category_id);
            }
            openRecipe(option);
            const ack = `Opening ${option.name}.`;
            setAiOutput(ack);
            await playTts(ack);
            setRecipePickOptions([]);
            return;
          }
        }
        const selected = Number(prompt);
        const option = recipePickOptions[selected - 1];
        if (option) {
          if (activePage !== "food-hub") {
            switchPage("food-hub");
          }
          if (foodHubMode !== "wins" || activeFoodHubCategory !== option.category_id) {
            enterWins(option.category_id);
          }
          openRecipe(option);
          const ack = `Opening ${option.name}.`;
          setAiOutput(ack);
          await playTts(ack);
          setRecipePickOptions([]);
          return;
        }
        const optionsText = recipePickOptions
          .map((item, i) => `${i + 1}) ${item.name}`)
          .join("\n");
        setAiOutput(`Please reply with a valid option number.\n${optionsText}`);
        return;
      }

      const categoryCommand = matchFoodHubCategoryCommand(prompt);
      if (categoryCommand) {
        const alreadyInFoodHub = activePage === "food-hub";
        if (!alreadyInFoodHub) {
          switchPage("food-hub");
        }

        if (categoryCommand.action === "help-decide") {
          const alreadyOpen = helpDecideOpen && alreadyInFoodHub;
          openHelpDecide();
          const ack = alreadyOpen
            ? "Help me decide is already open."
            : "Opening help me decide.";
          setAiOutput(ack);
          await playTts(ack);
          return;
        }

        const metaLabel =
          FOOD_HUB_CATEGORY_META.find((item) => item.id === categoryCommand.id)
            ?.eyebrow ?? categoryCommand.label;
        const alreadyInCategory =
          alreadyInFoodHub &&
          foodHubMode === "wins" &&
          activeFoodHubCategory === categoryCommand.id;
        if (!alreadyInCategory) {
          enterWins(categoryCommand.id);
        }
        const ack = alreadyInCategory
          ? `You're already in ${metaLabel}.`
          : `Opening ${metaLabel}.`;
        setAiOutput(ack);
        await playTts(ack);
        return;
      }

      if (isFoodHubSearchIntent(prompt)) {
        const rawQuery = extractSearchQuery(prompt);
        const normalizedQuery = normalizeSearchQuery(rawQuery);
        const timeConstraint = parseSearchTimeConstraint(prompt);
        if (normalizedQuery.length >= 2 || timeConstraint) {
          let recipes = helpDecideAllRecipes;
          if (!recipes.length) {
            try {
              const data = await getFoodHubAll();
              recipes = (data.recipes ?? []).map((recipe) => {
                const key = normalizeRecipeKey(recipe.name);
                const local = foodHubImageByNameRef.current[key];
                return local ? { ...recipe, image_local: local } : recipe;
              });
              setHelpDecideAllRecipes(recipes);
            } catch (e: any) {
              setErr(e?.message ?? "Food hub lookup failed");
            }
          }
          if (recipes.length) {
            if (!recipeSearchIndexRef.current.length) {
              recipeSearchIndexRef.current = buildRecipeSearchIndex(recipes);
            }
            const queryTokens = new Set(
              normalizedQuery.split(" ").filter(Boolean)
            );
            const hasQueryTokens = queryTokens.size > 0;
            const tagSearch = (() => {
              if (!normalizedQuery) return false;
              for (const tag of FOOD_HUB_SEARCH_LABEL_TAGS) {
                const normTag = normalizeTriggerText(tag);
                if (normTag && normalizedQuery.includes(normTag)) {
                  return true;
                }
              }
              return false;
            })();
            if (
              tagSearch &&
              recipeSearchIndexRef.current.some((entry) => !entry.tagTokens)
            ) {
              recipeSearchIndexRef.current = buildRecipeSearchIndex(recipes);
            }
            const scored = recipeSearchIndexRef.current
              .map((entry) => {
                let overlap = 0;
                let substringHit = false;
                const tokensToUse = tagSearch ? entry.tagTokens : entry.tokens;
                const blobToUse = tagSearch ? entry.tagBlob : entry.blob;
                if (hasQueryTokens) {
                  queryTokens.forEach((token) => {
                    if (tokensToUse.has(token)) overlap += 1;
                    if (!substringHit && blobToUse.includes(token)) {
                      substringHit = true;
                    }
                  });
                }
                if (hasQueryTokens && !overlap && !substringHit) return null;
                const tokenScore = hasQueryTokens
                  ? overlap / Math.max(queryTokens.size, 1)
                  : 0;
                const score = Math.max(tokenScore, substringHit ? 0.95 : 0, hasQueryTokens ? 0 : 0.5);
                return { entry, score };
              })
              .filter((item): item is { entry: RecipeSearchEntry; score: number } =>
                Boolean(item)
              )
              .sort((a, b) => b.score - a.score);
            const minScore = hasQueryTokens ? (queryTokens.size > 1 ? 0.4 : 0.2) : 0;
            const results = scored
              .filter((item) => item.score >= minScore)
              .map((item) => item.entry.recipe)
              .filter((recipe) => {
                if (!timeConstraint) return true;
                const total = getRecipeTotalTime(recipe);
                if (total == null) return false;
                const min = timeConstraint.min ?? 0;
                const max = timeConstraint.max ?? Infinity;
                return total >= min && total <= max;
              });
            if (results.length) {
              if (activePage !== "food-hub") {
                switchPage("food-hub");
              }
              if (helpDecideOpen) {
                closeHelpDecide();
              }
              setFoodHubSearchResults(results);
              setFoodHubSearchQuery(rawQuery || normalizedQuery);
              setFoodHubSearchLabel(
                formatSearchLabel(rawQuery, normalizedQuery, timeConstraint)
              );
              setFoodHubSearchOpen(true);
              const ack = pickSearchAck(
                rawQuery,
                normalizedQuery,
                timeConstraint
              );
              setAiOutput(ack);
              await playTts(ack);
              return;
            }
          }
          const ack = `I couldn't find any recipes for ${rawQuery || "that"}.`;
          setAiOutput(ack);
          await playTts(ack);
          return;
        }
      }

      const inFoodHubCategory =
        activePage === "food-hub" && foodHubMode === "wins";
      const recipeIntentTrigger =
        inFoodHubCategory ||
        (activePage !== "food-hub" &&
          /\b(recipe|recipes|cook|cooking|make|making|dinner|tea|supper|meal|meals)\b/i.test(
            prompt
          ));
      if (recipeIntentTrigger) {
        const query = extractRecipeQuery(prompt);
        if (query.length >= 3) {
          let recipes = helpDecideAllRecipes;
          if (!recipes.length) {
            try {
              const data = await getFoodHubAll();
              recipes = (data.recipes ?? []).map((recipe) => {
                const key = normalizeRecipeKey(recipe.name);
                const local = foodHubImageByNameRef.current[key];
                return local ? { ...recipe, image_local: local } : recipe;
              });
              setHelpDecideAllRecipes(recipes);
            } catch (e: any) {
              setErr(e?.message ?? "Food hub lookup failed");
            }
          }
          if (recipes.length) {
            if (!recipeIndexRef.current.length) {
              recipeIndexRef.current = buildRecipeIndex(recipes);
            }
            const scored = recipeIndexRef.current
              .map((entry) => ({
                entry,
                score: scoreRecipeMatch(query, entry),
              }))
              .filter((item) => item.score > 0)
              .sort((a, b) => b.score - a.score);
            if (scored.length) {
              const best = scored[0];
              const second = scored[1];
              const confident =
                best.score >= 0.6 &&
                (!second || best.score - second.score >= 0.12 || best.score >= 0.75);
              if (confident) {
                const recipe = best.entry.recipe;
                if (activePage !== "food-hub") {
                  switchPage("food-hub");
                }
                if (foodHubMode !== "wins" || activeFoodHubCategory !== recipe.category_id) {
                  enterWins(recipe.category_id);
                }
                openRecipe(recipe);
                const ack = `Opening ${recipe.name}.`;
                setAiOutput(ack);
                await playTts(ack);
                return;
              }
              const topOptions = scored.slice(0, 3).map((item) => item.entry.recipe);
              if (topOptions.length && inFoodHubCategory) {
                setRecipePickOptions(topOptions);
                const optionsText = topOptions
                  .map((item, i) => `${i + 1}) ${item.name}`)
                  .join("\n");
                const promptText = `Which recipe did you mean?\n${optionsText}`;
                setAiOutput(promptText);
                await playTts("Which recipe did you mean?");
                return;
              }
            }
          }
        }
      }

      if (isFoodHubTrigger(prompt)) {
        if (activePage === "food-hub" && foodHubMode === "wins") {
          exitWins();
        } else {
          switchPage("food-hub");
        }
        const alreadyInHub = activePage === "food-hub" && foodHubMode !== "wins";
        const foodHubAcks = [
          "Let's cook.",
          "Get your chef's hat on.",
          "Food Hub is up.",
          "Heading to Food Hub.",
          "Opening Food Hub now.",
          "Bringing up Food Hub.",
          "All right, let's make dinner.",
          "Dinner mode: on.",
          "Let's get cooking.",
          "Let's get dinner going.",
          "Time to cook.",
          "Time to make dinner.",
          "Let's make something to eat.",
          "Let's sort dinner.",
          "Let's do dinner.",
          "Let's do tea.",
          "Kitchen time.",
          "Food Hub, coming up.",
          "Launching Food Hub.",
          "Pulling up Food Hub.",
          "Aprons on.",
          "Let's cook something good.",
          "Let's get dinner started.",
          "Let's get tea started.",
          "Let's cook tonight.",
          "Let's make dinner tonight.",
          "Let's make something tasty.",
          "Let's get a meal going.",
          "Let's get food on.",
          "Let's put dinner on.",
          "Let's put tea on.",
          "Let's get the pans out.",
          "Let's fire up the kitchen.",
          "Let's get a recipe going.",
          "Let's pick something to cook.",
          "Let's make a plan for dinner.",
          "Let's cook a meal.",
          "Let's make a meal.",
          "Let's whip something up.",
          "Let's cook up dinner.",
          "Let's make tea.",
          "Let's make dinner.",
          "Let's prep dinner.",
          "Let's prep tea.",
          "Let's get dinner rolling.",
          "Let's get tea rolling.",
          "Let's get cooking now.",
          "Let's get dinner on the go.",
          "Let's make something quick.",
          "Let's make something easy.",
          "Let's get into Food Hub.",
          "Let's jump into Food Hub.",
          "Let's head to Food Hub.",
          "Let's open Food Hub.",
          "Let's launch Food Hub.",
          "Let's bring up Food Hub.",
          "Let's pull up Food Hub.",
          "Let's load Food Hub.",
          "Let's start Food Hub.",
          "Let's head to the kitchen.",
          "Let's get the kitchen going.",
          "Let's get the chef vibes on.",
          "Let's get the stove going.",
          "Let's get the oven going.",
          "Let's get dinner sorted.",
          "Let's get tea sorted.",
          "Let's get supper sorted.",
          "Let's get food sorted.",
          "Let's sort dinner.",
          "Let's sort tea.",
          "Let's sort supper.",
          "Let's start cooking.",
          "Let's start dinner.",
          "Let's start tea.",
          "Let's start food.",
          "Let's cook dinner.",
          "Let's cook tea.",
          "Let's cook food.",
          "Let's make food.",
          "Let's make something to eat.",
          "Let's make something for dinner.",
          "Let's make something for tea.",
          "Let's make something for tonight.",
          "Let's cook something for tonight.",
          "Let's cook something for dinner.",
          "Let's cook something for tea.",
          "Let's get a dinner pick.",
          "Let's get a tea pick.",
          "Let's choose dinner.",
          "Let's choose tea.",
          "Let's choose something to cook.",
          "Let's pick dinner.",
          "Let's pick tea.",
          "Let's pick a meal.",
          "Let's pick a recipe.",
          "Let's pick something tasty.",
          "Let's go cook.",
          "Let's go make dinner.",
          "Let's go make tea.",
          "Let's go to Food Hub.",
          "Let's move to Food Hub.",
          "Let's go to the food hub.",
          "Let's move to the food hub.",
          "Let's head to the food hub.",
          "Let's get to the food hub.",
          "Let's go get dinner started.",
          "Let's go get tea started.",
          "Let's get a meal on.",
          "Let's get dinner on.",
          "Let's get tea on.",
          "Let's get supper on.",
          "Let's go make something to eat.",
          "Let's make a quick dinner.",
          "Let's make a quick tea.",
          "Let's make a quick meal.",
          "Let's make an easy dinner.",
          "Let's make an easy meal.",
        ];
        const ack = alreadyInHub
          ? "You're already in Food Hub."
          : foodHubAcks[Math.floor(Math.random() * foodHubAcks.length)];
        setAiOutput(ack);
        await playTts(ack);
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
    if (activePage !== "food-hub" && foodHubSearchOpen) {
      closeFoodHubSearch();
    }
  }, [activePage, helpDecideOpen, foodHubSearchOpen]);

  useEffect(() => {
    if (!foodHubSearchOpen) return;
    if (foodHubSearchCloseTimerRef.current != null) {
      window.clearTimeout(foodHubSearchCloseTimerRef.current);
      foodHubSearchCloseTimerRef.current = null;
    }
    setFoodHubSearchVisible(false);
    const raf = requestAnimationFrame(() => {
      setFoodHubSearchVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [foodHubSearchOpen]);

  useEffect(() => {
    return () => {
      if (recipeCloseTimerRef.current != null) {
        window.clearTimeout(recipeCloseTimerRef.current);
        recipeCloseTimerRef.current = null;
      }
      if (foodHubSearchCloseTimerRef.current != null) {
        window.clearTimeout(foodHubSearchCloseTimerRef.current);
        foodHubSearchCloseTimerRef.current = null;
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
    recipeIndexRef.current = buildRecipeIndex(helpDecideAllRecipes);
    recipeSearchIndexRef.current = buildRecipeSearchIndex(helpDecideAllRecipes);
  }, [helpDecideAllRecipes]);

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

  function openHelpDecide() {
    setHelpDecideOpen(true);
    setHelpDecidePhase("prefs");
    setHelpDecidePair(null);
    setHelpDecideCurrentRound([]);
    setHelpDecideNextRound([]);
    setHelpDecidePairIndex(0);
    setHelpDecideWinner(null);
  }

  function closeFoodHubSearch() {
    setFoodHubSearchVisible(false);
    if (foodHubSearchCloseTimerRef.current != null) {
      window.clearTimeout(foodHubSearchCloseTimerRef.current);
    }
    foodHubSearchCloseTimerRef.current = window.setTimeout(() => {
      setFoodHubSearchOpen(false);
      setFoodHubSearchResults([]);
      setFoodHubSearchQuery("");
      setFoodHubSearchLabel("");
      foodHubSearchCloseTimerRef.current = null;
    }, 320);
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

  const renderTempTextInput = (className: string) => (
    <section className={`glass-tile ${className}`}>
      <div className="aiBlock">
        <div className="aiLabel">Ask Sam (temp)</div>
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

              {renderTempTextInput("winsTempInput")}
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
                          openHelpDecide();
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
              {renderTempTextInput("foodHubTempInput")}
          </div>
        ) : null}

        {foodHubSearchOpen ? (
          <div
            className={`decideOverlay${
              foodHubSearchVisible ? " decideOverlay--open" : ""
            }`}
          >
            <div
              className="decideOverlayBackdrop"
              onClick={closeFoodHubSearch}
            />
            <div className="decideCard" role="dialog" aria-modal="true">
              <div className="decideTop">
                <div>
                  <div className="decideTitle">Search results</div>
                  <div className="decideSubtitle">
                    {foodHubSearchLabel
                      ? `${foodHubSearchLabel} · ${foodHubSearchResults.length} recipe${
                          foodHubSearchResults.length === 1 ? "" : "s"
                        }`
                      : `${foodHubSearchResults.length} recipe${
                          foodHubSearchResults.length === 1 ? "" : "s"
                        }`}
                  </div>
                </div>
                <div className="decideActions">
                  <button
                    type="button"
                    className="glass-pill glass-pill--small"
                    onClick={closeFoodHubSearch}
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="foodHubSearchControls">
                {renderTempTextInput("foodHubSearchTempInput")}
              </div>
              <div className="foodHubSearchList" role="list">
                {foodHubSearchResults.map((recipe) => (
                  <button
                    key={recipe.id}
                    type="button"
                    className="foodHubSearchItem glass-tile"
                    role="listitem"
                    onClick={() => {
                      if (foodHubMode !== "wins" || activeFoodHubCategory !== recipe.category_id) {
                        enterWins(recipe.category_id);
                      }
                      openRecipe(recipe);
                      closeFoodHubSearch();
                    }}
                  >
                    <div className="foodHubSearchThumb" aria-hidden="true">
                      {recipe.image_local || recipe.image_url ? (
                        <img
                          src={recipe.image_local ?? recipe.image_url ?? ""}
                          alt=""
                          loading="lazy"
                        />
                      ) : (
                        <span>Image</span>
                      )}
                    </div>
                    <div className="foodHubSearchBody">
                      <div className="foodHubSearchTop">
                        <div className="foodHubSearchName">{recipe.name}</div>
                      {formatSearchTime(recipe) ? (
                        <div className="foodHubSearchTime">
                          {formatSearchTime(recipe)}
                        </div>
                      ) : null}
                      </div>
                  </div>
                </button>
              ))}
            </div>
            </div>
          </div>
        ) : null}

        {helpDecideOpen ? (
          <div className="decideOverlay decideOverlay--open">
            <div className="decideOverlayBackdrop" onClick={closeHelpDecide} />
            <div
              className={`decideCard glass-tile${
                helpDecidePhase === "bracket"
                  ? " decideCard--arena"
                  : helpDecidePhase === "winner"
                    ? " decideCard--winner"
                    : ""
              }`}
              role="dialog"
              aria-modal="true"
            >
              {helpDecidePhase !== "winner" ? (
                <div
                  className={`decideTop${
                    helpDecidePhase === "bracket" ? " decideTop--navOnly" : ""
                  }`}
                >
                  {helpDecidePhase === "bracket" ? (
                    <div className="decideRoundTop">
                      Round {helpDecideRound} ·{" "}
                      <span className="decideRoundTopCount">
                        {helpDecideCurrentRound.length} recipes
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="decideTitle">Help me decide</div>
                      <div className="decideSubtitle">
                        Head-to-head picks with soft matching.
                      </div>
                    </div>
                  )}
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
              ) : null}

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
                    <ElectricBorder
                      color="#80c1ff"
                      speed={3}
                      chaos={0.09}
                      borderRadius={16}
                      className="decideFightBorder"
                    >
                      <button
                        type="button"
                        className="glass-pill decideFight"
                        onClick={startHelpDecideBracket}
                        disabled={!helpDecideAllRecipes.length}
                      >
                        FIGHT
                      </button>
                    </ElectricBorder>
                    <button
                      type="button"
                      className="glass-pill glass-pill--small decideReset"
                      onClick={resetHelpDecidePrefs}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : helpDecidePhase === "bracket" ? (
                <div className="decideBattle">
                  {helpDecidePair ? (
                    <div className="decidePair decidePair--arena">
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
                                {recipe.tags.slice(0, 3).map((tag) => {
                                  const tagKey = tag
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]+/g, "-")
                                    .replace(/(^-|-$)/g, "");
                                  return (
                                    <span
                                      key={tag}
                                      className="winsTag decideTag"
                                      data-tag={tagKey}
                                    >
                                      {tag}
                                    </span>
                                  );
                                })}
                              </div>
                              <button
                                type="button"
                                className="glass-pill decideChooseButton"
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
                      <div className="decideWinnerImage">
                        {helpDecideWinner.image_local ? (
                          <img
                            src={helpDecideWinner.image_local}
                            alt={helpDecideWinner.name}
                          />
                        ) : (
                          <div className="decideOptionPlaceholder">Image</div>
                        )}
                      </div>
                      <div className="decideWinnerBody">
                        <div className="decideWinnerTitle">
                          {helpDecideWinner.name}
                        </div>
                        {helpDecideWinner.tagline ? (
                          <div className="decideWinnerTagline">
                            {helpDecideWinner.tagline}
                          </div>
                        ) : null}
                        <div className="decideWinnerActions">
                          <button
                            type="button"
                            className="glass-pill glass-pill--small"
                            onClick={() => setHelpDecidePhase("prefs")}
                          >
                            Back to filters
                          </button>
                          <button
                            type="button"
                            className="glass-pill glass-pill--small"
                            onClick={() => switchPage("dashboard")}
                          >
                            Back to dashboard
                          </button>
                          <button
                            type="button"
                            className="glass-pill glass-pill--small"
                            onClick={closeHelpDecide}
                          >
                            Back to food hub
                          </button>
                          <button
                            type="button"
                            className="glass-pill"
                            onClick={() => openRecipe(helpDecideWinner, "decide")}
                          >
                            Open recipe
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="decideEmpty">No winner yet.</div>
                  )}
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
