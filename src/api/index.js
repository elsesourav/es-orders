// Export all user data API functions for easy importing
export {
  deleteUserData,
  getAllUserData,
  getUserData,
  setUserData,
  updateUserData,
} from "./userDataApi";

// Export data store API functions
export {
  createDataStore,
  deleteDataStore,
  getAllDataStores,
  getDataStore,
  updateDataStore,
} from "./dataStoreApi";

// Export products API functions
export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductBySku,
  getProductsBySkus,
  updateProduct,
} from "./productsApi";

// Export product groups API functions
export {
  addProductsToGroup,
  createProductGroup,
  deleteProductGroup,
  getProductGroup,
  getProductGroupByName,
  getUserProductGroups,
  removeProductsFromGroup,
  setGroupProducts,
  updateProductGroup,
} from "./productGroupsApi";

// Export orders API functions
export {
  createBulkOrders,
  createOrder,
  deleteOrder,
  getAllOrders,
  getOrderById,
  getOrderCount,
  getOrdersByDateRange,
  getRecentOrders,
  searchOrders,
  updateOrder,
} from "./ordersApi";

// Export SKU mappings API functions
export {
  deleteAllSkuMappings,
  deleteMultipleSkuMappings,
  deleteSkuMapping,
  getAllSkuMappings,
  getNewSku,
  getPaginatedSkuMappings,
  getSkuMapping,
  getSkuMappingsCount,
  getSkuMappingsObject,
  searchSkuMappings,
  searchSkuMappingsPaginated,
  setSkuMapping,
  updateSkuMapping,
} from "./skuMappingsApi";

// Export users API functions
export {
  createUser,
  fetchAllUsers,
  getUserById,
  getUserByUsername,
  getUserCookie,
  getUserId,
  listUsers,
  removeUserCookie,
  setUserCookie,
  signin,
  signout,
  signup,
} from "./usersApi";

// Export verticals API functions
export { getAllVerticals } from "./verticalsApi";

// Export categories API functions
export {
  getAllCategories,
  getCategoryProducts,
  getVerticalCategories,
} from "./categoriesApi";
