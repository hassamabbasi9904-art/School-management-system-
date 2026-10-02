import mongoose, { Schema } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Accountant', 'Principal', 'Teacher', 'Receptionist', 'Parent'],
    default: 'Admin',
  },
  campusId: { type: String, default: 'all' },
  phone: { type: String },
  avatar: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

// Campus Schema
const CampusSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  principalName: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  cashBalance: { type: Number, default: 0 },
});

// Academic Session
const AcademicSessionSchema = new Schema({
  name: { type: String, required: true }, // e.g. "2025-2026"
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  isCurrent: { type: Boolean, default: false },
});

// Student Schema
const StudentSchema = new Schema({
  registrationNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, required: true },
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  motherName: { type: String },
  cnicOrBForm: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  emergencyContact: { type: String },
  address: { type: String, required: true },
  dateOfBirth: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  religion: { type: String, default: 'Islam' },
  bloodGroup: { type: String, default: 'O+' },
  admissionDate: { type: String, required: true },
  campusId: { type: String, required: true },
  classId: { type: String, required: true },
  sectionId: { type: String, required: true },
  status: { type: String, enum: ['Active', 'Inactive', 'Transferred', 'Graduated', 'Left'], default: 'Active' },
  monthlyFee: { type: Number, required: true },
  discountPercentage: { type: Number, default: 0 },
  avatarUrl: { type: String },
  parentEmail: { type: String },
  notes: { type: String },
  leavingDate: { type: String },
  leavingReason: { type: String },
});

// Class Schema
const ClassSchema = new Schema({
  name: { type: String, required: true },
  numericLevel: { type: Number, required: true },
  sections: [{ type: String }],
  subjects: [{ type: String }],
  monthlyTuitionFee: { type: Number, default: 4500 },
  campusId: { type: String, default: 'all' },
});

// Section Schema
const SectionSchema = new Schema({
  classId: { type: String, required: true },
  name: { type: String, required: true },
  classTeacherName: { type: String },
  roomNumber: { type: String },
  capacity: { type: Number, default: 40 },
});

// Subject Schema
const SubjectSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  classId: { type: String, required: true },
  totalMarks: { type: Number, default: 100 },
  passingMarks: { type: Number, default: 40 },
});

// Fee Structure Schema
const FeeStructureSchema = new Schema({
  campusId: { type: String, required: true },
  classId: { type: String, required: true },
  admissionFee: { type: Number, default: 10000 },
  monthlyTuitionFee: { type: Number, default: 5000 },
  annualCharges: { type: Number, default: 6000 },
  examFee: { type: Number, default: 1500 },
  computerFee: { type: Number, default: 1000 },
  transportFee: { type: Number, default: 3500 },
  miscCharges: { type: Number, default: 500 },
});

// Fee Voucher Schema
const FeeVoucherSchema = new Schema({
  voucherNumber: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  classId: { type: String, required: true },
  className: { type: String, required: true },
  sectionName: { type: String, required: true },
  campusId: { type: String, required: true },
  month: { type: String, required: true },
  dueDate: { type: String, required: true },
  issueDate: { type: String, required: true },
  tuitionFee: { type: Number, default: 0 },
  annualCharges: { type: Number, default: 0 },
  examFee: { type: Number, default: 0 },
  computerFee: { type: Number, default: 0 },
  transportFee: { type: Number, default: 0 },
  miscCharges: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  fineAmount: { type: Number, default: 0 },
  totalPayable: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  remainingAmount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid', 'Partial', 'Overdue'], default: 'Unpaid' },
  paymentDate: { type: String },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque', 'Online'] },
  collectedBy: { type: String },
});

// Book Schema
const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  classId: { type: String, required: true },
  className: { type: String, required: true },
  category: { type: String, enum: ['Textbook', 'Exercise Book', 'Guide', 'Stationery', 'Reference'], default: 'Textbook' },
  isbn: { type: String, required: true },
  stockQuantity: { type: Number, default: 0 },
  unitPrice: { type: Number, required: true },
  campusId: { type: String, required: true },
});

// Book Sale Slip Schema
const BookSaleSlipSchema = new Schema({
  slipNumber: { type: String, required: true, unique: true },
  studentId: { type: String },
  studentName: { type: String, required: true },
  registrationNumber: { type: String },
  className: { type: String, required: true },
  campusId: { type: String, required: true },
  date: { type: String, required: true },
  items: [
    {
      bookId: { type: String, required: true },
      bookTitle: { type: String, required: true },
      quantity: { type: Number, required: true },
      unitPrice: { type: Number, required: true },
      total: { type: Number, required: true },
    },
  ],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, required: true },
  remainingAmount: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'Cash' },
  soldBy: { type: String, required: true },
});

// Expense Category Schema
const ExpenseCategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

// Expense Schema
const ExpenseSchema = new Schema({
  voucherNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  campusId: { type: String, required: true },
  paymentMethod: { type: String, enum: ['Cash', 'Bank Transfer', 'Cheque'], default: 'Cash' },
  status: { type: String, enum: ['Approved', 'Pending', 'Rejected'], default: 'Approved' },
  recordedBy: { type: String, required: true },
});

