import type { Timestamp } from "firebase/firestore";

/** Firestore document shapes. Kept in one place so rules, functions and UI agree. */

export type UserRole = "STUDENT" | "SHOP_OWNER" | "SUPER_ADMIN";

export interface UserDoc {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type ShopStatus = "OPEN" | "CLOSED" | "TEMPORARILY_UNAVAILABLE";

export interface OpeningHour {
  day: string;
  open: boolean;
  from: string;
  to: string;
}

export interface ShopDoc {
  shopId: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string | null;
  logoPublicId?: string | null;
  coverImageUrl: string | null;
  coverPublicId?: string | null;
  location: string;
  contactNumber: string;
  contactEmail?: string;
  preparationTime: string;
  rating?: number;
  status: ShopStatus;
  openingHours: OpeningHour[];
  /** Cashfree vendor/beneficiary reference. Populated by Cloud Functions only. */
  vendorId?: string | null;
  payoutConfigured?: boolean;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface CategoryDoc {
  categoryId: string;
  shopId: string;
  name: string;
  imageUrl?: string | null;
  sortOrder?: number;
}

export interface MenuItemDoc {
  itemId: string;
  shopId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  cloudinaryPublicId: string | null;
  categoryId: string;
  categoryName: string;
  available: boolean;
  popular: boolean;
  veg?: boolean;
  ingredients?: string;
  preparationTime?: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type PaymentStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItemSnapshot {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface OrderDoc {
  orderId: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  shopId: string;
  shopName: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  platformCommission: number;
  paymentGatewayCharges: number;
  shopAmount: number;
  totalAmount: number;
  currency: "INR";
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  receiptId: string | null;
  /** Client-generated key so retries never create a second order. */
  idempotencyKey: string;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export type ReceiptStatusDoc = "ACTIVE" | "REDEEMED";

export interface ReceiptDoc {
  receiptId: string;
  orderId: string;
  studentId: string;
  shopId: string;
  shopName: string;
  counter: string;
  receiptNumber: string;
  status: ReceiptStatusDoc;
  createdAt?: Timestamp | null;
  redeemedAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
}

/** Configurable platform commission. Written only by SUPER_ADMIN. */
export interface CommissionConfig {
  mode: "FIXED" | "PERCENTAGE";
  value: number;
}

export const DEFAULT_COMMISSION: CommissionConfig = { mode: "PERCENTAGE", value: 1 };
