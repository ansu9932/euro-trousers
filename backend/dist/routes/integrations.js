import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/index.js';
import { auditLog, declarations, financeRecords, importLogs, masterRecords, notificationOutbox, operationalRecords, reconciliations } from '../db/schema.js';
import { authorize } from '../security.js';
import { exportWorkbook, parseWorkbook } from '../services/spreadsheets.js';
import { tallyVoucherXml } from '../services/tally.js';
import { enqueueNotification } from '../services/notifications.js';
import { writeAudit } from '../audit.js';
const routes = async (app) => {
    app.get('/reports/:name', { preHandler: authorize(app, 'reports', 'view') }, async (request, reply) => { const { name } = z.object({ name: z.enum(['imports', 'exports', 'finance', 'containers', 'holds', 'reconciliation', 'audit']) }).parse(request.params), format = z.object({ format: z.enum(['json', 'xlsx']).default('json') }).parse(request.query).format; let rows = []; if (name === 'imports' || name === 'exports')
        rows = await db.select().from(declarations).where(eq(declarations.kind, name === 'imports' ? 'IMPORT' : 'EXPORT')).orderBy(desc(declarations.declarationDate));
    else if (name === 'finance')
        rows = await db.select().from(financeRecords).orderBy(desc(financeRecords.createdAt));
    else if (name === 'containers' || name === 'holds')
        rows = await db.select().from(operationalRecords).where(eq(operationalRecords.type, name === 'containers' ? 'CONTAINER' : 'HOLD')).orderBy(desc(operationalRecords.createdAt));
    else if (name === 'reconciliation')
        rows = await db.select().from(reconciliations).orderBy(desc(reconciliations.createdAt));
    else
        rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(10000); if (format === 'json')
        return { data: rows }; const keys = Object.keys(rows[0] ?? { message: '' }), file = await exportWorkbook(name, keys.map(key => ({ header: key, key, width: 20 })), rows); return reply.header('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet').header('content-disposition', `attachment; filename="${name}.xlsx"`).send(file); });
    app.post('/imports/masters', { preHandler: authorize(app, 'masters', 'create') }, async (request, reply) => { const input = z.object({ filename: z.string(), type: z.string(), contentBase64: z.string() }).parse(request.body), rows = await parseWorkbook(Buffer.from(input.contentBase64, 'base64'), ['code', 'nameEn']), errors = []; const valid = rows.flatMap((row, index) => { try {
        return [{ type: input.type, code: z.string().min(1).parse(row.code), nameEn: z.string().min(1).parse(row.nameEn), nameAr: row.nameAr ? String(row.nameAr) : undefined, metadata: { imported: true } }];
    }
    catch (error) {
        errors.push({ row: index + 2, message: error.message });
        return [];
    } }); if (valid.length)
        await db.insert(masterRecords).values(valid).onConflictDoNothing(); const [log] = await db.insert(importLogs).values({ type: `MASTER_${input.type}`, filename: input.filename, status: errors.length ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED', totalRows: rows.length, validRows: valid.length, errors, createdBy: request.user.sub }).returning(); await writeAudit(request, { action: 'IMPORT', entity: 'master_record', entityId: log.id, after: { type: input.type, totalRows: rows.length, validRows: valid.length } }); return reply.code(201).send(log); });
    app.post('/exports/tally', { preHandler: authorize(app, 'finance', 'view') }, async (request, reply) => { const input = z.object({ date: z.string(), number: z.string(), party: z.string(), ledger: z.string(), amount: z.number().positive(), narration: z.string().optional() }).parse(request.body); return reply.header('content-type', 'application/xml').header('content-disposition', `attachment; filename="${input.number}.xml"`).send(tallyVoucherXml(input)); });
    app.post('/notifications', { preHandler: authorize(app, 'administration', 'create') }, async (request, reply) => { const input = z.object({ event: z.string(), channel: z.enum(['EMAIL', 'WHATSAPP']), recipient: z.string().min(3), payload: z.record(z.string(), z.unknown()) }).parse(request.body); const [item] = await enqueueNotification(input.event, input.channel, input.recipient, input.payload); return reply.code(201).send(item); });
    app.get('/notifications', { preHandler: authorize(app, 'administration', 'view') }, async () => ({ data: await db.select().from(notificationOutbox).orderBy(desc(notificationOutbox.createdAt)).limit(100) }));
};
export default routes;
