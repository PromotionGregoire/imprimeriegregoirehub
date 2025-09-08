# Inventaire des fonctions - PromoFlow

## 1. Edge Functions (Supabase)

| ID  | Nom fonction                   | Entrées                                       | Sorties                    | Dépendances                                                 | Erreurs notables                           |
| --- | ------------------------------ | --------------------------------------------- | -------------------------- | ----------------------------------------------------------- | ------------------------------------------ |
| E01 | `send-submission-notification` | `submissionId`, `clientEmail`                 | `{success}`                | tables `submissions, clients, submission_items`, Resend API | 400 input, 404 missing, 502 email provider |
| E02 | `handle-submission-approval`   | `submission_id`, `client_id`                  | `{order_id}`               | trigger mentionné, crée commande                            | 409 état invalide, 500 DB                  |
| E03 | `handle-submission-rejection`  | `submission_id`, `rejection_reason`           | `{success}`                | `submissions`                                               | 409 si statut non pending                  |
| E04 | `notify-production-team`       | `order_id`, `priority`                        | `{queued:true}`            | Slack/Email interne                                         | 502 intégration down                       |
| E05 | `webhook-dispatcher`           | `event{type,payload}`                         | `{delivered, failed}`      | `webhook_configurations`                                    | 401 signature, 410 endpoint inactif        |
| E06 | `handle-payment-webhook`       | raw body Stripe + header                      | `OK`                       | Stripe SDK, `payments`                                      | 400 signature, 422 mapping                 |
| E07 | `create-invoice-from-order`    | `order_id`                                    | `{invoice_id}`             | `orders, invoices, invoice_lines`                           | 409 déjà facturé                           |
| E08 | `send-invoice-email`           | `invoice_id`, `to`                            | `{sent:true}`              | Resend, `invoices`                                          | 412 status non sentable                    |
| E09 | `record-payment`               | `invoice_id`, `amount`, `method`, `reference` | `{payment_id, new_status}` | `payments, invoices`                                        | 422 amount, 409 overpay                    |
| E10 | `system-monitoring`            | none                                          | rapport synthèse           | logs, vues métriques                                        | 500 check interne                          |
| E11 | `process-email-queue`          | none                                          | `{processed, failed}`      | `email_queue`                                               | 429 backoff                                |
| E12 | `proof-approval-public`        | `approval_token`, `decision`, `comments?`     | `{status}`                 | `proofs`, `orders`                                          | 410 token expiré                           |

## 2. Fonctions base de données

| ID  | Nom fonction                    | Type     | Paramètres                           | Retour                    | Utilisation                               |
| --- | ------------------------------- | -------- | ------------------------------------ | ------------------------- | ----------------------------------------- |
| F01 | `is_admin()`                    | SQL      | -                                    | `boolean`                 | RLS policies                              |
| F02 | `generate_product_code()`       | PL/pgSQL | `product_name`, `product_category`   | `text`                    | Trigger auto-génération codes produits   |
| F03 | `generate_client_number()`      | PL/pgSQL | -                                    | `text`                    | Default client_number                     |
| F04 | `generate_order_number()`       | PL/pgSQL | -                                    | `text`                    | Default order_number                      |
| F05 | `generate_submission_number()`  | PL/pgSQL | -                                    | `text`                    | Default submission_number                 |
| F06 | `gen_invoice_number()`          | PL/pgSQL | -                                    | `text`                    | Génération numéros factures               |
| F07 | `handle_new_user()`             | PL/pgSQL | NEW (trigger)                        | `trigger`                 | Création profil auto lors signup          |
| F08 | `update_updated_at_column()`    | PL/pgSQL | NEW (trigger)                        | `trigger`                 | Mise à jour automatique timestamps       |
| F09 | `get_submission_for_approval()` | PL/pgSQL | `p_token`, `p_token_type`            | TABLE                     | Récupération soumission publique         |
| F10 | `get_proof_for_approval()`      | PL/pgSQL | `p_approval_token`                   | TABLE                     | Récupération épreuve pour validation     |
| F11 | `add_ordre_history()`           | PL/pgSQL | `p_order_id`, `p_action_type`, etc.  | `uuid`                    | Journalisation historique commandes      |
| F12 | `invoices_set_defaults()`       | PL/pgSQL | NEW (trigger)                        | `trigger`                 | Calculs automatiques factures            |
| F13 | `after_payment_update_invoice()`| PL/pgSQL | NEW (trigger)                        | `trigger`                 | Recalcul balance après paiement          |

