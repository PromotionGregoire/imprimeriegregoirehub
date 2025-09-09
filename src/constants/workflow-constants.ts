// ===================================================
// GUIDE COMPLET DES STATUTS ET WORKFLOWS
// ===================================================

export interface WorkflowStep {
  status: string;
  description: string;
  color: 'success' | 'info' | 'warning' | 'danger' | 'normal';
  nextSteps: string[];
  actions?: string[];
}

// ===================================================
// 1. WORKFLOW DES SOUMISSIONS
// ===================================================
export const SUBMISSION_WORKFLOW: WorkflowStep[] = [
  {
    status: 'Brouillon',
    description: 'Soumission en cours de création',
    color: 'normal',
    nextSteps: ['Envoyée'],
    actions: ['Éditer', 'Supprimer', 'Envoyer au client']
  },
  {
    status: 'Envoyée',
    description: 'Soumission envoyée au client pour approbation',
    color: 'info',
    nextSteps: ['En attente', 'Acceptée', 'Refusée'],
    actions: ['Rappeler client', 'Modifier', 'Annuler']
  },
  {
    status: 'En attente',
    description: 'Client a reçu la soumission, en attente de réponse',
    color: 'warning',
    nextSteps: ['Acceptée', 'Refusée'],
    actions: ['Rappeler client', 'Modifier délai']
  },
  {
    status: 'Acceptée',
    description: 'Client a accepté la soumission → Commande créée automatiquement',
    color: 'success',
    nextSteps: [], // Terminal - devient une commande
    actions: ['Voir commande générée', 'Créer épreuve']
  },
  {
    status: 'Refusée',
    description: 'Client a refusé la soumission',
    color: 'danger',
    nextSteps: ['Brouillon'], // Peut être modifiée et re-envoyée
    actions: ['Modifier et renvoyer', 'Archiver', 'Contacter client']
  }
];

// ===================================================
// 2. WORKFLOW DES COMMANDES  
// ===================================================
export const ORDER_WORKFLOW: WorkflowStep[] = [
  {
    status: 'En attente de l\'épreuve',
    description: 'Commande créée, en attente de création/approbation de l\'épreuve',
    color: 'warning',
    nextSteps: ['En production'],
    actions: ['Créer épreuve', 'Voir détails', 'Démarrer production']
  },
  {
    status: 'En production',
    description: 'Épreuve approuvée, production en cours',
    color: 'info',
    nextSteps: ['Marqué Facturé'],
    actions: ['Voir épreuve', 'Marquer facturé', 'Modifier délai']
  },
  {
    status: 'Marqué Facturé',
    description: 'Production terminée et facturée',
    color: 'normal',
    nextSteps: ['Complétée'],
    actions: ['Voir facture', 'Marquer livrée']
  },
  {
    status: 'Complétée',
    description: 'Production terminée et livrée au client',
    color: 'success',
    nextSteps: [], // Terminal
    actions: ['Créer facture', 'Demander avis', 'Archiver']
  }
];

// ===================================================
// 3. WORKFLOW DES ÉPREUVES
// ===================================================
export const PROOF_WORKFLOW: WorkflowStep[] = [
  {
    status: 'A preparer',
    description: 'Épreuve à créer/préparer',
    color: 'warning',
    nextSteps: ['En préparation'],
    actions: ['Commencer préparation', 'Assigner designer']
  },
  {
    status: 'En préparation',
    description: 'Épreuve en cours de création par l\'équipe',
    color: 'info',
    nextSteps: ['Envoyée au client', 'En révision'],
    actions: ['Continuer travail', 'Envoyer au client', 'Marquer en révision']
  },
  {
    status: 'Envoyée au client',
    description: 'Épreuve envoyée au client pour approbation',
    color: 'normal',
    nextSteps: ['Approuvée', 'Modification demandée'],
    actions: ['Rappeler client', 'Voir épreuve']
  },
  {
    status: 'En révision',
    description: 'Épreuve en cours de révision interne avant envoi',
    color: 'warning',
    nextSteps: ['Envoyée au client', 'En préparation'],
    actions: ['Continuer révision', 'Retourner en préparation', 'Envoyer au client']
  },
  {
    status: 'Modification demandée',
    description: 'Client demande des modifications',
    color: 'danger',
    nextSteps: ['En préparation', 'En révision'],
    actions: ['Voir commentaires', 'Commencer modifications', 'Contacter client']
  },
  {
    status: 'Approuvée',
    description: 'Client a approuvé l\'épreuve → Commande passe en production',
    color: 'success',
    nextSteps: [], // Terminal - déclenche la production
    actions: ['Démarrer production', 'Voir version finale']
  }
];

