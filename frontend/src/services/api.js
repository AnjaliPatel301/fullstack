import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxefit_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Seller API uses seller token
const sellerApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});
sellerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxefit_seller_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
sellerApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

// Courier API uses courier token
const courierApi = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});
courierApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('luxefit_courier_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
courierApi.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePassword: (data) => api.put('/auth/update-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  addAddress: (data) => api.post('/users/address', data),
  updateAddress: (id, data) => api.put(`/users/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/address/${id}`),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getOne: (id) => api.get(`/products/${id}`), // alias used by some pages
  getFeatured: () => api.get('/products/featured'),
  getFlashSale: () => api.get('/products/flash-sale'),
  search: (q) => api.get('/products/search', { params: { q } }),
};

export const cartAPI = {
  get: () => api.get('/cart'),
  add: (data) => api.post('/cart/add', data),
  update: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  remove: (itemId) => api.delete(`/cart/item/${itemId}`),
  clear: () => api.delete('/cart/clear'),
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my-orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  getOne: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  getAllAdmin: (params) => api.get('/orders', { params }),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  createRazorpayOrder: (data) => api.post('/payments/create-order', data),
  verifyRazorpay: (data) => api.post('/payments/verify', data),
  getKey: () => api.get('/payments/key'),
};

export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (productId) => api.post('/wishlist', { productId }),
  remove: (productId) => api.delete(`/wishlist/${productId}`),
  toggle: (productId) => api.post('/wishlist/toggle', { productId }),
  clear: () => api.delete('/wishlist/clear'),
};

export const reviewAPI = {
  // create can be called as create(productId, data)
  create: (productIdOrData, data) => {
    if (typeof productIdOrData === 'string' || typeof productIdOrData === 'number') {
      return api.post('/reviews', { ...data, productId: productIdOrData });
    }
    return api.post('/reviews', productIdOrData);
  },
  getProductReviews: (productId, params) => api.get(`/reviews/product/${productId}`, { params }),
  getByProduct: (productId, params) => api.get(`/reviews/product/${productId}`, { params }), // alias used in ProductDetail
  getMyReviews: () => api.get('/reviews/my-reviews'),
  adminGetAll: (params) => api.get('/reviews', { params }),
  adminDelete: (id) => api.delete(`/reviews/${id}`),
  adminToggleVisibility: (id) => api.put(`/reviews/${id}/toggle-visibility`),
};

export const locationAPI = {
  checkPincode: (pincode) => api.get(`/location/check/${pincode}`),
};

export const couponAPI = {
  validate: (data) => api.post('/coupons/validate', data),
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getAllAdmin: () => api.get('/categories/all'),
  getSubcategories: (slug) => api.get(`/categories/${slug}/subcategories`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put('/categories/' + id, data),
  delete: (id) => api.delete('/categories/' + id),
  addType: (id, type) => api.post('/categories/' + id + '/types', { type }),
  removeType: (id, type) => api.delete('/categories/' + id + '/types/' + encodeURIComponent(type)),
  renameType: (id, oldType, newType) => api.put('/categories/' + id + '/types/rename', { oldType, newType }),
};

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSalesReport: (params) => api.get('/admin/reports/sales', { params }),
  // Users
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleUserBlock: (id) => api.put(`/admin/users/${id}/toggle-block`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  // Seller management
  getAllSellers: (params) => api.get('/admin/sellers', { params }),
  getSellerById: (id) => api.get(`/admin/sellers/${id}`),
  updateSellerStatus: (id, data) => api.put(`/admin/sellers/${id}/status`, data),
  updateSellerCommission: (id, data) => api.put(`/admin/sellers/${id}/commission`, data),
  getSellerAnalytics: () => api.get('/admin/sellers/analytics'),
  setDefaultCommission: (data) => api.put('/admin/sellers/default-commission', data),
  // Withdrawal management
  getAllWithdrawals: (params) => api.get('/admin/withdrawals', { params }),
  updateWithdrawal: (id, data) => api.put(`/admin/withdrawals/${id}`, data),
};

export const returnAPI = {
  create: (data) => api.post('/returns', data),
  getMyReturns: () => api.get('/returns/my-returns'),
  adminGetAll: (params) => api.get('/returns', { params }),
  adminGetStats: () => api.get('/returns/stats'),
  adminUpdate: (id, data) => api.put(`/returns/${id}`, data),
  sellerGetReturns: () => sellerApi.get('/returns/seller/returns'),
};

export const bannerAPI = {
  getActive: (params) => api.get('/banners/active', { params }),
  adminGetAll: () => api.get('/banners'),
  adminCreate: (data) => api.post('/banners', data),
  adminUpdate: (id, data) => api.put(`/banners/${id}`, data),
  adminToggle: (id) => api.put(`/banners/${id}/toggle`),
  adminDelete: (id) => api.delete(`/banners/${id}`),
};

export const commissionAPI = {
  getAll: () => api.get('/commissions'),
  setGlobal: (data) => api.post('/commissions/global', data),
  setCategory: (data) => api.post('/commissions/category', data),
  setSeller: (data) => api.post('/commissions/seller', data),
  delete: (id) => api.delete(`/commissions/${id}`),
};

export const notificationAPI = {
  getMy: (params) => api.get('/notifications/my', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  adminSend: (data) => api.post('/notifications', data),
  adminGetAll: (params) => api.get('/notifications/all', { params }),
};

export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getMy: () => api.get('/complaints/my'),
  adminGetAll: (params) => api.get('/complaints', { params }),
  adminUpdate: (id, data) => api.put(`/complaints/${id}`, data),
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data),
};

