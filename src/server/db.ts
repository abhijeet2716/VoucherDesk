import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Voucher, AuditLog, VoucherStatus, VoucherFilterQuery } from './types.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'vouchers_db.json');

// Realistic stylized SVG data URLs for seed signatures
export const SAMPLE_EMPLOYEE_SIG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="M 20 60 Q 50 10 70 55 T 120 40 T 170 70 Q 210 20 250 50 Q 270 65 290 55" fill="none" stroke="%231e3a8a" stroke-width="2.5" stroke-linecap="round"/><path d="M 50 75 C 90 70 140 85 240 70" fill="none" stroke="%231e3a8a" stroke-width="1.8" stroke-dasharray="3,3"/><text x="210" y="92" font-family="sans-serif" font-size="10" fill="%2364748b">Alex Morgan</text></svg>';

export const SAMPLE_DIRECTOR_SIG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="100" viewBox="0 0 300 100"><path d="M 30 70 C 40 20 65 15 75 75 Q 110 30 160 35 T 220 70 Q 250 40 280 45" fill="none" stroke="%230f172a" stroke-width="3" stroke-linecap="round"/><path d="M 35 45 Q 120 40 240 45" fill="none" stroke="%230f172a" stroke-width="2"/><text x="180" y="92" font-family="sans-serif" font-size="10" font-weight="bold" fill="%230f172a">David Vance (Director)</text></svg>';

interface DbData {
  users: User[];
  vouchers: Voucher[];
  voucherCounter: number;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

class Database {
  private data: DbData = {
    users: [],
    vouchers: [],
    voucherCounter: 100,
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database, falling back to fresh seed:', err);
      this.seedInitialData();
      this.save();
    }
  }

