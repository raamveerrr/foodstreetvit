# Campus Eats Express

Build a completely new application from scratch called:

DIGITALFOODSTREET

DigitalFoodStreet is a campus food pre-ordering platform designed primarily for university students.

The most important product principle is:

MAKE ORDERING FOOD AS FAST, SIMPLE AND EFFORTLESS AS POSSIBLE.

Students should be able to:

Open DigitalFoodStreet

→ Discover food

→ Choose a shop

→ Choose food

→ Add to cart

→ Checkout

→ Pay

→ Automatically receive a digital receipt

→ Show the receipt at the shop

→ Collect the food

The website should feel like a premium native mobile food-ordering application, even though it is a web application.

==================================================

IMPORTANT — THIS IS PHASE 1

==================================================

This first phase is primarily UI/UX.

Focus on building an extremely polished mobile-first application experience.

DO NOT spend this phase implementing:

- Supabase backend

- Firebase

- Authentication backend

- Razorpay integration

- Real database

- Real-time subscriptions

- Edge Functions

- Production payment verification

- Complex admin backend

Use realistic local mock data for now.

However, structure the frontend cleanly so the mock data can later be replaced by Supabase without rebuilding the UI.

The UI architecture should already anticipate:

- real authentication

- real orders

- real receipts

- real-time order status

- shop management

- secure receipt redemption

==================================================

PRODUCT PHILOSOPHY

==================================================

DigitalFoodStreet should NOT feel like a college project.

It should feel like a real food-tech startup application.

Design inspiration:

- Convenience of modern food-ordering apps

- Cleanliness and polish of premium mobile applications

- Fast interactions

- Strong visual hierarchy

- Excellent typography

- Beautiful food imagery

- Minimal friction

Do NOT copy any existing company's branding or UI.

The application should feel original.

==================================================

MOBILE FIRST

==================================================

Mobile is the PRIMARY platform.

Design intentionally for:

360px

375px

390px

412px

430px

Do not build a desktop website and shrink it down.

Build the mobile experience first.

Desktop should adapt gracefully afterward.

The mobile interface should feel like:

"I am using a food-ordering app."

Not:

"I am browsing a college website."

==================================================

PRIMARY BOTTOM NAVIGATION

==================================================

Create a fixed mobile bottom navigation bar.

There must be EXACTLY four primary navigation buttons:

1. HOME

2. CART

3. FAVOURITE

4. RECEIPTS

Do NOT add Profile as a bottom navigation item.

Do NOT add Orders as a fifth navigation item.

Do NOT add Categories as a bottom navigation item.

The bottom navigation should feel like a native mobile app.

Use:

Home icon

Cart icon

Heart icon

Receipt icon

The active item should have a subtle animated indicator.

Use Framer Motion for:

- active icon transition

- active indicator

- subtle scale

- tap feedback

The navigation must:

- remain fixed

- respect mobile safe areas

- never cover content

- work at small screen widths

- feel lightweight

- not consume excessive vertical space

==================================================

PROFILE ACCESS

==================================================

Profile should NOT be part of bottom navigation.

Instead:

Place a small profile/avatar button in the top-right of the Home screen and other appropriate screens.

Tapping the avatar opens the Profile/Account page.

Profile can contain:

Name

Email

Settings

Help

Logout

Keep Profile secondary.

The four primary actions remain:

Home

Cart

Favourite

Receipts

==================================================

VISUAL DESIGN

==================================================

Create a premium food-tech design system.

Overall feeling:

Premium

Clean

Warm

Modern

Fast

Friendly

Minimal

Professional

Young

Trustworthy

Avoid:

- Excessive gradients

- Neon colors

- Rainbow UI

- Huge shadows

- Excessive glassmorphism

- Excessively rounded cards

- Cheap-looking templates

- Giant typography everywhere

- Overloaded dashboards

- Excessive animations

Use a sophisticated neutral background with one strong food-inspired accent color.

Use accent color primarily for:

- CTA buttons

- active navigation

- selected states

- important status

- favourite state

- highlights

Keep the overall interface calm.

==================================================

TYPOGRAPHY

==================================================

Use a modern premium sans-serif font.

Typography must have a clear hierarchy.

Use:

Large:

Page titles / greeting

Medium:

Section headings

Regular:

Food descriptions

Small:

Metadata

Prices should be easy to scan.

