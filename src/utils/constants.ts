// API Configuration - Connect to your Spring Boot Backend
// For local development, use your computer's IP address for mobile access instead of localhost
// Example: http://192.168.1.100:8082/gym

// IMPORTANT: For Android Emulator, use your computer's IP address, not localhost
// The Android emulator runs in a virtual machine and localhost refers to the emulator itself
// Your current IP: 172.16.106.198
export const API_BASE_URL = 'http://192.168.183.38:8080';
// NEXT_PUBLIC_API_BASE_URL=http://localhost:8082


// Auth Endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: '/gym/auth/login',
  REGISTER: '/gym/auth/register',
  LOGOUT: '/gym/auth/logout',
  REFRESH: '/gym/auth/refresh',
};

// Member Endpoints
export const MEMBER_ENDPOINTS = {
  GET_ALL: '/gym/members/all',
  GET_BY_ID: (id: number) => `/gym/members/${id}`,
};

// Trainer Endpoints
export const TRAINER_ENDPOINTS = {
  GET_ALL: '/gym/trainers',
  GET_ACTIVE: '/gym/trainers/active',
  GET_BY_ID: (id: number) => `/gym/trainers/${id}`,
  CREATE: '/gym/trainers',
  UPDATE: (id: number) => `/gym/trainers/${id}`,
  DELETE: (id: number) => `/gym/trainers/${id}`,
  GET_BY_SPECIALIZATION: (specialization: string) => `/gym/trainers/specialization/${specialization}`,
  GET_TOP_RATED: '/gym/trainers/top-rated',
};

// Membership Endpoints
export const MEMBERSHIP_ENDPOINTS = {
  GET_ALL: '/gym/membership-plans',
  GET_BY_ID: (id: number) => `/gym/membership-plans/${id}`,
  CREATE: '/gym/membership-plans',
  UPDATE: (id: number) => `/gym/membership-plans/${id}`,
  DELETE: (id: number) => `/gym/membership-plans/${id}`,
};

// Attendance Endpoints
export const ATTENDANCE_ENDPOINTS = {
  GET_ALL: '/gym/attendance',
  GET_BY_MEMBER: (memberId: number) => `/gym/attendance/member/${memberId}`,
  CHECK_IN: '/gym/attendance/checkin',
  CHECK_OUT: '/gym/attendance/checkout',
  BY_DATE_RANGE: '/gym/attendance/date-range',
};

// Payment Endpoints
export const PAYMENT_ENDPOINTS = {
  GET_ALL: '/gym/payments',
  GET_BY_ID: (id: number) => `/gym/payments/${id}`,
  GET_BY_MEMBER: (memberId: number) => `/gym/payments/member/${memberId}`,
  CREATE: '/gym/payments',
  UPDATE_STATUS: (id: number) => `/gym/payments/${id}/status`,
};

// Progress Endpoints
export const PROGRESS_ENDPOINTS = {
  GET_ALL: '/gym/progress',
  GET_BY_MEMBER: (memberId: number) => `/gym/progress/member/${memberId}`,
  CREATE: '/gym/progress',
  UPDATE: (id: number) => `/gym/progress/${id}`,
  DELETE: (id: number) => `/gym/progress/${id}`,
};

// Gym Endpoints
export const GYM_ENDPOINTS = {
  GET_ALL: '/gym/gyms/all',
  GET_ACTIVE: '/gym/gyms/active',
  GET_BY_ID: (id: number) => `/gym/gyms/${id}`,
  CREATE: '/gym/gyms/create',
  UPDATE: (id: number) => `/gym/gyms/${id}`,
  DELETE: (id: number) => `/gym/gyms/${id}`,
};

