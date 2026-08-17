# Manual Deployment Guide for Edge Function

## What to Do

The Edge Function code has been created and is ready to deploy. Since the CLI has permission issues, here's how to deploy manually through the Supabase Dashboard:

### Step 1: Copy the Function Code
The complete Edge Function code is located at:
- File: `supabase/functions/create-shop-owner-and-shop/index.ts`

### Step 2: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project: **gnkuiljuevvexulwyion**
3. Go to **Edge Functions** in the left sidebar
4. Click **Create a new function**

### Step 3: Create the Function
1. Name: `create-shop-owner-and-shop`
2. Language: TypeScript
3. Copy the entire code from `supabase/functions/create-shop-owner-and-shop/index.ts`
4. Paste it into the editor
5. Click **Deploy**

### Step 4: Test the Function
After deployment:
1. Note the function URL (will be displayed)
2. The app should automatically work - it calls: `https://gnkuiljuevvexulwyion.supabase.co/functions/v1/create-shop-owner-and-shop`

## Function Details

**Triggers on:** POST request to `/functions/v1/create-shop-owner-and-shop`

**What it does:**
1. Verifies the caller is a SUPER_ADMIN user
2. Creates a new auth user with temporary password
3. Creates a user profile in the `users` table
4. Creates a shop in the `shops` table
5. Returns shop and owner details

**Required Fields in Request Body:**
```json
{
  "ownerName": "John Doe",
  "ownerEmail": "john@example.com",
  "ownerPhone": "+1234567890",
  "temporaryPassword": "TempPass123!",
  "shop": {
    "name": "Pizza Place",
    "description": "Delicious pizza",
    "category": "Fast food",
    "phone": "+1234567890",
    "email": "pizza@example.com",
    "campus": "Main Campus",
    "prepTime": "15-20 minutes",
    "hours": {
      "monday": {"open": "09:00", "close": "22:00"}
    },
    "status": "CLOSED"
  }
}
```

## After Deployment

Once deployed:
1. Return to the app
2. Go to `/admin/shops/create`
3. Fill in the form and click "Create Shop & Owner"
4. It should work! 🎉

## Troubleshooting

If you get a CORS error:
- Make sure the function is actually deployed (check Dashboard → Edge Functions)
- The function should be running (green status)
- Clear browser cache and refresh

If you get "You do not have access":
- Verify you're logged in as a SUPER_ADMIN user
- Check that your user profile has role = "SUPER_ADMIN" in the `users` table
