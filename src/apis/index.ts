export const URLS = {
  flipkartFeaturesForSeller: "https://seller.flipkart.com/getFeaturesForSeller",
  flipkartSellerLocation:
    "https://seller.flipkart.com/napi/get-locations?locationType=pickup&include=state&capabilities=NON_FBF%2CFBF_LITE",
  listingsDataForStates:
    "https://seller.flipkart.com/napi/listing/listingsDataForStates",
  finalTier: "https://seller.flipkart.com/napi/darwin/finalTier",
  updateSellingPrice:
    "https://seller.flipkart.com/napi/listing/updateSellingPrice",
  brandApproval: "https://seller.flipkart.com/napi/regulation/approvalStatus?",
  flipkartAPIMapping:
    "https://seller.flipkart.com/napi/listing/create-update-listings",
  flipkartUpdateListing:
    "https://seller.flipkart.com/napi/listing/create-update-listings?inventoryUpdateSource=SD_listings_create_update",
  flipkartListingInfo:
    "https://seller.flipkart.com/napi/listing/get-listings-info-by-id",
  flipkartModifyListingsSetting:
    "https://seller.flipkart.com/napi/listing/modifyListingsSetting",
  flipkartGraphql: "https://seller.flipkart.com/napi/graphql",
  flipkartSearchUrl: "https://1.rome.api.flipkart.com/api/4/page/fetch",
  flipkartSearchUrl2: "https://2.rome.api.flipkart.com/api/4/page/fetch",
};

export * from "./categoriesApi";
export * from "./groupsApi";
export * from "./itemsApi";
export * from "./listingTemplatesApi";
export * from "./mapSkusApi";
export * from "./marketplaceProductsApi";
export * from "./ordersStatesApi";
export * from "./promptApi";
export * from "./sharedAccessUsersApi";
export * from "./usersApi";
export * from "./verticalsApi";

export {
  LISTING_FETCH_DEFAULT_STATES,
  checkApprovalStatus,
  createNewProductMappingBulk,
  deleteAllListingData,
  fetchAndSaveListingData,
  fetchAndSaveListingDataByManualIds,
  fetchAndSaveListingDataByRefresh,
  fetchAndSaveListingDataByVertical,
  fetchFlipkartSearchData,
  getAllListingSellerData,
  getAllListingSellerDataByVertical,
  getCurrentStrategyInfo,
  getListingDataStatus,
  getSavedListingData,
  getSellerInfo,
  getSellerTier,
  isSellerLoggedIn,
  processBatchForVerificationNew,
  requestStopListingDataFetch,
  searchAndVerifyProducts,
  searchListings,
  setFetchStrategyMode,
  updateSellingPrice,
  updateSpecificProductFieldsOptimized,
  verifyProductUsingUserDataNew,
} from "./seller";
