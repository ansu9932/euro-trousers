export const DOCUMENT_TYPES=['Commercial Invoice','Packing List','B/L','AWB','COO','Delivery Order','Import Permit','Export Permit','Customs Declaration Copy','Gate Pass','Insurance Certificate','Inspection / Quality Certificate','Fumigation Certificate','Other'] as const
export const GENERATED_TYPES=['Delivery Order','Gate Pass','Exit Pass','Goods Transfer Note','Packing List','Commercial Invoice'] as const
export function documentNumber(prefix:string,year:number,sequence:number){return `${prefix}-${year}-${String(sequence).padStart(4,'0')}`}
export function qrVerificationPayload(baseUrl:string,number:string){return `${baseUrl.replace(/\/$/,'')}/verify/${encodeURIComponent(number)}`}
