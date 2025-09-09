/**
 * Constantes de statuts partagées entre le front-end et les Edge Functions
 * ⚠️ IMPORTANT: Ces valeurs doivent correspondre exactement aux CHECK constraints de la DB
 */

// === STATUTS DES SOUMISSIONS ===
export const SUBMISSION_STATUS = {
  DRAFT: 'Brouillon',
  SENT: 'Envoyée', 
  ACCEPTED: 'Acceptée',
  REJECTED: 'Refusée',
  // Statuts legacy (à migrer progressivement)
  IN_REVISION: 'En révision'
} as const;

export type SubmissionStatusType = typeof SUBMISSION_STATUS[keyof typeof SUBMISSION_STATUS];

// === STATUTS DES COMMANDES ===
export const ORDER_STATUS = {
  WAITING_PROOF: "En attente de l'épreuve",
  IN_PRODUCTION: 'En production', 
  COMPLETED: 'Complétée'
} as const;

export type OrderStatusType = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// === STATUTS DES ÉPREUVES ===
export const PROOF_STATUS = {
  TO_PREPARE: 'A preparer',          // État initial
  PREPARATION: 'En préparation',      // En cours de travail
  SENT_TO_CLIENT: 'Envoyée au client', // Envoyée pour validation
  APPROVED: 'Approuvée',             // Validée par le client
  MODIFICATION_REQUESTED: 'Modification demandée' // Client demande des changements
} as const;

export type ProofStatusType = typeof PROOF_STATUS[keyof typeof PROOF_STATUS];

// === TYPES D'ACTIONS POUR L'HISTORIQUE ===
export const ACTION_TYPES = {
  // Soumissions
  CREATE_SUBMISSION: 'create_submission',
  SEND_SUBMISSION: 'send_submission', 
  APPROVE_SUBMISSION: 'approve_submission',
  REJECT_SUBMISSION: 'reject_submission',
  
  // Commandes
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER_STATUS: 'update_order_status',
  START_PRODUCTION: 'start_production',
  COMPLETE_ORDER: 'complete_order',
  
  // Épreuves
  CREATE_PROOF: 'create_proof',
  UPLOAD_PROOF: 'upload_proof',
  SEND_PROOF: 'send_proof_to_client',
  APPROVE_PROOF: 'approve_proof',
  REJECT_PROOF: 'request_modification',
  
  // Général
  ADD_COMMENT: 'add_comment',
  ARCHIVE: 'archive',
  RESTORE: 'restore'
} as const;

export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];

// === HELPERS DE VALIDATION ===
export const isValidSubmissionStatus = (status: string): status is SubmissionStatusType => {
  return Object.values(SUBMISSION_STATUS).includes(status as SubmissionStatusType);
};

export const isValidOrderStatus = (status: string): status is OrderStatusType => {
  return Object.values(ORDER_STATUS).includes(status as OrderStatusType);
};

export const isValidProofStatus = (status: string): status is ProofStatusType => {
  return Object.values(PROOF_STATUS).includes(status as ProofStatusType);
};

// === CONFIGURATION DES COULEURS PAR STATUT ===
export const STATUS_COLORS = {
  // Soumissions
  [SUBMISSION_STATUS.DRAFT]: { dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-700', bar: 'bg-gray-500' },
  [SUBMISSION_STATUS.SENT]: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  [SUBMISSION_STATUS.ACCEPTED]: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
  [SUBMISSION_STATUS.REJECTED]: { dot: 'bg-red-500', badge: 'bg-red-100 text-red-700', bar: 'bg-red-500' },
  
  // Commandes  
  [ORDER_STATUS.WAITING_PROOF]: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  [ORDER_STATUS.IN_PRODUCTION]: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  [ORDER_STATUS.COMPLETED]: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
  
  // Épreuves
  [PROOF_STATUS.TO_PREPARE]: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
  [PROOF_STATUS.PREPARATION]: { dot: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  [PROOF_STATUS.SENT_TO_CLIENT]: { dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', bar: 'bg-purple-500' },
  [PROOF_STATUS.APPROVED]: { dot: 'bg-green-500', badge: 'bg-green-100 text-green-700', bar: 'bg-green-500' },
  [PROOF_STATUS.MODIFICATION_REQUESTED]: { dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500' },
} as const;

// === URLS CANONIQUES ===
export const PORTAL_URLS = {
  BASE: 'https://client.promotiongregoire.com',
  PROOF_APPROVAL: (token: string) => `https://client.promotiongregoire.com/epreuve/${token}`,
  SUBMISSION_APPROVAL: (token: string) => `https://client.promotiongregoire.com/soumission/${token}`
} as const;

export const HUB_URLS = {
  BASE: 'https://hub.promotiongregoire.com'
} as const;