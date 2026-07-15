export type ClientAccessRequestStatus="pendente"|"aprovada"|"recusada"|"cancelada";
export type ClientAccessRequest={id:string;usuario_id:string;nome:string;empresa_informada:string;cnpj_informado:string|null;cargo:string;telefone:string;email:string;status:ClientAccessRequestStatus;empresa_id:string|null;motivo_recusa:string|null;analisado_por:string|null;analisado_em:string|null;created_at:string;updated_at:string};
export type ClientAccessSignup={nome:string;empresa_informada:string;cnpj_informado:string;cargo:string;telefone:string;email:string;password:string};
