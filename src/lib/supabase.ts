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
    if (error as any) {
      console.dir(error);
    }
    // Attempt to extract more specific error message if it's a HTTP error
    let specificError = "We couldn't create that shop and owner.";
    try {
      if (error && typeof (error as any).context?.text === "function") {
        const bodyText = await (error as any).context.text();
        const bodyJson = JSON.parse(bodyText);
        if (bodyJson.message) specificError = bodyJson.message;
      }
    } catch (e) {
      // ignore
    }
    throw new Error(specificError);
  }

  const normalised = (data ?? {}) as Partial<CreateShopOwnerResult>;

  if (normalised.success === false) {
    throw new Error(normalised.message || "We couldn't create that shop and owner.");
  }

  if (normalised.success === true || normalised.shopId || normalised.ownerId || normalised.ownerEmail) {
    return {
      success: true,
      message: normalised.message || "Shop and owner created successfully.",
      shopId: normalised.shopId,
      ownerId: normalised.ownerId,
      shopName: normalised.shopName,
      ownerName: normalised.ownerName,
      ownerEmail: normalised.ownerEmail,
      temporaryPassword: normalised.temporaryPassword,
    };
  }

  throw new Error("We couldn't create that shop and owner.");
};
