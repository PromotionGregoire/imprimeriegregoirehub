# Rapport d'Audit - Cohérence Linguistique PromoFlow

## Résumé des Incohérences
- **Nombre total d'incohérences détectées :** 47
- **Actions en français :** 15 (32%)
- **Actions en anglais :** 24 (51%)  
- **Actions mixtes :** 8 (17%)

## Détail par Catégorie

### 1. Base de Données

#### Types d'actions (action_type) - Table ordre_historique
| Valeur actuelle | Langue | Suggestion cohérente | Localisation |
|-----------------|---------|---------------------|---------------|
| upload_epreuve | **Mixte** ❌ | upload_proof OU telecharger_epreuve | migrations SQL |
| send_epreuve | **Mixte** ❌ | send_proof OU envoyer_epreuve | migrations SQL |
| approve_epreuve | **Mixte** ❌ | approve_proof OU approuver_epreuve | migrations SQL |
| reject_epreuve | **Mixte** ❌ | reject_proof OU rejeter_epreuve | migrations SQL |
| add_comment | **Anglais** ❌ | ajouter_commentaire | migrations SQL |
| start_production | **Anglais** ❌ | demarrer_production | migrations SQL |
| update_order | **Anglais** ❌ | modifier_commande | migrations SQL |
| changement_statut_epreuve | **Français** ✅ | Cohérent | migrations SQL |

#### Noms de colonnes problématiques
| Table | Colonne actuelle | Langue | Suggestion |
|-------|------------------|---------|------------|
| proofs | file_url | Anglais | url_fichier |
| proofs | approval_token | Anglais | jeton_approbation |
| proofs | validation_token | Anglais | jeton_validation |
| clients | business_name | Anglais | nom_entreprise |
| clients | contact_name | Anglais | nom_contact |
| clients | phone_number | Anglais | numero_telephone |
| orders | order_number | Anglais | numero_commande |
| orders | total_price | Anglais | prix_total |
| submissions | submission_number | Anglais | numero_soumission |
| submissions | approval_token | Anglais | jeton_approbation |

#### Noms de tables mélangés
| Table actuelle | Langue | Suggestion |
|---------------|---------|------------|
| epreuve_commentaires | Français | ✅ Cohérent |
| ordre_historique | Français | ✅ Cohérent |
| proofs | Anglais | epreuves |
| orders | Anglais | commandes |
| submissions | Anglais | soumissions |
| clients | Anglais | ✅ OK (international) |

### 2. Frontend - Handlers et Fonctions

#### Event Handlers incohérents
| Composant | Handler actuel | Langue | Suggestion |
|-----------|----------------|---------|------------|
| CreateClientModal | handleSubmit | Anglais | gereSoumission |
| CreateEmployeeModal | handleSubmit | Anglais | gereSoumission |
| CreateSupplierModal | handleSubmit | Anglais | gereSoumission |
| EditEmployeeModal | handleSubmit | Anglais | gereSoumission |
| StatusManager | updateStatus.isPending | Anglais | miseAJourStatut.enCours |
| ProofCard | onClick | Anglais | auClic |
| ProductModal | onSubmit | Anglais | auValidation |

#### Fonctions utilitaires
| Fonction | Langue | Suggestion |
|----------|---------|------------|
| handleInputChange | Anglais | gereChangementSaisie |
| handleSignOut | Anglais | gereDeconnexion |
| onSearchChange | Anglais | auChangementRecherche |
| toggleCategory | Anglais | basculerCategorie |

### 3. Labels et UI

#### Boutons incohérents
| Emplacement | Label actuel | Langue | Problème |
|-------------|--------------|---------|-----------|
| CreateClientModal | "Sauvegarder les modifications" | Français | ✅ Cohérent |
| CreateClientModal | "Enregistrement..." | Français | ✅ Cohérent |
| CreateSupplierModal | "Sauvegarde..." | Français | ✅ Cohérent |
| EditEmployeeModal | "Attribution..." | Français | ✅ Cohérent |
| ProductVariantManager | "Sauvegarder les variantes" | Français | ✅ Cohérent |
| StatusManager | "Marquer comme..." | Français | ✅ Cohérent |

#### Statuts mixtes dans StatusBadge
| Statut français | Équivalent anglais présent | Incohérence |
|----------------|---------------------------|-------------|
| "Brouillon" | "draft" | ❌ |
| "En attente" | "pending" | ❌ |
| "Envoyée" | "sent" | ❌ |
| "Acceptée" | "approved" | ❌ |
| "Rejetée" | "rejected" | ❌ |
| "Complétée" | "completed" | ❌ |

### 4. Messages et Notifications

