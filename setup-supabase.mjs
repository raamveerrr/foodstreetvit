import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gnkuiljuevvexulwyion.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3VpbGp1ZXZ2ZXh1bHd5aW9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4OTI0NzUsImV4cCI6MjEwMjQ2ODQ3NX0.DHHcl-7EhpL7ZylhO64p0bf84sTrh7IVAVhKW7gEsF0";
const supabaseServiceRoleKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdua3VpbGp1ZXZ2ZXh1bHd5aW9uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njg5MjQ3NSwiZXhwIjoyMTAyNDY4NDc1fQ.d0sNY0sjSVwvQb-11XEPlO2r27R5MujgHqadCkL5Gfc";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const SQL = `
create extension if not exists "pgcrypto";

-- Users table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  uid text unique not null,
  email text unique not null,
  name text not null default '',
  phone text default '',
  role text not null default 'STUDENT' check (role in ('STUDENT', 'SHOP_OWNER', 'SUPER_ADMIN')),
  must_change_password boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shops table
create table if not exists public.shops (
  id uuid primary key default gen_random_uuid(),
  shop_id text unique not null,
  owner_uid text not null,
  name text not null,
  description text default '',
  category text default '',
  phone text default '',
  email text default '',
  campus text default '',
  prep_time text default '',
  hours jsonb default '[]'::jsonb,
  status text not null default 'CLOSED',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.shops enable row level security;

-- RLS Policies for users
drop policy if exists "users read own record" on public.users;
create policy "users read own record"
on public.users
for select
using (auth.uid()::text = uid);

drop policy if exists "users update own record" on public.users;
create policy "users update own record"
on public.users
for update
using (auth.uid()::text = uid);

drop policy if exists "superadmin can read all users" on public.users;
create policy "superadmin can read all users"
on public.users
for select
using (
  exists (
    select 1 from public.users u
    where u.uid = auth.uid()::text and u.role = 'SUPER_ADMIN'
  )
);

-- RLS Policies for shops
drop policy if exists "superadmin can manage shops" on public.shops;
create policy "superadmin can manage shops"
on public.shops
for all
using (
  exists (
    select 1 from public.users u
    where u.uid = auth.uid()::text and u.role = 'SUPER_ADMIN'
  )
)
with check (
  exists (
    select 1 from public.users u
    where u.uid = auth.uid()::text and u.role = 'SUPER_ADMIN'
  )
);

drop policy if exists "shop owner can read own shop" on public.shops;
create policy "shop owner can read own shop"
on public.shops
for select
using (owner_uid = auth.uid()::text);

drop policy if exists "shop owner can update own shop" on public.shops;
create policy "shop owner can update own shop"
on public.shops
for update
using (owner_uid = auth.uid()::text);
`;

async function setupDatabase() {
  console.log("Setting up Supabase database schema...");
  try {
    const { data, error } = await supabase.rpc("exec", { sql: SQL });
    if (error) {
      // Try direct SQL query approach
      console.log("Trying direct SQL execution...");
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql: SQL }),
      });

      if (!response.ok) {
        console.log(
          "RPC approach failed, attempting individual SQL statements via raw API..."
        );
        const statements = SQL.split(";").filter((s) => s.trim());
        for (const statement of statements) {
          if (!statement.trim()) continue;
          await new Promise((resolve) => setTimeout(resolve, 200));
          try {
            const res = await fetch(`${supabaseUrl}/rest/v1/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${supabaseServiceRoleKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query: statement.trim() + ";" }),
            });
            if (!res.ok) {
              console.warn(`Warning: statement may have failed: ${statement.substring(0, 50)}...`);
            }
          } catch (e) {
            console.warn(`Skipping statement: ${statement.substring(0, 50)}...`);
          }
        }
      } else {
        console.log("✓ Database schema created via RPC");
      }
    } else {
      console.log("✓ Database schema created");
    }
  } catch (err) {
    console.error("Error setting up database:", err);
    console.log(
      "Note: You may need to create tables manually in Supabase dashboard. Continuing with Edge Function setup..."
    );
  }
}

