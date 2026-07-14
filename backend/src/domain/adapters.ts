export interface CustomsPortalAdapter { mode:'manual'|'api'; submit(declarationId:string):Promise<{reference:string;status:string}>; getStatus(reference:string):Promise<string> }
export class ManualCustomsPortalAdapter implements CustomsPortalAdapter { mode='manual' as const; async submit(_declarationId:string):Promise<{reference:string;status:string}>{ throw new Error('Manual mode requires staff-entered SAIF reference') } async getStatus(){ return 'MANUAL_TRACKING' } }
export interface NotificationChannel { name:string; configured():boolean; send(recipient:string,subject:string,body:string):Promise<void> }
export type PermissionAction='view'|'create'|'edit'|'approve'|'delete'
export const MODULES=['dashboard','masters','declarations','finance','documents','containers','inspections','clearance','stock','reports','integrations','audit','administration'] as const