## 3. Hooks React (Frontend)

| ID  | Nom hook                     | Paramètres                | Retour                        | Dépendances          | Fonctionnalité                    |
| --- | ---------------------------- | ------------------------- | ----------------------------- | -------------------- | --------------------------------- |
| H01 | `useAuth()`                  | -                         | `{user, loading, signOut}`    | Supabase Auth        | Gestion authentification          |
| H02 | `useClients()`               | `filters?`                | `{data, loading, error}`      | React Query          | Liste clients avec filtres        |
| H03 | `useClientDetails()`         | `clientId`                | `{client, loading, error}`    | React Query          | Détails client spécifique         |
| H04 | `useSubmissions()`           | `filters?`                | `{data, loading, error}`      | React Query          | Liste soumissions                 |
| H05 | `useSubmissionDetails()`     | `submissionId`            | `{submission, loading}`       | React Query          | Détails soumission                |
| H06 | `useOrders()`                | `filters?`                | `{orders, loading, error}`    | React Query          | Liste commandes                   |
| H07 | `useProofs()`                | `filters?`                | `{proofs, loading, error}`    | React Query          | Liste épreuves/BAT                |
| H08 | `useProducts()`              | -                         | `{products, loading}`         | React Query          | Catalogue produits                |
| H09 | `useSuppliers()`             | -                         | `{suppliers, loading}`        | React Query          | Liste fournisseurs                |
| H10 | `useToast()`                 | -                         | `{toast, dismiss}`            | shadcn/ui            | Notifications utilisateur         |
| H11 | `useInvoices()`              | `filters?`                | `{invoices, loading, error}`  | React Query          | Liste factures                    |
| H12 | `useProjects()`              | `filters?`                | `{projects, loading, error}`  | React Query          | Liste projets/dossiers            |
| H13 | `useTimeOffRequests()`       | -                         | `{requests, loading, error}`  | React Query          | Demandes de congé                 |
| H14 | `useTimesheets()`            | `filters?`                | `{timesheets, loading}`       | React Query          | Feuilles de temps                 |

## 4. Fonctions utilitaires (Frontend)

| ID  | Nom fonction           | Paramètres                    | Retour       | Description                           |
| --- | ---------------------- | ----------------------------- | ------------ | ------------------------------------- |
| U01 | `cn()`                 | `...ClassValue[]`             | `string`     | Fusion classes CSS (clsx + twMerge)   |
| U02 | `formatCurrency()`     | `amount`, `currency?`         | `string`     | Formatage montants monétaires         |
| U03 | `formatDate()`         | `date`, `format?`             | `string`     | Formatage dates localisées            |
| U04 | `generateId()`         | -                             | `string`     | Génération UUID côté client           |
| U05 | `validateEmail()`      | `email`                       | `boolean`    | Validation format email               |
| U06 | `validatePhone()`      | `phone`                       | `boolean`    | Validation numéro téléphone           |
| U07 | `sanitizeInput()`      | `input`                       | `string`     | Nettoyage entrées utilisateur         |
| U08 | `downloadFile()`       | `url`, `filename`             | `Promise`    | Téléchargement fichiers               |
| U09 | `uploadFile()`         | `file`, `bucket`, `path`      | `Promise`    | Upload fichiers Supabase Storage      |
| U10 | `debounce()`           | `func`, `wait`                | `function`   | Limitation fréquence appels           |