async function createEdgeFunction() {
  console.log("Creating Edge Function: create-shop-owner-and-shop...");

  const functionCode = `import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Payload = {
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
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  try {
    const payload = (await req.json()) as Payload;

    const { data: { user: adminUser }, error: authErr } = await supabaseAdmin.auth.admin.getUserById(
      req.headers.get("x-user-id") || ""
    );
    
    if (authErr || !adminUser) {
      return new Response(JSON.stringify({ success: false, message: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: adminProfile } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("uid", adminUser.id)
      .single();

    if (adminProfile?.role !== "SUPER_ADMIN") {
      return new Response(JSON.stringify({ success: false, message: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ownerEmail = payload.ownerEmail.trim().toLowerCase();
    const ownerPassword = payload.temporaryPassword || "Temp@12345";

    const { data: authResult, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true,
      user_metadata: {
        name: payload.ownerName,
      },
    });

    if (createErr || !authResult?.user) {
      return new Response(
        JSON.stringify({ success: false, message: createErr?.message || "Failed to create owner account" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const uid = authResult.user.id;

    const { error: userErr } = await supabaseAdmin.from("users").insert({
      uid,
      email: ownerEmail,
      name: payload.ownerName,
      phone: payload.ownerPhone ?? "",
      role: "SHOP_OWNER",
      must_change_password: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (userErr) {
      return new Response(JSON.stringify({ success: false, message: userErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const shopId = \`shop_\${crypto.randomUUID()}\`;

    const { error: shopErr } = await supabaseAdmin.from("shops").insert({
      shop_id: shopId,
      owner_uid: uid,
      name: payload.shop.name,
      description: payload.shop.description,
      category: payload.shop.category,
      phone: payload.shop.phone,
      email: payload.shop.email,
      campus: payload.shop.campus,
      prep_time: payload.shop.prepTime,
      hours: payload.shop.hours ?? [],
      status: payload.shop.status ?? "CLOSED",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (shopErr) {
      return new Response(JSON.stringify({ success: false, message: shopErr.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        shopId,
        ownerId: uid,
        shopName: payload.shop.name,
        ownerName: payload.ownerName,
        ownerEmail,
        temporaryPassword: ownerPassword,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, message: error?.message || "Unexpected error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});`;

  try {
    const response = await fetch(
      `${supabaseUrl}/functions/v1/create-shop-owner-and-shop`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${supabaseServiceRoleKey}`,
          "Content-Type": "application/typescript",
        },
        body: functionCode,
      }
    );

    if (response.ok) {
      console.log("✓ Edge Function created successfully");
    } else {
      const text = await response.text();
      console.log(
        `Note: Edge Function creation requires Supabase Dashboard. You'll need to create it manually.`
      );
      console.log(`Response: ${text}`);
    }
  } catch (err) {
    console.log(
      "Note: Edge Function creation requires Supabase Dashboard. You'll need to create it manually."
    );
  }
}

async function createSuperAdmin() {
  console.log("Creating initial SUPER_ADMIN user...");
  try {
    const { data: existingSuperAdmin } = await supabase
      .from("users")
      .select("uid")
      .eq("role", "SUPER_ADMIN")
      .limit(1);

    if (existingSuperAdmin && existingSuperAdmin.length > 0) {
      console.log("✓ SUPER_ADMIN user already exists");
      return;
    }

    // Create auth user
    const superAdminEmail = "admin@digitalfoodstreet.local";
    const superAdminPassword = "SuperAdmin@123";

    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: superAdminEmail,
      password: superAdminPassword,
      email_confirm: true,
      user_metadata: { name: "Super Administrator" },
    });

    if (authErr) {
      console.log(`Note: Super admin user may already exist. Error: ${authErr.message}`);
      return;
    }

    const adminUid = authData.user?.id;
    if (!adminUid) {
      console.log("Failed to get admin UID");
      return;
    }

    // Insert into users table
    const { error: insertErr } = await supabase.from("users").insert({
      uid: adminUid,
      email: superAdminEmail,
      name: "Super Administrator",
      role: "SUPER_ADMIN",
      must_change_password: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertErr) {
      console.log(`Note: Admin user record may already exist. Error: ${insertErr.message}`);
      return;
    }

    console.log("✓ SUPER_ADMIN user created");
    console.log(`  Email: ${superAdminEmail}`);
    console.log(`  Password: ${superAdminPassword}`);
    console.log(`  ⚠️  Change password on first login!`);
  } catch (err) {
    console.error("Error creating super admin:", err);
  }
}

async function main() {
  console.log("🚀 Supabase Backend Setup\n");
  await setupDatabase();
  await createEdgeFunction();
  await createSuperAdmin();
  console.log("\n✅ Setup complete!");
  console.log(
    "\nNext steps:"
  );
  console.log("1. Go to Supabase Dashboard → Edge Functions");
  console.log("2. Create a new function named 'create-shop-owner-and-shop'");
  console.log("3. Copy the TypeScript code from the function output");
  console.log("4. Set environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  console.log("5. Deploy and test the admin flow at http://localhost:8080/admin/shops/create");
}

main().catch(console.error);
