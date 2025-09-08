# Documentation PromoFlow - Imprimerie Grégoire

Bienvenue dans la documentation complète de l'application PromoFlow, le système de gestion intégré pour l'Imprimerie Grégoire.

## 📚 Vue d'ensemble de la documentation

Cette documentation est organisée en plusieurs sections pour vous permettre de comprendre rapidement l'architecture, les fonctionnalités et l'utilisation de l'application.

### 🔍 Documents disponibles

| Document | Description | Audience cible |
|----------|-------------|----------------|
| **[AUDIT.md](./AUDIT.md)** | Audit complet de qualité et recommandations d'amélioration | Direction, Équipe technique |
| **[ERD.md](./ERD.md)** | Diagramme entité-relation et architecture de données | Développeurs, Architectes |
| **[WORKFLOWS.md](./WORKFLOWS.md)** | Processus métier détaillés de bout en bout | Utilisateurs, Managers |
| **[SECURITY-RBAC.md](./SECURITY-RBAC.md)** | Sécurité et contrôle d'accès par rôles | Admins, Sécurité |
| **[EVENTS.md](./EVENTS.md)** | Système d'événements et notifications | Développeurs, Intégrateurs |

## 🚀 Démarrage rapide

### Pour les utilisateurs métier
1. 📖 Lisez **[WORKFLOWS.md](./WORKFLOWS.md)** pour comprendre les processus
2. 🔐 Consultez votre section dans **[SECURITY-RBAC.md](./SECURITY-RBAC.md)** pour vos permissions

### Pour les développeurs
1. 🏗️ Étudiez **[ERD.md](./ERD.md)** pour l'architecture données
2. 🔧 Consultez **[AUDIT.md](./AUDIT.md)** pour les bonnes pratiques
3. ⚡ Explorez **[EVENTS.md](./EVENTS.md)** pour les intégrations

### Pour les administrateurs
1. 🛡️ Maîtrisez **[SECURITY-RBAC.md](./SECURITY-RBAC.md)** pour la sécurité
2. 📊 Analysez **[AUDIT.md](./AUDIT.md)** pour les optimisations
3. 🔔 Configurez **[EVENTS.md](./EVENTS.md)** pour les notifications

## 🎯 Fonctionnalités principales

### 💼 Gestion commerciale
- **Clients** : Création, suivi, historique
- **Devis** : Génération automatique, validation en ligne
- **Commandes** : Workflow complet de production

### 🏭 Production
- **BAT (Bon À Tirer)** : Système de validation client
- **Suivi production** : Temps réel, alertes délais
- **Contrôle qualité** : Validation multi-niveaux

### 👥 Gestion d'équipe
- **Utilisateurs** : Rôles et permissions granulaires
- **Fournisseurs** : Catalogue, performance, suivi
- **Reporting** : Analytics et métriques métier

### 🔔 Communication
- **Notifications** : Email automatique, temps réel
- **Validation client** : Liens sécurisés, expiration
- **Historique** : Traçabilité complète des actions

## 🛠️ Architecture technique

### Frontend
- **Framework** : React 18 + TypeScript + Vite
- **UI** : Tailwind CSS + shadcn/ui
- **État** : React Query + Context API
- **Routing** : React Router v6

### Backend
- **Base de données** : PostgreSQL (Supabase)
- **API** : Edge Functions (Deno/TypeScript)  
- **Authentification** : Supabase Auth + RLS
- **Stockage** : Supabase Storage

### Sécurité
- **Row Level Security** : Accès granulaire par rôle
- **Chiffrement** : TLS 1.3 + AES-256
- **Audit** : Logs complets, RGPD compliant
- **Tokens** : JWT + UUID sécurisés

## 📊 Métriques de qualité

### Score global : 8.2/10

| Critère | Note | Status |
|---------|------|--------|
| Architecture | 9/10 | ✅ Excellente |
| Sécurité | 8/10 | ✅ Très bonne |
| Performance | 7/10 | 🔶 Bonne |
| Maintenabilité | 8/10 | ✅ Très bonne |
| Tests | 3/10 | 🔴 À améliorer |

### Prochaines améliorations
1. **Tests unitaires** (priorité haute)
2. **Optimisation performance** (priorité moyenne)  
3. **Consistance linguistique** (priorité haute)

## 🔗 Liens utiles

### Administration Supabase
- [Dashboard](https://supabase.com/dashboard/project/ytcrplsistsxfaxkfqqp)
- [SQL Editor](https://supabase.com/dashboard/project/ytcrplsistsxfaxkfqqp/sql/new)
- [Edge Functions](https://supabase.com/dashboard/project/ytcrplsistsxfaxkfqqp/functions)
- [Authentification](https://supabase.com/dashboard/project/ytcrplsistsxfaxkfqqp/auth/users)

### Développement
- [Repository GitHub](https://github.com/PromotionGregoire/imprimeriegregoirehub)
- [Application Live](https://lovable.dev/projects/75366268-51f4-4ea3-8dfc-05ac18fb6cac)
- [Logs Production](https://supabase.com/dashboard/project/ytcrplsistsxfaxkfqqp/logs/explorer)

## 🆘 Support et maintenance

### Contact technique
- **Email** : dev@imprimerie-gregoire.fr
- **Documentation** : Cette documentation
- **Issues** : Via le repository GitHub

### Escalade
1. **Niveau 1** : Consultation documentation
2. **Niveau 2** : Équipe développement interne  
3. **Niveau 3** : Support Supabase/Lovable

### Maintenance planifiée
- **Quotidienne** : Backup automatique (3h00)
- **Hebdomadaire** : Mise à jour sécurité (dimanche 2h00)
- **Mensuelle** : Optimisation base de données
- **Trimestrielle** : Audit sécurité complet

## 📈 Roadmap

### Version 2.0 (Q2 2024)
- [ ] Tests automatisés complets
- [ ] Mobile responsive amélioré
- [ ] API publique partenaires
- [ ] IA prédictive délais

### Version 3.0 (Q4 2024)  
- [ ] App mobile native
- [ ] Intégration ERP externe
- [ ] Workflows configurables
- [ ] Analytics avancées BI

---

## 💡 Comment utiliser cette documentation

### 🎯 Par rôle

**🏢 Direction/Management**
```
AUDIT.md → Vue d'ensemble qualité et ROI
WORKFLOWS.md → Processus métier optimisés  
SECURITY-RBAC.md → Conformité et gouvernance
```

**👨‍💻 Équipe technique**
```
ERD.md → Architecture données complète
EVENTS.md → Intégrations et APIs
AUDIT.md → Bonnes pratiques et dettes techniques
```

**👥 Utilisateurs finaux**
```
WORKFLOWS.md → Guide d'utilisation détaillé
SECURITY-RBAC.md → Vos droits et permissions
README.md → Vue d'ensemble générale
```

### 🔍 Par besoin

**🐛 Résolution de problème**
1. Consultez les logs dans Supabase
2. Vérifiez les permissions dans SECURITY-RBAC.md
3. Analysez le workflow dans WORKFLOWS.md

**🚀 Nouvelle fonctionnalité**  
1. Étudiez l'architecture dans ERD.md
2. Comprenez les événements dans EVENTS.md
3. Respectez les bonnes pratiques d'AUDIT.md

**🔒 Question sécurité**
1. SECURITY-RBAC.md est votre référence
2. Vérifiez les RLS policies
3. Consultez les logs d'audit

---

*Cette documentation est maintenue à jour en continu. Dernière mise à jour : Janvier 2024*

**📞 Questions ? Contactez l'équipe technique ou consultez les sections spécialisées ci-dessus.**