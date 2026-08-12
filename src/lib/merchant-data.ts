/**
 * Shop-owner (merchant) view models.
 *
 * These shapes are what the merchant UI renders. They are projections of the
 * Firestore documents in `src/lib/firebase/types.ts`, built in `merchant-store`.
 * A shop owner only ever reads and writes data scoped to a shop they own.
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
  categoryId?: string;
  image: string;
  imagePublicId?: string | null;
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
  shopAmount: number;
  platformCommission: number;
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
  logoPublicId?: string | null;
  cover: string | null;
  coverPublicId?: string | null;
  prepTime: string;
  availability: ShopAvailability;
  hours: DayHours[];
  paymentConnected: boolean;
  categories: string[];
  categoryIds: Record<string, string>;
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

export const formatMoney = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