Do not make every piece of text bold.

Whitespace is important.

==================================================

APP HEADER

==================================================

Do NOT use a traditional desktop website navbar.

Use an app-style header.

Example:

Good morning, Ramveer 👋

What are you craving today?

Top-right:

Profile avatar

The greeting should eventually come from the logged-in user.

For this UI phase use mock user data.

Keep the header compact.

==================================================

HOME PAGE

==================================================

The Home screen is the most important screen.

The user should understand what to do within seconds.

Suggested structure:

Greeting

Search

Categories

Open shops

Popular food

Favourite/reorder section

==================================================

SEARCH

==================================================

Create a premium search bar:

"Search food or shops"

The search interaction should feel instant.

Include search icon.

Use a subtle focus animation.

Later this will connect to real database search.

For now use mock data.

==================================================

FOOD CATEGORIES

==================================================

Create a horizontal scrollable category section.

Example:

All

Burgers

Meals

Snacks

Drinks

Desserts

Coffee

Cards should be compact and easy to tap.

The category selector should feel smooth.

Use Framer Motion for selected category transitions.

==================================================

SHOPS

==================================================

Create:

"Open now"

or

"Shops near you"

Show realistic campus food shops.

Example shops:

Zuzu

Cake Stories

Bites & Bites

Shakers & Movers

Each shop card should show:

Shop image

Shop name

Open / Closed status

Preparation estimate

Short description

Example:

Zuzu

● Open

10–15 min

The cards should be highly tappable.

==================================================

POPULAR FOOD

==================================================

Create:

"Popular today"

Food cards should show:

Large food image

Food name

Shop name

Price

Favourite button

Add button

Example:

Chicken Burger

Zuzu

₹129

[ + ]

The Add interaction should be extremely fast.

==================================================

FAVOURITE / QUICK ORDER

==================================================

Favourites are a CORE FEATURE of DigitalFoodStreet.

The purpose is not merely saving food.

The purpose is:

MAKE DAILY REORDERING EXTREMELY EASY.

Example:

A student regularly orders:

Chicken Burger

Cold Coffee

They should be able to:

Open Favourite

→ Tap Add

→ Open Cart

→ Checkout

with minimal interaction.

Create a Home section:

"Your favourites"

Show a few favourite food items.

Each item should have:

Image

Name

Shop

Price

Heart

Add button

==================================================

FAVOURITE ANIMATION

==================================================

Use Framer Motion.

When the heart is pressed:

Heart should animate subtly.

Use:

- scale

- opacity

- small motion

Then show a professional toast:

"Added to favourites"

or:

"Removed from favourites"

Do NOT use browser alerts.

==================================================

SHOP PAGE

==================================================

When the user taps a shop, open a premium mobile shop page.

Top section:

Shop cover image

Back button

Favourite shop button

Shop information:

Logo

Name

Open/Closed

Estimated preparation time

Rating if available

Then:

Sticky horizontal categories.

Example:

Popular

Meals

Burgers

Snacks

Drinks

==================================================

MENU

==================================================

Menu items should be extremely easy to understand.

Each food item:

Image

Name

Short description

Price

Availability

Favourite icon

Add button

Example:

Chicken Burger

Crispy chicken, lettuce & special sauce

₹129

[ Add ]

==================================================

ADD TO CART

==================================================

When user presses Add:

Do not navigate away.

Give immediate visual feedback.

Example:

Add

becomes:

✓ Added

Then a small toast:

"Chicken Burger added to cart"

The cart badge should update immediately.

Use a smooth but very fast animation.

==================================================

FOOD DETAILS

==================================================

Tapping the food item can open a mobile bottom sheet.

Show:

Large image

Name

Description

Price

Ingredients if available

Quantity selector

Add to cart

Use Framer Motion.

Bottom sheet should feel native.

Do not make it a full desktop-style modal.

==================================================

CART

==================================================

Cart should be extremely simple.

Header:

Your Cart

Show shop:

From Zuzu

Items:

Food image

Name

Quantity

Price

Quantity controls:

− 1 +

Remove

Then sticky checkout summary:

Subtotal

Discount

Total

Primary button:

"Continue to Checkout"

The checkout UI should be intentionally simple because this is campus pickup.

Do NOT create a complicated ecommerce checkout.

There is no home delivery requirement.

==================================================

CART EMPTY STATE

==================================================

