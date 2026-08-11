import { FOODS, SHOPS } from "./data";

/**
 * Shop-owner (merchant) mock data layer.
 *
 * Shape mirrors the future backend model so it can be swapped 1:1 later:
 *   owner -> shops -> { menu, categories, orders, customers, payments, settings }
 * Nothing here is shared with the student store: a shop owner only ever reads
 * and writes data scoped to a shop id they own.
 */

export type OrderStatus =
  | "NEW"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export const ORDER_FLOW: OrderStatus[] = [
  "NEW",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export const nextStatus = (s: OrderStatus): OrderStatus | null => {
  const i = ORDER_FLOW.indexOf(s);
  if (i === -1 || i === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[i + 1] ?? null;
};

export type ShopAvailability = "open" | "closed" | "unavailable";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export type Day = (typeof DAYS)[number];

export interface DayHours {
  day: Day;
  open: boolean;
  from: string;
  to: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  available: boolean;
  veg: boolean;
  popular: boolean;
  ingredients?: string;
  prepTime?: string;
}

export interface OrderLine {
  name: string;
  qty: number;
  price: number;
}

export interface ShopOrder {
  id: string;
  code: string;
  customerName: string;
  lines: OrderLine[];
  total: number;
  paid: boolean;
  status: OrderStatus;
  placedAt: string;
}

export interface ShopCustomer {
  id: string;
  name: string;
  initials: string;
  orders: number;
  spent: number;
  lastOrder: string;
}

export interface OwnerShop {
  id: string;
  name: string;
  description: string;
  category: string;
  phone: string;
  email: string;
  campus: string;
  logo: string | null;
  cover: string | null;
  prepTime: string;
  availability: ShopAvailability;
  hours: DayHours[];
  paymentConnected: boolean;
  categories: string[];
  menu: MenuItem[];
  orders: ShopOrder[];
  customers: ShopCustomer[];
}

export const defaultHours = (): DayHours[] =>
  DAYS.map((day) => ({
    day,
    open: day !== "Sunday",
    from: "10:00 AM",
    to: "08:00 PM",
  }));

export const TIME_OPTIONS = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
  "11:00 PM",
];

export const SHOP_CATEGORIES = [
  "Fast food and beverages",
  "Bakery and desserts",
  "Snacks and quick bites",
  "Juices and shakes",
  "Meals and thali",
];

const menuFor = (shopId: string): MenuItem[] =>
  FOODS.filter((f) => f.shopId === shopId).map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
    price: f.price,
    category: f.category,
    image: f.image,
    available: f.available,
    veg: !/chicken|egg|mutton/i.test(f.name),
    popular: Boolean(f.popular),
    ingredients: f.ingredients ?? "",
    prepTime: "10–15 minutes",
  }));

const seedOrders = (shopId: string, menu: MenuItem[]): ShopOrder[] => {
  const pick = (i: number) => menu[i % menu.length]!;
  const base = Date.parse("2026-01-01T00:00:00.000Z");
  const specs: Array<{ code: string; who: string; status: OrderStatus; idx: number[]; mins: number }> = [
    { code: "FS-4821", who: "Ramveer S.", status: "NEW", idx: [0, 0, 2], mins: 4 },
    { code: "FS-4820", who: "Ananya P.", status: "NEW", idx: [1, 3], mins: 9 },
    { code: "FS-4818", who: "Kabir M.", status: "ACCEPTED", idx: [2], mins: 16 },
    { code: "FS-4815", who: "Isha R.", status: "PREPARING", idx: [0, 1], mins: 24 },
    { code: "FS-4811", who: "Devansh K.", status: "READY", idx: [3, 3], mins: 33 },
    { code: "FS-4802", who: "Meera T.", status: "COMPLETED", idx: [1], mins: 68 },
    { code: "FS-4799", who: "Aarav J.", status: "COMPLETED", idx: [0, 2], mins: 92 },
    { code: "FS-4795", who: "Nikhil V.", status: "CANCELLED", idx: [2], mins: 140 },
  ];
  return specs.map((s, n) => {
    const lines: OrderLine[] = [];
    s.idx.forEach((i) => {
      const item = pick(i);
      const found = lines.find((l) => l.name === item.name);
      if (found) found.qty += 1;
      else lines.push({ name: item.name, qty: 1, price: item.price });
    });
    return {
      id: `${shopId}_o_${n}`,
      code: s.code,
      customerName: s.who,
      lines,
      total: lines.reduce((t, l) => t + l.price * l.qty, 0),
      paid: s.status !== "CANCELLED",
      status: s.status,
      placedAt: new Date(base - s.mins * 60000).toISOString(),
    };
  });
};

const seedCustomers = (shopId: string): ShopCustomer[] =>
  [
    { name: "Ramveer S.", orders: 14, spent: 2480, lastOrder: "Today" },
    { name: "Ananya P.", orders: 9, spent: 1610, lastOrder: "Today" },
    { name: "Kabir M.", orders: 7, spent: 1180, lastOrder: "Yesterday" },
    { name: "Isha R.", orders: 5, spent: 860, lastOrder: "2 days ago" },
    { name: "Devansh K.", orders: 3, spent: 495, lastOrder: "4 days ago" },
  ].map((c, i) => ({
    id: `${shopId}_c_${i}`,
    initials: c.name.charAt(0),
    ...c,
  }));

const buildShop = (shopId: string, category: string): OwnerShop => {
  const base = SHOPS.find((s) => s.id === shopId)!;
  const menu = menuFor(shopId);
  return {
    id: shopId,
    name: base.name,
    description: base.description,
    category,
    phone: "+91 98765 43210",
    email: `${shopId}@campus.edu`,
    campus: "Campus Food Court",
    logo: null,
    cover: base.image,
    prepTime: base.prepTime.replace(" min", " minutes"),
    availability: base.isOpen ? "open" : "closed",
    hours: defaultHours(),
    paymentConnected: false,
    categories: Array.from(new Set(menu.map((m) => m.category))),
    menu,
    orders: seedOrders(shopId, menu),
    customers: seedCustomers(shopId),
  };
};

export const seedOwnerShops = (): OwnerShop[] => [
  buildShop("zuzu", "Fast food and beverages"),
  buildShop("cake-stories", "Bakery and desserts"),
];

export const formatMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