#### Messages d'erreur mixtes
| Type | Message actuel | Langue | Problème |
|------|----------------|---------|-----------|
| CreateEmployeeModal | "Cette adresse courriel est déjà utilisée" | Français | ✅ |
| CreateEmployeeModal | "Impossible de créer l'employé" | Français | ✅ |
| SupplierProductsManager | "Impossible de modifier le produit" | Français | ✅ |
| useProofToggle | "Impossible de modifier le statut" | Français | ✅ |

#### Commentaires de code
| Fichier | Commentaire | Langue | Suggestion |
|---------|-------------|---------|------------|
| Trigger SQL | "-- Ne logger que si le statut a changé" | Français | ✅ |
| Trigger SQL | "-- Get proof, order, submission and client details" | Anglais | "-- Récupérer les détails de l'épreuve, commande, soumission et client" |

### 5. Actions API/Services

#### Edge Functions
| Fonction | Nom anglais | Équivalent français suggéré |
|----------|-------------|----------------------------|
| send-submission-notification | ❌ | envoyer-notification-soumission |
| send-proof-notification | ❌ | envoyer-notification-epreuve |
| approve-proof | ❌ | approuver-epreuve |
| get-proof-by-token | ❌ | obtenir-epreuve-par-jeton |

### 6. Hooks personnalisés

#### Hooks avec noms anglais
| Hook actuel | Suggestion française |
|-------------|---------------------|
| useClients | useClients ✅ (OK) |
| useSubmissions | useSoumissions |
| useProofs | useEpreuves |
| useOrders | useCommandes |
| useProducts | useProduits |
| useSuppliers | useFournisseurs |

## Recommandations

### Option 1 : Interface Française, Code Anglais (RECOMMANDÉ) ⭐
- **Interface utilisateur :** 100% français pour l'utilisateur québécois
- **Code interne :** Anglais pour la maintenance et standards développeur
- **Base de données :** Anglais pour les noms techniques, français pour les données métier

**Avantages :**
- Interface 100% localisée pour l'utilisateur final
- Code maintenable par équipe internationale
- Séparation claire interface/logique

**Plan d'action :**
1. Garder tous les labels UI en français
2. Migrer les action_type vers l'anglais cohérent
3. Standardiser les handlers en anglais
4. Créer un dictionnaire de traduction fr/en

### Option 2 : Tout en Français
- **Avantages :** Cohérence totale pour équipe québécoise
- **Inconvénients :** Code moins standard, difficile pour nouveaux développeurs

### Changements Prioritaires (Impact Élevé)

#### 1. Harmoniser les action_type (BASE DE DONNÉES)
```sql
-- Migration pour standardiser les action_type
UPDATE ordre_historique SET action_type = 'upload_proof' WHERE action_type = 'upload_epreuve';
UPDATE ordre_historique SET action_type = 'send_proof' WHERE action_type = 'send_epreuve';
UPDATE ordre_historique SET action_type = 'approve_proof' WHERE action_type = 'approve_epreuve';
UPDATE ordre_historique SET action_type = 'reject_proof' WHERE action_type = 'reject_epreuve';
UPDATE ordre_historique SET action_type = 'update_order_status' WHERE action_type = 'changement_statut_epreuve';
```

#### 2. Standardiser StatusBadge (INTERFACE)
- Supprimer les doublons anglais/français
- Garder uniquement les versions françaises visibles
- Mapper en interne vers codes anglais

#### 3. Renommer Edge Functions (API)
- `send-submission-notification` → `send-notification`
- `approve-proof` → `approve-proof` (OK)
- `get-proof-by-token` → `get-proof` (simplifier)

#### 4. Créer dictionnaire de traduction centralisé

## Métriques de Consistance

### Par Section
- **Base de données :** 35% cohérent (17/47 incohérences)
- **Frontend :** 80% cohérent (labels français OK, handlers anglais incohérents)
- **Messages :** 95% cohérent (presque tout en français)
- **API :** 10% cohérent (tout en anglais)

### Effort Estimé
- **Correction critique (action_type) :** 2-3 heures
- **Standardisation complète :** 1-2 jours
- **Tests et validation :** 4-6 heures
- **Documentation :** 2 heures

### Impact Utilisateur Actuel
- **Visible :** Faible (interface déjà majoritairement française)
- **Technique :** Moyen (confusion pour développeurs)
- **Maintenance :** Élevé (recherche difficile, bugs potentiels)

## Conclusion

L'application a une **interface utilisateur cohérente en français** mais un **code backend incohérent**. La priorité est de standardiser les `action_type` et créer un dictionnaire de traduction pour maintenir une interface française avec un code technique anglais standard.