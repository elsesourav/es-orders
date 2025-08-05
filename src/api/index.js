// Export all user data API functions for easy importing
export {
   deleteUserData,
   getAllUserData,
   getUserData,
   getUserDataByUserId,
   setUserData,
   updateUserData,
} from "./userDataApi";

// Export base form data API functions
export {
   createBaseFormData,
   deleteBaseFormData,
   getAllBaseFormData,
   getBaseFormData,
   updateBaseFormData,
} from "./baseFormDataApi";

// Export data store API functions
export {
   createDataStore,
   deleteDataStore,
   getDataStore,
   updateDataStore,
} from "./dataStoreApi";

// Export products API functions
export {
   createProduct,
   deleteProduct,
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

// Export seller API functions from seller folder
export {
   // Brand approval and mapping functions
   checkApprovalStatus,
   createNewProductMappingBulk,
   // Full update functions
   createUpdateListing,
   deleteAllListingData,
   fetchAndSaveListingData,
   fetchAndSaveListingDataByVertical,
   fetchFlipkartSearchData,
   // Listing fetch functions
   getAllListingSellerData,
   getAllListingSellerDataByVertical,
   getListingDataStatus,
   getListingInfo,
   getSavedListingData,
   // Seller info functions
   getSellerInfo,
   getSellerTier,
   isSellerLoggedIn,
   processBatchForVerificationNew,
   searchAndVerifyProducts,
   searchListings,
   // Price update functions
   updateSellingPrice,
   verifyProductUsingUserDataNew,
} from "./seller";

// API URLs configuration
export const URLS = {
   flipkartFeaturesForSeller:
      "https://seller.flipkart.com/getFeaturesForSeller",
   listingsDataForStates:
      "https://seller.flipkart.com/napi/listing/listingsDataForStates",
   finalTier: "https://seller.flipkart.com/napi/darwin/finalTier",
   updateSellingPrice:
      "https://seller.flipkart.com/napi/listing/updateSellingPrice",
   brandApproval: "https://seller.flipkart.com/napi/regulation/approvalStatus?",
   flipkartAPIMapping:
      "https://seller.flipkart.com/napi/listing/create-update-listings",
   flipkartSearchUrl: "https://1.rome.api.flipkart.com/api/4/page/fetch",
};
