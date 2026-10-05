export const PRODUCT_CONFIG = Object.freeze({
  name: process.env.NEXT_PUBLIC_KARATU_PRODUCT_NAME || "Karatu SIS",
  slug: process.env.NEXT_PUBLIC_KARATU_PRODUCT_SLUG || "karatu",
  rootDomain: process.env.NEXT_PUBLIC_KARATU_ROOT_DOMAIN?.trim() || null,
});

export const PRODUCT_NAME = PRODUCT_CONFIG.name;
