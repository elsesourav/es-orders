/**
 * Calculate weight in grams from SKU quantity data.
 */
export const calculateWeightInGrams = (allQuantityPerKg, unit, unitType) => {
  const type = unitType.toLowerCase();
  let weight = 0;

  allQuantityPerKg.forEach((qtyPerKg) => {
    if (type === "p") {
      weight += parseInt(unit) * (1 / qtyPerKg) * 1000;
    } else if (type === "g") {
      weight += parseInt(unit);
    } else if (type === "kg") {
      weight += parseInt(unit) * 1000;
    }
  });

  return weight;
};

/**
 * Derive marketplace info badge from a product ID prefix.
 * Returns { label, className } or null.
 */
export const getMarketplaceInfo = (item) => {
  const productId = String(
    item?.productId ?? item?.product_id ?? item?.productID ?? "",
  ).toUpperCase();

  if (productId.startsWith("VPS")) {
    return {
      label: "Shopsy",
      className:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    };
  }

  if (productId.startsWith("PAE")) {
    return {
      label: "Flipkart",
      className:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    };
  }

  return null;
};

/** Default product placeholder. */
export const DEFAULT_PRODUCT = {
  name: "NA",
  label: "NA",
  weight: "NA",
  unite: "NA",
};

/** Placeholder shown while data is loading. */
export const LOADING_PRODUCT = {
  name: "Loading...",
  label: "Loading...",
  weight: "Loading...",
  unite: "Loading...",
};
