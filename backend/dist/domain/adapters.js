export class ManualCustomsPortalAdapter {
    mode = 'manual';
    async submit(_declarationId) { throw new Error('Manual mode requires staff-entered SAIF reference'); }
    async getStatus() { return 'MANUAL_TRACKING'; }
}
export const MODULES = ['dashboard', 'masters', 'declarations', 'finance', 'documents', 'containers', 'inspections', 'clearance', 'stock', 'reports', 'integrations', 'audit', 'administration'];