// Income Schema
const IncomeSchema = new Schema({
  receiptNumber: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  source: {
    type: String,
    enum: ['Student Fee', 'Admission Income', 'Book Sales', 'Transport Income', 'Other Income'],
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  campusId: { type: String, required: true },
  paymentMethod: { type: String, default: 'Cash' },
  recordedBy: { type: String, required: true },
});

// Day Book Schema
const DayBookSchema = new Schema({
  date: { type: String, required: true },
  campusId: { type: String, required: true },
  openingBalance: { type: Number, default: 0 },
  feeCollection: { type: Number, default: 0 },
  admissionIncome: { type: Number, default: 0 },
  bookSalesIncome: { type: Number, default: 0 },
  otherIncome: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
  closingBalance: { type: Number, default: 0 },
  transactionsCount: { type: Number, default: 0 },
  isReconciled: { type: Boolean, default: true },
});

// Cash Ledger Schema
const CashLedgerSchema = new Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  referenceNo: { type: String, required: true },
  amount: { type: Number, required: true },
  campusId: { type: String, required: true },
  balanceAfter: { type: Number, required: true },
  performedBy: { type: String, required: true },
});

// Staff Schema
const StaffSchema = new Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  staffType: {
    type: String,
    enum: ['Teacher', 'Accountant', 'Receptionist', 'Driver', 'Peon', 'Admin Staff'],
    required: true,
  },
  cnic: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String },
  joiningDate: { type: String, required: true },
  salary: { type: Number, required: true },
  campusId: { type: String, required: true },
  status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Terminated'], default: 'Active' },
});

// Salary Schema
const SalarySchema = new Schema({
  slipNumber: { type: String, required: true, unique: true },
  staffId: { type: String, required: true },
  staffName: { type: String, required: true },
  designation: { type: String, required: true },
  month: { type: String, required: true },
  baseSalary: { type: Number, required: true },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netSalary: { type: Number, required: true },
  paymentDate: { type: String, required: true },
  paymentMethod: { type: String, default: 'Bank Transfer' },
  status: { type: String, enum: ['Paid', 'Pending'], default: 'Paid' },
  campusId: { type: String, required: true },
  paidBy: { type: String, required: true },
});

// Exam Schema
const ExamSchema = new Schema({
  title: { type: String, required: true },
  examType: { type: String, enum: ['Mid-Term', 'Final Exam', 'Monthly Test', 'First Term'], required: true },
  session: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  campusId: { type: String, default: 'all' },
  status: { type: String, enum: ['Upcoming', 'Ongoing', 'Completed', 'Published'], default: 'Published' },
});

// Exam Result Schema
const ExamResultSchema = new Schema({
  examId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  classId: { type: String, required: true },
  className: { type: String, required: true },
  sectionName: { type: String, required: true },
  campusId: { type: String, required: true },
  subjectMarks: [
    {
      subjectName: { type: String, required: true },
      totalMarks: { type: Number, required: true },
      obtainedMarks: { type: Number, required: true },
      grade: { type: String, required: true },
    },
  ],
  totalMarks: { type: Number, required: true },
  obtainedMarks: { type: Number, required: true },
  percentage: { type: Number, required: true },
  grade: { type: String, required: true },
  gpa: { type: Number, required: true },
  positionRank: { type: Number },
  remarks: { type: String, default: 'Good performance' },
});

// Notification Schema
const NotificationSchema = new Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['fee', 'defaulter', 'admission', 'system'], default: 'system' },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
  recipientRole: { type: String },
});

// Audit Log Schema
const AuditLogSchema = new Schema({
  timestamp: { type: Date, default: Date.now },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  action: { type: String, required: true },
  module: { type: String, required: true },
  details: { type: String, required: true },
  ipAddress: { type: String, default: '127.0.0.1' },
  status: { type: String, enum: ['Success', 'Warning', 'Error'], default: 'Success' },
});

// Model instantiations
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const CampusModel = mongoose.models.Campus || mongoose.model('Campus', CampusSchema);
export const AcademicSessionModel = mongoose.models.AcademicSession || mongoose.model('AcademicSession', AcademicSessionSchema);
export const StudentModel = mongoose.models.Student || mongoose.model('Student', StudentSchema);
export const ClassModel = mongoose.models.Class || mongoose.model('Class', ClassSchema);
export const SectionModel = mongoose.models.Section || mongoose.model('Section', SectionSchema);
export const SubjectModel = mongoose.models.Subject || mongoose.model('Subject', SubjectSchema);
export const FeeStructureModel = mongoose.models.FeeStructure || mongoose.model('FeeStructure', FeeStructureSchema);
export const FeeVoucherModel = mongoose.models.FeeVoucher || mongoose.model('FeeVoucher', FeeVoucherSchema);
export const BookModel = mongoose.models.Book || mongoose.model('Book', BookSchema);
export const BookSaleSlipModel = mongoose.models.BookSaleSlip || mongoose.model('BookSaleSlip', BookSaleSlipSchema);
export const ExpenseCategoryModel = mongoose.models.ExpenseCategory || mongoose.model('ExpenseCategory', ExpenseCategorySchema);
export const ExpenseModel = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);
export const IncomeModel = mongoose.models.Income || mongoose.model('Income', IncomeSchema);
export const DayBookModel = mongoose.models.DayBook || mongoose.model('DayBook', DayBookSchema);
export const CashLedgerModel = mongoose.models.CashLedger || mongoose.model('CashLedger', CashLedgerSchema);
export const StaffModel = mongoose.models.Staff || mongoose.model('Staff', StaffSchema);
export const SalaryModel = mongoose.models.Salary || mongoose.model('Salary', SalarySchema);
export const ExamModel = mongoose.models.Exam || mongoose.model('Exam', ExamSchema);
export const ExamResultModel = mongoose.models.ExamResult || mongoose.model('ExamResult', ExamResultSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema);
