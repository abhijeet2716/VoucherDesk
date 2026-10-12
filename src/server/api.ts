import { Router, Response } from 'express';
import { db, hashPassword } from './db.js';
import { authenticateToken, authorizeRole, generateToken, AuthRequest } from './auth.js';
import { VoucherFilterQuery } from './types.js';

export const apiRouter = Router();

// ==========================================
// AUTHENTICATION APIs
// ==========================================

// 1. Get demo user profiles for convenient switcher
apiRouter.get('/auth/demo-users', (_req, res: Response) => {
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    department: u.department,
    employeeId: u.employeeId,
  }));
  res.json({ users });
});

// 2. Direct login by email & password
apiRouter.post('/auth/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }

    const hashedInput = hashPassword(password);
    if (user.passwordHash !== hashedInput) {
      res.status(401).json({ error: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        defaultSignature: user.defaultSignature,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal login error' });
  }
});

// 3. Quick Switch Demo Account
apiRouter.post('/auth/switch-demo', (req, res: Response) => {
  try {
    const { role, email } = req.body;
    let targetUser = email ? db.getUserByEmail(email) : null;

    if (!targetUser && role) {
      targetUser = db.getUsers().find((u) => u.role === role);
    }

    if (!targetUser) {
      res.status(404).json({ error: 'Demo user not found' });
      return;
    }

    const token = generateToken(targetUser);
    res.json({
      token,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        department: targetUser.department,
        employeeId: targetUser.employeeId,
        defaultSignature: targetUser.defaultSignature,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to switch demo user' });
  }
});

// 4. Get Current User info
apiRouter.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      employeeId: user.employeeId,
      defaultSignature: user.defaultSignature,
    },
  });
});

// 5. Update user default signature
apiRouter.put('/auth/signature', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { signature } = req.body;
    if (!signature) {
      res.status(400).json({ error: 'Signature data is required' });
      return;
    }
    const updated = db.updateUserSignature(req.user!.id, signature);
    res.json({
      message: 'Signature updated successfully',
      defaultSignature: updated.defaultSignature,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// VOUCHER MANAGEMENT APIs
// ==========================================

// 1. Dashboard summary stats
apiRouter.get('/vouchers/dashboard', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const stats = db.getDashboardStats(req.user!);
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. List Vouchers with Search, Filter & Sort
apiRouter.get('/vouchers', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const query = req.query as VoucherFilterQuery;
    const result = db.getVouchers(req.user!, query);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Voucher Details by ID
apiRouter.get('/vouchers/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const voucher = db.getVoucherById(id, req.user!);
    if (!voucher) {
      res.status(404).json({
        error: 'Voucher not found or you are not authorized to view this voucher.',
      });
      return;
    }
    res.json({ voucher });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Create New Voucher (Employee only)
apiRouter.post(
  '/vouchers',
  authenticateToken,
  authorizeRole('employee'),
  (req: AuthRequest, res: Response) => {
    try {
      const {
        department,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        expenseDate,
        amount,
        currency,
        employeeSignature,
      } = req.body;

      const newVoucher = db.createVoucher(req.user!, {
        department,
        expenseTitle,
        expenseCategory,
        expenseDescription,
        expenseDate,
        amount: Number(amount),
        currency,
        employeeSignature,
      });

      res.status(201).json({
        message: 'Draft voucher created successfully',
        voucher: newVoucher,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 5. Update Draft Voucher (Employee only, Draft status only)
apiRouter.put(
  '/vouchers/:id',
  authenticateToken,
  authorizeRole('employee'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const updated = db.updateDraftVoucher(req.user!, id, req.body);
      res.json({
        message: 'Draft voucher updated successfully',
        voucher: updated,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 6. Delete Draft Voucher (Employee only, Draft status only)
apiRouter.delete(
  '/vouchers/:id',
  authenticateToken,
  authorizeRole('employee'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      db.deleteDraftVoucher(req.user!, id);
      res.json({ message: 'Draft voucher deleted successfully' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 7. Submit Voucher for Approval (Employee only, Signature mandatory)
apiRouter.post(
  '/vouchers/:id/submit',
  authenticateToken,
  authorizeRole('employee'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { signature } = req.body;
      const submitted = db.submitVoucher(req.user!, id, signature);
      res.json({
        message: 'Voucher successfully submitted for Director approval',
        voucher: submitted,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 8. Approve Voucher (Director only, Signature mandatory)
apiRouter.post(
  '/vouchers/:id/approve',
  authenticateToken,
  authorizeRole('director'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { directorSignature } = req.body;
      const approved = db.approveVoucher(req.user!, id, directorSignature);
      res.json({
        message: 'Voucher approved and queued for Accounts reimbursement',
        voucher: approved,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 9. Reject Voucher (Director only, Rejection Reason mandatory)
apiRouter.post(
  '/vouchers/:id/reject',
  authenticateToken,
  authorizeRole('director'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const rejected = db.rejectVoucher(req.user!, id, rejectionReason);
      res.json({
        message: 'Voucher rejected with remarks recorded',
        voucher: rejected,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 10. Process Reimbursement (Accounts Team only)
apiRouter.post(
  '/vouchers/:id/reimburse',
  authenticateToken,
  authorizeRole('accounts'),
  (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { paymentReference, paymentStatus } = req.body;
      const processed = db.processReimbursement(req.user!, id, {
        paymentReference,
        paymentStatus,
      });
      res.json({
        message: 'Reimbursement payment processed successfully',
        voucher: processed,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
);

// 11. Generic signature image upload endpoint
apiRouter.post('/upload-signature', authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const { imageData } = req.body;
    if (!imageData || typeof imageData !== 'string') {
      res.status(400).json({ error: 'Valid image data (base64 or URL) is required' });
      return;
    }

    // Validate that it looks like an image or data URL
    if (!imageData.startsWith('data:image/') && !imageData.startsWith('http')) {
      res.status(400).json({ error: 'Uploaded file must be a valid image format' });
      return;
    }

    res.json({
      success: true,
      signatureUrl: imageData,
      message: 'Signature uploaded successfully',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
