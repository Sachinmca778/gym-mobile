export type RootStackParamList = {
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
  Dashboard: undefined;
  Members: undefined;
  MemberDetail: { memberId: number };
  CreateMember: undefined;
  AssignMembership: undefined;
  CreateMembershipPlan: undefined;
  Attendance: undefined;
  Memberships: undefined;
  Progress: undefined;
  Payments: undefined;
  CreatePayment: undefined;
  Profile: undefined;
  Gyms: undefined;
  CreateGym: { gymId?: number };
  Trainers: undefined;
  TrainerDetail: { trainerId: number };
  CreateTrainer: { trainer?: any };
  MyPaymentHistory: undefined;
  Settings: undefined;
};



export type BottomTabParamList = {
  Dashboard: undefined;
  Members: undefined;
  Attendance: undefined;
  Payments: undefined;
  Profile: undefined;
  Signup: undefined;
};

