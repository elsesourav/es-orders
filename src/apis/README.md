# API Migration Map (Old → New)

This mapping documents function-level matches from legacy API modules to schema-based API modules.

Shared API types are centralized in `src/types/api.ts`.

## `skuMappingApi` → `mapSkusApi`

- `getAllSkuMappings` → `listMapSkus`
- `getPaginatedSkuMappings` → `listMapSkusPaginated`
- `getSkuMappingsObjectByCache` → `getMapSkusObjectByCache`
- `getSkuMappingsObject` → `getMapSkusObject`
- `getSkuMapping` → `getMapSkuByOldSku`
- `getNewSku` → `getMapSkuNewSku`
- `setSkuMapping` → `upsertMapSku`
- `setMultipleSkuMappings` → `upsertManyMapSkus`
- `updateSkuMapping` → `updateMapSku`
- `deleteSkuMapping` → `deleteMapSku`
- `deleteMultipleSkuMappings` → `deleteManyMapSkus`
- `deleteAllSkuMappings` → `clearMapSkus`
- `getSkuMappingsCount` → `countMapSkus`
- `searchSkuMappings` → `searchMapSkus`
- `searchSkuMappingsPaginated` → `searchMapSkusPaginated`
- `replaceAllSkuMappings` → `replaceAllMapSkus`
- `exportSkuMappingsToJson` → `exportMapSkusToJson`
- `importSkuMappingsFromJson` → `importMapSkusFromJson`

## `userDataApi` → `marketplaceProductsApi`

- `getUserData` → `getMarketplaceDataset`
- `getAllUserData` → `listMarketplaceDatasets`
- `setUserData` → `upsertMarketplaceDataset`
- `updateUserData` → `updateMarketplaceDataset`
- `deleteUserData` → `deleteMarketplaceDataset`
- `updateProductsInChunks` → `patchMarketplaceProductsInChunks`

## Removed APIs

- `groupDataApi` removed (GroupData table dropped)
- `groupVariantsApi` removed (GroupVariant table dropped)

## `productsApi` → `itemsApi`

- `createProduct` → `createItem`
- `updateProduct` → `updateItem`
- `deleteProduct` → `deleteItem`
- `getAllProducts` → `listItems`
- `getProductBySku` → `getItemBySku`
- `getProductsBySkus` → `getItemsBySkus`

## `productGroupsApi` → `groupsApi`

- `createProductGroup` → `createGroup`
- `updateProductGroup` → `updateGroup`
- `deleteProductGroup` → `deleteGroup`
- `getUserProductGroups` → `listGroups`
- `getProductGroup` → `getGroupById`
- `getProductGroupByName` → `getGroupByName`
- `addProductsToGroup` → `addItemsToGroup`
- `removeProductsFromGroup` → `removeItemsFromGroup`
- `setGroupProducts` → `setGroupItems`

## `ordersApi` → `ordersStatesApi`

- `createOrder` → `createOrderState`
- `getAllOrders` → `listOrderStates`
- `getOrderById` → `getOrderStateById`
- `updateOrder` → `updateOrderState`
- `deleteOrder` → `deleteOrderState`
- `getOrdersByDateRange` → `listOrderStatesByDateRange`
- `getRecentOrders` → `listRecentOrderStates`
- `searchOrders` → `searchOrderStates`
- `getOrderCount` → `countOrderStates`
- `createBulkOrders` → `createManyOrderStates`

## `listingTemplateApi` → `listingTemplatesApi`

- `createListingTemplate` → `createListingTemplate`
- `updateListingTemplate` → `updateListingTemplate`
- `deleteListingTemplate` → `deleteListingTemplate`
- `getAllListingTemplates` → `listListingTemplates`

## `usersApi` → `usersApi`

- `createUser` → `createUser`
- `getUserById` → `getUserById`
- `getUserByUsername` → `getUserByUsername`
- `listUsers` → `listUsers`
- `fetchAllUsers` → `fetchAllUsers`
- `setUserCookie` → `setUserCookie`
- `getUserCookie` → `getUserCookie`
- `getUserId` → `getUserId`
- `removeUserCookie` → `removeUserCookie`
- `signup` → `signup`
- `signin` → `signin`
- `signout` → `signout`

## `verticalsApi` → `verticalsApi`

- `createVertical` → `createVertical`
- `updateVertical` → `updateVertical`
- `deleteVertical` → `deleteVertical`
- `getAllVerticals` → `getAllVerticals`
- `getVerticalById` → `getVerticalById`

## `categoriesApi` → `categoriesApi`

- `createCategory` → `createCategory`
- `updateCategory` → `updateCategory`
- `deleteCategory` → `deleteCategory`
- `getAllCategories` → `getAllCategories`
- `getCategoryById` → `getCategoryById`
- `getVerticalCategories` → `getVerticalCategories`
- `addBaseItemToCategory` → `addBaseItemToCategory`
- `addMultipleBaseItemsToCategory` → `addMultipleBaseItemsToCategory`
- `getCategoryBaseItems` → `getCategoryBaseItems`
- `getCategoryBaseItemsPaginated` → `getCategoryBaseItemsPaginated`
- `getCategoryBaseItemsCount` → `getCategoryBaseItemsCount`
- `searchCategoryBaseItems` → `searchCategoryBaseItems`
- `updateCategoryBaseItem` → `updateCategoryBaseItem`
- `removeBaseItemFromCategory` → `removeBaseItemFromCategory`
- `removeMultipleBaseItemsFromCategory` → `removeMultipleBaseItemsFromCategory`
- `removeAllBaseItemsFromCategory` → `removeAllBaseItemsFromCategory`
- `getCategoriesWithBaseItem` → `getCategoriesWithBaseItem`

## `promptApi` → `promptApi`

- `createPrompt` → `createPrompt`
- `updatePrompt` → `updatePrompt`
- `deletePrompt` → `deletePrompt`
- `getAllPrompts` → `getAllPrompts`

## `seller/*`

- _(empty)_
