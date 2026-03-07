// Smart Drive System — Data Layer (localStorage)
const SDS_DB = {
  USERS: 'sds_users',
  VEHICLES: 'sds_vehicles',
  BOOKINGS: 'sds_bookings',
  PAYMENTS: 'sds_payments',
  GATE_LOGS: 'sds_gate_logs',
  INCIDENTS: 'sds_incidents',
  REPORTS: 'sds_reports',
  PROGRESS_RECORDS: 'sds_progress_records',
  INSTRUCTOR_SCHEDULES: 'sds_instructor_schedules',

  getAll(entity) {
    return JSON.parse(localStorage.getItem(entity) || '[]');
  },

  getById(entity, id) {
    return this.getAll(entity).find(r => r.id === id) || null;
  },

  saveAll(entity, records) {
    localStorage.setItem(entity, JSON.stringify(records));
  },

  create(entity, record) {
    const records = this.getAll(entity);
    const newId = records.length > 0 ? Math.max(...records.map(r => r.id)) + 1 : 1;
    const newRecord = { ...record, id: newId, createdAt: new Date().toISOString() };
    records.push(newRecord);
    this.saveAll(entity, records);
    return newRecord;
  },

  update(entity, id, updates) {
    const records = this.getAll(entity);
    const idx = records.findIndex(r => r.id === id);
    if (idx !== -1) {
      records[idx] = { ...records[idx], ...updates, updatedAt: new Date().toISOString() };
      this.saveAll(entity, records);
      return records[idx];
    }
    return null;
  },

  delete(entity, id) {
    const records = this.getAll(entity).filter(r => r.id !== id);
    this.saveAll(entity, records);
  },

  query(entity, predicate) {
    return this.getAll(entity).filter(predicate);
  },

  init() {
    if (localStorage.getItem('sds_initialized')) return;

    const now = new Date().toISOString();

    // Seed users
    const users = [
      { id: 1, name: 'Admin User',    email: 'admin@smartdrive.com',      password: 'admin123', role: 'admin',      status: 'active', phone: '555-0001', createdAt: now },
      { id: 2, name: 'John Smith',    email: 'instructor@smartdrive.com',  password: 'pass123',  role: 'instructor', status: 'active', phone: '555-0002', licenseNo: 'INS-001', createdAt: now },
      { id: 3, name: 'Alice Johnson', email: 'instructor2@smartdrive.com', password: 'pass123',  role: 'instructor', status: 'active', phone: '555-0003', licenseNo: 'INS-002', createdAt: now },
      { id: 4, name: 'Jane Staff',    email: 'staff@smartdrive.com',       password: 'pass123',  role: 'staff',      status: 'active', phone: '555-0004', createdAt: now },
      { id: 5, name: 'Bob Driver',    email: 'student@smartdrive.com',     password: 'pass123',  role: 'student',    status: 'active', phone: '555-0005', createdAt: now }
    ];
    localStorage.setItem(this.USERS, JSON.stringify(users));

    // Seed vehicles
    const vehicles = [
      { id: 1, plate: 'ABC-001', model: 'Toyota Corolla', year: 2022, status: 'available',    color: 'White',  createdAt: now },
      { id: 2, plate: 'DEF-002', model: 'Honda Civic',    year: 2021, status: 'available',    color: 'Blue',   createdAt: now },
      { id: 3, plate: 'GHI-003', model: 'Nissan Sentra',  year: 2023, status: 'maintenance', color: 'Silver', createdAt: now }
    ];
    localStorage.setItem(this.VEHICLES, JSON.stringify(vehicles));

    // Seed instructor schedules (next 7 days)
    const today = new Date();
    const schedules = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      schedules.push({ id: i * 2 + 1, instructorId: 2, date: dateStr, timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00'], createdAt: now });
      schedules.push({ id: i * 2 + 2, instructorId: 3, date: dateStr, timeSlots: ['09:00', '11:00', '13:00', '15:00', '16:00'], createdAt: now });
    }
    localStorage.setItem(this.INSTRUCTOR_SCHEDULES, JSON.stringify(schedules));

    // Seed sample bookings
    const d1 = new Date(today); d1.setDate(today.getDate() + 1);
    const d2 = new Date(today); d2.setDate(today.getDate() + 3);
    const bookings = [
      { id: 1, studentId: 5, instructorId: 2, vehicleId: 1, date: d1.toISOString().split('T')[0], time: '09:00', status: 'confirmed', paymentStatus: 'paid',    notes: 'First lesson',    createdAt: now },
      { id: 2, studentId: 5, instructorId: 3, vehicleId: 2, date: d2.toISOString().split('T')[0], time: '11:00', status: 'pending',   paymentStatus: 'pending', notes: 'Highway practice', createdAt: now }
    ];
    localStorage.setItem(this.BOOKINGS, JSON.stringify(bookings));

    // Seed sample payments
    const payments = [
      { id: 1, bookingId: 1, studentId: 5, amount: 50, status: 'approved', proofFile: '', submittedDate: now, createdAt: now },
      { id: 2, bookingId: 2, studentId: 5, amount: 50, status: 'pending',  proofFile: '', submittedDate: now, createdAt: now }
    ];
    localStorage.setItem(this.PAYMENTS, JSON.stringify(payments));

    // Seed sample progress records
    const progress = [
      { id: 1, studentId: 5, instructorId: 2, bookingId: 1, performance: 'Good', notes: 'Smooth steering, needs work on parallel parking', date: d1.toISOString().split('T')[0], createdAt: now }
    ];
    localStorage.setItem(this.PROGRESS_RECORDS, JSON.stringify(progress));

    localStorage.setItem('sds_initialized', 'true');
  }
};

// Authentication utilities
const SDS_AUTH = {
  login(email, password) {
    const users = SDS_DB.getAll(SDS_DB.USERS);
    const user = users.find(u => u.email === email && u.password === password && u.status === 'active');
    if (user) {
      sessionStorage.setItem('sds_current_user', JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout() {
    sessionStorage.removeItem('sds_current_user');
    window.location.href = 'index.html';
  },

  getCurrentUser() {
    const raw = sessionStorage.getItem('sds_current_user');
    return raw ? JSON.parse(raw) : null;
  },

  requireAuth(role) {
    const user = this.getCurrentUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (role && user.role !== role) { window.location.href = 'index.html'; return null; }
    return user;
  },

  refreshCurrentUser() {
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = SDS_DB.getById(SDS_DB.USERS, current.id);
    if (updated) sessionStorage.setItem('sds_current_user', JSON.stringify(updated));
    return updated;
  }
};

// UI helper utilities
const SDS_UI = {
  showToast(message, type = 'success') {
    let toast = document.getElementById('sds-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'sds-toast';
      document.body.appendChild(toast);
    }
    toast.className = 'sds-toast sds-toast-' + type;
    toast.textContent = message;
    toast.style.display = 'block';
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => { toast.style.display = 'none'; }, 3500);
  },

  formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  statusBadge(status) {
    const map = {
      active: 'badge-success', inactive: 'badge-danger', pending: 'badge-warning',
      confirmed: 'badge-success', cancelled: 'badge-danger', rescheduled: 'badge-info',
      approved: 'badge-success', rejected: 'badge-danger', paid: 'badge-success',
      available: 'badge-success', maintenance: 'badge-warning', 'in-use': 'badge-info',
      open: 'badge-warning', resolved: 'badge-success', completed: 'badge-success'
    };
    const cls = map[status] || 'badge-secondary';
    return `<span class="badge ${cls}">${status.charAt(0).toUpperCase() + status.slice(1)}</span>`;
  }
};

// Initialize DB on script load
SDS_DB.init();
