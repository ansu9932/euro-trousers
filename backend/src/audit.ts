import type { FastifyRequest } from 'fastify'
import { db } from './db/index.js'
import { auditLog } from './db/schema.js'
import type { AuthUser } from './security.js'

export async function writeAudit(request:FastifyRequest,input:{action:string;entity:string;entityId:string;before?:unknown;after?:unknown}){const actor=request.user as AuthUser|undefined;await db.insert(auditLog).values({actorId:actor?.sub,action:input.action,entity:input.entity,entityId:input.entityId,before:input.before??null,after:input.after??null,ip:request.ip,requestId:request.id})}
