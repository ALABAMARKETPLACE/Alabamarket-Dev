// Deterministic "random" helpers — same product ID always produces the same values

// Names grouped by ethnicity so first name and surname always match
const NIGERIAN_NAME_GROUPS = [
  // Igbo
  {
    first: ["Emeka", "Chidi", "Ngozi", "Chioma", "Adaeze", "Uche", "Ikenna", "Obinna",
            "Chinwe", "Uchenna", "Adaora", "Ifunanya", "Amaka", "Ifeoma", "Nkechi",
            "Ebuka", "Obiora", "Chukwudi", "Chinyere", "Ogechi", "Kelechi", "Tochukwu",
            "Onyeka", "Chidinma", "Chizaram", "Nwanneka", "Ugochi", "Dubem", "Somtochukwu"],
    last:  ["Okonkwo", "Nwosu", "Eze", "Okafor", "Chukwu", "Obi", "Okoro", "Umeh",
            "Nnaji", "Igwe", "Anyanwu", "Obiechina", "Okoye", "Onwudiwe", "Ezeh",
            "Nwachukwu", "Ezechi", "Obiora", "Onyekachi", "Agbo"],
  },
  // Yoruba
  {
    first: ["Tunde", "Seun", "Femi", "Kola", "Biodun", "Bayo", "Damilola", "Wale",
            "Sola", "Dele", "Kunle", "Jide", "Lanre", "Deji", "Funke", "Bisi",
            "Yetunde", "Sade", "Titi", "Folake", "Tolani", "Ronke", "Bukky", "Yemi",
            "Ayo", "Tobi", "Kemi", "Taiwo", "Kehinde", "Moyosore", "Gbemi", "Lara",
            "Rotimi", "Niyi", "Remi", "Adunola", "Feyi", "Bolaji"],
    last:  ["Adeyemi", "Babatunde", "Adesanya", "Adeleke", "Balogun", "Fashola",
            "Abiodun", "Lawal", "Ogunleye", "Adewale", "Adebayo", "Oladele",
            "Afolabi", "Ogundimu", "Akintola", "Adekunle", "Salami", "Olawale",
            "Adeola", "Ogundipe", "Olatunji", "Adegoke"],
  },
  // Hausa / Fulani
  {
    first: ["Musa", "Ibrahim", "Abubakar", "Suleiman", "Usman", "Aliyu", "Aminu",
            "Kabiru", "Nasiru", "Sadiya", "Hafsat", "Zuwaira", "Fatima", "Ramatu",
            "Bilkisu", "Hadiza", "Aisha", "Zainab", "Hauwa", "Maryam", "Yakubu",
            "Haruna", "Bashir", "Hamisu", "Rabi", "Asiya", "Jamila"],
    last:  ["Sani", "Danbatta", "Bello", "Yusuf", "Garba", "Tanko", "Umar",
            "Danladi", "Maigari", "Abdullahi", "Shehu", "Dabo", "Lawan", "Goni",
            "Musa", "Wada", "Tukur", "Magaji"],
  },
];

// Messages split by sentiment so they match the star rating given
const POSITIVE_MESSAGES = [
  "Item arrived faster than expected. Very happy with my purchase, exactly as described.",
  "Quality is top notch! Will definitely order again from this seller.",
  "Packaging was neat and delivery was on time. The product is exactly what I needed.",
  "Very good product, no complaints at all. The quality exceeded my expectations.",
  "Fast delivery! Got it within 3 days. Product is original and well packaged.",
  "Excellent quality and great value. Will definitely be ordering more soon.",
  "Good value for money. The seller also responded quickly to all my questions.",
  "Product is exactly as shown in the picture. No surprises at all, very satisfied.",
  "This is my second time buying this item. Always reliable quality from this store.",
  "Smooth transaction from start to finish. The product arrived in perfect condition.",
  "This thing too good o! Delivery was swift and the product is correct.",
  "Omo this product is the real deal. Packaging was secure and item arrived intact.",
  "Ordered this for my office and colleagues have been asking where I got it from.",
  "Seller was very responsive. Item came on the promised date. 100% recommended.",
  "Great product for the price. I have been using it for two weeks, no issues at all.",
  "Very impressed with the build quality. You can tell it is made to last.",
  "Ordered two units, both arrived in perfect condition. Seller dey try!",
  "Top quality product. Delivery was prompt and the item was well secured in the box.",
  "I have bought from this seller before and the standard has not dropped. Well done.",
  "Exactly what I needed. No stress with the order, everything went smoothly.",
  "Quality pass my expectation. I recommend this for everyone looking for value.",
  "Someone recommended this to me and I am so glad I bought it.",
  "I was skeptical at first but this product is 100% genuine. Very happy!",
  "Came across this while browsing and decided to try it. Absolutely zero regrets!",
  "5 stars.",
  "Very fast delivery. Product is good.",
  "Original product. Happy with my purchase.",
  "Good one.",
  "Packaging dey correct. Item dey work well.",
  "Seller reliable. Product as described.",
];

const NEUTRAL_MESSAGES = [
  "Product is okay, nothing extraordinary but it does what it is supposed to do.",
  "Delivery was a bit delayed but the product itself is decent.",
  "It is fine for the price. Do not expect too much and you will not be disappointed.",
  "Average quality. Serves the purpose but could be better.",
  "Not bad, not great. It works.",
  "The product is alright. Took a while to arrive but it got here.",
  "Okay product. I have seen better but also worse for this price range.",
  "Three stars because the packaging was a bit rough but the item was intact.",
  "Expected a bit more from the description but it is acceptable.",
  "It works as expected. Nothing wow about it but does the job.",
  "Delivery was okay. Product quality is average.",
  "I have mixed feelings. It works but the build feels a bit cheap.",
];