## 5. Composants de service (Frontend)

| ID  | Nom service            | Méthodes principales          | Responsabilité                        |
| --- | ---------------------- | ----------------------------- | ------------------------------------- |
| S01 | `ApiClient`            | `get()`, `post()`, `put()`    | Communication API centralisée         |
| S02 | `AuthService`          | `login()`, `logout()`, `refresh()` | Gestion authentification             |
| S03 | `NotificationService`  | `show()`, `hide()`, `clear()` | Système notifications                 |
| S04 | `FileService`          | `upload()`, `download()`, `delete()` | Gestion fichiers                   |
| S05 | `ValidationService`    | `validate()`, `sanitize()`    | Validation données                    |
| S06 | `CacheService`         | `get()`, `set()`, `clear()`   | Cache local données                   |
| S07 | `LoggingService`       | `log()`, `warn()`, `error()`  | Journalisation erreurs                |
| S08 | `MetricsService`       | `track()`, `flush()`          | Métriques usage                       |

## 6. Workers et tâches automatisées

| ID  | Nom worker              | Déclencheur                   | Fréquence     | Fonctionnalité                        |
| --- | ----------------------- | ----------------------------- | ------------- | ------------------------------------- |
| W01 | `EmailQueueProcessor`   | Cron                          | Chaque minute | Traitement queue emails               |
| W02 | `InvoiceReminderJob`    | Cron                          | Quotidien     | Rappels factures échues               |
| W03 | `DataCleanupWorker`     | Cron                          | Hebdomadaire  | Nettoyage données obsolètes           |
| W04 | `BackupWorker`          | Cron                          | Quotidien     | Sauvegarde données critiques          |
| W05 | `MetricsAggregator`     | Cron                          | Horaire       | Agrégation métriques business         |
| W06 | `NotificationProcessor` | Event-driven                  | Temps réel    | Traitement notifications push         |

## 7. Intégrations externes

| ID  | Service externe        | Fonctions d'interface         | Utilisation                           |
| --- | ---------------------- | ----------------------------- | ------------------------------------- |
| I01 | `Resend API`           | `sendEmail()`, `getStatus()`  | Envoi emails transactionnels          |
| I02 | `Stripe API`           | `createPayment()`, `webhook()` | Traitement paiements                 |
| I03 | `Supabase Storage`     | `upload()`, `download()`      | Stockage fichiers                     |
| I04 | `Supabase Auth`        | `signIn()`, `signUp()`        | Authentification utilisateurs         |
| I05 | `Supabase Realtime`    | `subscribe()`, `unsubscribe()` | Mises à jour temps réel              |

## 8. Métriques et monitoring

### Métriques de performance
- Temps de réponse moyen par fonction
- Taux d'erreur par endpoint
- Utilisation mémoire et CPU
- Latence base de données

### Métriques métier
- Nombre de soumissions créées/jour
- Taux de conversion soumission → commande  
- Temps moyen de traitement des épreuves
- Volume de facturation mensuel

### Alertes configurées
- Taux d'erreur > 5% sur une période de 5 minutes
- Latence > 2 secondes sur endpoints critiques
- Échec d'envoi d'emails > 10% sur 1 heure
- Utilisation disque > 85%

## 9. Documentation technique

### Schémas OpenAPI
- Endpoints REST documentés avec Swagger
- Exemples de requêtes/réponses
- Codes d'erreur standardisés

### Tests automatisés
- Tests unitaires: 85% couverture
- Tests d'intégration: endpoints critiques
- Tests E2E: workflows principaux
- Tests de charge: 100 utilisateurs simultanés

### Déploiement
- Pipeline CI/CD automatisé
- Déploiement blue-green
- Rollback automatique en cas d'erreur
- Monitoring post-déploiement