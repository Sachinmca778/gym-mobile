export type UserRole = 'SUPER_USER' | 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'TRAINER' | 'MEMBER' | 'GUEST';

export interface RolePermissions {
  // Navigation tabs
  canViewDashboard: boolean;
  canViewMembers: boolean;
  canViewAttendance: boolean;
  canViewPayments: boolean;
  canViewProfile: boolean;

  // Screen access
  canCreateMember: boolean;
  canEditMember: boolean;
  canViewMemberDetails: boolean;
  canAssignMembership: boolean;
  canCreateMembershipPlan: boolean;
  canViewMemberships: boolean;
  canRecordPayment: boolean;
  canViewProgress: boolean;
  canUpdateProgress: boolean;
  canViewTrainers: boolean;
  canManageTrainers: boolean;
  canViewGyms: boolean;
  canManageGyms: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;

  // Data access
  canViewAllMembers: boolean;
  canViewAssignedMembers: boolean;
  canViewOwnData: boolean;
  canViewFinancialReports: boolean;
}

const rolePermissions: Record<UserRole, RolePermissions> = {
  SUPER_USER: {
    // Navigation tabs
    canViewDashboard: true,
    canViewMembers: true,
    canViewAttendance: true,
    canViewPayments: true,
    canViewProfile: true,

    // Screen access
    canCreateMember: true,
    canEditMember: true,
    canViewMemberDetails: true,
    canAssignMembership: true,
    canCreateMembershipPlan: true,
    canViewMemberships: true,
    canRecordPayment: true,
    canViewProgress: true,
    canUpdateProgress: true,
    canViewTrainers: true,
    canManageTrainers: true,
    canViewGyms: true,
    canManageGyms: true,
    canViewReports: true,
    canManageUsers: true,

    // Data access
    canViewAllMembers: true,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: true,
  },

  ADMIN: {
    // Navigation tabs
    canViewDashboard: true,
    canViewMembers: true,
    canViewAttendance: true,
    canViewPayments: true,
    canViewProfile: true,

    // Screen access
    canCreateMember: true,
    canEditMember: true,
    canViewMemberDetails: true,
    canAssignMembership: true,
    canCreateMembershipPlan: true,
    canViewMemberships: true,
    canRecordPayment: true,
    canViewProgress: true,
    canUpdateProgress: true,
    canViewTrainers: true,
    canManageTrainers: true,
    canViewGyms: true,
    canManageGyms: true,
    canViewReports: true,
    canManageUsers: true,

    // Data access
    canViewAllMembers: true,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: true,
  },

  MANAGER: {
    // Navigation tabs
    canViewDashboard: true,
    canViewMembers: true,
    canViewAttendance: true,
    canViewPayments: true,
    canViewProfile: true,

    // Screen access
    canCreateMember: true,
    canEditMember: true,
    canViewMemberDetails: true,
    canAssignMembership: true,
    canCreateMembershipPlan: true,
    canViewMemberships: true,
    canRecordPayment: true,
    canViewProgress: true,
    canUpdateProgress: true,
    canViewTrainers: true,
    canManageTrainers: false,
    canViewGyms: false,
    canManageGyms: false,
    canViewReports: true,
    canManageUsers: false,

    // Data access
    canViewAllMembers: true,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: true,
  },

  RECEPTIONIST: {
    // Navigation tabs
    canViewDashboard: true,
    canViewMembers: true,
    canViewAttendance: true,
    canViewPayments: true,
    canViewProfile: true,

    // Screen access
    canCreateMember: true,
    canEditMember: false,
    canViewMemberDetails: true,
    canAssignMembership: false,
    canCreateMembershipPlan: false,
    canViewMemberships: false,
    canRecordPayment: true,
    canViewProgress: false,
    canUpdateProgress: false,
    canViewTrainers: false,
    canManageTrainers: false,
    canViewGyms: false,
    canManageGyms: false,
    canViewReports: false,
    canManageUsers: false,

    // Data access
    canViewAllMembers: true,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: false,
  },

  TRAINER: {
    // Navigation tabs
    canViewDashboard: true,
    canViewMembers: true,
    canViewAttendance: false,
    canViewPayments: false,
    canViewProfile: true,

    // Screen access
    canCreateMember: false,
    canEditMember: false,
    canViewMemberDetails: true,
    canAssignMembership: false,
    canCreateMembershipPlan: false,
    canViewMemberships: false,
    canRecordPayment: false,
    canViewProgress: true,
    canUpdateProgress: true,
    canViewTrainers: false,
    canManageTrainers: false,
    canViewGyms: false,
    canManageGyms: false,
    canViewReports: false,
    canManageUsers: false,

    // Data access
    canViewAllMembers: false,
    canViewAssignedMembers: true,
    canViewOwnData: true,
    canViewFinancialReports: false,
  },

  MEMBER: {
    // Navigation tabs
    canViewDashboard: false,
    canViewMembers: false,
    canViewAttendance: true,
    canViewPayments: false,
    canViewProfile: true,

    // Screen access
    canCreateMember: false,
    canEditMember: false,
    canViewMemberDetails: false,
    canAssignMembership: false,
    canCreateMembershipPlan: false,
    canViewMemberships: true,
    canRecordPayment: false,
    canViewProgress: true,
    canUpdateProgress: false,
    canViewTrainers: false,
    canManageTrainers: false,
    canViewGyms: false,
    canManageGyms: false,
    canViewReports: false,
    canManageUsers: false,

    // Data access
    canViewAllMembers: false,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: false,
  },

  GUEST: {
    // Navigation tabs
    canViewDashboard: false,
    canViewMembers: false,
    canViewAttendance: true,
    canViewPayments: false,
    canViewProfile: true,

    // Screen access
    canCreateMember: false,
    canEditMember: false,
    canViewMemberDetails: false,
    canAssignMembership: false,
    canCreateMembershipPlan: false,
    canViewMemberships: true,
    canRecordPayment: false,
    canViewProgress: true,
    canUpdateProgress: false,
    canViewTrainers: false,
    canManageTrainers: false,
    canViewGyms: false,
    canManageGyms: false,
    canViewReports: false,
    canManageUsers: false,

    // Data access
    canViewAllMembers: false,
    canViewAssignedMembers: false,
    canViewOwnData: true,
    canViewFinancialReports: false,
  },
};