const CRITICAL_MESSAGES = [
  "Not what I expected at all. The quality is very poor for the price.",
  "Delivery took too long and the item looks different from the picture.",
  "I am not satisfied. The product stopped working after a few days.",
  "Very disappointing. I would not recommend this to anyone.",
  "Poor quality. I should have read more reviews before buying.",
  "The seller is not responsive. Product is substandard.",
  "Came damaged. Had to manage it. Not happy at all.",
  "Does not match the description. Waste of money.",
  "Quality is terrible. Expected much better.",
  "One star because zero is not an option.",
];

function hashStr(str: string): number {
  return str.split("").reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0) || 0;
}

/** Consistent rating (3.5–5.0) and review count for a product */
export function getRatingInfo(productId: string): { rating: number; reviews: number } {
  const h = hashStr(productId);
  const ratings = [3.5, 3.7, 3.8, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0];
  const reviewCounts = [12, 25, 38, 47, 63, 81, 102, 134, 156, 189, 214, 267, 312, 445, 521, 678];
  return {
    rating: ratings[h % ratings.length],
    reviews: reviewCounts[(h >> 3) % reviewCounts.length],
  };
}

/**
 * Pick a whole-number star rating (1–5) for a single review, weighted so the
 * distribution matches the product's average rating.
 */
function pickStarRating(productId: string, idx: number, avgRating: number): number {
  const seed = hashStr(`${productId}_star_${idx}`) % 100;
  // Thresholds: [5-star cutoff, 4-star cutoff, 3-star cutoff, 2-star cutoff]
  let t: [number, number, number, number];
  if (avgRating >= 4.7)      t = [70, 90, 97, 99];
  else if (avgRating >= 4.4) t = [58, 83, 93, 97];
  else if (avgRating >= 4.0) t = [44, 72, 88, 95];
  else if (avgRating >= 3.6) t = [30, 60, 80, 92];
  else                       t = [20, 45, 68, 85];
  if (seed < t[0]) return 5;
  if (seed < t[1]) return 4;
  if (seed < t[2]) return 3;
  if (seed < t[3]) return 2;
  return 1;
}

/** Pick a message that fits the star rating */
function pickMessage(productId: string, idx: number, stars: number): string {
  const seed = hashStr(`${productId}_msg_${idx}`);
  if (stars >= 4) return POSITIVE_MESSAGES[seed % POSITIVE_MESSAGES.length];
  if (stars === 3) return NEUTRAL_MESSAGES[seed % NEUTRAL_MESSAGES.length];
  return CRITICAL_MESSAGES[seed % CRITICAL_MESSAGES.length];
}

export interface GeneratedReview {
  _id: string;
  userName: string;
  rating: number;
  message: string;
  createdAt: string;
  isGenerated: true;
}

/**
 * Generate one deterministic review for a product at global index `idx`.
 * `total` is used to space dates evenly so index 0 = most recent, last = oldest.
 */
function generateOneReview(
  productId: string,
  idx: number,
  total: number,
  avgRating: number,
): GeneratedReview {
  const seed = hashStr(`${productId}_review_${idx}`);

  // Pick ethnicity group; spread across the pool using prime-multiplied index
  // to reduce name repeats within a visible page
  const groupIdx  = (seed + idx * 7)  % NIGERIAN_NAME_GROUPS.length;
  const group     = NIGERIAN_NAME_GROUPS[groupIdx];
  const firstName = group.first[(seed + idx * 11) % group.first.length];
  const lastName  = group.last[ (seed + idx * 13) % group.last.length];

  const stars   = pickStarRating(productId, idx, avgRating);
  const message = pickMessage(productId, idx, stars);

  const hourSeed = hashStr(`${productId}_h_${idx}`);
  const minSeed  = hashStr(`${productId}_m_${idx}`);
  const jitter   = (hashStr(`${productId}_j_${idx}`) % 7) - 3;
  // Anchor: most recent review = late October 2025; oldest = ~12 months before that
  const anchor   = new Date("2025-10-31T23:59:59Z");
  const base     = total > 1 ? Math.floor((idx / (total - 1)) * 360) : 0;
  const daysAgo  = Math.max(0, base + jitter);
  const date = new Date(anchor);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hourSeed % 24, minSeed % 60, 0, 0);

  return {
    _id: `gen_${productId}_${idx}`,
    userName: `${firstName} ${lastName}`,
    rating: stars,
    message,
    createdAt: date.toISOString(),
    isGenerated: true,
  };
}

/**
 * Generate a page of reviews that matches the totalReviews count from getRatingInfo.
 * Pagination lines up with what the product card displays.
 */
export function generateReviews(
  productId: string,
  page = 1,
  pageSize = 10,
): { data: GeneratedReview[]; total: number } {
  const { reviews: total, rating: avgRating } = getRatingInfo(productId);
  const start = (page - 1) * pageSize;
  const end   = Math.min(start + pageSize, total);
  const data: GeneratedReview[] = [];
  for (let i = start; i < end; i++) {
    data.push(generateOneReview(productId, i, total, avgRating));
  }
  return { data, total };
}
