export function getUniqueId(index = 0): string {
  const baseChars =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const base = baseChars.length;
  const maxVal = base ** 3;

  const safeIndex = Number.isFinite(index) ? index : 0;

  const seconds = Math.floor(Date.now() / 1000);
  let n = ((seconds % maxVal) + safeIndex) % maxVal;

  let id = "";
  do {
    id = baseChars[n % base] + id;
    n = Math.floor(n / base);
  } while (n > 0);

  return id.padStart(3, "0");
}

export function isShopsyProduct(skuId: string): boolean {
  return !!skuId && /^(SPY_|SHY_|SH_)/.test(skuId.toUpperCase());
}

export function shopsyModifySkuId(skuId: string): string {
  if (isShopsyProduct(skuId)) {
    return skuId.toUpperCase().replace(/^(SPY_|SHY_|SH_)/, "");
  }
  return skuId;
}
