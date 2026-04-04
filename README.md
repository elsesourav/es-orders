# ES Orders

ES Orders is a React + Vite order management app focused on fast daily fulfillment workflows.
It helps teams review saved order states, inspect order items in detail, resolve SKU mappings, and manage multiple user accounts from one interface.

## Download Android App

<div align="left">
  <a href="./ES%20Orders.apk" download>
    <img alt="Download ES Orders APK" src="https://img.shields.io/badge/Download-ES%20Orders.apk-1f6feb?style=for-the-badge&logo=android&logoColor=white" />
  </a>
</div>

## Key Features

### 1. Authentication & Account Management

- Sign up and sign in with username/password.
- Session-based auth persistence with cookies.
- Multi-account support:
  - add account
  - switch account
  - disconnect account
  - logout all accounts
- Auto-redirect to settings/auth flow if a user is not authenticated.

### 2. Saved Order States Dashboard (Home)

- Fetches user-specific saved order states.
- Displays each state by timestamp.
- Quick entry into:
  - RTD (Ready To Dispatch) list
  - Handover list
- Empty and error states for better reliability.

### 3. Orders Reader Experience

- Full-screen order card workflow optimized for mobile and desktop.
- Horizontal swipe navigation with preloading and performance windows for large order lists.
- Direct hotzone navigation (left/right touch zones) to move between orders quickly.
- Order jump dialog to jump to a specific order number.
- Multi-item order support with item index selector.
- Product image preloading/cache for smoother browsing.
- Marketplace badge rendering (Flipkart / Shopsy-like sources).
- Copy SKU support:
  - Web clipboard (`navigator.clipboard`)
  - Android bridge clipboard (`window.AndroidClipboard`) when available

### 4. Product Resolution & Weight Calculation

- Resolves product details using:
  - item SKU
  - mapped SKU
  - normalized SKU parsing
- Supports composite SKU parsing formats:
  - IDs-then-quantity
  - quantity-then-IDs
- Fallback matching by title if SKU-token match is missing.
- Computes item weight in grams using quantity/unit logic.

### 5. SKU Mapping Management

- Searchable SKU map table.
- Add, edit, soft-delete, and restore mappings.
- Active and deleted view modes.
- Debounced search for large mapping lists.
- Builder-assisted new SKU generation with stepwise flow:
  1. Select vertical
  2. Select category
  3. Add one or more product SKUs
  4. Enter quantity
  5. Choose unit
- Built-in validation to prevent self-mapping and chain conflicts.

### 6. Personalization & UX Settings

- Dark mode toggle.
- Language switching (English / Bengali).
- Font size controls (small / medium / large).
- Simple Orders View mode for compact order reading.
- Responsive navigation for desktop and mobile.

### 7. Developer Contact & App Info

- In-app app-information card.
- Developer contact links (email + social profiles).

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Supabase JS 2
- Swiper 12
- Lucide React + React Icons

## Project Structure (Important Paths)

- `src/components` - main UI pages and reusable UI blocks
- `src/components/orders` - order viewing flow and data resolution
- `src/components/settings` - account center and SKU mapping tools
- `src/components/login` - sign in/sign up modals
- `src/api` - Supabase data access layer
- `src/lib` - auth, language, theme, font-size, utility hooks
- `setup.sql` - baseline SQL schema/setup script
- `ES Orders.apk` - Android app binary

## Environment Variables

Create a `.env` file in project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run dev
```

### 3. Build for production

```bash
npm run build
```

### 4. Type-check

```bash
npm run typecheck
```

### 5. Lint

```bash
npm run lint
```

## Database Notes

- The app relies on Supabase tables for users, orders states, items/base items, categories, verticals, and SKU mappings.
- Use `setup.sql` as the starting point for schema setup and extend as needed for all API tables used in `src/api`.

## Scripts

- `npm run dev` - Start Vite dev server
- `npm run build` - Production build
- `npm run typecheck` - TypeScript check without emit
- `npm run lint` - ESLint
- `npm run preview` - Preview production build

## APK Download (Direct File)

If you are viewing this repository in a file browser that supports local links, use the button at the top.

Alternative direct link:

- [Download ES Orders.apk](./ES%20Orders.apk)

## License

All rights reserved.

Copyright (c) 2026 SouravBarui2026

This project is NOT open source.

Use, copying, modification, distribution, or resale is not allowed without prior written permission from SouravBarui2026.

## README Copyright

README Copyright by SouravBarui2026