// ===================================================
// 4. TRANSITIONS AUTOMATIQUES
// ===================================================
export const AUTO_TRANSITIONS = {
  // Quand une soumission est acceptée → Commande créée
  submission_accepted: {
    trigger: 'Soumission → Acceptée',
    result: 'Commande → En attente de l\'épreuve'
  },
  
  // Quand une épreuve est approuvée → Commande en production
  proof_approved: {
    trigger: 'Épreuve → Approuvée', 
    result: 'Commande → En production'
  }
};

// ===================================================
// 5. ACTIONS DISPONIBLES PAR STATUT
// ===================================================
export const AVAILABLE_ACTIONS = {
  submissions: {
    'Brouillon': ['edit', 'delete', 'send'],
    'Envoyée': ['remind', 'modify', 'cancel'],
    'En attente': ['remind', 'modify_deadline'],
    'Acceptée': ['view_order', 'create_proof'],
    'Refusée': ['modify_resend', 'archive', 'contact']
  },
  
  orders: {
    'En attente de l\'épreuve': ['create_proof', 'view_details', 'start_production'],
    'En production': ['view_proof', 'mark_invoiced', 'modify_deadline'],
    'Marqué Facturé': ['view_invoice', 'mark_delivered'],
    'Complétée': ['create_invoice', 'request_review', 'archive']
  },
  
  proofs: {
    'A preparer': ['start_preparation', 'assign_designer'],
    'En préparation': ['continue_work', 'send_to_client', 'mark_revision'],
    'Envoyée au client': ['remind_client', 'view_proof'],
    'En révision': ['continue_revision', 'back_to_preparation', 'send_to_client'],
    'Modification demandée': ['view_comments', 'start_modifications', 'contact_client'],
    'Approuvée': ['start_production', 'view_final']
  }
};

// ===================================================
// 6. COULEURS ET ICÔNES PAR STATUT
// ===================================================
export const STATUS_THEMES = {
  // Soumissions
  'Brouillon': { theme: 'normal', icon: 'FileText' },
  'Envoyée': { theme: 'info', icon: 'Send' },
  'En attente': { theme: 'warning', icon: 'Clock' },
  'Acceptée': { theme: 'success', icon: 'CheckCircle' },
  'Refusée': { theme: 'danger', icon: 'AlertCircle' },
  
  // Commandes  
  'En attente de l\'épreuve': { theme: 'warning', icon: 'Clock' },
  'En production': { theme: 'info', icon: 'FileText' },
  'Marqué Facturé': { theme: 'normal', icon: 'CreditCard' },
  'Complétée': { theme: 'success', icon: 'CheckCircle' },
  
  // Épreuves
  'A preparer': { theme: 'warning', icon: 'Hourglass' },
  'En préparation': { theme: 'info', icon: 'Clock' },
  'Envoyée au client': { theme: 'normal', icon: 'Send' },
  'En révision': { theme: 'warning', icon: 'FileText' },
  'Modification demandée': { theme: 'danger', icon: 'AlertTriangle' },
  'Approuvée': { theme: 'success', icon: 'CheckCircle' }
};

// ===================================================
// 7. HELPER FUNCTIONS
// ===================================================
export const getNextStatuses = (currentStatus: string, type: 'submission' | 'order' | 'proof'): string[] => {
  const workflows = {
    submission: SUBMISSION_WORKFLOW,
    order: ORDER_WORKFLOW, 
    proof: PROOF_WORKFLOW
  };
  
  const workflow = workflows[type];
  const currentStep = workflow.find(step => step.status === currentStatus);
  return currentStep?.nextSteps || [];
};

export const getAvailableActions = (status: string, type: 'submissions' | 'orders' | 'proofs'): string[] => {
  return AVAILABLE_ACTIONS[type][status] || [];
};

export const getStatusTheme = (status: string) => {
  return STATUS_THEMES[status] || { theme: 'normal', icon: 'FileText' };
};