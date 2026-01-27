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
  certifications: string[];
  schedule: Record<string, string>;
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
  memberId: number;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'ONLINE';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  notes: string;
  transactionId: string;
  paymentDate: string;
  createdAt: string;
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
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  openingTime: string;
  closingTime: string;
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
}

export interface RegisterRequest {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: string;
}

