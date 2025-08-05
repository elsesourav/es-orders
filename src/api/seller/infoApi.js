import { URLS } from "../index";

/**
 * Get seller information from Flipkart
 * @returns {Promise<Object|null>} Seller info object or null if error
 */
export const getSellerInfo = async () => {
   try {
      const res = await fetch(URLS.flipkartFeaturesForSeller);
      const json = await res?.json();
      const info = {
         sellerId: json?.sellerId,
         userId: json?.userId,
         csrfToken: json?.csrfToken,
      };
      return info;
   } catch (error) {
      console.log(error);
      return null;
   }
};

/**
 * Check if seller is logged in and has valid session
 * @returns {Promise<boolean>} True if seller is logged in
 */
export const isSellerLoggedIn = async () => {
   try {
      const sellerInfo = await getSellerInfo();
      return !!(sellerInfo && sellerInfo.csrfToken && sellerInfo.sellerId);
   } catch (error) {
      console.error("Error checking seller login status:", error);
      return false;
   }
};

/**
 * Get seller tier information from Flipkart
 * @returns {Promise<string|null>} Seller tier (e.g., 'silver', 'gold', 'platinum') or null if error
 */
export const getSellerTier = async () => {
   try {
      const response = await fetch(URLS.finalTier, {
         method: "GET",
         headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
         },
      });

      if (!response.ok) {
         throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data?.tier || null;
   } catch (error) {
      console.error("Error fetching seller tier:", error);
      return null;
   }
};
