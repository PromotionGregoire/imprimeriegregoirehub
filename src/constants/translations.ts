/**
 * Dictionnaire de traduction centralisé pour PromoFlow
 * Maintient la cohérence entre l'interface française et le code technique anglais
 */

// ========================
// TYPES D'ACTIONS (Base de données)
// ========================
export const ACTION_TYPES = {
  // Actions sur les épreuves
  UPLOAD_PROOF: 'upload_proof',
  SEND_PROOF: 'send_proof', 
  APPROVE_PROOF: 'approve_proof',
  REJECT_PROOF: 'reject_proof',
  VIEW_PROOF: 'view_proof',
  
  // Actions sur les commandes
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER_STATUS: 'update_order_status',
  CANCEL_ORDER: 'cancel_order',
  START_PRODUCTION: 'start_production',
  COMPLETE_ORDER: 'complete_order',
  
  // Actions sur les soumissions
  CREATE_SUBMISSION: 'create_submission',
  SEND_SUBMISSION: 'send_submission',
  APPROVE_SUBMISSION: 'approve_submission',
  REJECT_SUBMISSION: 'reject_submission',
  
  // Actions générales
  ADD_COMMENT: 'add_comment',
  SEND_REMINDER: 'send_reminder',
  UPDATE_STATUS: 'update_status',
  ASSIGN_USER: 'assign_user',
} as const;

// ========================
// TRADUCTIONS DES ACTIONS (Interface utilisateur)
// ========================
export const ACTION_LABELS = {
  [ACTION_TYPES.UPLOAD_PROOF]: 'Épreuve téléversée',
  [ACTION_TYPES.SEND_PROOF]: 'Épreuve envoyée au client',
  [ACTION_TYPES.APPROVE_PROOF]: 'Épreuve approuvée',
  [ACTION_TYPES.REJECT_PROOF]: 'Modifications demandées',
  [ACTION_TYPES.VIEW_PROOF]: 'Épreuve consultée',
  
  [ACTION_TYPES.CREATE_ORDER]: 'Commande créée',
  [ACTION_TYPES.UPDATE_ORDER_STATUS]: 'Commande modifiée',
  [ACTION_TYPES.CANCEL_ORDER]: 'Commande annulée',
  [ACTION_TYPES.START_PRODUCTION]: 'Production démarrée',
  [ACTION_TYPES.COMPLETE_ORDER]: 'Commande complétée',
  
  [ACTION_TYPES.CREATE_SUBMISSION]: 'Soumission créée',
  [ACTION_TYPES.SEND_SUBMISSION]: 'Soumission envoyée',
  [ACTION_TYPES.APPROVE_SUBMISSION]: 'Soumission approuvée',
  [ACTION_TYPES.REJECT_SUBMISSION]: 'Soumission rejetée',
  
  [ACTION_TYPES.ADD_COMMENT]: 'Commentaire ajouté',
  [ACTION_TYPES.SEND_REMINDER]: 'Rappel envoyé',
  [ACTION_TYPES.UPDATE_STATUS]: 'Statut modifié',
  [ACTION_TYPES.ASSIGN_USER]: 'Utilisateur assigné',
} as const;

// ========================
// STATUTS STANDARDISÉS
// ========================
export const STATUS_VALUES = {
  // Statuts des soumissions
  SUBMISSION_DRAFT: 'draft',
  SUBMISSION_SENT: 'sent', 
  SUBMISSION_APPROVED: 'approved',
  SUBMISSION_REJECTED: 'rejected',
  SUBMISSION_IN_REVISION: 'in_revision',
  
  // Statuts des commandes
  ORDER_PENDING_PROOF: 'pending_proof',
  ORDER_IN_PRODUCTION: 'in_production',
  ORDER_COMPLETED: 'completed',
  ORDER_CANCELLED: 'cancelled',
  
  // Statuts des épreuves
  PROOF_TO_PREPARE: 'to_prepare',
  PROOF_SENT_TO_CLIENT: 'sent_to_client',
  PROOF_APPROVED: 'proof_approved',
  PROOF_MODIFICATION_REQUESTED: 'modification_requested',
  
  // Statuts des clients
  CLIENT_PROSPECT: 'prospect',
  CLIENT_ACTIVE: 'active',
  CLIENT_INACTIVE: 'inactive',
} as const;

