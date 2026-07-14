import { db } from './db/index.js';
import { auditLog } from './db/schema.js';
export async function writeAudit(request, input) { const actor = request.user; await db.insert(auditLog).values({ actorId: actor?.sub, action: input.action, entity: input.entity, entityId: input.entityId, before: input.before ?? null, after: input.after ?? null, ip: request.ip, requestId: request.id }); }
