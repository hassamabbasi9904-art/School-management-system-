import {
  Campus,
  AcademicSession,
  ClassItem,
  SectionItem,
  SubjectItem,
  Student,
  FeeVoucher,
  Book,
  BookSaleSlip,
  Expense,
  ExpenseCategory,
  Income,
  DayBookEntry,
  CashTransaction,
  StaffMember,
  SalaryPayment,
  Exam,
  ExamResult,
  NotificationItem,
  AuditLog,
  SchoolSettings,
  User,
  UserRole,
  PermissionMatrix,
} from '@/types';

export const DEFAULT_PERMISSIONS: Record<UserRole, PermissionMatrix> = {
  'Super Admin': {
    students: { view: true, create: true, edit: true, delete: true, promote: true },
    fees: { view: true, generate: true, collect: true, edit: true, reports: true },
    accounts: { view: true, addExpense: true, addIncome: true, dayBook: true, cashLedger: true },
    academics: { view: true, manageClasses: true, manageSubjects: true, examinations: true },
    books: { view: true, manageStock: true, saleSlip: true },
    staff: { view: true, manage: true, payroll: true },
    reports: { view: true, export: true },
    settings: { view: true, manageCampuses: true, manageUsers: true, rbac: true, auditLogs: true },
  },
  'Admin': {
    students: { view: true, create: true, edit: true, delete: true, promote: true },
    fees: { view: true, generate: true, collect: true, edit: true, reports: true },
    accounts: { view: true, addExpense: true, addIncome: true, dayBook: true, cashLedger: true },
    academics: { view: true, manageClasses: true, manageSubjects: true, examinations: true },
    books: { view: true, manageStock: true, saleSlip: true },
    staff: { view: true, manage: true, payroll: true },
    reports: { view: true, export: true },
    settings: { view: true, manageCampuses: false, manageUsers: true, rbac: false, auditLogs: true },
  },
  'Accountant': {
    students: { view: true, create: false, edit: false, delete: false, promote: false },
    fees: { view: true, generate: true, collect: true, edit: true, reports: true },
    accounts: { view: true, addExpense: true, addIncome: true, dayBook: true, cashLedger: true },
    academics: { view: true, manageClasses: false, manageSubjects: false, examinations: false },
    books: { view: true, manageStock: true, saleSlip: true },
    staff: { view: true, manage: false, payroll: true },
    reports: { view: true, export: true },
    settings: { view: false, manageCampuses: false, manageUsers: false, rbac: false, auditLogs: false },
  },
  'Principal': {
    students: { view: true, create: true, edit: true, delete: false, promote: true },
    fees: { view: true, generate: false, collect: false, edit: false, reports: true },
    accounts: { view: true, addExpense: false, addIncome: false, dayBook: true, cashLedger: true },
    academics: { view: true, manageClasses: true, manageSubjects: true, examinations: true },
    books: { view: true, manageStock: false, saleSlip: false },
    staff: { view: true, manage: true, payroll: false },
    reports: { view: true, export: true },
    settings: { view: true, manageCampuses: false, manageUsers: false, rbac: false, auditLogs: true },
  },
  'Teacher': {
    students: { view: true, create: false, edit: false, delete: false, promote: false },
    fees: { view: false, generate: false, collect: false, edit: false, reports: false },
    accounts: { view: false, addExpense: false, addIncome: false, dayBook: false, cashLedger: false },
    academics: { view: true, manageClasses: false, manageSubjects: false, examinations: true },
    books: { view: true, manageStock: false, saleSlip: false },
    staff: { view: false, manage: false, payroll: false },
    reports: { view: false, export: false },
    settings: { view: false, manageCampuses: false, manageUsers: false, rbac: false, auditLogs: false },
  },
  'Receptionist': {
    students: { view: true, create: true, edit: true, delete: false, promote: false },
    fees: { view: true, generate: false, collect: true, edit: false, reports: false },
    accounts: { view: false, addExpense: false, addIncome: false, dayBook: false, cashLedger: false },
    academics: { view: true, manageClasses: false, manageSubjects: false, examinations: false },
    books: { view: true, manageStock: false, saleSlip: true },
    staff: { view: false, manage: false, payroll: false },
    reports: { view: false, export: false },
    settings: { view: false, manageCampuses: false, manageUsers: false, rbac: false, auditLogs: false },
  },
  'Parent': {
    students: { view: true, create: false, edit: false, delete: false, promote: false },
    fees: { view: true, generate: false, collect: false, edit: false, reports: false },
    accounts: { view: false, addExpense: false, addIncome: false, dayBook: false, cashLedger: false },
    academics: { view: true, manageClasses: false, manageSubjects: false, examinations: true },
    books: { view: false, manageStock: false, saleSlip: false },
    staff: { view: false, manage: false, payroll: false },
    reports: { view: false, export: false },
    settings: { view: false, manageCampuses: false, manageUsers: false, rbac: false, auditLogs: false },
  },
};

