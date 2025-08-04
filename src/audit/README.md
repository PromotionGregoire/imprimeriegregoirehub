# Audit de Cohérence Linguistique PromoFlow

Ce dossier contient les outils et rapports pour maintenir la cohérence linguistique de l'application PromoFlow.

## Fichiers

### 📋 `language-consistency-report.md`
Rapport d'audit exhaustif identifiant toutes les incohérences linguistiques dans l'application :
- **Base de données** : Types d'actions, noms de colonnes, tables
- **Frontend** : Handlers, fonctions, composants  
- **Interface** : Labels, boutons, messages
- **API** : Endpoints, services

### 🔧 `../constants/translations.ts`
Dictionnaire de traduction centralisé permettant :
- Mapping des `action_type` de base de données
- Traduction des statuts français ↔ anglais
- Labels UI standardisés
- Messages d'erreur cohérents
- Utilitaires de migration

### 🧪 `../scripts/check-language-consistency.ts`
Script automatisé d'analyse du codebase qui :
- Scanne tous les fichiers source
- Détecte les incohérences linguistiques
- Génère un rapport JSON détaillé
- Fournit des recommandations

## Utilisation

### Exécuter l'audit automatique
```bash
# Installation des dépendances de dev si nécessaire
npm install -D tsx glob

# Exécuter l'audit
npx tsx src/scripts/check-language-consistency.ts

# Le rapport sera généré dans language-consistency-check.json
```

### Lire le rapport manuel
```bash
cat src/audit/language-consistency-report.md
```

### Utiliser le dictionnaire de traduction
```typescript
import { getStatusLabel, UI_LABELS, ACTION_TYPES } from '@/constants/translations';

// Obtenir un label français pour un statut
const frenchLabel = getStatusLabel('approved'); // "Approuvée"

// Utiliser les labels UI standardisés
const saveButton = UI_LABELS.SAVE; // "Sauvegarder"

// Utiliser les action types cohérents
const uploadAction = ACTION_TYPES.UPLOAD_PROOF; // "upload_proof"
```

## Recommandations

### Stratégie adoptée : Interface Française + Code Anglais

✅ **Interface utilisateur** : 100% français pour l'expérience utilisateur québécoise  
✅ **Code technique** : Anglais pour la maintenabilité et standards développeur  
✅ **Dictionnaire centralisé** : Traduction automatique via `translations.ts`

### Changements prioritaires

1. **🔴 CRITIQUE** : Migrer les `action_type` mixtes en base de données
2. **🟠 IMPORTANT** : Standardiser StatusBadge avec dictionnaire
3. **🟡 AMÉLIORATION** : Harmoniser les handlers d'événements

### Plan de migration

```sql
-- Migration des action_type vers standards anglais
UPDATE ordre_historique SET action_type = 'upload_proof' WHERE action_type = 'upload_epreuve';
UPDATE ordre_historique SET action_type = 'send_proof' WHERE action_type = 'send_epreuve';
-- ... voir language-consistency-report.md pour la liste complète
```

## Métriques

- **47 incohérences** détectées au total
- **17 problèmes critiques** (base de données)
- **8 incohérences mixtes** (français/anglais mélangés)
- **Estimation** : 2-3 heures pour corriger les problèmes critiques

## Maintenance continue

1. **Lors d'ajout de nouvelles fonctionnalités** :
   - Ajouter les nouveaux `ACTION_TYPES` dans `translations.ts`
   - Utiliser les labels UI du dictionnaire
   - Préférer les statuts anglais en code, français en interface

2. **Tests réguliers** :
   - Exécuter le script d'audit avant chaque release
   - Vérifier que les nouveaux messages sont en français
   - S'assurer de la cohérence des nouveaux composants

3. **Documentation** :
   - Mettre à jour ce README si de nouveaux patterns sont ajoutés
   - Documenter les exceptions justifiées
   - Maintenir la liste des termes techniques acceptés en anglais

## Support

Pour des questions sur la cohérence linguistique ou l'utilisation de ces outils, consulter :
- Le rapport d'audit détaillé
- Les commentaires dans `translations.ts`
- Les exemples d'usage dans le code existant