  private save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving database to disk:', err);
    }
  }

  private seedInitialData() {
    const passwordHash = hashPassword('password123');
    const now = new Date().toISOString();

    const users: User[] = [
      {
        id: 'usr_emp_1',
        name: 'Alex Morgan',
        email: 'alex.morgan@company.com',
        passwordHash,
        role: 'employee',
        employeeId: 'EMP-1042',
        department: 'Engineering',
        defaultSignature: SAMPLE_EMPLOYEE_SIG,
        createdAt: '2026-01-10T09:00:00.000Z',
      },
      {
        id: 'usr_emp_2',
        name: 'Sarah Chen',
        email: 'sarah.chen@company.com',
        passwordHash,
        role: 'employee',
        employeeId: 'EMP-1088',
        department: 'Marketing',
        defaultSignature: SAMPLE_EMPLOYEE_SIG,
        createdAt: '2026-01-15T10:30:00.000Z',
      },
      {
        id: 'usr_dir_1',
        name: 'David Vance',
        email: 'david.vance@company.com',
        passwordHash,
        role: 'director',
        employeeId: 'DIR-0001',
        department: 'Executive Management',
        defaultSignature: SAMPLE_DIRECTOR_SIG,
        createdAt: '2025-11-01T08:00:00.000Z',
      },
      {
        id: 'usr_acc_1',
        name: 'Elena Rostova',
        email: 'elena.rostova@company.com',
        passwordHash,
        role: 'accounts',
        employeeId: 'ACC-0021',
        department: 'Finance & Accounts',
        createdAt: '2025-12-05T09:00:00.000Z',
      },
    ];

    const todayDate = new Date().toISOString().split('T')[0];
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const pastDate = new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0];

    const vouchers: Voucher[] = [
      {
        id: 'vch_001',
        voucherNumber: 'EV-2026-0101',
        userId: 'usr_emp_1',
        employeeName: 'Alex Morgan',
        employeeId: 'EMP-1042',
        department: 'Engineering',
        expenseTitle: 'Cloud Infrastructure & AWS Certification Exam',
        expenseCategory: 'Training & Certifications',
        expenseDescription: 'AWS Certified Solutions Architect Professional examination fee and official study guide voucher.',
        expenseDate: todayDate,
        voucherDate: todayDate,
        amount: 380.00,
        currency: 'USD',
        status: 'draft',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        paymentStatus: 'unpaid',
        createdAt: now,
        updatedAt: now,
        auditLogs: [
          {
            id: 'aud_1',
            voucherId: 'vch_001',
            action: 'CREATED_DRAFT',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            details: 'Created voucher draft for AWS Certification Exam',
            createdAt: now,
          },
        ],
      },
      {
        id: 'vch_002',
        voucherNumber: 'EV-2026-0102',
        userId: 'usr_emp_1',
        employeeName: 'Alex Morgan',
        employeeId: 'EMP-1042',
        department: 'Engineering',
        expenseTitle: 'High-Performance Ergonomic Monitor & Stand',
        expenseCategory: 'Office Supplies',
        expenseDescription: '4K Ultra-wide USB-C monitor and dual articulating arm for remote engineering station per company allowance.',
        expenseDate: yesterdayDate,
        voucherDate: yesterdayDate,
        amount: 549.99,
        currency: 'USD',
        status: 'pending_approval',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        employeeSignatureDate: yesterdayDate + 'T14:20:00.000Z',
        paymentStatus: 'unpaid',
        createdAt: yesterdayDate + 'T11:00:00.000Z',
        updatedAt: yesterdayDate + 'T14:20:00.000Z',
        auditLogs: [
          {
            id: 'aud_2',
            voucherId: 'vch_002',
            action: 'CREATED_DRAFT',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            details: 'Draft voucher created',
            createdAt: yesterdayDate + 'T11:00:00.000Z',
          },
          {
            id: 'aud_3',
            voucherId: 'vch_002',
            action: 'SUBMITTED',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            details: 'Submitted for Director review with signature',
            createdAt: yesterdayDate + 'T14:20:00.000Z',
          },
        ],
      },
      {
        id: 'vch_003',
        voucherNumber: 'EV-2026-0103',
        userId: 'usr_emp_2',
        employeeName: 'Sarah Chen',
        employeeId: 'EMP-1088',
        department: 'Marketing',
        expenseTitle: 'Quarterly Client Strategy Dinner & Catering',
        expenseCategory: 'Meals & Entertainment',
        expenseDescription: 'Dinner meeting with Apex Enterprise stakeholders discussing Q3 software rollout roadmap at The Grand Bistro.',
        expenseDate: todayDate,
        voucherDate: todayDate,
        amount: 320.50,
        currency: 'USD',
        status: 'pending_approval',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        employeeSignatureDate: todayDate + 'T16:00:00.000Z',
        paymentStatus: 'unpaid',
        createdAt: todayDate + 'T15:30:00.000Z',
        updatedAt: todayDate + 'T16:00:00.000Z',
        auditLogs: [
          {
            id: 'aud_4',
            voucherId: 'vch_003',
            action: 'CREATED_DRAFT',
            actorId: 'usr_emp_2',
            actorName: 'Sarah Chen',
            actorRole: 'employee',
            details: 'Created draft voucher for client dinner',
            createdAt: todayDate + 'T15:30:00.000Z',
          },
          {
            id: 'aud_5',
            voucherId: 'vch_003',
            action: 'SUBMITTED',
            actorId: 'usr_emp_2',
            actorName: 'Sarah Chen',
            actorRole: 'employee',
            details: 'Voucher submitted with employee signature',
            createdAt: todayDate + 'T16:00:00.000Z',
          },
        ],
      },
      {
        id: 'vch_004',
        voucherNumber: 'EV-2026-0104',
        userId: 'usr_emp_2',
        employeeName: 'Sarah Chen',
        employeeId: 'EMP-1088',
        department: 'Marketing',
        expenseTitle: 'Flight Tickets - Annual Tech Marketing Expo',
        expenseCategory: 'Travel',
        expenseDescription: 'Round-trip commercial flight tickets for conference presentation and sponsor booth management.',
        expenseDate: pastDate,
        voucherDate: pastDate,
        amount: 860.00,
        currency: 'USD',
        status: 'approved',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        employeeSignatureDate: pastDate + 'T09:15:00.000Z',
        directorSignature: SAMPLE_DIRECTOR_SIG,
        approvalDate: todayDate + 'T10:10:00.000Z',
        approvedById: 'usr_dir_1',
        approvedByName: 'David Vance',
        paymentStatus: 'unpaid',
        createdAt: pastDate + 'T09:00:00.000Z',
        updatedAt: todayDate + 'T10:10:00.000Z',
        auditLogs: [
          {
            id: 'aud_6',
            voucherId: 'vch_004',
            action: 'CREATED_DRAFT',
            actorId: 'usr_emp_2',
            actorName: 'Sarah Chen',
            actorRole: 'employee',
            createdAt: pastDate + 'T09:00:00.000Z',
          },
          {
            id: 'aud_7',
            voucherId: 'vch_004',
            action: 'SUBMITTED',
            actorId: 'usr_emp_2',
            actorName: 'Sarah Chen',
            actorRole: 'employee',
            createdAt: pastDate + 'T09:15:00.000Z',
          },
          {
            id: 'aud_8',
            voucherId: 'vch_004',
            action: 'APPROVED',
            actorId: 'usr_dir_1',
            actorName: 'David Vance',
            actorRole: 'director',
            details: 'Voucher approved with Director digital signature. Queued for reimbursement.',
            createdAt: todayDate + 'T10:10:00.000Z',
          },
        ],
      },
      {
        id: 'vch_005',
        voucherNumber: 'EV-2026-0105',
        userId: 'usr_emp_1',
        employeeName: 'Alex Morgan',
        employeeId: 'EMP-1042',
        department: 'Engineering',
        expenseTitle: 'First Class Taxi Ride from Airport',
        expenseCategory: 'Travel',
        expenseDescription: 'Luxury limousine airport transit after delayed flight.',
        expenseDate: pastDate,
        voucherDate: pastDate,
        amount: 195.00,
        currency: 'USD',
        status: 'rejected',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        employeeSignatureDate: pastDate + 'T16:00:00.000Z',
        rejectionReason: 'Exceeds standard company travel policy per-diem limit. Standard rideshare or airport express shuttle should be booked.',
        approvalDate: todayDate + 'T08:30:00.000Z',
        approvedById: 'usr_dir_1',
        approvedByName: 'David Vance',
        paymentStatus: 'unpaid',
        createdAt: pastDate + 'T15:00:00.000Z',
        updatedAt: todayDate + 'T08:30:00.000Z',
        auditLogs: [
          {
            id: 'aud_9',
            voucherId: 'vch_005',
            action: 'CREATED_DRAFT',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            createdAt: pastDate + 'T15:00:00.000Z',
          },
          {
            id: 'aud_10',
            voucherId: 'vch_005',
            action: 'SUBMITTED',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            createdAt: pastDate + 'T16:00:00.000Z',
          },
          {
            id: 'aud_11',
            voucherId: 'vch_005',
            action: 'REJECTED',
            actorId: 'usr_dir_1',
            actorName: 'David Vance',
            actorRole: 'director',
            details: 'Rejected with policy violation notice: Exceeds standard company travel policy per-diem limit.',
            createdAt: todayDate + 'T08:30:00.000Z',
          },
        ],
      },
      {
        id: 'vch_006',
        voucherNumber: 'EV-2026-0106',
        userId: 'usr_emp_1',
        employeeName: 'Alex Morgan',
        employeeId: 'EMP-1042',
        department: 'Engineering',
        expenseTitle: 'Team JetBrains All Products Software Subscriptions',
        expenseCategory: 'Software & Subscriptions',
        expenseDescription: 'Annual renewal for IDE licenses for core engineering team members.',
        expenseDate: pastDate,
        voucherDate: pastDate,
        amount: 1450.00,
        currency: 'USD',
        status: 'approved',
        employeeSignature: SAMPLE_EMPLOYEE_SIG,
        employeeSignatureDate: pastDate + 'T10:00:00.000Z',
        directorSignature: SAMPLE_DIRECTOR_SIG,
        approvalDate: pastDate + 'T14:00:00.000Z',
        approvedById: 'usr_dir_1',
        approvedByName: 'David Vance',
        paymentStatus: 'reimbursed',
        paymentReference: 'ACH-REIMB-883910',
        paymentDate: todayDate + 'T11:45:00.000Z',
        reimbursedById: 'usr_acc_1',
        reimbursedByName: 'Elena Rostova',
        createdAt: pastDate + 'T09:00:00.000Z',
        updatedAt: todayDate + 'T11:45:00.000Z',
        auditLogs: [
          {
            id: 'aud_12',
            voucherId: 'vch_006',
            action: 'SUBMITTED',
            actorId: 'usr_emp_1',
            actorName: 'Alex Morgan',
            actorRole: 'employee',
            createdAt: pastDate + 'T10:00:00.000Z',
          },
          {
            id: 'aud_13',
            voucherId: 'vch_006',
            action: 'APPROVED',
            actorId: 'usr_dir_1',
            actorName: 'David Vance',
            actorRole: 'director',
            details: 'Approved by Director',
            createdAt: pastDate + 'T14:00:00.000Z',
          },
          {
            id: 'aud_14',
            voucherId: 'vch_006',
            action: 'REIMBURSED',
            actorId: 'usr_acc_1',
            actorName: 'Elena Rostova',
            actorRole: 'accounts',
            details: 'Processed for bank direct deposit. Ref: ACH-REIMB-883910',
            createdAt: todayDate + 'T11:45:00.000Z',
          },
        ],
      },
    ];

    this.data = {
      users,
      vouchers,
      voucherCounter: 106,
    };
  }

  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public getVouchers(user: User, filters: VoucherFilterQuery): { vouchers: Voucher[]; total: number } {
    let list = [...this.data.vouchers];

    // Role boundary: Employees can ONLY see vouchers created by themselves
    if (user.role === 'employee') {
      list = list.filter((v) => v.userId === user.id);
    }
    // Director & Accounts see ALL vouchers in the organization

    // 1. Text search across voucher number, employee name, expense title, description
    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.voucherNumber.toLowerCase().includes(q) ||
          v.employeeName.toLowerCase().includes(q) ||
          v.expenseTitle.toLowerCase().includes(q) ||
          (v.expenseDescription && v.expenseDescription.toLowerCase().includes(q)) ||
          v.department.toLowerCase().includes(q)
      );
    }

    // 2. Specific filter by voucherNumber
    if (filters.voucherNumber && filters.voucherNumber.trim()) {
      const vn = filters.voucherNumber.trim().toLowerCase();
      list = list.filter((v) => v.voucherNumber.toLowerCase().includes(vn));
    }

    // 3. Employee Name filter
    if (filters.employeeName && filters.employeeName.trim()) {
      const en = filters.employeeName.trim().toLowerCase();
      list = list.filter((v) => v.employeeName.toLowerCase().includes(en));
    }

    // 4. Department filter
    if (filters.department && filters.department !== 'all') {
      list = list.filter((v) => v.department.toLowerCase() === filters.department!.toLowerCase());
    }

    // 5. Category filter
    if (filters.category && filters.category !== 'all') {
      list = list.filter((v) => v.expenseCategory.toLowerCase() === filters.category!.toLowerCase());
    }

    // 6. Status filter
    if (filters.status && filters.status !== 'all') {
      list = list.filter((v) => v.status === filters.status);
    }

    // 7. Date Range filter (expenseDate or voucherDate)
    if (filters.dateFrom) {
      list = list.filter((v) => v.expenseDate >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      list = list.filter((v) => v.expenseDate <= filters.dateTo!);
    }

    // 8. Amount Range filter
    if (filters.minAmount !== undefined && filters.minAmount !== '') {
      const min = parseFloat(filters.minAmount);
      if (!isNaN(min)) {
        list = list.filter((v) => v.amount >= min);
      }
    }
    if (filters.maxAmount !== undefined && filters.maxAmount !== '') {
      const max = parseFloat(filters.maxAmount);
      if (!isNaN(max)) {
        list = list.filter((v) => v.amount <= max);
      }
    }

    // 9. Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;

    list.sort((a, b) => {
      let valA: any = (a as any)[sortBy];
      let valB: any = (b as any)[sortBy];

      if (sortBy === 'amount') {
        return (valA - valB) * sortOrder;
      }
      if (typeof valA === 'string' && typeof valB === 'string') {
        return valA.localeCompare(valB) * sortOrder;
      }
      return 0;
    });

    const total = list.length;
    return { vouchers: list, total };
  }

  public getVoucherById(id: string, user: User): Voucher | null {
    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) return null;

    // Role check: Employee can only view their own
    if (user.role === 'employee' && voucher.userId !== user.id) {
      return null;
    }

    return voucher;
  }

  public getDashboardStats(user: User) {
    const today = new Date().toISOString().split('T')[0];

    if (user.role === 'employee') {
      const myVouchers = this.data.vouchers.filter((v) => v.userId === user.id);
      const totalVouchers = myVouchers.length;
      const draftVouchers = myVouchers.filter((v) => v.status === 'draft').length;
      const pendingApproval = myVouchers.filter((v) => v.status === 'pending_approval').length;
      const approvedVouchers = myVouchers.filter((v) => v.status === 'approved').length;
      const rejectedVouchers = myVouchers.filter((v) => v.status === 'rejected').length;
      const totalAmountClaimed = myVouchers
        .filter((v) => v.status !== 'draft')
        .reduce((sum, v) => sum + v.amount, 0);

      const recentVouchers = [...myVouchers]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5);

      return {
        role: 'employee',
        totalVouchers,
        draftVouchers,
        pendingApproval,
        approvedVouchers,
        rejectedVouchers,
        totalAmountClaimed,
        recentVouchers,
      };
    }

    if (user.role === 'director') {
      const all = this.data.vouchers;
      const pendingList = all.filter((v) => v.status === 'pending_approval');
      const pendingApprovalCount = pendingList.length;
      const totalPendingAmount = pendingList.reduce((sum, v) => sum + v.amount, 0);

      const approvedToday = all.filter(
        (v) => v.status === 'approved' && v.approvalDate && v.approvalDate.startsWith(today)
      ).length;

      const rejectedToday = all.filter(
        (v) => v.status === 'rejected' && v.approvalDate && v.approvalDate.startsWith(today)
      ).length;

      const totalVouchers = all.length;
      const totalApprovedAmount = all
        .filter((v) => v.status === 'approved')
        .reduce((sum, v) => sum + v.amount, 0);

      const recentActivity = [...all]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6);

      return {
        role: 'director',
        pendingApprovalCount,
        approvedToday,
        rejectedToday,
        totalPendingAmount,
        totalVouchers,
        totalApprovedAmount,
        recentActivity,
      };
    }

    // Accounts Team
    const all = this.data.vouchers;
    const totalVouchers = all.length;
    const pendingApproval = all.filter((v) => v.status === 'pending_approval').length;
    const approvedVouchers = all.filter((v) => v.status === 'approved').length;
    const rejectedVouchers = all.filter((v) => v.status === 'rejected').length;
    const reimbursedVouchers = all.filter((v) => v.paymentStatus === 'reimbursed').length;

    const totalApprovedExpenseAmount = all
      .filter((v) => v.status === 'approved')
      .reduce((sum, v) => sum + v.amount, 0);

    const totalReimbursedAmount = all
      .filter((v) => v.paymentStatus === 'reimbursed')
      .reduce((sum, v) => sum + v.amount, 0);

    const recentApprovedVouchers = all
      .filter((v) => v.status === 'approved')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);

    return {
      role: 'accounts',
      totalVouchers,
      pendingApproval,
      approvedVouchers,
      rejectedVouchers,
      reimbursedVouchers,
      totalApprovedExpenseAmount,
      totalReimbursedAmount,
      recentApprovedVouchers,
    };
  }

  public createVoucher(
    user: User,
    data: {
      department: string;
      expenseTitle: string;
      expenseCategory: string;
      expenseDescription?: string;
      expenseDate: string;
      amount: number;
      currency?: string;
      employeeSignature?: string;
    }
  ): Voucher {
    if (user.role !== 'employee') {
      throw new Error('Only employees can create expense vouchers');
    }

    // Validation
    if (!data.department || !data.department.trim()) {
      throw new Error('Department is mandatory');
    }
    if (!data.expenseTitle || !data.expenseTitle.trim()) {
      throw new Error('Expense Title is mandatory');
    }
    if (!data.expenseCategory || !data.expenseCategory.trim()) {
      throw new Error('Expense Category is mandatory');
    }
    if (!data.expenseDate) {
      throw new Error('Expense Date is mandatory');
    }
    if (data.amount === undefined || isNaN(data.amount) || data.amount <= 0) {
      throw new Error('Amount is mandatory and must be greater than zero');
    }

    this.data.voucherCounter += 1;
    const pad = String(this.data.voucherCounter).padStart(4, '0');
    const voucherNumber = `EV-2026-${pad}`;

    const now = new Date().toISOString();
    const today = now.split('T')[0];
    const voucherId = 'vch_' + crypto.randomUUID().slice(0, 8);

    const newVoucher: Voucher = {
      id: voucherId,
      voucherNumber,
      userId: user.id,
      employeeName: user.name,
      employeeId: user.employeeId || 'N/A',
      department: data.department.trim(),
      expenseTitle: data.expenseTitle.trim(),
      expenseCategory: data.expenseCategory.trim(),
      expenseDescription: data.expenseDescription ? data.expenseDescription.trim() : '',
      expenseDate: data.expenseDate,
      voucherDate: today,
      amount: parseFloat(Number(data.amount).toFixed(2)),
      currency: data.currency || 'USD',
      status: 'draft',
      employeeSignature: data.employeeSignature || user.defaultSignature || '',
      paymentStatus: 'unpaid',
      createdAt: now,
      updatedAt: now,
      auditLogs: [
        {
          id: 'aud_' + crypto.randomUUID().slice(0, 8),
          voucherId,
          action: 'CREATED_DRAFT',
          actorId: user.id,
          actorName: user.name,
          actorRole: user.role,
          details: `Draft voucher ${voucherNumber} created.`,
          createdAt: now,
        },
      ],
    };

    this.data.vouchers.unshift(newVoucher);
    this.save();
    return newVoucher;
  }

  public updateDraftVoucher(
    user: User,
    id: string,
    data: Partial<{
      department: string;
      expenseTitle: string;
      expenseCategory: string;
      expenseDescription: string;
      expenseDate: string;
      amount: number;
      currency: string;
      employeeSignature: string;
    }>
  ): Voucher {
    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.userId !== user.id) {
      throw new Error('Unauthorized: You can only edit your own vouchers');
    }

    if (voucher.status !== 'draft') {
      throw new Error('Business Rule: Only vouchers in Draft status can be edited');
    }

    if (data.amount !== undefined && (isNaN(data.amount) || data.amount <= 0)) {
      throw new Error('Amount must be greater than zero');
    }

    const now = new Date().toISOString();

    if (data.department) voucher.department = data.department.trim();
    if (data.expenseTitle) voucher.expenseTitle = data.expenseTitle.trim();
    if (data.expenseCategory) voucher.expenseCategory = data.expenseCategory.trim();
    if (data.expenseDescription !== undefined) voucher.expenseDescription = data.expenseDescription.trim();
    if (data.expenseDate) voucher.expenseDate = data.expenseDate;
    if (data.amount !== undefined) voucher.amount = parseFloat(Number(data.amount).toFixed(2));
    if (data.currency) voucher.currency = data.currency;
    if (data.employeeSignature !== undefined) voucher.employeeSignature = data.employeeSignature;

    voucher.updatedAt = now;
    voucher.auditLogs.push({
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      voucherId: voucher.id,
      action: 'UPDATED_DRAFT',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: 'Draft details updated by employee.',
      createdAt: now,
    });

    this.save();
    return voucher;
  }

  public deleteDraftVoucher(user: User, id: string): boolean {
    const index = this.data.vouchers.findIndex((v) => v.id === id);
    if (index === -1) {
      throw new Error('Voucher not found');
    }

    const voucher = this.data.vouchers[index];
    if (voucher.userId !== user.id) {
      throw new Error('Unauthorized: You can only delete your own vouchers');
    }

    if (voucher.status !== 'draft') {
      throw new Error('Business Rule: Only vouchers in Draft status can be deleted');
    }

    this.data.vouchers.splice(index, 1);
    this.save();
    return true;
  }

  public submitVoucher(user: User, id: string, signature?: string): Voucher {
    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.userId !== user.id) {
      throw new Error('Unauthorized: You can only submit your own vouchers');
    }

    if (voucher.status !== 'draft') {
      throw new Error('Only draft vouchers can be submitted for approval');
    }

    // Enforce validations
    if (!voucher.department || !voucher.department.trim()) {
      throw new Error('Department is mandatory');
    }
    if (!voucher.expenseTitle || !voucher.expenseTitle.trim()) {
      throw new Error('Expense Title is mandatory');
    }
    if (!voucher.expenseDate) {
      throw new Error('Expense Date is mandatory');
    }
    if (!voucher.amount || voucher.amount <= 0) {
      throw new Error('Amount is mandatory and must be greater than zero');
    }

    const effectiveSig = signature || voucher.employeeSignature || user.defaultSignature;
    if (!effectiveSig || !effectiveSig.trim()) {
      throw new Error('Validation Error: Employee Signature is mandatory before submission');
    }

    const now = new Date().toISOString();
    voucher.status = 'pending_approval';
    voucher.employeeSignature = effectiveSig;
    voucher.employeeSignatureDate = now;
    voucher.updatedAt = now;

    voucher.auditLogs.push({
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      voucherId: voucher.id,
      action: 'SUBMITTED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: 'Voucher submitted for Director review with verified employee signature.',
      createdAt: now,
    });

    this.save();
    return voucher;
  }

  public approveVoucher(user: User, id: string, directorSignature: string): Voucher {
    if (user.role !== 'director') {
      throw new Error('Unauthorized: Only the Director can approve vouchers');
    }

    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.status !== 'pending_approval') {
      throw new Error(`Cannot approve voucher currently in "${voucher.status}" status. Only Pending Approval vouchers can be approved.`);
    }

    if (!directorSignature || !directorSignature.trim()) {
      throw new Error('Validation Error: Director Signature is mandatory before approval');
    }

    const now = new Date().toISOString();
    voucher.status = 'approved';
    voucher.directorSignature = directorSignature;
    voucher.approvalDate = now;
    voucher.approvedById = user.id;
    voucher.approvedByName = user.name;
    voucher.rejectionReason = undefined;
    voucher.updatedAt = now;

    voucher.auditLogs.push({
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      voucherId: voucher.id,
      action: 'APPROVED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Voucher approved by Director ${user.name}. Transferred to Accounts Team for reimbursement.`,
      createdAt: now,
    });

    this.save();
    return voucher;
  }

  public rejectVoucher(user: User, id: string, rejectionReason: string): Voucher {
    if (user.role !== 'director') {
      throw new Error('Unauthorized: Only the Director can reject vouchers');
    }

    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.status !== 'pending_approval') {
      throw new Error(`Cannot reject voucher currently in "${voucher.status}" status. Only Pending Approval vouchers can be rejected.`);
    }

    if (!rejectionReason || !rejectionReason.trim()) {
      throw new Error('Validation Error: Rejection Reason is mandatory if a voucher is rejected');
    }

    const now = new Date().toISOString();
    voucher.status = 'rejected';
    voucher.rejectionReason = rejectionReason.trim();
    voucher.approvalDate = now;
    voucher.approvedById = user.id;
    voucher.approvedByName = user.name;
    voucher.updatedAt = now;

    voucher.auditLogs.push({
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      voucherId: voucher.id,
      action: 'REJECTED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Voucher rejected. Reason: "${rejectionReason.trim()}"`,
      createdAt: now,
    });

    this.save();
    return voucher;
  }

  public processReimbursement(
    user: User,
    id: string,
    data: { paymentReference: string; paymentStatus?: 'reimbursed' | 'processing' }
  ): Voucher {
    if (user.role !== 'accounts') {
      throw new Error('Unauthorized: Only the Accounts Team can process reimbursements');
    }

    const voucher = this.data.vouchers.find((v) => v.id === id);
    if (!voucher) {
      throw new Error('Voucher not found');
    }

    if (voucher.status !== 'approved') {
      throw new Error('Only approved vouchers can be processed for reimbursement');
    }

    if (!data.paymentReference || !data.paymentReference.trim()) {
      throw new Error('Payment reference or transaction number is mandatory');
    }

    const now = new Date().toISOString();
    voucher.paymentStatus = data.paymentStatus || 'reimbursed';
    voucher.paymentReference = data.paymentReference.trim();
    voucher.paymentDate = now;
    voucher.reimbursedById = user.id;
    voucher.reimbursedByName = user.name;
    voucher.updatedAt = now;

    voucher.auditLogs.push({
      id: 'aud_' + crypto.randomUUID().slice(0, 8),
      voucherId: voucher.id,
      action: 'REIMBURSED',
      actorId: user.id,
      actorName: user.name,
      actorRole: user.role,
      details: `Reimbursement processed: ${voucher.paymentReference} (${voucher.currency} ${voucher.amount})`,
      createdAt: now,
    });

    this.save();
    return voucher;
  }

  public updateUserSignature(userId: string, signature: string): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    user.defaultSignature = signature;
    this.save();
    return user;
  }
}

export const db = new Database();
