import { eq } from 'drizzle-orm';
import { db, pool } from './index.js';
import { companySettings, masterRecords, permissions, rolePermissions, roles, users } from './schema.js';
import { hashPassword, passwordSchema } from '../security.js';
export const ROLE_NAMES = ['System Administrator', 'Customs Manager', 'Documentation Officer', 'Data Entry Officer', 'Warehouse Officer', 'Finance Officer', 'Logistics Officer', 'General Manager', 'Viewer', 'Auditor'];
export const INCOTERMS_2020 = ['EXW', 'FCA', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP', 'FAS', 'FOB', 'CFR', 'CIF'];
const modules = ['dashboard', 'masters', 'declarations', 'finance', 'documents', 'containers', 'inspections', 'clearance', 'stock', 'reports', 'imports', 'integrations', 'audit', 'administration'];
const actions = ['view', 'create', 'edit', 'approve', 'archive', 'restore', 'export'];
const roleRules = {
    'System Administrator': { modules, actions }, 'Customs Manager': { modules: ['dashboard', 'masters', 'declarations', 'documents', 'containers', 'inspections', 'clearance', 'stock', 'reports'], actions: ['view', 'create', 'edit', 'approve', 'export'] },
    'Documentation Officer': { modules: ['dashboard', 'masters', 'declarations', 'documents', 'reports', 'imports'], actions: ['view', 'create', 'edit', 'export'] }, 'Data Entry Officer': { modules: ['dashboard', 'masters', 'declarations', 'documents', 'containers'], actions: ['view', 'create', 'edit'] },
    'Warehouse Officer': { modules: ['dashboard', 'documents', 'containers', 'clearance', 'stock', 'reports'], actions: ['view', 'create', 'edit', 'export'] }, 'Finance Officer': { modules: ['dashboard', 'declarations', 'finance', 'documents', 'reports'], actions: ['view', 'create', 'edit', 'approve', 'export'] },
    'Logistics Officer': { modules: ['dashboard', 'declarations', 'documents', 'containers', 'inspections', 'clearance', 'reports'], actions: ['view', 'create', 'edit', 'export'] }, 'General Manager': { modules: ['dashboard', 'declarations', 'finance', 'reports', 'audit'], actions: ['view', 'approve', 'export'] },
    Viewer: { modules: ['dashboard', 'reports'], actions: ['view', 'export'] }, Auditor: { modules, actions: ['view', 'export'] }
};
for (const name of ROLE_NAMES)
    await db.insert(roles).values({ name }).onConflictDoNothing();
for (const module of modules)
    for (const action of actions)
        await db.insert(permissions).values({ module, action }).onConflictDoNothing();
const allRoles = await db.select().from(roles), allPermissions = await db.select().from(permissions);
for (const role of allRoles) {
    const rule = roleRules[role.name];
    if (!rule)
        continue;
    for (const permission of allPermissions.filter(p => rule.modules.includes(p.module) && rule.actions.includes(p.action)))
        await db.insert(rolePermissions).values({ roleId: role.id, permissionId: permission.id }).onConflictDoNothing();
}
await db.insert(companySettings).values({ nameEn: 'EURO TROUSERS MFG. CO. (FZC)', nameAr: 'يـروتـراوزرس ام اف جي كومبني ش.م.ح', trn: '100232060200003', addressEn: 'SAIF Zone, Sharjah, United Arab Emirates', addressAr: 'المنطقة الحرة بمطار الشارقة الدولي، الشارقة، الإمارات العربية المتحدة' }).onConflictDoNothing();
for (const code of INCOTERMS_2020)
    await db.insert(masterRecords).values({ type: 'INCOTERM', code, nameEn: code }).onConflictDoNothing();
await db.insert(masterRecords).values({ type: 'CUSTOMS_OFFICE', code: 'SAIF', nameEn: 'SAIF Zone Customs Authority', nameAr: 'هيئة جمارك المنطقة الحرة بمطار الشارقة الدولي' }).onConflictDoNothing();
for (const code of ['AED', 'USD', 'EUR', 'GBP'])
    await db.insert(masterRecords).values({ type: 'CURRENCY', code, nameEn: code }).onConflictDoNothing();
for (const code of ['PCS', 'KG', 'MTR', 'ROLL', 'CTN'])
    await db.insert(masterRecords).values({ type: 'UOM', code, nameEn: code }).onConflictDoNothing();
const email = process.env.BOOTSTRAP_ADMIN_EMAIL ?? 'admin@example.com', password = process.env.BOOTSTRAP_ADMIN_PASSWORD ?? 'ChangeMe123!';
if (!passwordSchema.test(password))
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be 12+ chars with upper, lower, number, and symbol');
const [adminRole] = await db.select().from(roles).where(eq(roles.name, 'System Administrator')).limit(1);
if (adminRole)
    await db.insert(users).values({ email, passwordHash: await hashPassword(password), displayName: 'System Administrator', roleId: adminRole.id }).onConflictDoNothing();
await pool.end();
console.log(`Seeded ${ROLE_NAMES.length} roles, permissions, masters, company settings, and bootstrap administrator`);
