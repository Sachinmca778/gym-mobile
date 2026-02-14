// TypeScript Types for the Gym CRM Mobile App

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accessToken: string;
  refreshToken: string;
  gymId?: number; // Added for gym scoping - null for ADMIN
}

export interface Member {
  id: number;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  address: string;
  city: string;
  state: string;
  pincode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  medicalConditions: string;
  allergies: string;
  fitnessGoals: string;
  profileImage: string;
  gymId: number;
  userId: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'EXPIRED';
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trainer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experienceYears: number;
  hourlyRate: number;
  bio: string;
  location: string;
  certifications: string; // JSON string from backend
  schedule: string; // JSON string from backend
  rating?: number;
  totalRatings?: number;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMonths: number;
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attendance {
  id: number;
  memberId: number;
  checkIn: string;
  checkOut: string;
  method: 'QR' | 'BIOMETRIC' | 'MANUAL';
  notes: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  userId: number;
  memberName?: string;
  membershipId?: number;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'ONLINE' | 'BANK_TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes?: string;
  transactionId?: string;
  paymentDate: string;
  dueDate?: string;
  createdAt: string;
}

export interface PaymentForm {
  userId: number;
  membershipId?: number;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'ONLINE' | 'BANK_TRANSFER';
  transactionId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  paymentDate: string;
  dueDate?: string;
  notes?: string;
}

export interface PaymentSummary {
  currentMonthAmount: number;
  todayRevenue: number;
  totalOverdueAmount: number;
  pendingAmount: number;
}

export interface MemberSearchResult {
  id: number;
  memberCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

export interface UserSearchResult {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
}

export interface MembershipPlanSelect {
  id: number;
  name: string;
  price: number;
  durationMonths: number;
  description: string;
  features: string[];
  isActive: boolean;
}

export interface ProgressTracking {
  id: number;
  memberId: number;
  measurementDate: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
  notes: string;
  createdAt: string;
}

export interface Gym {
  id: number;
  gymCode?: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  totalPaymentsCurrentMonth: number;
  expiringMembersCount: number;
  pendingPayments: number;
  todayAttendance: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  role: string;
  name: string;
  memberId: number;
  gymId?: number; // null for ADMIN, set for other roles
}

export interface RegisterRequest {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  gymId?: number;
}

export interface MemberFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | '';
  
  // Address
  address: string;
  city: string;
  state: string;
  pincode: string;
  
  // Emergency Contact
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  
  // Membership
  membershipType: string;
  startDate: string;
  duration: string;
  amount: string;
  
  // Health Information
  medicalConditions: string;
  allergies: string;
  fitnessGoals: string;
}

// Member Membership Module Types
export interface MemberMembership {
  id: number;
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  amountPaid: number;
  gymId: number;
  status: string;
  autoRenewal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MemberMembershipForm {
  memberId: number;
  planId: number;
  startDate: string;
  endDate: string;
  amountPaid: number;
  autoRenewal: boolean;
}

export interface MemberSearchItem {
  id: number;
  name: string;
  email: string;
  phone: string;
  memberCode: string;
  status: string;
}

export interface GymForm {
  gymCode: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  openingTime: string;
  closingTime: string;
  isActive: boolean;
}

export interface MembershipPlanForm {
  name: string;
  description: string;
  durationMonths: string;
  price: string;
  features: string;
  isActive: boolean;
}



