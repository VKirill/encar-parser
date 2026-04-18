const API_BASE = "https://api.encar.com";
const SEARCH_ENDPOINT = `${API_BASE}/search/car/list/premium`;
const PHOTO_BASE = "https://ci.encar.com";
const DETAIL_URL = "https://www.encar.com/dc/dc_cardetailview.do?carid=";

// Примерные курсы — обновляются при необходимости
export const KRW_TO_RUB = 0.063;
export const KRW_TO_USD = 0.00072;

export const MANUFACTURERS: Record<string, string> = {
  hyundai: "현대",
  kia: "기아",
  genesis: "제네시스",
  chevrolet: "쉐보레(GM대우)",
  ssangyong: "KG모빌리티(쌍용)",
  renault: "르노코리아(삼성)",
  bmw: "BMW",
  mercedes: "벤츠",
  audi: "Audi",
  volkswagen: "폭스바겐",
  toyota: "도요타",
  honda: "혼다",
  volvo: "볼보",
  porsche: "포르쉐",
  tesla: "테슬라",
  lexus: "렉서스",
  mini: "미니",
  landrover: "랜드로버",
  jaguar: "재규어",
  lincoln: "링컨",
  cadillac: "캐딜락",
  jeep: "지프",
  ford: "포드",
  maserati: "마세라티",
  ferrari: "페라리",
  lamborghini: "람보르기니",
  bentley: "벤틀리",
  rollsroyce: "롤스로이스",
  nissan: "닛산(인피니티)",
  subaru: "스바루",
  mitsubishi: "미쓰비시",
  citroen: "시트로엥",
  peugeot: "푸조",
  fiat: "피아트",
  chrysler: "크라이슬러",
};

export const MANUFACTURER_LABELS: Record<string, string> = {
  hyundai: "Hyundai",
  kia: "Kia",
  genesis: "Genesis",
  chevrolet: "Chevrolet",
  ssangyong: "SsangYong",
  renault: "Renault Korea",
  bmw: "BMW",
  mercedes: "Mercedes-Benz",
  audi: "Audi",
  volkswagen: "Volkswagen",
  toyota: "Toyota",
  honda: "Honda",
  volvo: "Volvo",
  porsche: "Porsche",
  tesla: "Tesla",
  lexus: "Lexus",
  mini: "MINI",
  landrover: "Land Rover",
  jaguar: "Jaguar",
  lincoln: "Lincoln",
  cadillac: "Cadillac",
  jeep: "Jeep",
  ford: "Ford",
  maserati: "Maserati",
  ferrari: "Ferrari",
  lamborghini: "Lamborghini",
  bentley: "Bentley",
  rollsroyce: "Rolls-Royce",
  nissan: "Nissan",
  subaru: "Subaru",
  mitsubishi: "Mitsubishi",
  citroen: "Citroën",
  peugeot: "Peugeot",
  fiat: "Fiat",
  chrysler: "Chrysler",
};

export const FUEL_LABELS: Record<string, string> = {
  "가솔린": "Бензин",
  "디젤": "Дизель",
  "LPG": "LPG",
  "가솔린+전기": "Гибрид",
  "전기": "Электро",
  "LPG+전기": "LPG гибрид",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  "오토": "АКПП",
  "수동": "МКПП",
  "CVT": "Вариатор",
};

// Reverse mapping: корейское название → slug
const KOREAN_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(MANUFACTURERS).map(([slug, ko]) => [ko, slug])
);

export function getBrandBySlug(slug: string): string | null {
  return MANUFACTURERS[slug] ?? null;
}

export function getAllBrandSlugs(): string[] {
  return Object.keys(MANUFACTURERS);
}

export interface CarPhoto {
  type: string;
  location: string;
  updatedDate: string;
  ordering: number;
}

export interface CarListing {
  id: string;
  slug: string;
  manufacturer: string;
  manufacturerKey: string;
  model: string;
  badge: string;
  badgeDetail: string;
  year: number;
  formYear: string;
  priceMan: number;
  priceKRW: number;
  priceRUB: number;
  mileageKm: number;
  fuelType: string;
  fuelTypeRu: string;
  transmission: string;
  transmissionRu: string;
  sellType: string;
  officeCity: string;
  officeName: string;
  dealerName: string;
  modifiedDate: string;
  photoUrl: string;
  photos: string[];
  detailUrl: string;
  trust: string[];
  condition: string[];
}

export interface BrandStats {
  total: number;
  cars: CarListing[];
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  avgMileage: number;
  models: { name: string; count: number; minPrice: number }[];
}