// ========================
// LABELS DES STATUTS (Interface)
// ========================
export const STATUS_LABELS = {
  // Soumissions
  [STATUS_VALUES.SUBMISSION_DRAFT]: 'Brouillon',
  [STATUS_VALUES.SUBMISSION_SENT]: 'Envoyée',
  [STATUS_VALUES.SUBMISSION_APPROVED]: 'Acceptée',
  [STATUS_VALUES.SUBMISSION_REJECTED]: 'Rejetée', 
  [STATUS_VALUES.SUBMISSION_IN_REVISION]: 'En révision',
  
  // Commandes
  [STATUS_VALUES.ORDER_PENDING_PROOF]: 'En attente de l\'épreuve',
  [STATUS_VALUES.ORDER_IN_PRODUCTION]: 'En production',
  [STATUS_VALUES.ORDER_COMPLETED]: 'Complétée',
  [STATUS_VALUES.ORDER_CANCELLED]: 'Annulée',
  
  // Épreuves
  [STATUS_VALUES.PROOF_TO_PREPARE]: 'À préparer',
  [STATUS_VALUES.PROOF_SENT_TO_CLIENT]: 'Envoyée au client',
  [STATUS_VALUES.PROOF_APPROVED]: 'Approuvée',
  [STATUS_VALUES.PROOF_MODIFICATION_REQUESTED]: 'Modification demandée',
  
  // Clients
  [STATUS_VALUES.CLIENT_PROSPECT]: 'Prospect',
  [STATUS_VALUES.CLIENT_ACTIVE]: 'Actif',
  [STATUS_VALUES.CLIENT_INACTIVE]: 'Inactif',
} as const;

// ========================
// LABELS UI (Boutons, formulaires, etc.)
// ========================
export const UI_LABELS = {
  // Actions CRUD
  CREATE: 'Créer',
  EDIT: 'Modifier',
  UPDATE: 'Mettre à jour',
  DELETE: 'Supprimer',
  SAVE: 'Sauvegarder',
  CANCEL: 'Annuler',
  SUBMIT: 'Soumettre',
  
  // Actions de workflow
  SEND: 'Envoyer',
  APPROVE: 'Approuver',
  REJECT: 'Rejeter',
  RESEND: 'Renvoyer',
  DOWNLOAD: 'Télécharger',
  UPLOAD: 'Téléverser',
  
  // États de chargement
  LOADING: 'Chargement...',
  SAVING: 'Sauvegarde...',
  SENDING: 'Envoi...',
  PROCESSING: 'Traitement...',
  UPLOADING: 'Téléversement...',
  
  // Navigation
  BACK: 'Retour',
  NEXT: 'Suivant',
  PREVIOUS: 'Précédent',
  CLOSE: 'Fermer',
  
  // Filtres et recherche
  SEARCH: 'Rechercher',
  FILTER: 'Filtrer',
  SORT: 'Trier',
  RESET: 'Réinitialiser',
  
  // Confirmations
  CONFIRM: 'Confirmer',
  YES: 'Oui',
  NO: 'Non',
  
  // Messages génériques
  SUCCESS: 'Succès',
  ERROR: 'Erreur',
  WARNING: 'Attention',
  INFO: 'Information',
} as const;

// ========================
// MESSAGES D'ERREUR ET SUCCÈS
// ========================
export const MESSAGES = {
  // Succès génériques
  SUCCESS_CREATE: 'Élément créé avec succès',
  SUCCESS_UPDATE: 'Modification sauvegardée',
  SUCCESS_DELETE: 'Élément supprimé',
  SUCCESS_SEND: 'Envoyé avec succès',
  
  // Erreurs génériques  
  ERROR_CREATE: 'Impossible de créer l\'élément',
  ERROR_UPDATE: 'Impossible de modifier l\'élément',
  ERROR_DELETE: 'Impossible de supprimer l\'élément',
  ERROR_SEND: 'Impossible d\'envoyer',
  ERROR_UPLOAD: 'Échec du téléversement',
  ERROR_NETWORK: 'Erreur de connexion',
  ERROR_UNKNOWN: 'Une erreur inattendue s\'est produite',
  
  // Messages spécifiques
  EMAIL_ALREADY_USED: 'Cette adresse courriel est déjà utilisée',
  REQUIRED_FIELD: 'Ce champ est obligatoire',
  INVALID_FORMAT: 'Format invalide',
  FILE_TOO_LARGE: 'Fichier trop volumineux',
  UNSUPPORTED_FORMAT: 'Format de fichier non supporté',
  
  // Confirmations
  CONFIRM_DELETE: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  CONFIRM_CANCEL: 'Êtes-vous sûr de vouloir annuler ? Les modifications non sauvegardées seront perdues.',
  CONFIRM_APPROVE: 'Êtes-vous certain de vouloir approuver ? Cette action est irréversible.',
} as const;

