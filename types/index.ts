export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Accountant'
  | 'Principal'
  | 'Teacher'
  | 'Receptionist'
  | 'Parent';

export interface PermissionMatrix {
  students: { view: boolean; create: boolean; edit: boolean; delete: boolean; promote: boolean };
  fees: { view: boolean; generate: boolean; collect: boolean; edit: boolean; reports: boolean };
  accounts: { view: boolean; addExpense: boolean; addIncome: boolean; dayBook: boolean; cashLedger: boolean };
  academics: { view: boolean; manageClasses: boolean; manageSubjects: boolean; examinations: boolean };
  books: { view: boolean; manageStock: boolean; saleSlip: boolean };
  staff: { view: boolean; manage: boolean; payroll: boolean };
  reports: { view: boolean; export: boolean };
  settings: { view: boolean; manageCampuses: boolean; manageUsers: boolean; rbac: boolean; auditLogs: boolean };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  campusId?: string; // 'all' or specific campus id
  phone?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Campus {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName?: string;
  status: 'active' | 'inactive';
  cashBalance: number;
}

export interface AcademicSession {
  id: string;
  name: string; // e.g. "2025-2026"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "Grade 1", "Grade 10", "Prep"
  numericLevel: number;
  sections: string[]; // ['A', 'B']
  subjects: string[];
  monthlyTuitionFee: number;
  campusId: string;
}

export interface SectionItem {
  id: string;
  classId: string;
  name: string; // "A", "B", "Green", etc.
  classTeacherName?: string;
  roomNumber?: string;
  capacity: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  classId: string;
  totalMarks: number;
  passingMarks: number;
}

export interface Student {
  id: string;
  registrationNumber: string; // e.g. "REG-2026-001"
  rollNumber: string;
  name: string;
  fatherName: string;
  motherName?: string;
  cnicOrBForm: string;
  mobileNumber: string;
  emergencyContact?: string;
  address: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  religion: string;
  bloodGroup: string;
  admissionDate: string;
  campusId: string;
  classId: string;
  sectionId: string;
  status: 'Active' | 'Inactive' | 'Transferred' | 'Graduated' | 'Left';
  monthlyFee: number;
  discountPercentage?: number;
  avatarUrl?: string;
  parentEmail?: string;
  notes?: string;
  leavingDate?: string;
  leavingReason?: string;
}

export interface FeeStructure {
  id: string;
  campusId: string;
  classId: string;
  admissionFee: number;
  monthlyTuitionFee: number;
  annualCharges: number;
  examFee: number;
  computerFee: number;
  transportFee: number;
  miscCharges: number;
}

export interface FeeVoucher {
  id: string;
  voucherNumber: string; // e.g. "VCH-2026-001"
  studentId: string;
  studentName: string;
  registrationNumber: string;
  classId: string;
  className: string;
  sectionName: string;
  campusId: string;
  month: string; // "October 2026"
  dueDate: string;
  issueDate: string;
  tuitionFee: number;
  annualCharges: number;
  examFee: number;
  computerFee: number;
  transportFee: number;
  miscCharges: number;
  discountAmount: number;
  fineAmount: number;
  totalPayable: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Paid' | 'Unpaid' | 'Partial' | 'Overdue';
  paymentDate?: string;
  paymentMethod?: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Online';
  collectedBy?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  classId: string;
  className: string;
  category: 'Textbook' | 'Exercise Book' | 'Guide' | 'Stationery' | 'Reference';
  isbn: string;
  stockQuantity: number;
  unitPrice: number;
  campusId: string;
}

export interface BookSaleItem {
  bookId: string;
  bookTitle: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BookSaleSlip {
  id: string;
  slipNumber: string;
  studentId?: string;
  studentName: string;
  registrationNumber?: string;
  className: string;
  campusId: string;
  date: string;
  items: BookSaleItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer';
  soldBy: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Expense {
  id: string;
  voucherNumber: string;
  date: string;
  categoryId: string;
  categoryName: string;
  description: string;
  amount: number;
  campusId: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque';
  status: 'Approved' | 'Pending' | 'Rejected';
  recordedBy: string;
}

export interface Income {
  id: string;
  receiptNumber: string;
  date: string;
  source: 'Student Fee' | 'Admission Income' | 'Book Sales' | 'Transport Income' | 'Other Income';
  description: string;
  amount: number;
  campusId: string;
  paymentMethod: 'Cash' | 'Bank Transfer';
  recordedBy: string;
}

export interface DayBookEntry {
  id: string;
  date: string; // YYYY-MM-DD
  campusId: string;
  openingBalance: number;
  feeCollection: number;
  admissionIncome: number;
  bookSalesIncome: number;
  otherIncome: number;
  totalIncome: number;
  totalExpense: number;
  closingBalance: number;
  transactionsCount: number;
  isReconciled: boolean;
}

export interface CashTransaction {
  id: string;
  date: string;
  time: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  description: string;
  referenceNo: string;
  amount: number;
  campusId: string;
  balanceAfter: number;
  performedBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  designation: string;
  staffType: 'Teacher' | 'Accountant' | 'Receptionist' | 'Driver' | 'Peon' | 'Admin Staff';
  cnic: string;
  contact: string;
  email?: string;
  joiningDate: string;
  salary: number;
  campusId: string;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
}

export interface SalaryPayment {
  id: string;
  slipNumber: string;
  staffId: string;
  staffName: string;
  designation: string;
  month: string; // e.g. "September 2026"
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer';
  status: 'Paid' | 'Pending';
  campusId: string;
  paidBy: string;
}

export interface Exam {
  id: string;
  title: string; // e.g. "Mid-Term Examination 2026"
  examType: 'Mid-Term' | 'Final Exam' | 'Monthly Test' | 'First Term';
  session: string;
  startDate: string;
  endDate: string;
  campusId: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Published';
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  registrationNumber: string;
  classId: string;
  className: string;
  sectionName: string;
  campusId: string;
  subjectMarks: {
    subjectName: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
  }[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  positionRank?: number;
  remarks: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'fee' | 'defaulter' | 'admission' | 'system';
  createdAt: string;
  read: boolean;
  recipientRole?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface SchoolSettings {
  schoolName: string;
  tagline: string;
  registrationNo: string;
  taxNumber: string;
  primaryPhone: string;
  email: string;
  website: string;
  currency: string;
  currencySymbol: string;
  logoUrl?: string;
  currentSession: string;
  address: string;
}
