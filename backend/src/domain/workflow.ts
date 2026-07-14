export const states = ['DRAFT','L1_PENDING','L2_PENDING','L3_PENDING','L4_PENDING','APPROVED','SUBMITTED','UNDER_INSPECTION','CLEARED','GATE_PASS_ISSUED','CLOSED','ON_HOLD','REJECTED','AMENDED','CANCELLED'] as const
export type DeclarationState = typeof states[number]
export type WorkflowContext = { dutyAed:number; vatAed:number; valueAed:number; approvalThresholdAed:number; previousState?:DeclarationState }
export function nextState(current:DeclarationState, context:WorkflowContext):DeclarationState {
  if(current==='DRAFT'||current==='REJECTED') return 'L1_PENDING'
  if(current==='L1_PENDING') return 'L2_PENDING'
  if(current==='L2_PENDING') {
    if(context.dutyAed===0&&context.vatAed===0) return context.valueAed>=context.approvalThresholdAed?'L4_PENDING':'APPROVED'
    return 'L3_PENDING'
  }
  if(current==='L3_PENDING') return context.valueAed>=context.approvalThresholdAed?'L4_PENDING':'APPROVED'
  if(current==='L4_PENDING') return 'APPROVED'
  if(current==='APPROVED') return 'SUBMITTED'
  if(current==='SUBMITTED') return 'CLEARED'
  if(current==='UNDER_INSPECTION') return 'CLEARED'
  if(current==='CLEARED') return 'GATE_PASS_ISSUED'
  if(current==='GATE_PASS_ISSUED') return 'CLOSED'
  if(current==='ON_HOLD'&&context.previousState) return context.previousState
  throw new Error(`No forward transition from ${current}`)
}
export function calculateDutyAndVat(valueAed:number,dutyRate=5,vatRate=5,exempt=false,vatExempt=false){ const duty=exempt?0:valueAed*dutyRate/100; const vat=vatExempt?0:(valueAed+duty)*vatRate/100; return { dutyAed:Math.round(duty*100)/100, vatAed:Math.round(vat*100)/100, totalAed:Math.round((valueAed+duty+vat)*100)/100 } }
