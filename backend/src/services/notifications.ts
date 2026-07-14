import nodemailer from 'nodemailer'
import { db } from '../db/index.js'
import { notificationOutbox } from '../db/schema.js'

export async function enqueueNotification(event:string,channel:'EMAIL'|'WHATSAPP',recipient:string,payload:Record<string,unknown>){return db.insert(notificationOutbox).values({event,channel,recipient,payload}).returning()}
export async function sendEmail(to:string,subject:string,text:string){if(!process.env.SMTP_HOST)throw new Error('SMTP_NOT_CONFIGURED');const transport=nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT??587),secure:false,auth:process.env.SMTP_USER?{user:process.env.SMTP_USER,pass:process.env.SMTP_PASSWORD}:undefined});return transport.sendMail({from:process.env.SMTP_FROM??process.env.SMTP_USER,to,subject,text})}
