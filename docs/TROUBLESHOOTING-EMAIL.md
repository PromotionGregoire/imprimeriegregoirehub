# Guide de Dépannage - Système Email

## 📧 Problèmes d'Envoi d'Emails

### Erreur: "Invalid `reply_to` field" (Resend)

**Symptôme :**
```
"Failed to send email: Invalid `reply_to` field. The email address needs to follow the `email@example.com` or `Name <email@example.com>` format."
```

**Cause Racine :**
Resend exige que le champ `reply_to` contienne uniquement l'adresse email simple (`email@domain.com`), contrairement au champ `from` qui peut accepter le format avec nom (`Nom <email@domain.com>`).

**Problème Technique :**
Dans les secrets Supabase, si `RESEND_REPLY_TO` contient un format avec nom (ex: `"Imprimerie Grégoire <info@promotiongregoire.com>"`), Resend rejette l'email.

**Solution Appliquée :**

1. **Extraction automatique de l'email pur :**
   ```typescript
   // Fonction pour extraire l'email pur (sans le nom)
   const extractEmailOnly = (emailString: string): string => {
     const match = emailString.match(/<([^>]+)>/);
     return match ? match[1] : emailString;
   };
   
   const replyToEmail = extractEmailOnly(replyToEmailRaw);
   ```

2. **Validation du format :**
   - `from`: Peut être `"Nom <email@domain.com>"` ✅
   - `reply_to`: Doit être `"email@domain.com"` uniquement ✅

**Prévention :**
- Toujours configurer `RESEND_REPLY_TO` avec l'email simple uniquement
- La fonction `extractEmailOnly()` gère automatiquement les deux formats

### Erreur: Colonnes Base de Données Incorrectes

**Symptômes Identifiés et Corrigés :**

1. **`contact_email` au lieu de `email`** ✅ Corrigé
   - Fichiers affectés : `handle-proof-decision/index.ts`

2. **`commentaire` au lieu de `comment_text`** ✅ Corrigé  
   - Fichiers affectés : `handle-proof-decision/index.ts`

### Configuration Recommandée des Secrets

```bash
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM_PROOFS=info@promotiongregoire.com
RESEND_REPLY_TO=info@promotiongregoire.com
PUBLIC_PORTAL_BASE_URL=https://client.promotiongregoire.com
```

**⚠️ Important :**
- `RESEND_FROM_PROOFS` : Peut inclure le nom de l'expéditeur
- `RESEND_REPLY_TO` : EMAIL SIMPLE UNIQUEMENT (sera nettoyé automatiquement)

## 🔧 Fonctions Email Validées

| Fonction | Status | Remarques |
|----------|--------|-----------|
| `send-proof-to-client` | ✅ | Extraction email automatique |
| `handle-proof-decision` | ✅ | Colonnes DB corrigées |
| `approve-proof` | ✅ | Configuration correcte |
| `request-proof-modification` | ✅ | Emails internes OK |
| `handle-quote-decision` | ✅ | Structure validée |

## 🚨 Checklist de Dépannage

1. **Vérifier les secrets Supabase :**
   - [ ] `RESEND_API_KEY` présent et valide
   - [ ] `RESEND_REPLY_TO` ne contient que l'email (pas de nom)
   - [ ] Domaine email validé sur Resend.com

2. **Vérifier les logs Edge Functions :**
   ```bash
   # Chercher les erreurs dans les logs
   "Invalid reply_to field"
   "column does not exist"  
   ```

3. **Tester l'envoi manuel :**
   - Utiliser le bouton "Envoyer au client" sur une épreuve
   - Vérifier les logs de la fonction `send-proof-to-client`

## 📋 Actions Correctives Appliquées

### Commit: Correction Email Reply-To Field
- **Fichier modifié :** `supabase/functions/send-proof-to-client/index.ts`
- **Changement :** Ajout fonction `extractEmailOnly()` pour nettoyer `reply_to`
- **Test :** ✅ Email envoyé avec succès

### Commit: Correction Colonnes Database
- **Fichier modifié :** `supabase/functions/handle-proof-decision/index.ts`
- **Changements :**
  - `contact_email` → `email`
  - `commentaire` → `comment_text`
- **Test :** ✅ Refus d'épreuve fonctionne

---

**Date de création :** 09/01/2025  
**Dernière mise à jour :** 09/01/2025  
**Responsable :** Système de gestion Imprimerie Grégoire