export const getRolePermissions = (role: string): RolePermissions => {
  const userRole = role as UserRole;
  return rolePermissions[userRole] || rolePermissions.MEMBER;
};

export const hasPermission = (userRole: string, permission: keyof RolePermissions): boolean => {
  const permissions = getRolePermissions(userRole);
  return permissions[permission];
};

export const canAccessScreen = (userRole: string, screenName: string): boolean => {
  const permissions = getRolePermissions(userRole);

  switch (screenName) {
    case 'Dashboard':
      return permissions.canViewDashboard;
    case 'Members':
      return permissions.canViewMembers;
    case 'Attendance':
      return permissions.canViewAttendance;
    case 'Payments':
      return permissions.canViewPayments;
    case 'Profile':
      return permissions.canViewProfile;
    case 'MyPaymentHistory':
      return true;
    case 'Signup':
      return permissions.canManageUsers;
    case 'CreateMember':
      return permissions.canCreateMember;
    case 'MemberDetail':
      return permissions.canViewMemberDetails;
    case 'AssignMembership':
      return permissions.canAssignMembership;
    case 'CreateMembershipPlan':
      return permissions.canCreateMembershipPlan;
    case 'Memberships':
      return permissions.canViewMemberships;
    case 'Progress':
      return permissions.canViewProgress;
    case 'CreatePayment':
      return permissions.canRecordPayment;
    case 'Trainers':
      return permissions.canViewTrainers;
    case 'TrainerDetail':
      return permissions.canViewTrainers;
    case 'CreateTrainer':
      return permissions.canManageTrainers;
    case 'Gyms':
      return permissions.canViewGyms;
    case 'CreateGym':
      return permissions.canManageGyms;
    default:
      return false;
  }
};
