# ES Orders

ES Orders is a React + Vite order management application built for high-speed daily fulfillment operations. It helps teams review saved order states, inspect order details, resolve SKU mappings, and manage multiple accounts from a single interface.

## Download Android App

<div align="left">
  <a href="./ES%20Orders.apk" download>
    <img alt="Download ES Orders APK" src="https://img.shields.io/badge/Download-ES%20Orders.apk-1f6feb?style=for-the-badge&logo=android&logoColor=white" />
  </a>
</div>

## Features

### Authentication and Account Management

- Sign up and sign in with username/password credentials.
- Keep authenticated sessions active using cookie-based persistence.
- Manage multiple accounts in one app:
  - add account
  - switch account
  - disconnect account
  - log out all accounts
- Automatically redirect users to auth/settings flow when authentication is missing.

### Saved Order States Dashboard

- Fetch and display user-specific saved order states.
- Show state history by timestamp.
- Open RTD (Ready to Dispatch) and Handover lists directly from the dashboard.
- Provide reliable empty and error states.

### Order Reading Experience

- Full-screen order-card workflow optimized for both desktop and mobile.
- Horizontal swipe navigation with preloading windows for smoother large-list performance.
- Hot-zone navigation (left/right touch areas) for rapid order traversal.
- Jump-to-order dialog for direct navigation to a specific order number.
- Multi-item order support with item index selection.
- Product image preloading and caching for faster transitions.
- Marketplace badge rendering (for Flipkart and Shopsy-like sources).
- SKU copy support via:
  - Web Clipboard API (`navigator.clipboard`)
  - Android bridge clipboard (`window.AndroidClipboard`) when available

### Product Resolution and Weight Calculation

- Resolve products using item SKU, mapped SKU, and normalized SKU parsing.
- Parse composite SKU formats in both IDs-then-quantity and quantity-then-IDs layouts.
- Fall back to title-based matching when token matching is unavailable.
- Compute item weight in grams using quantity and unit logic.

### SKU Mapping Management

- Searchable SKU mapping table.
- Add, edit, soft-delete, and restore mappings.
- Toggle between active and deleted records.
- Debounced search for better large-dataset performance.
- Step-by-step SKU builder flow:
  1. Select vertical
  2. Select category
  3. Add one or more product SKUs
  4. Enter quantity
  5. Choose unit
- Built-in guardrails to prevent self-mapping and chain conflicts.

### Personalization and UX Settings

- Dark mode toggle.
- Language switching (English and Bengali).
- Font size controls (small, medium, and large).
- Simple Orders View mode for compact reading.
- Responsive navigation across desktop and mobile layouts.

### App Information

- In-app application information card.
- Developer contact links (email and social profiles).

## Tech Stack

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Supabase JS 2
- Swiper 12
- Lucide React
- React Icons

## Project Structure

- `src/components`: Main pages and reusable UI components
- `src/components/orders`: Order reader workflow and data resolution logic
- `src/components/settings`: Account management and SKU mapping tools
- `src/components/login`: Sign-in and sign-up components
- `src/api`: Supabase data access layer
- `src/lib`: Auth, language, theme, font size, and utility hooks
- `setup.sql`: Base database schema/setup script
- `ES Orders.apk`: Android app binary

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Build for Production

```bash
npm run build
```

### 4. Run Type Check

```bash
npm run typecheck
```

### 5. Run Linting

```bash
npm run lint
```

## Scripts

- `npm run dev`: Start the Vite development server
- `npm run build`: Create a production build
- `npm run typecheck`: Run TypeScript checks without emitting files
- `npm run lint`: Run ESLint
- `npm run preview`: Preview the production build locally

## Database Notes

- The app depends on Supabase tables for users, order states, items/base items, categories, verticals, and SKU mappings.
- Use `setup.sql` as the starting schema and extend it for all tables required by files in `src/api`.

## APK Download (Direct Link)

If your file browser supports local links, use the download button above.

Alternative direct link:

- [Download ES Orders.apk](./ES%20Orders.apk)

## License

This repository is proprietary and not open source.

Copyright (c) 2026 Sourav Barui.
All rights reserved.

No permission is granted to use, copy, modify, merge, publish, distribute, sublicense, or sell any part of this software or its documentation without prior written permission from the copyright owner.

See the `LICENSE` file for full terms.