interface MemoryStore {
  settings: SchoolSettings;
  users: User[];
  campuses: Campus[];
  academicSessions: AcademicSession[];
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
  students: Student[];
  feeVouchers: FeeVoucher[];
  books: Book[];
  bookSaleSlips: BookSaleSlip[];
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
  incomes: Income[];
  dayBook: DayBookEntry[];
  cashLedger: CashTransaction[];
  staff: StaffMember[];
  salaries: SalaryPayment[];
  exams: Exam[];
  examResults: ExamResult[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

function getInitialStore(): MemoryStore {
  const campuses: Campus[] = [
    {
      id: 'camp-1',
      name: 'Main Campus (Karachi Central)',
      code: 'KC-01',
      address: 'Plot 42, Block 5, Clifton, Karachi',
      phone: '+92 21 3583 4901',
      email: 'main.clifton@educore.edu.pk',
      principalName: 'Prof. Muhammad Tariq Khan',
      status: 'active',
      cashBalance: 485200,
    },
    {
      id: 'camp-2',
      name: 'Gulberg Campus (Lahore)',
      code: 'LHR-02',
      address: '18-C/II, MM Alam Road, Gulberg III, Lahore',
      phone: '+92 42 3575 8890',
      email: 'gulberg@educore.edu.pk',
      principalName: 'Dr. Shahida Parveen',
      status: 'active',
      cashBalance: 312500,
    },
    {
      id: 'camp-3',
      name: 'Capital Campus (Islamabad)',
      code: 'ISB-03',
      address: 'Sector F-8/3, Margalla Road, Islamabad',
      phone: '+91 51 228 1400',
      email: 'islamabad@educore.edu.pk',
      principalName: 'Engr. Farrukh Nadeem',
      status: 'active',
      cashBalance: 198000,
    },
  ];

  const academicSessions: AcademicSession[] = [
    { id: 'sess-1', name: '2025-2026', startDate: '2025-08-01', endDate: '2026-06-30', isCurrent: false },
    { id: 'sess-2', name: '2026-2027', startDate: '2026-08-01', endDate: '2027-06-30', isCurrent: true },
  ];

  const classes: ClassItem[] = [
    { id: 'cls-prep', name: 'Prep / Kindergarten', numericLevel: 0, sections: ['A', 'B'], subjects: ['English Rhymes', 'Basic Urdu', 'Early Math', 'Art & Craft'], monthlyTuitionFee: 4200, campusId: 'all' },
    { id: 'cls-1', name: 'Grade 1', numericLevel: 1, sections: ['A', 'B', 'C'], subjects: ['English', 'Urdu', 'Mathematics', 'General Science', 'Islamiat'], monthlyTuitionFee: 4500, campusId: 'all' },
    { id: 'cls-2', name: 'Grade 2', numericLevel: 2, sections: ['A', 'B'], subjects: ['English', 'Urdu', 'Mathematics', 'General Science', 'Islamiat', 'Social Studies'], monthlyTuitionFee: 4800, campusId: 'all' },
    { id: 'cls-5', name: 'Grade 5', numericLevel: 5, sections: ['A', 'B'], subjects: ['English', 'Urdu', 'Mathematics', 'Science', 'Social Studies', 'Computer', 'Islamiat'], monthlyTuitionFee: 5500, campusId: 'all' },
    { id: 'cls-9', name: 'Grade 9 (Matric/O-Level)', numericLevel: 9, sections: ['Science-A', 'Computer-B'], subjects: ['English Compulsory', 'Urdu Compulsory', 'Mathematics', 'Physics', 'Chemistry', 'Biology / Computer Science', 'Pakistan Studies'], monthlyTuitionFee: 7500, campusId: 'all' },
    { id: 'cls-10', name: 'Grade 10 (Matric/O-Level)', numericLevel: 10, sections: ['Science-A', 'Computer-B'], subjects: ['English Compulsory', 'Urdu Compulsory', 'Mathematics', 'Physics', 'Chemistry', 'Biology / Computer Science', 'Islamiat'], monthlyTuitionFee: 8000, campusId: 'all' },
  ];

  const sections: SectionItem[] = [
    { id: 'sec-1', classId: 'cls-prep', name: 'A (Rose)', classTeacherName: 'Mrs. Hina Salman', roomNumber: 'Room 101', capacity: 30 },
    { id: 'sec-2', classId: 'cls-prep', name: 'B (Tulip)', classTeacherName: 'Ms. Ayesha Siddiqa', roomNumber: 'Room 102', capacity: 30 },
    { id: 'sec-3', classId: 'cls-1', name: 'A', classTeacherName: 'Ms. Sadia Bilal', roomNumber: 'Room 201', capacity: 35 },
    { id: 'sec-4', classId: 'cls-1', name: 'B', classTeacherName: 'Mr. Usman Ghani', roomNumber: 'Room 202', capacity: 35 },
    { id: 'sec-5', classId: 'cls-9', name: 'Science-A', classTeacherName: 'Sir Kamran Haider', roomNumber: 'Lab 1', capacity: 40 },
    { id: 'sec-6', classId: 'cls-10', name: 'Science-A', classTeacherName: 'Sir Zubair Ahmed', roomNumber: 'Lab 2', capacity: 40 },
  ];

  const subjects: SubjectItem[] = [
    { id: 'sub-1', name: 'English', code: 'ENG-101', classId: 'cls-1', totalMarks: 100, passingMarks: 40 },
    { id: 'sub-2', name: 'Mathematics', code: 'MATH-101', classId: 'cls-1', totalMarks: 100, passingMarks: 40 },
    { id: 'sub-3', name: 'General Science', code: 'SCI-101', classId: 'cls-1', totalMarks: 100, passingMarks: 40 },
    { id: 'sub-4', name: 'Urdu', code: 'URD-101', classId: 'cls-1', totalMarks: 100, passingMarks: 40 },
    { id: 'sub-5', name: 'Islamiat', code: 'ISL-101', classId: 'cls-1', totalMarks: 50, passingMarks: 20 },
    { id: 'sub-6', name: 'Physics', code: 'PHY-901', classId: 'cls-9', totalMarks: 100, passingMarks: 33 },
    { id: 'sub-7', name: 'Chemistry', code: 'CHM-901', classId: 'cls-9', totalMarks: 100, passingMarks: 33 },
    { id: 'sub-8', name: 'Mathematics', code: 'MTH-901', classId: 'cls-9', totalMarks: 100, passingMarks: 33 },
  ];

  const students: Student[] = [
    {
      id: 'stu-101',
      registrationNumber: 'REG-2026-001',
      rollNumber: '01',
      name: 'Muhammad Daniyal Khan',
      fatherName: 'Taimoor Khan',
      motherName: 'Zainab Taimoor',
      cnicOrBForm: '42101-7892341-3',
      mobileNumber: '+92 300 2345678',
      emergencyContact: '+92 321 9876543',
      address: 'House 14-B, Street 9, Clifton, Karachi',
      dateOfBirth: '2018-04-12',
      gender: 'Male',
      religion: 'Islam',
      bloodGroup: 'B+',
      admissionDate: '2024-08-10',
      campusId: 'camp-1',
      classId: 'cls-1',
      sectionId: 'sec-3',
      status: 'Active',
      monthlyFee: 4500,
      discountPercentage: 0,
    },
    {
      id: 'stu-102',
      registrationNumber: 'REG-2026-002',
      rollNumber: '02',
      name: 'Fatima Zahra Bukhari',
      fatherName: 'Syed Asad Bukhari',
      motherName: 'Syeda Noor Fatima',
      cnicOrBForm: '42201-1234987-2',
      mobileNumber: '+92 333 4567890',
      address: 'Apartment 4B, Creek Vista, Phase 8, DHA, Karachi',
      dateOfBirth: '2018-09-21',
      gender: 'Female',
      religion: 'Islam',
      bloodGroup: 'O+',
      admissionDate: '2024-08-11',
      campusId: 'camp-1',
      classId: 'cls-1',
      sectionId: 'sec-3',
      status: 'Active',
      monthlyFee: 4500,
      discountPercentage: 10,
    },
    {
      id: 'stu-103',
      registrationNumber: 'REG-2026-003',
      rollNumber: '03',
      name: 'Hamza Farooq',
      fatherName: 'Farooq Azam',
      motherName: 'Nadia Farooq',
      cnicOrBForm: '35202-9843210-7',
      mobileNumber: '+92 312 8765432',
      address: 'House 55, Block J, Gulberg III, Lahore',
      dateOfBirth: '2010-06-14',
      gender: 'Male',
      religion: 'Islam',
      bloodGroup: 'A+',
      admissionDate: '2022-08-01',
      campusId: 'camp-2',
      classId: 'cls-9',
      sectionId: 'sec-5',
      status: 'Active',
      monthlyFee: 7500,
      discountPercentage: 0,
    },
    {
      id: 'stu-104',
      registrationNumber: 'REG-2026-004',
      rollNumber: '04',
      name: 'Ayesha Mehmood',
      fatherName: 'Mehmood Ul Hassan',
      motherName: 'Samina Mehmood',
      cnicOrBForm: '61101-5678901-4',
      mobileNumber: '+92 345 6789012',
      address: 'House 88, Street 12, F-8/3, Islamabad',
      dateOfBirth: '2009-11-03',
      gender: 'Female',
      religion: 'Islam',
      bloodGroup: 'AB+',
      admissionDate: '2021-08-15',
      campusId: 'camp-3',
      classId: 'cls-10',
      sectionId: 'sec-6',
      status: 'Active',
      monthlyFee: 8000,
      discountPercentage: 0,
    },
    {
      id: 'stu-105',
      registrationNumber: 'REG-2026-005',
      rollNumber: '05',
      name: 'Bilal Ahmed Siddiqui',
      fatherName: 'Rashid Siddiqui',
      cnicOrBForm: '42101-8934201-1',
      mobileNumber: '+92 301 9081234',
      address: 'Flat 12, Al-Noor Heights, Gulshan, Karachi',
      dateOfBirth: '2018-02-17',
      gender: 'Male',
      religion: 'Islam',
      bloodGroup: 'O-',
      admissionDate: '2024-09-01',
      campusId: 'camp-1',
      classId: 'cls-1',
      sectionId: 'sec-4',
      status: 'Active',
      monthlyFee: 4500,
      discountPercentage: 0,
    },
    {
      id: 'stu-106',
      registrationNumber: 'REG-2026-006',
      rollNumber: '06',
      name: 'Zainab Imran',
      fatherName: 'Imran Bashir',
      cnicOrBForm: '35201-3456789-6',
      mobileNumber: '+92 322 3456123',
      address: '22 Garden Town, Lahore',
      dateOfBirth: '2011-03-29',
      gender: 'Female',
      religion: 'Islam',
      bloodGroup: 'A-',
      admissionDate: '2023-08-05',
      campusId: 'camp-2',
      classId: 'cls-9',
      sectionId: 'sec-5',
      status: 'Active',
      monthlyFee: 7500,
      discountPercentage: 0,
    },
  ];

  const feeVouchers: FeeVoucher[] = [
    {
      id: 'vch-001',
      voucherNumber: 'VCH-2026-1001',
      studentId: 'stu-101',
      studentName: 'Muhammad Daniyal Khan',
      registrationNumber: 'REG-2026-001',
      classId: 'cls-1',
      className: 'Grade 1',
      sectionName: 'A',
      campusId: 'camp-1',
      month: 'September 2026',
      dueDate: '2026-09-10',
      issueDate: '2026-09-01',
      tuitionFee: 4500,
      annualCharges: 0,
      examFee: 0,
      computerFee: 500,
      transportFee: 2500,
      miscCharges: 200,
      discountAmount: 0,
      fineAmount: 0,
      totalPayable: 7700,
      paidAmount: 7700,
      remainingAmount: 0,
      status: 'Paid',
      paymentDate: '2026-09-07',
      paymentMethod: 'Cash',
      collectedBy: 'Accountant Tariq',
    },
    {
      id: 'vch-002',
      voucherNumber: 'VCH-2026-1002',
      studentId: 'stu-102',
      studentName: 'Fatima Zahra Bukhari',
      registrationNumber: 'REG-2026-002',
      classId: 'cls-1',
      className: 'Grade 1',
      sectionName: 'A',
      campusId: 'camp-1',
      month: 'September 2026',
      dueDate: '2026-09-10',
      issueDate: '2026-09-01',
      tuitionFee: 4500,
      annualCharges: 0,
      examFee: 0,
      computerFee: 500,
      transportFee: 0,
      miscCharges: 0,
      discountAmount: 450, // 10% discount
      fineAmount: 0,
      totalPayable: 4550,
      paidAmount: 4550,
      remainingAmount: 0,
      status: 'Paid',
      paymentDate: '2026-09-05',
      paymentMethod: 'Bank Transfer',
      collectedBy: 'Accountant Tariq',
    },
    {
      id: 'vch-003',
      voucherNumber: 'VCH-2026-1003',
      studentId: 'stu-103',
      studentName: 'Hamza Farooq',
      registrationNumber: 'REG-2026-003',
      classId: 'cls-9',
      className: 'Grade 9 (Matric/O-Level)',
      sectionName: 'Science-A',
      campusId: 'camp-2',
      month: 'September 2026',
      dueDate: '2026-09-10',
      issueDate: '2026-09-01',
      tuitionFee: 7500,
      annualCharges: 0,
      examFee: 1500,
      computerFee: 1000,
      transportFee: 3000,
      miscCharges: 300,
      discountAmount: 0,
      fineAmount: 500,
      totalPayable: 13800,
      paidAmount: 0,
      remainingAmount: 13800,
      status: 'Overdue',
    },
    {
      id: 'vch-004',
      voucherNumber: 'VCH-2026-1004',
      studentId: 'stu-104',
      studentName: 'Ayesha Mehmood',
      registrationNumber: 'REG-2026-004',
      classId: 'cls-10',
      className: 'Grade 10 (Matric/O-Level)',
      sectionName: 'Science-A',
      campusId: 'camp-3',
      month: 'September 2026',
      dueDate: '2026-09-10',
      issueDate: '2026-09-01',
      tuitionFee: 8000,
      annualCharges: 0,
      examFee: 1500,
      computerFee: 1000,
      transportFee: 0,
      miscCharges: 0,
      discountAmount: 0,
      fineAmount: 0,
      totalPayable: 10500,
      paidAmount: 5000,
      remainingAmount: 5500,
      status: 'Partial',
      paymentDate: '2026-09-09',
      paymentMethod: 'Cash',
      collectedBy: 'Accountant Rizwan',
    },
    {
      id: 'vch-005',
      voucherNumber: 'VCH-2026-1005',
      studentId: 'stu-105',
      studentName: 'Bilal Ahmed Siddiqui',
      registrationNumber: 'REG-2026-005',
      classId: 'cls-1',
      className: 'Grade 1',
      sectionName: 'B',
      campusId: 'camp-1',
      month: 'September 2026',
      dueDate: '2026-09-10',
      issueDate: '2026-09-01',
      tuitionFee: 4500,
      annualCharges: 0,
      examFee: 0,
      computerFee: 500,
      transportFee: 0,
      miscCharges: 100,
      discountAmount: 0,
      fineAmount: 400,
      totalPayable: 5500,
      paidAmount: 0,
      remainingAmount: 5500,
      status: 'Overdue',
    },
  ];

  const books: Book[] = [
    { id: 'bk-1', title: 'Oxford Progressive English Book 1', author: 'Rachel Redford', classId: 'cls-1', className: 'Grade 1', category: 'Textbook', isbn: '978-0199060012', stockQuantity: 45, unitPrice: 850, campusId: 'camp-1' },
    { id: 'bk-2', title: 'Countdown Mathematics Book 1 (3rd Edition)', author: 'Shamim Akhtar', classId: 'cls-1', className: 'Grade 1', category: 'Textbook', isbn: '978-0199060029', stockQuantity: 38, unitPrice: 780, campusId: 'camp-1' },
    { id: 'bk-3', title: 'Urdu Guldasta (Champa) Grade 1', author: 'Fauzia Farooq', classId: 'cls-1', className: 'Grade 1', category: 'Textbook', isbn: '978-0199060036', stockQuantity: 50, unitPrice: 620, campusId: 'camp-1' },
    { id: 'bk-4', title: 'Physics for Class IX (Sindh/Punjab Board)', author: 'Dr. M. Akram', classId: 'cls-9', className: 'Grade 9 (Matric/O-Level)', category: 'Textbook', isbn: '978-9694940010', stockQuantity: 28, unitPrice: 950, campusId: 'camp-2' },
    { id: 'bk-5', title: 'Chemistry for Secondary Classes 9 & 10', author: 'Dr. Jalil Ur Rehman', classId: 'cls-9', className: 'Grade 9 (Matric/O-Level)', category: 'Textbook', isbn: '978-9694940027', stockQuantity: 32, unitPrice: 1020, campusId: 'camp-2' },
    { id: 'bk-6', title: 'School Diary & Academic Planner 2026-27', author: 'EduCore Press', classId: 'cls-1', className: 'Grade 1', category: 'Stationery', isbn: 'EDC-2026-DY', stockQuantity: 120, unitPrice: 350, campusId: 'camp-1' },
  ];

  const bookSaleSlips: BookSaleSlip[] = [
    {
      id: 'bs-101',
      slipNumber: 'BKS-2026-041',
      studentId: 'stu-101',
      studentName: 'Muhammad Daniyal Khan',
      registrationNumber: 'REG-2026-001',
      className: 'Grade 1',
      campusId: 'camp-1',
      date: '2026-09-02',
      items: [
        { bookId: 'bk-1', bookTitle: 'Oxford Progressive English Book 1', quantity: 1, unitPrice: 850, total: 850 },
        { bookId: 'bk-2', bookTitle: 'Countdown Mathematics Book 1', quantity: 1, unitPrice: 780, total: 780 },
        { bookId: 'bk-6', bookTitle: 'School Diary 2026-27', quantity: 1, unitPrice: 350, total: 350 },
      ],
      totalAmount: 1980,
      paidAmount: 1980,
      remainingAmount: 0,
      paymentMethod: 'Cash',
      soldBy: 'Librarian Asif',
    },
    {
      id: 'bs-102',
      slipNumber: 'BKS-2026-042',
      studentId: 'stu-103',
      studentName: 'Hamza Farooq',
      registrationNumber: 'REG-2026-003',
      className: 'Grade 9 (Matric/O-Level)',
      campusId: 'camp-2',
      date: '2026-09-03',
      items: [
        { bookId: 'bk-4', bookTitle: 'Physics for Class IX', quantity: 1, unitPrice: 950, total: 950 },
        { bookId: 'bk-5', bookTitle: 'Chemistry for Secondary Classes', quantity: 1, unitPrice: 1020, total: 1020 },
      ],
      totalAmount: 1970,
      paidAmount: 1500,
      remainingAmount: 470,
      paymentMethod: 'Cash',
      soldBy: 'Librarian Shakeel',
    },
  ];

  const expenseCategories: ExpenseCategory[] = [
    { id: 'cat-1', name: 'Salaries', description: 'Faculty and admin staff monthly payroll' },
    { id: 'cat-2', name: 'Electricity', description: 'K-Electric / LESCO bills' },
    { id: 'cat-3', name: 'Gas', description: 'Sui Northern / Southern Gas bills' },
    { id: 'cat-4', name: 'Internet & IT', description: 'Fiber internet connection and server hosting' },
    { id: 'cat-5', name: 'Rent', description: 'Campus building lease and rent payments' },
    { id: 'cat-6', name: 'Maintenance', description: 'Building repairs, painting, AC servicing' },
    { id: 'cat-7', name: 'Transport & Fuel', description: 'School vans diesel, maintenance and driver allowances' },
    { id: 'cat-8', name: 'Stationery & Printing', description: 'Exam sheets, printing cartridges, office stationery' },
    { id: 'cat-9', name: 'Miscellaneous', description: 'Tea, guest refreshment, petty cash' },
  ];

  const expenses: Expense[] = [
    {
      id: 'exp-1',
      voucherNumber: 'EXP-2026-0091',
      date: '2026-09-04',
      categoryId: 'cat-2',
      categoryName: 'Electricity',
      description: 'Monthly K-Electric bill for Clifton Campus Main Wing',
      amount: 68400,
      campusId: 'camp-1',
      paymentMethod: 'Bank Transfer',
      status: 'Approved',
      recordedBy: 'Accountant Tariq',
    },
    {
      id: 'exp-2',
      voucherNumber: 'EXP-2026-0092',
      date: '2026-09-08',
      categoryId: 'cat-7',
      categoryName: 'Transport & Fuel',
      description: 'Diesel fuel refill for 4 school buses',
      amount: 42000,
      campusId: 'camp-1',
      paymentMethod: 'Cash',
      status: 'Approved',
      recordedBy: 'Transport Incharge',
    },
    {
      id: 'exp-3',
      voucherNumber: 'EXP-2026-0093',
      date: '2026-09-12',
      categoryId: 'cat-8',
      categoryName: 'Stationery & Printing',
      description: 'Printed Mid-term exam question papers & answer booklets',
      amount: 18500,
      campusId: 'camp-2',
      paymentMethod: 'Cash',
      status: 'Approved',
      recordedBy: 'Admin Assistant',
    },
    {
      id: 'exp-4',
      voucherNumber: 'EXP-2026-0094',
      date: '2026-09-15',
      categoryId: 'cat-4',
      categoryName: 'Internet & IT',
      description: 'High-speed fiber optic connection & software renewal',
      amount: 14000,
      campusId: 'camp-3',
      paymentMethod: 'Bank Transfer',
      status: 'Approved',
      recordedBy: 'IT Officer',
    },
  ];

  const incomes: Income[] = [
    {
      id: 'inc-1',
      receiptNumber: 'INC-2026-001',
      date: '2026-09-01',
      source: 'Admission Income',
      description: 'New admission processing fees for Grade 1 & Prep (4 candidates)',
      amount: 40000,
      campusId: 'camp-1',
      paymentMethod: 'Cash',
      recordedBy: 'Receptionist Fatima',
    },
    {
      id: 'inc-2',
      receiptNumber: 'INC-2026-002',
      date: '2026-09-10',
      source: 'Transport Income',
      description: 'Monthly student bus route fee collection September',
      amount: 32000,
      campusId: 'camp-2',
      paymentMethod: 'Cash',
      recordedBy: 'Accountant Rizwan',
    },
    {
      id: 'inc-3',
      receiptNumber: 'INC-2026-003',
      date: '2026-09-14',
      source: 'Other Income',
      description: 'Auditorium rental for weekend inter-school debate',
      amount: 25000,
      campusId: 'camp-1',
      paymentMethod: 'Bank Transfer',
      recordedBy: 'Admin Officer',
    },
  ];

  const dayBook: DayBookEntry[] = [
    {
      id: 'db-1',
      date: '2026-09-25',
      campusId: 'camp-1',
      openingBalance: 450000,
      feeCollection: 48500,
      admissionIncome: 10000,
      bookSalesIncome: 3400,
      otherIncome: 5000,
      totalIncome: 66900,
      totalExpense: 31700,
      closingBalance: 485200,
      transactionsCount: 8,
      isReconciled: true,
    },
    {
      id: 'db-2',
      date: '2026-09-26',
      campusId: 'camp-1',
      openingBalance: 485200,
      feeCollection: 28000,
      admissionIncome: 0,
      bookSalesIncome: 1800,
      otherIncome: 0,
      totalIncome: 29800,
      totalExpense: 14200,
      closingBalance: 500800,
      transactionsCount: 5,
      isReconciled: true,
    },
    {
      id: 'db-3',
      date: '2026-09-25',
      campusId: 'camp-2',
      openingBalance: 300000,
      feeCollection: 24000,
      admissionIncome: 5000,
      bookSalesIncome: 2000,
      otherIncome: 0,
      totalIncome: 31000,
      totalExpense: 18500,
      closingBalance: 312500,
      transactionsCount: 6,
      isReconciled: true,
    },
  ];

  const cashLedger: CashTransaction[] = [
    {
      id: 'csh-1',
      date: '2026-09-25',
      time: '09:30 AM',
      type: 'INCOME',
      category: 'Student Fee',
      description: 'Fee collection VCH-2026-1001 for Daniyal Khan',
      referenceNo: 'VCH-2026-1001',
      amount: 7700,
      campusId: 'camp-1',
      balanceAfter: 457700,
      performedBy: 'Accountant Tariq',
    },
    {
      id: 'csh-2',
      date: '2026-09-25',
      time: '11:15 AM',
      type: 'INCOME',
      category: 'Book Sale',
      description: 'Book sale slip BKS-2026-041',
      referenceNo: 'BKS-2026-041',
      amount: 1980,
      campusId: 'camp-1',
      balanceAfter: 459680,
      performedBy: 'Librarian Asif',
    },
    {
      id: 'csh-3',
      date: '2026-09-25',
      time: '02:00 PM',
      type: 'EXPENSE',
      category: 'Transport & Fuel',
      description: 'Van Diesel emergency refuel',
      referenceNo: 'EXP-2026-0092',
      amount: 42000,
      campusId: 'camp-1',
      balanceAfter: 417680,
      performedBy: 'Transport Incharge',
    },
    {
      id: 'csh-4',
      date: '2026-09-26',
      time: '10:00 AM',
      type: 'INCOME',
      category: 'Student Fee',
      description: 'Fee collection VCH-2026-1004 for Ayesha Mehmood',
      referenceNo: 'VCH-2026-1004',
      amount: 5000,
      campusId: 'camp-3',
      balanceAfter: 198000,
      performedBy: 'Accountant Rizwan',
    },
  ];

  const staff: StaffMember[] = [
    {
      id: 'stf-1',
      name: 'Sir Kamran Haider',
      designation: 'Senior Physics Teacher & Section Head',
      staffType: 'Teacher',
      cnic: '42101-5678912-3',
      contact: '+92 300 1122334',
      email: 'kamran.haider@educore.edu.pk',
      joiningDate: '2019-03-01',
      salary: 85000,
      campusId: 'camp-1',
      status: 'Active',
    },
    {
      id: 'stf-2',
      name: 'Ms. Sadia Bilal',
      designation: 'Primary English Teacher',
      staffType: 'Teacher',
      cnic: '42201-9012345-6',
      contact: '+92 321 4455667',
      email: 'sadia.bilal@educore.edu.pk',
      joiningDate: '2021-08-15',
      salary: 55000,
      campusId: 'camp-1',
      status: 'Active',
    },
    {
      id: 'stf-3',
      name: 'Muhammad Tariq',
      designation: 'Senior Accountant & Cashier',
      staffType: 'Accountant',
      cnic: '42101-3456789-1',
      contact: '+92 333 7788990',
      email: 'tariq.accounts@educore.edu.pk',
      joiningDate: '2018-01-10',
      salary: 68000,
      campusId: 'camp-1',
      status: 'Active',
    },
    {
      id: 'stf-4',
      name: 'Fatima Noor',
      designation: 'Front Desk & Admissions Receptionist',
      staffType: 'Receptionist',
      cnic: '42301-7654321-8',
      contact: '+92 345 9988776',
      email: 'reception.clifton@educore.edu.pk',
      joiningDate: '2023-01-05',
      salary: 42000,
      campusId: 'camp-1',
      status: 'Active',
    },
    {
      id: 'stf-5',
      name: 'Muhammad Aslam',
      designation: 'Senior School Bus Driver',
      staffType: 'Driver',
      cnic: '42401-2345678-9',
      contact: '+92 313 5566778',
      joiningDate: '2017-06-01',
      salary: 34000,
      campusId: 'camp-1',
      status: 'Active',
    },
  ];

  const salaries: SalaryPayment[] = [
    {
      id: 'sal-1',
      slipNumber: 'SAL-2026-0801',
      staffId: 'stf-1',
      staffName: 'Sir Kamran Haider',
      designation: 'Senior Physics Teacher',
      month: 'August 2026',
      baseSalary: 85000,
      allowances: 5000,
      deductions: 2000,
      netSalary: 88000,
      paymentDate: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      campusId: 'camp-1',
      paidBy: 'Accountant Tariq',
    },
    {
      id: 'sal-2',
      slipNumber: 'SAL-2026-0802',
      staffId: 'stf-2',
      staffName: 'Ms. Sadia Bilal',
      designation: 'Primary English Teacher',
      month: 'August 2026',
      baseSalary: 55000,
      allowances: 3000,
      deductions: 0,
      netSalary: 58000,
      paymentDate: '2026-09-01',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      campusId: 'camp-1',
      paidBy: 'Accountant Tariq',
    },
  ];

  const exams: Exam[] = [
    {
      id: 'ex-1',
      title: 'First Term Assessment 2026',
      examType: 'First Term',
      session: '2026-2027',
      startDate: '2026-09-15',
      endDate: '2026-09-24',
      campusId: 'all',
      status: 'Completed',
    },
    {
      id: 'ex-2',
      title: 'Mid-Term Examination 2026',
      examType: 'Mid-Term',
      session: '2026-2027',
      startDate: '2026-11-20',
      endDate: '2026-12-05',
      campusId: 'all',
      status: 'Upcoming',
    },
  ];

  const examResults: ExamResult[] = [
    {
      id: 'res-1',
      examId: 'ex-1',
      studentId: 'stu-101',
      studentName: 'Muhammad Daniyal Khan',
      registrationNumber: 'REG-2026-001',
      classId: 'cls-1',
      className: 'Grade 1',
      sectionName: 'A',
      campusId: 'camp-1',
      subjectMarks: [
        { subjectName: 'English', totalMarks: 100, obtainedMarks: 94, grade: 'A+' },
        { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 98, grade: 'A+' },
        { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 91, grade: 'A+' },
        { subjectName: 'Urdu', totalMarks: 100, obtainedMarks: 88, grade: 'A' },
        { subjectName: 'Islamiat', totalMarks: 50, obtainedMarks: 48, grade: 'A+' },
      ],
      totalMarks: 450,
      obtainedMarks: 419,
      percentage: 93.1,
      grade: 'A+',
      gpa: 4.0,
      positionRank: 1,
      remarks: 'Outstanding academic excellence! First Position in Class.',
    },
    {
      id: 'res-2',
      examId: 'ex-1',
      studentId: 'stu-102',
      studentName: 'Fatima Zahra Bukhari',
      registrationNumber: 'REG-2026-002',
      classId: 'cls-1',
      className: 'Grade 1',
      sectionName: 'A',
      campusId: 'camp-1',
      subjectMarks: [
        { subjectName: 'English', totalMarks: 100, obtainedMarks: 92, grade: 'A+' },
        { subjectName: 'Mathematics', totalMarks: 100, obtainedMarks: 90, grade: 'A+' },
        { subjectName: 'General Science', totalMarks: 100, obtainedMarks: 87, grade: 'A' },
        { subjectName: 'Urdu', totalMarks: 100, obtainedMarks: 85, grade: 'A' },
        { subjectName: 'Islamiat', totalMarks: 50, obtainedMarks: 46, grade: 'A+' },
      ],
      totalMarks: 450,
      obtainedMarks: 400,
      percentage: 88.9,
      grade: 'A',
      gpa: 3.8,
      positionRank: 2,
      remarks: 'Very diligent and attentive student. Second Position in Class.',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'notif-1',
      title: 'Fee Due Alert',
      message: 'September 2026 tuition fees are due for 2 students in Grade 1 and 9.',
      type: 'defaulter',
      createdAt: '2026-09-26T09:00:00Z',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'New Admission Registered',
      message: 'Muhammad Daniyal Khan enrolled into Grade 1 (Clifton Campus).',
      type: 'admission',
      createdAt: '2026-09-25T14:30:00Z',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Day Book Reconciled',
      message: 'Closing cash balance for Main Campus reconciled successfully at PKR 500,800.',
      type: 'system',
      createdAt: '2026-09-26T17:00:00Z',
      read: true,
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'aud-1',
      timestamp: '2026-09-27 10:14:02',
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'SYSTEM_LOGIN',
      module: 'Auth',
      details: 'Logged in from management portal workstation',
      status: 'Success',
    },
    {
      id: 'aud-2',
      timestamp: '2026-09-26 14:15:30',
      userName: 'Muhammad Tariq',
      userRole: 'Accountant',
      action: 'FEE_COLLECTION',
      module: 'Fee Management',
      details: 'Collected PKR 7,700 for Voucher VCH-2026-1001',
      status: 'Success',
    },
    {
      id: 'aud-3',
      timestamp: '2026-09-26 11:20:10',
      userName: 'Librarian Asif',
      userRole: 'Admin',
      action: 'BOOK_SALE',
      module: 'Book Management',
      details: 'Generated Sale Slip BKS-2026-041 (Amount: PKR 1,980)',
      status: 'Success',
    },
    {
      id: 'aud-4',
      timestamp: '2026-09-25 15:45:00',
      userName: 'Super Admin',
      userRole: 'Super Admin',
      action: 'EXPENSE_APPROVED',
      module: 'Expense Management',
      details: 'Approved EXP-2026-0091 (K-Electric bill PKR 68,400)',
      status: 'Success',
    },
  ];

  const users: User[] = [
    { id: 'usr-1', name: 'Dr. Zulfiqar Ali', email: 'admin@educore.edu.pk', role: 'Super Admin', campusId: 'all', phone: '+92 300 1234567', status: 'active', createdAt: '2024-01-01' },
    { id: 'usr-2', name: 'Muhammad Tariq', email: 'accountant@educore.edu.pk', role: 'Accountant', campusId: 'camp-1', phone: '+92 333 7788990', status: 'active', createdAt: '2024-02-15' },
    { id: 'usr-3', name: 'Prof. Tariq Khan', email: 'principal@educore.edu.pk', role: 'Principal', campusId: 'camp-1', phone: '+92 21 3583 4901', status: 'active', createdAt: '2024-01-10' },
    { id: 'usr-4', name: 'Sir Kamran Haider', email: 'teacher@educore.edu.pk', role: 'Teacher', campusId: 'camp-1', phone: '+92 300 1122334', status: 'active', createdAt: '2024-03-01' },
    { id: 'usr-5', name: 'Fatima Noor', email: 'reception@educore.edu.pk', role: 'Receptionist', campusId: 'camp-1', phone: '+92 345 9988776', status: 'active', createdAt: '2024-04-01' },
    { id: 'usr-6', name: 'Taimoor Khan (Parent)', email: 'parent@educore.edu.pk', role: 'Parent', campusId: 'camp-1', phone: '+92 300 2345678', status: 'active', createdAt: '2024-08-10' },
  ];

  const settings: SchoolSettings = {
    schoolName: 'EduCore Enterprise Grammar & College',
    tagline: 'Excellence in Character, Academic Rigor & Leadership',
    registrationNo: 'REG/SELD/2026/8941',
    taxNumber: 'NTN: 4192044-8',
    primaryPhone: '+92 21 3583 4900',
    email: 'info@educore.edu.pk',
    website: 'https://educore-enterprise.edu.pk',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    currentSession: '2026-2027',
    address: 'Central Campus Complex, Plot 42, Block 5, Clifton, Karachi, Pakistan',
  };

  return {
    settings,
    users,
    campuses,
    academicSessions,
    classes,
    sections,
    subjects,
    students,
    feeVouchers,
    books,
    bookSaleSlips,
    expenseCategories,
    expenses,
    incomes,
    dayBook,
    cashLedger,
    staff,
    salaries,
    exams,
    examResults,
    notifications,
    auditLogs,
  };
}

// Global singleton memory store
declare global {
  var __SCHOOL_STORE__: MemoryStore | undefined;
}

if (!global.__SCHOOL_STORE__) {
  global.__SCHOOL_STORE__ = getInitialStore();
}

export const store = global.__SCHOOL_STORE__;

/**
 * Automatically update Day Book and Cash Ledger for every financial transaction
 */
export function recordFinancialTransaction({
  type,
  sourceOrCategory,
  description,
  referenceNo,
  amount,
  campusId,
  performedBy,
}: {
  type: 'INCOME' | 'EXPENSE';
  sourceOrCategory: string;
  description: string;
  referenceNo: string;
  amount: number;
  campusId: string;
  performedBy: string;
}) {
  const today = new Date().toISOString().split('T')[0];
  const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // 1. Update Campus Cash Balance
  const campus = store.campuses.find((c) => c.id === campusId);
  if (campus) {
    if (type === 'INCOME') {
      campus.cashBalance += amount;
    } else {
      campus.cashBalance -= amount;
    }
  }

  const currentBalance = campus ? campus.cashBalance : 0;

  // 2. Add to Cash Ledger
  const cashEntry: CashTransaction = {
    id: `csh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: today,
    time,
    type,
    category: sourceOrCategory,
    description,
    referenceNo,
    amount,
    campusId,
    balanceAfter: currentBalance,
    performedBy,
  };
  store.cashLedger.unshift(cashEntry);

  // 3. Update or Create Day Book Entry for today
  let dayBookEntry = store.dayBook.find((d) => d.date === today && d.campusId === campusId);
  if (!dayBookEntry) {
    // Find yesterday's closing or campus balance
    const previousEntry = store.dayBook
      .filter((d) => d.campusId === campusId && d.date < today)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    const openingBalance = previousEntry ? previousEntry.closingBalance : (campus ? campus.cashBalance - (type === 'INCOME' ? amount : -amount) : 0);

    dayBookEntry = {
      id: `db-${Date.now()}`,
      date: today,
      campusId,
      openingBalance,
      feeCollection: 0,
      admissionIncome: 0,
      bookSalesIncome: 0,
      otherIncome: 0,
      totalIncome: 0,
      totalExpense: 0,
      closingBalance: openingBalance,
      transactionsCount: 0,
      isReconciled: true,
    };
    store.dayBook.unshift(dayBookEntry);
  }

  // Update specific Day Book fields
  if (type === 'INCOME') {
    if (sourceOrCategory.toLowerCase().includes('fee')) {
      dayBookEntry.feeCollection += amount;
    } else if (sourceOrCategory.toLowerCase().includes('admission')) {
      dayBookEntry.admissionIncome += amount;
    } else if (sourceOrCategory.toLowerCase().includes('book')) {
      dayBookEntry.bookSalesIncome += amount;
    } else {
      dayBookEntry.otherIncome += amount;
    }
    dayBookEntry.totalIncome += amount;
  } else {
    dayBookEntry.totalExpense += amount;
  }

  // Formula: Closing Balance = Opening Balance + Total Income - Total Expense
  dayBookEntry.closingBalance =
    dayBookEntry.openingBalance + dayBookEntry.totalIncome - dayBookEntry.totalExpense;
  dayBookEntry.transactionsCount += 1;

  // 4. Record Audit Log
  store.auditLogs.unshift({
    id: `aud-${Date.now()}`,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    userName: performedBy,
    userRole: 'System/Accountant',
    action: type === 'INCOME' ? 'FINANCIAL_INCOME_RECORDED' : 'FINANCIAL_EXPENSE_RECORDED',
    module: 'Accounts & Day Book',
    details: `${type}: ${sourceOrCategory} of PKR ${amount.toLocaleString()} (${referenceNo})`,
    status: 'Success',
  });
}