// ========================
// MAPPINGS DE RÉTROCOMPATIBILITÉ
// ========================

/**
 * Mapping pour les anciens action_type mixtes vers les nouveaux standards anglais
 * Utilisé lors de la migration de la base de données
 */
export const LEGACY_ACTION_TYPE_MAPPING = {
  'upload_epreuve': ACTION_TYPES.UPLOAD_PROOF,
  'send_epreuve': ACTION_TYPES.SEND_PROOF,
  'approve_epreuve': ACTION_TYPES.APPROVE_PROOF, 
  'reject_epreuve': ACTION_TYPES.REJECT_PROOF,
  'changement_statut_epreuve': ACTION_TYPES.UPDATE_STATUS,
  'add_comment': ACTION_TYPES.ADD_COMMENT,
  'update_order': ACTION_TYPES.UPDATE_ORDER_STATUS,
  'start_production': ACTION_TYPES.START_PRODUCTION,
} as const;

/**
 * Mapping pour les anciens statuts français vers codes anglais
 * Permet la transition progressive
 */
export const LEGACY_STATUS_MAPPING = {
  'Brouillon': STATUS_VALUES.SUBMISSION_DRAFT,
  'Envoyée': STATUS_VALUES.SUBMISSION_SENT,
  'Acceptée': STATUS_VALUES.SUBMISSION_APPROVED,
  'Rejetée': STATUS_VALUES.SUBMISSION_REJECTED,
  'En révision': STATUS_VALUES.SUBMISSION_IN_REVISION,
  
  'En attente de l\'épreuve': STATUS_VALUES.ORDER_PENDING_PROOF,
  'En production': STATUS_VALUES.ORDER_IN_PRODUCTION,
  'Complétée': STATUS_VALUES.ORDER_COMPLETED,
  'Annulée': STATUS_VALUES.ORDER_CANCELLED,
  
  'A preparer': STATUS_VALUES.PROOF_TO_PREPARE,
  'À préparer': STATUS_VALUES.PROOF_TO_PREPARE,
  'Envoyée au client': STATUS_VALUES.PROOF_SENT_TO_CLIENT,
  'Approuvée': STATUS_VALUES.PROOF_APPROVED,
  'Modification demandée': STATUS_VALUES.PROOF_MODIFICATION_REQUESTED,
  
  'Prospect': STATUS_VALUES.CLIENT_PROSPECT,
  'Actif': STATUS_VALUES.CLIENT_ACTIVE,
  'Inactif': STATUS_VALUES.CLIENT_INACTIVE,
} as const;

// ========================
// TYPES TYPESCRIPT
// ========================
export type ActionType = typeof ACTION_TYPES[keyof typeof ACTION_TYPES];
export type StatusValue = typeof STATUS_VALUES[keyof typeof STATUS_VALUES];
export type UILabel = typeof UI_LABELS[keyof typeof UI_LABELS];
export type Message = typeof MESSAGES[keyof typeof MESSAGES];

// ========================
// UTILITAIRES
// ========================

/**
 * Récupère le label français pour un action_type
 */
export function getActionLabel(actionType: ActionType): string {
  return ACTION_LABELS[actionType] || actionType;
}

/**
 * Récupère le label français pour un statut
 */
export function getStatusLabel(status: StatusValue | string): string {
  // Essayer d'abord avec la valeur directe
  if (status in STATUS_LABELS) {
    return STATUS_LABELS[status as StatusValue];
  }
  
  // Essayer avec le mapping legacy
  if (status in LEGACY_STATUS_MAPPING) {
    const mappedStatus = LEGACY_STATUS_MAPPING[status as keyof typeof LEGACY_STATUS_MAPPING];
    return STATUS_LABELS[mappedStatus];
  }
  
  // Retourner la valeur originale si aucun mapping trouvé
  return status;
}

/**
 * Convertit un ancien action_type vers le nouveau standard
 */
export function migrateActionType(oldActionType: string): ActionType {
  return LEGACY_ACTION_TYPE_MAPPING[oldActionType as keyof typeof LEGACY_ACTION_TYPE_MAPPING] || oldActionType as ActionType;
}

/**
 * Convertit un ancien statut français vers le code anglais standard
 */
export function migrateStatus(oldStatus: string): StatusValue {
  return LEGACY_STATUS_MAPPING[oldStatus as keyof typeof LEGACY_STATUS_MAPPING] || oldStatus as StatusValue;
}