export function generateCarSlug(car: CarListing): string {
  const modelSlug = car.model
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return `${car.id}-${modelSlug}-${car.year}`;
}

function findManufacturerKey(koName: string): string {
  return KOREAN_TO_SLUG[koName] ?? "";
}

function parseCarFromApi(raw: Record<string, unknown>): CarListing {
  const id = String(raw.Id ?? "");
  const yearRaw = Number(raw.Year ?? 0);
  const year = yearRaw ? Math.floor(yearRaw / 100) : 0;
  const priceMan = Number(raw.Price ?? 0);
  const priceKRW = priceMan * 10000;

  const photoPath = String(raw.Photo ?? "");
  const mainPhoto = photoPath ? `${PHOTO_BASE}${photoPath}001.jpg` : "";

  const photosRaw = (raw.Photos as CarPhoto[]) ?? [];
  const photos = photosRaw
    .sort((a, b) => a.ordering - b.ordering)
    .map((p) => `${PHOTO_BASE}${p.location}`)
    .slice(0, 10);

  const manufacturer = String(raw.Manufacturer ?? "");
  const fuelType = String(raw.FuelType ?? "");
  const transmission = String(raw.Transmission ?? "");
  const model = String(raw.Model ?? "");
  const manufacturerKey = findManufacturerKey(manufacturer);

  const modelSlug = model
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const slug = `${id}-${modelSlug}-${year}`;

  return {
    id,
    slug,
    manufacturer,
    manufacturerKey,
    model,
    badge: String(raw.Badge ?? ""),
    badgeDetail: String(raw.BadgeDetail ?? ""),
    year,
    formYear: String(raw.FormYear ?? ""),
    priceMan,
    priceKRW,
    priceRUB: Math.round(priceKRW * KRW_TO_RUB),
    mileageKm: Number(raw.Mileage ?? 0),
    fuelType,
    fuelTypeRu: FUEL_LABELS[fuelType] ?? fuelType,
    transmission,
    transmissionRu: TRANSMISSION_LABELS[transmission] ?? transmission,
    sellType: String(raw.SellType ?? ""),
    officeCity: String(raw.OfficeCityState ?? ""),
    officeName: String(raw.OfficeName ?? ""),
    dealerName: String(raw.DealerName ?? ""),
    modifiedDate: String(raw.ModifiedDate ?? ""),
    photoUrl: mainPhoto,
    photos: photos.length ? photos : mainPhoto ? [mainPhoto] : [],
    detailUrl: `${DETAIL_URL}${id}`,
    trust: (raw.Trust as string[]) ?? [],
    condition: (raw.Condition as string[]) ?? [],
  };
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json",
  "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
  Referer: "https://www.encar.com/",
};

// Фильтр: тип топлива (slug → Korean API name)
export const FUEL_FILTERS: Record<string, string> = {
  gasoline: "가솔린",
  diesel: "디젤",
  electric: "전기",
  hybrid: "가솔린+전기",
  lpg: "LPG(일반인 구입)",
};

export const FUEL_FILTER_LABELS: Record<string, string> = {
  gasoline: "Бензин",
  diesel: "Дизель",
  electric: "Электро",
  hybrid: "Гибрид",
  lpg: "LPG",
};

// Фильтр: КПП
export const TRANSMISSION_FILTERS: Record<string, string> = {
  auto: "오토",
  manual: "수동",
};

export const TRANSMISSION_FILTER_LABELS: Record<string, string> = {
  auto: "АКПП",
  manual: "МКПП",
};

// Фильтр: тип авто
export const CAR_TYPE_FILTERS: Record<string, string> = {
  korean: "Y",
  foreign: "N",
};

export const CAR_TYPE_LABELS: Record<string, string> = {
  korean: "Корейские",
  foreign: "Импортные",
};

// Годы для фильтра (select options)
export const YEAR_OPTIONS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

// Диапазоны пробега для фильтра
export const MILEAGE_OPTIONS = [
  { label: "до 10 000 км", value: 10000 },
  { label: "до 30 000 км", value: 30000 },
  { label: "до 50 000 км", value: 50000 },
  { label: "до 100 000 км", value: 100000 },
  { label: "до 150 000 км", value: 150000 },
];

// Диапазоны цен для фильтра (в 万원)
export const PRICE_OPTIONS = [
  { label: "до 1 млн ₽", manWon: 1587 },
  { label: "до 2 млн ₽", manWon: 3175 },
  { label: "до 3 млн ₽", manWon: 4762 },
  { label: "до 5 млн ₽", manWon: 7937 },
];