Show a beautiful empty state.

Example:

"Your cart is waiting 🍔"

"Add something delicious and it'll appear here."

Button:

"Explore Food"

==================================================

FAVOURITE PAGE

==================================================

Header:

Your Favourites

Subtitle:

"Your go-to food, one tap away."

Show favourite foods.

Each card:

Image

Name

Shop

Price

Heart

Add button

The purpose of this page is FAST REORDERING.

Make it possible to quickly add food without opening multiple screens.

Empty state:

"No favourites yet ❤️"

"Save your favourites for faster ordering."

Button:

"Explore Food"

==================================================

RECEIPTS — IMPORTANT

==================================================

The fourth navigation item must be:

RECEIPTS

Do NOT call it:

Tokens

My Tokens

Pickup Tokens

Use the word:

RECEIPT

throughout the customer-facing UI.

The Receipts page will eventually contain:

Active receipts

Past receipts

For the UI phase, use mock data.

==================================================

DIGITAL RECEIPT

==================================================

After a successful order, the student will eventually receive a digital receipt.

Design the receipt as a premium mobile pickup pass.

Example:

DIGITALFOODSTREET

Order Confirmed ✓

Receipt

FS-4821

Zuzu

Chicken Burger × 2

Cold Coffee × 1

Total

₹258

Payment

PAID ✓

Status

PREPARING

Pickup:

Zuzu Counter

The receipt number must be extremely easy to read.

The receipt should look professional and trustworthy.

Avoid loud backgrounds.

Avoid cheap gradients.

Think:

Digital receipt + premium pickup pass.

==================================================

RECEIPT PICKUP EXPERIENCE

==================================================

This is a critical product requirement.

The shop workers will be dealing with crowds.

They should NOT need to:

- Open a separate app

- Login for every pickup

- Search orders

- Scan every student

- Enter receipt numbers manually

- Manage a digital workflow for every customer

The existing physical shop workflow should remain.

Student shows the receipt on their phone.

Worker verifies:

Receipt number

Shop

Food items

Quantity

Then the WORKER uses the student's phone to perform a swipe on the receipt.

The student should NOT normally perform the swipe.

The interface must clearly communicate:

"Show this receipt at the counter."

"Counter staff will confirm pickup."

==================================================

RECEIPT SWIPE UI

==================================================

Create a beautiful mobile swipe-to-confirm interaction.

Example:

[ ← Slide to confirm pickup ]

The worker physically swipes the student's receipt.

Use Framer Motion.

The interaction should feel:

Fast

Physical

Smooth

Deliberate

Satisfying

The swipe should require a deliberate full gesture.

At completion:

Show:

✓ PICKUP CONFIRMED

Receipt FS-4821

Order collected successfully.

For now this can use local mock state.

IMPORTANT:

The frontend swipe is only a UI interaction.

In the future, the real backend will permanently mark the receipt as redeemed.

The student must never have a separate "redeem" button.

==================================================

RECEIPT AFTER PICKUP

==================================================

After pickup:

Show:

✓ PICKED UP

FS-4821

Order collected

12:42 PM

"This receipt has already been used."

Remove the active swipe control.

Do not show:

Generate new receipt

Reset receipt

Use again

Reactivate

==================================================

ONE-TIME RECEIPT PRINCIPLE

==================================================

Every successful order gets exactly ONE receipt.

One order

→ One receipt

→ One pickup

The receipt must eventually be permanently redeemable only once.

Refreshing the page must not generate another receipt.

Logging out and logging back in must not generate another receipt.

Opening the account on another device must not generate another receipt.

A new receipt is created ONLY after a new successful order.

For this phase use mock state, but structure the UI around this rule.

==================================================

ORDER CONFIRMATION SCREEN

==================================================

After successful checkout/payment in the future, show a beautiful success screen.

Example:

✓ ORDER CONFIRMED

Your food is being prepared.

Receipt:

FS-4821

Zuzu

Chicken Burger × 2

Cold Coffee × 1

₹258 PAID

Estimated preparation:

10–15 min

Primary button:

"View Receipt"

Secondary:

"Back to Home"

Use a smooth success animation.

==================================================

PROFILE

==================================================

Profile is NOT part of bottom navigation.

Access it through the top-right avatar.

Profile page can contain:

Profile information

My account

Past orders

Settings

Help & support

Logout

Keep this page secondary to the four main navigation areas.

