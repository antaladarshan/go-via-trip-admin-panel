import { API_BASE } from './api-base';
import { apiFetch } from './api-client';

const BASE_URL = API_BASE;

export interface AdminMetric {
  value: number;
  current_month?: number;
  prior_month?: number;
}

export interface AdminSummary {
  total_bookings: AdminMetric;
  total_revenue: AdminMetric;
  active_users: AdminMetric;
  active_vendors: AdminMetric;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  bookings: number;
  revenue: number;
}

export async function getAdminSummaryApi(): Promise<AdminSummary> {
  const res = await apiFetch(`${BASE_URL}/admin/stats/summary`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load dashboard summary');
  return data;
}

export async function getCategoryPerformanceApi(): Promise<CategoryPerformance[]> {
  const res = await apiFetch(`${BASE_URL}/admin/stats/category-performance`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load category performance');
  return data.categories ?? [];
}

// ─── Vendors ────────────────────────────────────────────────────────────────

export type VendorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AdminVendor {
  id: string;
  user_id: string;
  business_name: string;
  description: string | null;
  business_type: string | null;
  website: string | null;
  status: VendorStatus;
  rejection_reason: string | null;
  commission_rate: string | number | null;
  created_at: string;
  updated_at: string;
  owner_name: string;
  owner_email: string;
}

export async function getAllVendorsApi(): Promise<AdminVendor[]> {
  const res = await apiFetch(`${BASE_URL}/vendors`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load vendors');
  return data.vendors ?? [];
}

export async function updateVendorStatusApi(
  id: string,
  status: VendorStatus,
  rejection_reason?: string
): Promise<AdminVendor> {
  const res = await apiFetch(`${BASE_URL}/vendors/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status, rejection_reason: rejection_reason ?? null }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update vendor status');
  return data.vendor;
}

// ─── Categories ─────────────────────────────────────────────────────────────

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  parent_id: string | null;
  parent_name: string | null;
  status: 'active' | 'inactive';
  is_exclusive: boolean;
  subcategory_count: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  parent_id?: string | null;
  status?: 'active' | 'inactive';
}

export async function getAllCategoriesAdminApi(): Promise<AdminCategory[]> {
  const res = await apiFetch(`${BASE_URL}/admin/categories`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load categories');
  return data.categories ?? [];
}

export async function createCategoryApi(payload: CategoryPayload): Promise<AdminCategory> {
  const res = await apiFetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create category');
  return data.category;
}

export async function updateCategoryApi(id: string, payload: Partial<CategoryPayload>): Promise<AdminCategory> {
  const res = await apiFetch(`${BASE_URL}/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update category');
  return data.category;
}

export async function deleteCategoryApi(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/categories/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Failed to delete category');
  }
}

// ─── Listings ───────────────────────────────────────────────────────────────

export interface AdminListing {
  id: string;
  vendor_id: string;
  vendor_name: string;
  title: string;
  price: string | number;
  location: string;
  status: 'active' | 'inactive';
  category_id: string | null;
  category_name: string | null;
  featured: boolean;
  images: string[];
  created_at: string;
}

export interface AdminListingUpdate {
  status?: 'active' | 'inactive';
  category_id?: string | null;
  featured?: boolean;
  price?: number;
}

export interface AdminListingsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: 'active' | 'inactive';
  vendor_id?: string;
  featured?: boolean;
}

export interface AdminListingsResult {
  listings: AdminListing[];
  total: number;
  page: number;
  pageSize: number;
  vendors: { id: string; name: string }[];
}

export async function getAllListingsAdminApi(params: AdminListingsParams = {}): Promise<AdminListingsResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  if (params.vendor_id) qs.set('vendor_id', params.vendor_id);
  if (typeof params.featured === 'boolean') qs.set('featured', String(params.featured));
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await apiFetch(`${BASE_URL}/admin/listings${suffix}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load listings');
  return {
    listings: data.listings ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 15,
    vendors: data.vendors ?? [],
  };
}

export async function updateListingAdminApi(id: string, payload: AdminListingUpdate): Promise<AdminListing> {
  const res = await apiFetch(`${BASE_URL}/admin/listings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update listing');
  return data.listing;
}

export async function toggleListingFeaturedApi(id: string, featured: boolean): Promise<AdminListing> {
  const res = await apiFetch(`${BASE_URL}/admin/listings/${id}/feature`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ featured }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update listing');
  return data.listing;
}

export async function assignListingCategoryApi(id: string, category_id: string | null): Promise<AdminListing> {
  const res = await apiFetch(`${BASE_URL}/admin/listings/${id}/category`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ category_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update listing');
  return data.listing;
}

export async function deleteListingAdminApi(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/admin/listings/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Failed to delete listing');
  }
}

// ─── Bookings ───────────────────────────────────────────────────────────────

export type AdminBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AdminRefundStatus = 'none' | 'pending' | 'processed' | 'failed';

export interface AdminBooking {
  id: string;
  booking_code: string | null;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  listing_id: string;
  listing_title: string;
  location: string;
  images: string[] | null;
  vendor_id: string;
  vendor_name: string;
  category_id: string | null;
  category_name: string | null;
  start_date: string;
  pax_count: number;
  total_price: string | number;
  currency: string;
  status: AdminBookingStatus;
  refund_status: AdminRefundStatus;
  refund_amount: string | number | null;
  paid: boolean;
  created_at: string;
}

export interface AdminBookingsParams {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: AdminBookingStatus;
  vendor_id?: string;
  category_id?: string;
  customer_id?: string;
  from?: string;
  to?: string;
}

export interface AdminBookingsResult {
  bookings: AdminBooking[];
  total: number;
  page: number;
  pageSize: number;
  vendors: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export async function getAllBookingsAdminApi(params: AdminBookingsParams = {}): Promise<AdminBookingsResult> {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', String(params.page));
  if (params.pageSize) qs.set('pageSize', String(params.pageSize));
  if (params.q) qs.set('q', params.q);
  if (params.status) qs.set('status', params.status);
  if (params.vendor_id) qs.set('vendor_id', params.vendor_id);
  if (params.category_id) qs.set('category_id', params.category_id);
  if (params.customer_id) qs.set('customer_id', params.customer_id);
  if (params.from) qs.set('from', params.from);
  if (params.to) qs.set('to', params.to);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await apiFetch(`${BASE_URL}/admin/bookings${suffix}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load bookings');
  return {
    bookings: data.bookings ?? [],
    total: data.total ?? 0,
    page: data.page ?? 1,
    pageSize: data.pageSize ?? 15,
    vendors: data.vendors ?? [],
    categories: data.categories ?? [],
  };
}

export async function updateBookingStatusAdminApi(id: string, status: AdminBookingStatus): Promise<AdminBooking> {
  const res = await apiFetch(`${BASE_URL}/bookings/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update booking');
  return data.booking;
}

export async function cancelBookingAdminApi(id: string, reason?: string): Promise<AdminBooking> {
  const res = await apiFetch(`${BASE_URL}/bookings/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ cancellation_reason: reason ?? null }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to cancel booking');
  return data.booking;
}

// Standalone refund: issue/retry a gateway refund without cancelling the booking.
export async function refundBookingAdminApi(id: string): Promise<AdminBooking> {
  const res = await apiFetch(`${BASE_URL}/bookings/${id}/refund`, {
    method: 'POST',
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to initiate refund');
  return data.booking;
}

// ─── Payments ───────────────────────────────────────────────────────────────

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface AdminPayment {
  id: string;
  booking_id: string;
  booking_code: string | null;
  customer_id: string;
  customer_name: string;
  listing_title: string;
  amount: string | number;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  refund_id: string | null;
  refunded_amount: string | number | null;
  created_at: string;
}

export async function getAllPaymentsApi(): Promise<AdminPayment[]> {
  const res = await apiFetch(`${BASE_URL}/payments`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load payments');
  return data.payments ?? [];
}

// ─── Coupons ────────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'flat';
  discount_value: string | number;
  min_subtotal: string | number;
  max_discount: string | number | null;
  valid_from: string;
  valid_until: string | null;
  usage_limit: number | null;
  used_count: number;
  status: 'active' | 'inactive';
  applicable_categories: { id: string; name: string }[];
  created_at: string;
}

export interface CouponPayload {
  code: string;
  description?: string;
  discount_type: 'percent' | 'flat';
  discount_value: number;
  min_subtotal?: number;
  max_discount?: number | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  // Empty array (or omitted) = applies to every category.
  category_ids?: string[];
}

// All coupon fields are editable except the immutable `code`.
export interface CouponUpdatePayload {
  description?: string;
  discount_type?: 'percent' | 'flat';
  discount_value?: number;
  min_subtotal?: number;
  max_discount?: number | null;
  valid_until?: string | null;
  usage_limit?: number | null;
  status?: 'active' | 'inactive';
  category_ids?: string[];
}

export async function getAllCouponsApi(): Promise<Coupon[]> {
  const res = await apiFetch(`${BASE_URL}/coupons`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load coupons');
  return data.coupons ?? [];
}

export async function createCouponApi(payload: CouponPayload): Promise<Coupon> {
  const res = await apiFetch(`${BASE_URL}/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to create coupon');
  return data.coupon;
}

export async function updateCouponApi(
  id: string,
  payload: CouponUpdatePayload
): Promise<Coupon> {
  const res = await apiFetch(`${BASE_URL}/coupons/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to update coupon');
  return data.coupon;
}

export async function deleteCouponApi(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/coupons/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Failed to delete coupon');
  }
}

// ─── Reports ────────────────────────────────────────────────────────────────

export interface RevenuePoint {
  date: string;
  bookings: number;
  revenue: number;
}

export interface RevenueReport {
  points: RevenuePoint[];
  totals: { bookings: number; revenue: number };
  from: string;
  to: string;
}

export async function getRevenueReportApi(from: string, to: string): Promise<RevenueReport> {
  const res = await apiFetch(`${BASE_URL}/admin/reports/revenue?from=${from}&to=${to}`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load revenue report');
  return data;
}

// ─── Users ──────────────────────────────────────────────────────────────────

export interface AdminUserRow {
  id: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: 'customer' | 'vendor' | 'admin';
  phone: string | null;
  country: string | null;
  avatar_url: string | null;
  deleted_at: string | null;
  created_at: string;
}

export async function getAllUsersApi(): Promise<AdminUserRow[]> {
  const res = await apiFetch(`${BASE_URL}/users`, { credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to load users');
  return data.users ?? [];
}

export async function banUserApi(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/admin/users/${id}/ban`, { method: 'PATCH', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to ban user');
}

export async function unbanUserApi(id: string): Promise<void> {
  const res = await apiFetch(`${BASE_URL}/admin/users/${id}/unban`, { method: 'PATCH', credentials: 'include' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? 'Failed to unban user');
}
