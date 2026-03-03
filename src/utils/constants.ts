export const STORAGE_KEYS = {
  THEME: "__es_theme",
  APP_STATE: "__es_app_state",
  CURRENT_USER: "__es_current_user",
  PDF_CONFIGURATION: "__es_pdf_configuration",
  TEMPLATE_LIST_SORT_ORDER: "__es_template_list_sort_order",

  COPYSHOPSY_SKU_PREFIX: "__es_copy_shopsy_sku_prefix",
  COPYSHOPSY_SELLING_PRICE: "__es_copy_shopsy_selling_price",
  COPYSHOPSY_SALES_PACKAGE_SUFFIX: "__es_copy_shopsy_sales_package_suffix",
  COPYSHOPSY_STOCK: "__es_copy_shopsy_stock",
  COPYSHOPSY_MRP: "__es_copy_shopsy_mrp",

  CATALOG_OVERRIDES_PREFIX: "__es_catalog_updates_overrides_",

  SKU_MAPPING_LAST_UPDATE: "__es_sku_mappings_last_updated",
  SKU_MAPPING_DATA: "__es_sku_mappings_data",
  SETTLEMENT_UPDATE_SETTINGS: "__es_settlement_update_settings",
  FULL_UPDATE_SETTINGS: "__es_full_update_settings",
  LISTING_DATA_LAST_UPDATE: "__es_listing_data_last_updated",
  LISTING_DATA: "__es_listing_data",
} as const;

type ProductDetailsData = {
  hsn: string;
  taxCode: string;
  brand: string;
  suitableFor: string[];
  organic: string;
  typeOfSeed: string[];
  commonName: string;
  floweringPlant: string;
  description: string;
  searchKeywords: string[];
  keyFeatures: string[];
  family: string;
  scientificName: string;
  uses: string;
  soilNutrientRequirements: string;
  sowingMethod: string;
  careInstructions: string;
  otherFeatures: string;
  season: string[];
  maxShelfLife: string;
  maxShelfLifeUnit: string;
  soilType: string;
  sunlight: string;
  watering: string;
  germinationTime: string;
  shelfLife: string;
  packOf: string;
};

type AdditionalDetailsData = {
  listingStatus: string;
  mrp: string;
  procurementType: string;
  procurementSLA: string;
  stock: string;
  localHandlingFee: string;
  zonalHandlingFee: string;
  nationalHandlingFee: string;
  manufacturingDate: string;
  manufacturerDetails: string;
  packerDetails: string;
  importerDetails: string;
};

type MainDetailsData = {
  pricingMode: string;
  minQuantityInPiece: string;
  quantityType: string;
  startQuantity: string;
  endQuantity: string;
  profitValue: string;
  productCost: string;
  minSettlement: string;
  incrementSteps: string;
};

export const LISTING_TEMPLATE_INITIAL_PRODUCT_DETAILS: ProductDetailsData = {
  hsn: "1209",
  taxCode: "GST_5",
  brand: "Silba",
  suitableFor: [],
  organic: "Yes",
  typeOfSeed: [],
  commonName: "",
  floweringPlant: "No",
  description: "",
  searchKeywords: [],
  keyFeatures: [],
  family: "",
  scientificName: "",
  uses: "",
  soilNutrientRequirements: "",
  sowingMethod: "",
  careInstructions: "",
  otherFeatures: "",
  season: [],
  maxShelfLife: "",
  maxShelfLifeUnit: "Months",
  soilType: "",
  sunlight: "",
  watering: "",
  germinationTime: "",
  shelfLife: "",
  packOf: "1",
};

export const LISTING_TEMPLATE_INITIAL_ADDITIONAL_DETAILS: AdditionalDetailsData =
  {
    listingStatus: "Active",
    mrp: "699",
    procurementType: "express",
    procurementSLA: "1",
    stock: "500",
    localHandlingFee: "0",
    zonalHandlingFee: "0",
    nationalHandlingFee: "0",
    manufacturingDate: new Date(
      new Date().setDate(new Date().getDate() - 1),
    ).toLocaleDateString("en-CA"),
    manufacturerDetails: "PuravEnterprises",
    packerDetails: "PuravEnterprises",
    importerDetails: "PuravEnterprises",
  };

export const LISTING_TEMPLATE_INITIAL_MAIN_DETAILS: MainDetailsData = {
  pricingMode: "normal",
  minQuantityInPiece: "",
  quantityType: "pieces",
  startQuantity: "",
  endQuantity: "1000",
  profitValue: "",
  productCost: "",
  minSettlement: "99",
  incrementSteps: "10",
};
