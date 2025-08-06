# Copilot Instructions for ES-Orders

## Project Overview

This is a **seller automation tool** built as a React web application for e-commerce order management. The project name is "seller-automation" despite the repo being "es-orders".

## Architecture & Key Patterns

### Database & API Structure

-  **Backend**: Supabase with PostgreSQL (see `setup.sql` for complete schema)
-  **API Layer**: Modular API services in `src/api/` organized by domain:
   -  `userDataApi.js` - User-specific data with chunking support for large datasets
   -  `ordersApi.js` - Order management (limited to 10 most recent via trigger)
   -  `dataStoreApi.js` - Shared data storage with ownership controls
   -  `seller/` - Seller-specific operations (listing, mapping, price updates)

### Authentication Pattern

All API calls use `getUserId()` from `usersApi.js` for authentication. Pattern:

```javascript
const userId = getUserId();
if (!userId) throw new Error("Not authenticated");
```

### Data Chunking Strategy

**Critical**: The app handles large data (>5MB) via client-side chunking in `userDataApi.js`:

-  Main record stores metadata with `isChunked: true`
-  Chunks stored as `{name}_chunk_{index}` records
-  Use `reconstructClientChunkedData()` for retrieval
-  Always check `isNeedProducts` flag when fetching chunked data

### SKU Assets System

-  Static SKU mappings in `src/assets/sku/*.json` (17k+ entries)
-  Custom Vite plugin `copyExtensionUtils()` copies SKU files to dist during build
-  Files are massive (17k+ lines) - avoid editing directly

## Development Workflow

### Build System

```bash
npm run dev      # Vite development server
npm run build    # Production build (copies SKU assets automatically)
npm run preview  # Preview production build
```

### Project Structure Conventions

```
src/
├── api/           # Domain-organized API modules
├── components/    # Reusable UI components with barrel exports
│   └── inputs/    # Specialized input components
├── assets/sku/    # Large static SKU mapping files
└── lib/           # Utilities (supabase client, utils)
```

### Component Patterns

-  Barrel exports: Import from `src/components/` or `src/api/`
-  Tailwind CSS with custom theme (dark-dotted backgrounds, custom scrollbars)
-  Uses shadcn/ui patterns with Radix UI primitives

### Key Dependencies

-  **UI**: React 19, Tailwind CSS, Lucide React icons, Radix UI
-  **Data**: Supabase client, drag-and-drop (@dnd-kit), Excel handling (xlsx)
-  **Build**: Vite with custom asset copying plugin

## Common Patterns

### Error Handling

```javascript
if (error && error.code !== "PGRST116") {
   // PGRST116 = not found
   throw new Error(error.message);
}
```

### Data Operations

-  Always check user ownership before updates/deletes
-  Use `upsert` patterns for user data
-  Handle chunked data reconstruction when `isNeedProducts=true`

### Environment

-  Supabase credentials via `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
-  Built for extension/standalone deployment (base: "./")

## Files to Reference

-  `src/api/userDataApi.js` - Data chunking implementation
-  `vite.config.js` - Build configuration with SKU asset copying
-  `setup.sql` - Complete database schema
-  `src/assets/sku/` - Large static data files (handle with care)
