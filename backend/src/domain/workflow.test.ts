import { describe,expect,it } from 'vitest'
import { calculateDutyAndVat,nextState } from './workflow.js'
describe('declaration workflow',()=>{ it('skips finance when duty and VAT are zero',()=>expect(nextState('L2_PENDING',{dutyAed:0,vatAed:0,valueAed:50000,approvalThresholdAed:100000})).toBe('APPROVED')); it('requires GM for high values',()=>expect(nextState('L3_PENDING',{dutyAed:5,vatAed:5,valueAed:100000,approvalThresholdAed:100000})).toBe('L4_PENDING')) })
describe('customs calculations',()=>{ it('calculates duty then VAT',()=>expect(calculateDutyAndVat(100000)).toEqual({dutyAed:5000,vatAed:5250,totalAed:110250})); it('honors exemptions',()=>expect(calculateDutyAndVat(100000,5,5,true,true).totalAed).toBe(100000)) })
