export const BRAND = {
  name:         process.env.NEXT_PUBLIC_BRAND_NAME         ?? 'GoViaTrip',
  productName:  process.env.NEXT_PUBLIC_BRAND_PRODUCT_NAME ?? 'Admin CRM',
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? 'support@goviatrip.com',
  // RGB triplet strings — set these to override brand colour (e.g. "0 120 212" for blue)
  primaryRgb:     process.env.NEXT_PUBLIC_BRAND_PRIMARY      ?? '244 125 31',
  primaryDarkRgb: process.env.NEXT_PUBLIC_BRAND_PRIMARY_DARK ?? '220 113 28',
} as const;
