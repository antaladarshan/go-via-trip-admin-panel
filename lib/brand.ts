export const BRAND = {
  name:         process.env.NEXT_PUBLIC_BRAND_NAME         ?? 'Quiliss',
  productName:  process.env.NEXT_PUBLIC_BRAND_PRODUCT_NAME ?? 'Admin CRM',
  supportEmail: process.env.NEXT_PUBLIC_BRAND_SUPPORT_EMAIL ?? 'support@quiliss.com',
  // RGB triplet strings — set these to override brand colour (e.g. "0 120 212" for blue)
  primaryRgb:     process.env.NEXT_PUBLIC_BRAND_PRIMARY      ?? '250 149 2',
  primaryDarkRgb: process.env.NEXT_PUBLIC_BRAND_PRIMARY_DARK ?? '254 61 11',
} as const;
