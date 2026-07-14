import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { and, eq, gt, isNull } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { db } from './db/index.js'
import { permissions, refreshSessions, rolePermissions, roles, users } from './db/schema.js'

export const passwordSchema=/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,}$/
export const hashToken=(token:string)=>createHash('sha256').update(token).digest('hex')
export const newRefreshToken=()=>randomBytes(48).toString('base64url')
export const hashPassword=(password:string)=>bcrypt.hash(password,12)
export const verifyPassword=(password:string,hash:string)=>bcrypt.compare(password,hash)
export type AuthUser={sub:string;email:string;role:string}

export async function authenticate(request:FastifyRequest){ await request.jwtVerify<AuthUser>() }
export function authorize(app:FastifyInstance,module:string,action:string){return async(request:FastifyRequest)=>{await authenticate(request);const actor=request.user as AuthUser;if(actor.role==='System Administrator'||actor.role==='Auditor'&&action==='view')return;const rows=await db.select({id:permissions.id}).from(users).innerJoin(roles,eq(users.roleId,roles.id)).innerJoin(rolePermissions,eq(rolePermissions.roleId,roles.id)).innerJoin(permissions,eq(rolePermissions.permissionId,permissions.id)).where(and(eq(users.id,actor.sub),eq(permissions.module,module),eq(permissions.action,action),isNull(users.archivedAt))).limit(1);if(!rows.length)throw Object.assign(new Error('FORBIDDEN'),{statusCode:403})}}
export async function issueSession(app:FastifyInstance,user:AuthUser){const refreshToken=newRefreshToken();const expiresAt=new Date(Date.now()+7*24*60*60*1000);await db.insert(refreshSessions).values({userId:user.sub,tokenHash:hashToken(refreshToken),expiresAt});return{accessToken:app.jwt.sign(user,{expiresIn:process.env.ACCESS_TOKEN_TTL??'15m'}),refreshToken,expiresAt}}
export async function rotateSession(app:FastifyInstance,token:string){const [session]=await db.select({id:refreshSessions.id,userId:users.id,email:users.email,role:roles.name}).from(refreshSessions).innerJoin(users,eq(refreshSessions.userId,users.id)).innerJoin(roles,eq(users.roleId,roles.id)).where(and(eq(refreshSessions.tokenHash,hashToken(token)),isNull(refreshSessions.revokedAt),gt(refreshSessions.expiresAt,new Date()),eq(users.active,true))).limit(1);if(!session)return null;await db.update(refreshSessions).set({revokedAt:new Date()}).where(eq(refreshSessions.id,session.id));return issueSession(app,{sub:session.userId,email:session.email,role:session.role})}