==================================================

TOAST NOTIFICATIONS

==================================================

Create a reusable premium toast system.

Use toasts for:

Added to cart

Removed from cart

Added to favourites

Removed from favourites

Order confirmed

Receipt generated

Profile updated

Logged out

Examples:

"Added to cart"

"Added to favourites"

"Receipt ready"

"Order confirmed"

Never use browser alert().

Toasts should be:

- small

- elegant

- short

- non-blocking

- animated

==================================================

CONFIRMATION DIALOGS

==================================================

For destructive actions such as removing an item or logging out:

Use a premium mobile bottom sheet/dialog.

Example:

"Remove Chicken Burger?"

Cancel

Remove

Do not use browser confirmation dialogs.

==================================================

LOADING STATES

==================================================

Do not show blank screens.

Create reusable:

Skeleton loaders

Button loading states

Image loading states

Page loading states

Bottom-sheet loading states

Animations must be fast.

==================================================

FRAMER MOTION

==================================================

Use Framer Motion throughout the application.

Use animations for:

Page transitions

Card entrance

List stagger

Heart interaction

Add-to-cart feedback

Cart badge changes

Bottom navigation

Bottom sheets

Toasts

Success states

Receipt swipe

IMPORTANT:

Animations should make the app FEEL FAST.

Do not make users wait for animations.

Use mostly:

150–300ms

Use spring animation only where it improves the physical feel.

Avoid:

- long animations

- unnecessary bouncing

- excessive parallax

- continuous animations

- anything that slows navigation

==================================================

PERFORMANCE

==================================================

The application must feel extremely fast.

Use:

Lazy loading where appropriate

Optimized images

Lightweight components

Efficient rendering

Minimal unnecessary re-renders

Do not load huge assets unnecessarily.

==================================================

COMPONENT ARCHITECTURE

==================================================

Create reusable components:

AppHeader

BottomNavigation

ShopCard

FoodCard

CategorySelector

FavouriteButton

AddToCartButton

CartItem

ReceiptCard

ReceiptView

SwipeToConfirm

Toast

BottomSheet

Modal

Skeleton

EmptyState

StatusBadge

Avatar

Use TypeScript.

Keep components modular.

Avoid giant components.

==================================================

MOCK DATA

==================================================

Use realistic mock data.

Example shops:

Zuzu

Cake Stories

Bites & Bites

Shakers & Movers

Example foods:

Chicken Burger

Veg Burger

French Fries

Cold Coffee

Chocolate Cake

Pizza

Sandwich

Masala Maggi

Fresh Juice

Use realistic prices in INR.

The UI should look convincing with the mock data.

==================================================

DESKTOP BEHAVIOR

==================================================

Although mobile is the priority, the website should work on desktop.

On desktop:

Keep the primary content comfortably centered.

Do not stretch every card across a huge screen.

The experience should still feel like a polished application.

==================================================

ACCESSIBILITY

==================================================

Use:

Semantic HTML

Accessible buttons

Proper labels

Keyboard navigation

Visible focus states

Good contrast

Touch targets should be at least approximately 44px.

==================================================

IMPORTANT — DO NOT OVERBUILD

==================================================

Do NOT add:

- Admin dashboard

- Vendor dashboard

- Backend

- Supabase

- Firebase

- Razorpay

- Authentication backend

- Complex analytics

- Real notifications

- Real-time database

- Delivery tracking

yet.

This phase is about getting the STUDENT MOBILE EXPERIENCE extremely right.

==================================================

FINAL QUALITY BAR

==================================================

Before finishing this task, review every screen as if you were a student using the application every day.

Ask:

Can I find food quickly?

Can I find my favourite food quickly?

Can I add it quickly?

Is the cart obvious?

Is checkout simple?

Can I easily find my receipts?

Can I show my receipt at the counter?

Can the worker understand the receipt immediately?

Is the pickup interaction obvious?

Does the app feel fast?

Does the UI feel premium?

Does everything feel like one cohesive mobile application?

Fix inconsistencies before considering this phase complete.

DO NOT prioritize adding more features over polishing the existing experience.

The goal of this phase is:

A BEAUTIFUL, FAST, MOBILE-FIRST DIGITALFOODSTREET APP FOUNDATION.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://foodstreetvit.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1ddfe1de-0ca1-41bf-ad82-a019125cde64).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
