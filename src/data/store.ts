// In-memory data store (simulates a database for Cloudflare Workers)
// In production, replace with Cloudflare D1 / KV

// ============ INTERFACES ============

export interface Society {
  id: string;
  code: string; // Unique 6-char code e.g. "GRN001"
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  towers: number;
  totalFlats: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gst?: string;
  pan?: string;
  documents: string[];
  status: 'pending' | 'verified' | 'approved' | 'rejected' | 'suspended';
  adminId?: string; // Society Admin user id
  inviteLink?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  plan: 'starter' | 'professional' | 'enterprise';
  subscriptionExpiry?: string;
  stats?: {
    residents: number;
    visitors: number;
    complaints: number;
  };
}

export interface SocietyRegistration {
  id: string;
  societyName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  towers: number;
  totalFlats: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gst?: string;
  pan?: string;
  message?: string;
  status: 'new' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface SuperAdmin {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'superadmin';
  createdAt: string;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'admin' | 'guard' | 'resident';
  societyId: string;
  flatId?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Flat {
  id: string;
  societyId: string;
  flatNo: string;
  floor: number;
  block: string;
  area: number;
  type: string;
  status: 'occupied' | 'vacant';
  ownerId?: string;
  tenantId?: string;
  residents: string[];
  vehicles: Vehicle[];
  createdAt: string;
}

export interface Vehicle {
  type: 'car' | 'bike' | 'other';
  number: string;
  model: string;
}

export interface Visitor {
  id: string;
  societyId: string;
  name: string;
  phone: string;
  purpose: string;
  flatId: string;
  flatNo: string;
  residentName: string;
  status: 'pending' | 'approved' | 'rejected' | 'exited';
  entryTime?: string;
  exitTime?: string;
  guardId?: string;
  photo?: string;
  isPreApproved: boolean;
  approvedBy?: string;
  createdAt: string;
  vehicleNo?: string;
}

export interface Complaint {
  id: string;
  societyId: string;
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'security' | 'cleaning' | 'parking' | 'lift' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  flatId: string;
  flatNo: string;
  residentId: string;
  residentName: string;
  assignedTo?: string;
  comments: ComplaintComment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface ComplaintComment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  role: string;
  createdAt: string;
}

export interface Notice {
  id: string;
  societyId: string;
  title: string;
  content: string;
  category: 'general' | 'maintenance' | 'emergency' | 'event' | 'finance';
  priority: 'normal' | 'important' | 'urgent';
  authorId: string;
  authorName: string;
  attachments: string[];
  acknowledgedBy: string[];
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface Bill {
  id: string;
  societyId: string;
  flatId: string;
  flatNo: string;
  residentId: string;
  residentName: string;
  month: string;
  year: number;
  maintenanceAmount: number;
  waterCharges: number;
  parkingCharges: number;
  penalty: number;
  totalAmount: number;
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  role: string;
  societyId?: string;
  expiresAt: number;
}

// ============ SEED DATA ============

// Super Admin
export const superAdmins: SuperAdmin[] = [
  {
    id: 'sa1',
    name: 'Vikash Agarwal',
    email: 'superadmin@societyos.com',
    password: 'super@123',
    role: 'superadmin',
    createdAt: '2024-01-01T00:00:00Z',
    isActive: true
  }
];

// Societies
export const societies: Society[] = [
  {
    id: 'soc1',
    code: 'GRN001',
    name: 'Greenwood Heights CHS',
    address: '42, Sector 12, Kharghar',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    pincode: '410210',
    towers: 3,
    totalFlats: 120,
    contactName: 'Rajesh Sharma',
    contactEmail: 'admin@greenwood.com',
    contactPhone: '9876543210',
    documents: [],
    status: 'approved',
    adminId: 'u1',
    inviteLink: 'https://societyos.com/join/GRN001',
    createdAt: '2024-01-01T00:00:00Z',
    approvedAt: '2024-01-02T00:00:00Z',
    approvedBy: 'sa1',
    plan: 'professional',
    subscriptionExpiry: '2025-01-01T00:00:00Z',
    stats: { residents: 6, visitors: 7, complaints: 5 }
  },
  {
    id: 'soc2',
    code: 'SRY002',
    name: 'Sunrise Valley Apartments',
    address: '7, Rose Garden Lane, Wakad',
    city: 'Pune',
    state: 'Maharashtra',
    pincode: '411057',
    towers: 2,
    totalFlats: 64,
    contactName: 'Anand Kulkarni',
    contactEmail: 'admin@sunrise.com',
    contactPhone: '9812345678',
    documents: [],
    status: 'approved',
    adminId: 'u10',
    inviteLink: 'https://societyos.com/join/SRY002',
    createdAt: '2024-02-10T00:00:00Z',
    approvedAt: '2024-02-12T00:00:00Z',
    approvedBy: 'sa1',
    plan: 'starter',
    subscriptionExpiry: '2025-02-01T00:00:00Z',
    stats: { residents: 12, visitors: 3, complaints: 2 }
  },
  {
    id: 'soc3',
    code: 'PKV003',
    name: 'Park View Residency',
    address: '15, Park Street, Koramangala',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560034',
    towers: 4,
    totalFlats: 200,
    contactName: 'Suresh Reddy',
    contactEmail: 'admin@parkview.com',
    contactPhone: '9900112233',
    documents: [],
    status: 'verified',
    inviteLink: '',
    createdAt: '2024-03-01T00:00:00Z',
    plan: 'enterprise',
    stats: { residents: 0, visitors: 0, complaints: 0 }
  },
  {
    id: 'soc4',
    code: 'BLU004',
    name: 'Blue Bell Towers',
    address: '8, MG Road, Salt Lake',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700091',
    towers: 2,
    totalFlats: 48,
    contactName: 'Prashant Bose',
    contactEmail: 'prashant@bluebell.com',
    contactPhone: '9433221100',
    documents: [],
    status: 'pending',
    inviteLink: '',
    createdAt: '2024-04-10T00:00:00Z',
    plan: 'starter',
    stats: { residents: 0, visitors: 0, complaints: 0 }
  }
];

// Society Registration Leads
export const societyRegistrations: SocietyRegistration[] = [
  {
    id: 'reg1',
    societyName: 'Silver Oak Enclave',
    address: '22, Sector 56, Gurgaon',
    city: 'Gurgaon',
    state: 'Haryana',
    pincode: '122011',
    towers: 3,
    totalFlats: 90,
    contactName: 'Ravi Taneja',
    contactEmail: 'ravi@silveroak.com',
    contactPhone: '9711223344',
    message: 'We are a 5 year old society looking to digitize our management.',
    status: 'new',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'reg2',
    societyName: 'Lotus Garden Phase 2',
    address: '3, Lotus Lane, Bopal',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380058',
    towers: 5,
    totalFlats: 180,
    contactName: 'Chintan Shah',
    contactEmail: 'chintan@lotus.com',
    contactPhone: '9825443322',
    message: 'Large society with urgent need for visitor management.',
    status: 'under_review',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'sa1'
  },
  {
    id: 'reg3',
    societyName: 'Royal Palms',
    address: '101, Palm Avenue, Juhu',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400049',
    towers: 2,
    totalFlats: 36,
    contactName: 'Deepak Mehta',
    contactEmail: 'deepak@royalpalms.com',
    contactPhone: '9820334455',
    status: 'approved',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    reviewedBy: 'sa1'
  }
];

// Users scoped to societies
export const users: User[] = [
  // Greenwood Heights (soc1)
  { id: 'u1', name: 'Rajesh Sharma', email: 'admin@greenwood.com', phone: '9876543210', password: 'admin123', role: 'admin', societyId: 'soc1', createdAt: '2024-01-01T00:00:00Z', isActive: true },
  { id: 'u2', name: 'Ravi Kumar', email: 'guard@greenwood.com', phone: '9876543211', password: 'guard123', role: 'guard', societyId: 'soc1', createdAt: '2024-01-02T00:00:00Z', isActive: true },
  { id: 'u3', name: 'Priya Mehta', email: 'priya@greenwood.com', phone: '9876543212', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f1', createdAt: '2024-01-03T00:00:00Z', isActive: true },
  { id: 'u4', name: 'Arjun Nair', email: 'arjun@greenwood.com', phone: '9876543213', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f2', createdAt: '2024-01-04T00:00:00Z', isActive: true },
  { id: 'u5', name: 'Sunita Patel', email: 'sunita@greenwood.com', phone: '9876543214', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f3', createdAt: '2024-01-05T00:00:00Z', isActive: true },
  { id: 'u6', name: 'Vikram Singh', email: 'vikram@greenwood.com', phone: '9876543215', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f4', createdAt: '2024-01-06T00:00:00Z', isActive: true },
  { id: 'u7', name: 'Deepa Krishnan', email: 'deepa@greenwood.com', phone: '9876543216', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f5', createdAt: '2024-01-07T00:00:00Z', isActive: true },
  { id: 'u8', name: 'Mohan Rao', email: 'mohan@greenwood.com', phone: '9876543217', password: 'resident123', role: 'resident', societyId: 'soc1', flatId: 'f6', createdAt: '2024-01-08T00:00:00Z', isActive: true },
  // Sunrise Valley (soc2)
  { id: 'u10', name: 'Anand Kulkarni', email: 'admin@sunrise.com', phone: '9812345678', password: 'admin123', role: 'admin', societyId: 'soc2', createdAt: '2024-02-12T00:00:00Z', isActive: true },
  { id: 'u11', name: 'Ramesh Joshi', email: 'guard@sunrise.com', phone: '9812345679', password: 'guard123', role: 'guard', societyId: 'soc2', createdAt: '2024-02-13T00:00:00Z', isActive: true },
];

export const flats: Flat[] = [
  { id: 'f1', societyId: 'soc1', flatNo: 'A-101', floor: 1, block: 'A', area: 850, type: '2BHK', status: 'occupied', ownerId: 'u3', residents: ['u3'], vehicles: [{ type: 'car', number: 'MH12AB1234', model: 'Honda City' }], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f2', societyId: 'soc1', flatNo: 'A-102', floor: 1, block: 'A', area: 1100, type: '3BHK', status: 'occupied', ownerId: 'u4', residents: ['u4'], vehicles: [{ type: 'car', number: 'MH12CD5678', model: 'Toyota Innova' }, { type: 'bike', number: 'MH12EF9012', model: 'Royal Enfield' }], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f3', societyId: 'soc1', flatNo: 'A-201', floor: 2, block: 'A', area: 750, type: '2BHK', status: 'occupied', ownerId: 'u5', residents: ['u5'], vehicles: [{ type: 'bike', number: 'MH12GH3456', model: 'Honda Activa' }], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f4', societyId: 'soc1', flatNo: 'B-101', floor: 1, block: 'B', area: 1200, type: '3BHK', status: 'occupied', ownerId: 'u6', residents: ['u6'], vehicles: [{ type: 'car', number: 'MH12IJ7890', model: 'Hyundai Creta' }], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f5', societyId: 'soc1', flatNo: 'B-201', floor: 2, block: 'B', area: 850, type: '2BHK', status: 'occupied', ownerId: 'u7', residents: ['u7'], vehicles: [], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f6', societyId: 'soc1', flatNo: 'B-202', floor: 2, block: 'B', area: 650, type: '1BHK', status: 'occupied', ownerId: 'u8', residents: ['u8'], vehicles: [{ type: 'bike', number: 'MH12KL1234', model: 'TVS Jupiter' }], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f7', societyId: 'soc1', flatNo: 'C-101', floor: 1, block: 'C', area: 1100, type: '3BHK', status: 'vacant', residents: [], vehicles: [], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'f8', societyId: 'soc1', flatNo: 'C-201', floor: 2, block: 'C', area: 850, type: '2BHK', status: 'vacant', residents: [], vehicles: [], createdAt: '2024-01-01T00:00:00Z' },
];

export const visitors: Visitor[] = [
  { id: 'v1', societyId: 'soc1', name: 'Suresh Gupta', phone: '9988776655', purpose: 'Personal Visit', flatId: 'f1', flatNo: 'A-101', residentName: 'Priya Mehta', status: 'approved', entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), guardId: 'u2', isPreApproved: false, approvedBy: 'u3', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString() },
  { id: 'v2', societyId: 'soc1', name: 'Anita Desai', phone: '9977665544', purpose: 'Delivery', flatId: 'f2', flatNo: 'A-102', residentName: 'Arjun Nair', status: 'exited', entryTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), exitTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), guardId: 'u2', isPreApproved: true, createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
  { id: 'v3', societyId: 'soc1', name: 'Ramesh Joshi', phone: '9966554433', purpose: 'Plumber', flatId: 'f3', flatNo: 'A-201', residentName: 'Sunita Patel', status: 'pending', guardId: 'u2', isPreApproved: false, createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: 'v4', societyId: 'soc1', name: 'Kavya Reddy', phone: '9955443322', purpose: 'Personal Visit', flatId: 'f4', flatNo: 'B-101', residentName: 'Vikram Singh', status: 'rejected', guardId: 'u2', isPreApproved: false, createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString() },
  { id: 'v5', societyId: 'soc1', name: 'Nitin Shah', phone: '9944332211', purpose: 'Courier', flatId: 'f1', flatNo: 'A-101', residentName: 'Priya Mehta', status: 'approved', entryTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), guardId: 'u2', isPreApproved: true, createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString() },
  { id: 'v6', societyId: 'soc1', name: 'Pooja Iyer', phone: '9933221100', purpose: 'Maid', flatId: 'f5', flatNo: 'B-201', residentName: 'Deepa Krishnan', status: 'approved', entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), guardId: 'u2', isPreApproved: true, createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 'v7', societyId: 'soc1', name: 'Arun Pillai', phone: '9922110099', purpose: 'Electrician', flatId: 'f6', flatNo: 'B-202', residentName: 'Mohan Rao', status: 'pending', guardId: 'u2', isPreApproved: false, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
];

export const complaints: Complaint[] = [
  { id: 'c1', societyId: 'soc1', title: 'Water leakage in bathroom', description: 'There is a water leakage from the bathroom ceiling. Water is dripping continuously causing damage to the floor.', category: 'plumbing', status: 'in_progress', priority: 'high', flatId: 'f1', flatNo: 'A-101', residentId: 'u3', residentName: 'Priya Mehta', assignedTo: 'Maintenance Team', comments: [{ id: 'cc1', text: 'We have logged your complaint and assigned it to our plumbing team.', authorId: 'u1', authorName: 'Rajesh Sharma', role: 'admin', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() }, { id: 'cc2', text: 'Plumber visited and identified the issue. Will be fixed by tomorrow.', authorId: 'u1', authorName: 'Rajesh Sharma', role: 'admin', createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }], createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'c2', societyId: 'soc1', title: 'Street light not working near parking', description: 'The street light near the parking area B has been non-functional for the past week. Creates safety concerns at night.', category: 'electrical', status: 'open', priority: 'medium', flatId: 'f4', flatNo: 'B-101', residentId: 'u6', residentName: 'Vikram Singh', comments: [], createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'c3', societyId: 'soc1', title: 'Unauthorized parking in slot 23', description: 'Someone has been repeatedly parking in my allocated slot no. 23 near block A. Request strict action.', category: 'parking', status: 'resolved', priority: 'medium', flatId: 'f2', flatNo: 'A-102', residentId: 'u4', residentName: 'Arjun Nair', assignedTo: 'Security Team', comments: [{ id: 'cc3', text: 'Security team has been informed. CCTV footage will be reviewed.', authorId: 'u1', authorName: 'Rajesh Sharma', role: 'admin', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }], createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'c4', societyId: 'soc1', title: 'Lift not working in Block B', description: 'The lift in Block B has been out of service since morning. Elderly residents are facing difficulties.', category: 'lift', status: 'in_progress', priority: 'high', flatId: 'f5', flatNo: 'B-201', residentId: 'u7', residentName: 'Deepa Krishnan', assignedTo: 'Lift Maintenance', comments: [{ id: 'cc5', text: 'Lift technician has been called. ETA 2 hours.', authorId: 'u1', authorName: 'Rajesh Sharma', role: 'admin', createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() }], createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
  { id: 'c5', societyId: 'soc1', title: 'Garbage not collected for 3 days', description: 'The garbage from our floor has not been collected for the past 3 days. It is causing bad smell and hygiene issues.', category: 'cleaning', status: 'open', priority: 'medium', flatId: 'f3', flatNo: 'A-201', residentId: 'u5', residentName: 'Sunita Patel', comments: [], createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

export const notices: Notice[] = [
  { id: 'n1', societyId: 'soc1', title: 'Annual General Body Meeting - April 2024', content: `Dear Residents,\n\nThis is to inform all residents that the Annual General Body Meeting (AGM) of Greenwood Heights Housing Society will be held on:\n\n📅 Date: Sunday, 28th April 2024\n⏰ Time: 11:00 AM\n📍 Venue: Community Hall, Ground Floor\n\nAgenda:\n1. Review of Annual Accounts\n2. Election of New Committee Members\n3. Maintenance Charges Revision\n4. Society Infrastructure Upgrades\n5. Open House - Resident Suggestions\n\nAttendance of at least one member per flat is mandatory.\n\nRegards,\nSociety Committee`, category: 'general', priority: 'important', authorId: 'u1', authorName: 'Rajesh Sharma', attachments: [], acknowledgedBy: ['u3', 'u4'], isActive: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n2', societyId: 'soc1', title: 'Water Supply Interruption - 20th April', content: `Dear Residents,\n\nPlease note that due to scheduled maintenance work on the water pipeline, water supply will be interrupted:\n\n⏰ Time: 10:00 AM to 2:00 PM\n📅 Date: 20th April 2024\n\nAffected areas: All blocks (A, B, C)\n\nWater tankers will be arranged during this period. Please store sufficient water in advance.\n\nWe regret the inconvenience caused.\n\nRegards,\nMaintenance Team`, category: 'maintenance', priority: 'urgent', authorId: 'u1', authorName: 'Rajesh Sharma', attachments: [], acknowledgedBy: ['u3', 'u4', 'u5', 'u6'], isActive: true, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n3', societyId: 'soc1', title: 'April Maintenance Bill Generated', content: `Dear Residents,\n\nThe maintenance bills for April 2024 have been generated and sent to your registered email.\n\nMaintenance charges breakdown:\n• Base Maintenance: ₹2,500\n• Water Charges: ₹500\n• Common Area Electricity: ₹300\n\nPlease pay before 10th April to avoid late payment charges.\n\nRegards,\nTreasurer`, category: 'finance', priority: 'important', authorId: 'u1', authorName: 'Rajesh Sharma', attachments: [], acknowledgedBy: ['u4', 'u6', 'u7'], isActive: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 'n4', societyId: 'soc1', title: 'Holi Celebration - Community Event', content: `Dear Residents,\n\n🎉 Greenwood Heights Annual Holi Celebration 🎉\n\nJoin us for a colorful celebration!\n\n📅 Date: 25th March 2024\n⏰ Time: 9:00 AM onwards\n📍 Venue: Society Garden\n\nAll residents are cordially invited!\n\nRegards,\nCultural Committee`, category: 'event', priority: 'normal', authorId: 'u1', authorName: 'Rajesh Sharma', attachments: [], acknowledgedBy: ['u3', 'u4', 'u5', 'u6', 'u7', 'u8'], isActive: true, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() },
];

export const bills: Bill[] = [
  { id: 'b1', societyId: 'soc1', flatId: 'f1', flatNo: 'A-101', residentId: 'u3', residentName: 'Priya Mehta', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 500, penalty: 0, totalAmount: 3500, status: 'unpaid', dueDate: '2024-04-10', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'b2', societyId: 'soc1', flatId: 'f2', flatNo: 'A-102', residentId: 'u4', residentName: 'Arjun Nair', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 1000, penalty: 0, totalAmount: 4000, status: 'paid', dueDate: '2024-04-10', paidDate: '2024-04-05', paymentMethod: 'UPI', transactionId: 'UPI202404050001', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'b3', societyId: 'soc1', flatId: 'f3', flatNo: 'A-201', residentId: 'u5', residentName: 'Sunita Patel', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 0, penalty: 0, totalAmount: 3000, status: 'unpaid', dueDate: '2024-04-10', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'b4', societyId: 'soc1', flatId: 'f4', flatNo: 'B-101', residentId: 'u6', residentName: 'Vikram Singh', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 500, penalty: 0, totalAmount: 3500, status: 'paid', dueDate: '2024-04-10', paidDate: '2024-04-03', paymentMethod: 'Net Banking', transactionId: 'NB202404030002', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'b5', societyId: 'soc1', flatId: 'f5', flatNo: 'B-201', residentId: 'u7', residentName: 'Deepa Krishnan', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 0, penalty: 0, totalAmount: 3000, status: 'overdue', dueDate: '2024-03-10', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'b6', societyId: 'soc1', flatId: 'f6', flatNo: 'B-202', residentId: 'u8', residentName: 'Mohan Rao', month: '2024-04', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 0, penalty: 0, totalAmount: 3000, status: 'paid', dueDate: '2024-04-10', paidDate: '2024-04-07', paymentMethod: 'UPI', transactionId: 'UPI202404070003', createdAt: '2024-04-01T00:00:00Z' },
  { id: 'b7', societyId: 'soc1', flatId: 'f1', flatNo: 'A-101', residentId: 'u3', residentName: 'Priya Mehta', month: '2024-03', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 500, penalty: 0, totalAmount: 3500, status: 'paid', dueDate: '2024-03-10', paidDate: '2024-03-08', paymentMethod: 'UPI', transactionId: 'UPI202403080001', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'b8', societyId: 'soc1', flatId: 'f2', flatNo: 'A-102', residentId: 'u4', residentName: 'Arjun Nair', month: '2024-03', year: 2024, maintenanceAmount: 2500, waterCharges: 500, parkingCharges: 1000, penalty: 0, totalAmount: 4000, status: 'paid', dueDate: '2024-03-10', paidDate: '2024-03-06', paymentMethod: 'Net Banking', transactionId: 'NB202403060001', createdAt: '2024-03-01T00:00:00Z' },
];

export const sessions: Map<string, Session> = new Map();

// ID counters
let userCounter = 15;
let flatCounter = flats.length;
let visitorCounter = visitors.length;
let complaintCounter = complaints.length;
let noticeCounter = notices.length;
let billCounter = bills.length;
let societyCounter = societies.length;
let regCounter = societyRegistrations.length;

export function nextUserId() { return `u${++userCounter}`; }
export function nextFlatId() { return `f${++flatCounter}`; }
export function nextVisitorId() { return `v${++visitorCounter}`; }
export function nextComplaintId() { return `c${++complaintCounter}`; }
export function nextNoticeId() { return `n${++noticeCounter}`; }
export function nextBillId() { return `b${++billCounter}`; }
export function nextSocietyId() { return `soc${++societyCounter}`; }
export function nextRegId() { return `reg${++regCounter}`; }

export function generateSocietyCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
  const num = String(societyCounter).padStart(3, '0');
  return `${prefix}${num}`;
}
