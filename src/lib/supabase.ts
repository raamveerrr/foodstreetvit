import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gnkuiljuevvexulwyion.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3VpbGp1ZXZ2ZXh1bHd5aW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTI0NzUsImV4cCI6MjEwMjQ2ODQ3NX0.DHHcl-7EhpL7ZylhO64p0bf84sTrh7IVAVhKW7gEsF0";

export interface CreateShopOwnerPayload {
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  temporaryPassword?: string;
  shop: {
    name: string;
    description: string;
    category: string;
    phone: string;
    email: string;
    campus: string;
    prepTime: string;
    hours: unknown[];
    status?: string;
  };
}

export interface CreateShopOwnerResult {
  success: boolean;
  message?: string;
  shopId?: string;
  ownerId?: string;
  shopName?: string;
  ownerName?: string;
  ownerEmail?: string;
  temporaryPassword?: string;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const getSupabase = () => supabase;

export async function createShopOwnerAndShop(
  payload: CreateShopOwnerPayload,
): Promise<CreateShopOwnerResult> {
  const { data, error } = await supabase.functions.invoke<CreateShopOwnerResult>(
    "create-shop-owner-and-shop",
    {
      body: payload,
    },
  );

  if (error) {
    throw new Error(error.message || "We couldn't create that shop and owner.");
  }

  if (!data?.success) {
    throw new Error(data?.message || "We couldn't create that shop and owner.");
  }

  return data;
};