export async function fetchCars(options?: {
  limit?: number;
  manufacturer?: string;
  model?: string;
  carType?: string;
  fuelType?: string;
  transmission?: string;
  yearMin?: number;
  yearMax?: number;
  priceMin?: number;
  priceMax?: number;
  mileageMax?: number;
  sort?: string;
}): Promise<{ cars: CarListing[]; total: number }> {
  const limit = options?.limit ?? 100;
  const carType = options?.carType ?? "Y";
  const sort = options?.sort ?? "ModifiedDate";

  const parts = ["Hidden.N"];
  if (carType) parts.push(`CarType.${carType}`);
  if (options?.manufacturer) {
    const koName = MANUFACTURERS[options.manufacturer] ?? options.manufacturer;
    parts.push(`Manufacturer.${koName}`);
  }
  if (options?.model) {
    parts.push(`Model.${options.model}`);
  }
  if (options?.fuelType) {
    parts.push(`FuelType.${options.fuelType}`);
  }
  if (options?.transmission) {
    parts.push(`Transmission.${options.transmission}`);
  }
  if (options?.yearMin !== undefined && options?.yearMax !== undefined) {
    parts.push(`Year.range(${options.yearMin * 100}..${options.yearMax * 100 + 99})`);
  } else if (options?.yearMin !== undefined) {
    parts.push(`Year.range(${options.yearMin * 100}..)`);
  } else if (options?.yearMax !== undefined) {
    parts.push(`Year.range(..${options.yearMax * 100 + 99})`);
  }
  if (options?.priceMin !== undefined || options?.priceMax !== undefined) {
    const min = options.priceMin ?? "";
    const max = options.priceMax ?? "";
    parts.push(`Price.range(${min}..${max})`);
  }
  if (options?.mileageMax !== undefined) {
    parts.push(`Mileage.range(..${options.mileageMax})`);
  }

  const q = `(And.${parts.join("._.")}.)`;
  const sr = `|${sort}|0|${limit}`;

  const url = `${SEARCH_ENDPOINT}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;

  try {
    const resp = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 600 },
    });

    if (!resp.ok) {
      console.error(`Encar API error: ${resp.status} for query ${q}`);
      return { cars: [], total: 0 };
    }

    const data = await resp.json();
    const results = (data.SearchResults ?? []) as Record<string, unknown>[];
    const total = Number(data.Count ?? 0);
    const cars = results.map(parseCarFromApi);

    return { cars, total };
  } catch (error) {
    console.error(`Encar API fetch failed for query ${q}:`, error);
    return { cars: [], total: 0 };
  }
}

export async function fetchBrandStats(brandSlug: string): Promise<BrandStats> {
  const { cars, total } = await fetchCars({
    manufacturer: brandSlug,
    limit: 200,
  });

  if (cars.length === 0) {
    return { total, cars, minPrice: 0, maxPrice: 0, avgPrice: 0, avgMileage: 0, models: [] };
  }

  const prices = cars.map((c) => c.priceRUB).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const avgPrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const avgMileage = Math.round(
    cars.reduce((acc, c) => acc + c.mileageKm, 0) / cars.length
  );

  const modelMap = new Map<string, { count: number; prices: number[] }>();
  for (const car of cars) {
    const name = car.model || "Без модели";
    const entry = modelMap.get(name) ?? { count: 0, prices: [] };
    entry.count += 1;
    if (car.priceRUB > 0) entry.prices.push(car.priceRUB);
    modelMap.set(name, entry);
  }

  const models = Array.from(modelMap.entries())
    .map(([name, { count, prices }]) => ({
      name,
      count,
      minPrice: prices.length ? Math.min(...prices) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  return { total, cars, minPrice, maxPrice, avgPrice, avgMileage, models };
}

export async function fetchCarById(
  carId: string,
  brandSlug?: string
): Promise<CarListing | null> {
  // Encar API не поддерживает фильтр по Id.
  // Ищем авто в большой выборке по марке (до 500),
  // затем по всем (до 500). Кэш Next.js ISR помогает.
  const searches: Parameters<typeof fetchCars>[0][] = [];
  if (brandSlug) searches.push({ manufacturer: brandSlug, limit: 500 });
  searches.push({ limit: 500 });

  for (const opts of searches) {
    const { cars } = await fetchCars(opts);
    const found = cars.find((c) => c.id === carId);
    if (found) return found;
  }

  return null;
}