export const trackingAPI = {
  getOrderTracking: (orderId) => api.get(`/courier/orders/${orderId}/tracking`),
};

// Seller portal API
export const sellerAPI = {
  register: (data) => sellerApi.post('/seller/register', data),
  login: (data) => sellerApi.post('/seller/login', data),
  getMe: () => sellerApi.get('/seller/me'),
  updateShop: (data) => sellerApi.put('/seller/shop', data),
  getProducts: (params) => sellerApi.get('/seller/products', { params }),
  createProduct: (data) => sellerApi.post('/seller/products', data),
  updateProduct: (id, data) => sellerApi.put(`/seller/products/${id}`, data),
  deleteProduct: (id) => sellerApi.delete(`/seller/products/${id}`),
  getOrders: (params) => sellerApi.get('/seller/orders', { params }),
  acceptOrder: (id) => sellerApi.put(`/seller/orders/${id}/accept`),
  rejectOrder: (id, data) => sellerApi.put(`/seller/orders/${id}/reject`, data),
  packOrder: (id) => sellerApi.put(`/seller/orders/${id}/pack`),
  readyForPickup: (id) => sellerApi.put(`/seller/orders/${id}/ready-for-pickup`),
  getOrderInvoice: (id) => sellerApi.get(`/seller/orders/${id}/invoice`),
  getShippingLabel: (id) => sellerApi.get(`/seller/orders/${id}/shipping-label`),
  getEarnings: () => sellerApi.get('/seller/earnings'),
  requestWithdrawal: (data) => sellerApi.post('/seller/withdrawals', data),
  getWithdrawals: () => sellerApi.get('/seller/withdrawals'),
  getPublicShop: (slug) => sellerApi.get(`/seller/shop/${slug}`),
  getDashboardStats: () => sellerApi.get('/seller/dashboard'),
  getReviews: () => sellerApi.get('/reviews/seller/reviews'),
  replyToReview: (id, data) => sellerApi.put(`/reviews/${id}/reply`, data),
  getReturns: () => sellerApi.get('/returns/seller/returns'),
  getNotifications: () => sellerApi.get('/notifications/my'),
};

// Courier portal API
export const courierAPI = {
  register: (data) => courierApi.post('/courier/register', data),
  login: (data) => courierApi.post('/courier/login', data),
  getMe: () => courierApi.get('/courier/me'),
  getOrders: (params) => courierApi.get('/courier/orders', { params }),
  getStats: () => courierApi.get('/courier/stats'),
  updateTracking: (orderId, data) => courierApi.post(`/courier/orders/${orderId}/tracking`, data),
  scanParcel: (data) => courierApi.post('/courier/scan', data),
};

// Admin: courier management
export const adminCourierAPI = {
  getAll: (params) => api.get('/courier/admin/all', { params }),
  updateStatus: (id, data) => api.put(`/courier/admin/${id}/status`, data),
  assignToOrder: (orderId, data) => api.post(`/courier/admin/orders/${orderId}/assign`, data),
};

export default api;
