# Schémas JSON et Types TypeScript - PromoFlow

## 1. Schémas JSON normalisés

### 1.1 Schéma générique d'utilisateur

```json
{
  "$id": "User",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Utilisateur PromoFlow",
  "description": "Schéma standardisé pour tous les utilisateurs du système",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Identifiant unique utilisateur"
    },
    "full_name": {
      "type": "string",
      "minLength": 2,
      "maxLength": 100,
      "description": "Nom complet de l'utilisateur"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Adresse email unique"
    },
    "role": {
      "type": "string",
      "enum": ["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT"],
      "description": "Rôle dans le système"
    },
    "job_title": {
      "type": "string",
      "maxLength": 100,
      "description": "Poste occupé"
    },
    "phone": {
      "type": "string",
      "pattern": "^\\+?[1-9]\\d{1,14}$",
      "description": "Numéro de téléphone international"
    },
    "avatar_url": {
      "type": "string",
      "format": "uri",
      "description": "URL de l'avatar utilisateur"
    },
    "last_login": {
      "type": "string",
      "format": "date-time",
      "description": "Dernière connexion"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "Date de création du compte"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time",
      "description": "Dernière mise à jour"
    }
  },
  "required": ["id", "email", "role", "created_at"],
  "additionalProperties": false
}
```

### 1.2 Schéma générique d'action

```json
{
  "$id": "Action",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Action métier PromoFlow",
  "description": "Schéma pour le tracking des actions utilisateur",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Identifiant unique de l'action"
    },
    "type": {
      "type": "string",
      "enum": [
        "create_client", "create_submission", "send_submission",
        "approve_submission", "reject_submission", "create_proof",
        "approve_proof", "reject_proof", "create_invoice",
        "send_invoice", "record_payment", "create_project",
        "submit_time_off", "approve_time_off", "add_timesheet"
      ],
      "description": "Type d'action standardisé"
    },
    "initiator_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID de l'utilisateur initiateur"
    },
    "initiator_role": {
      "type": "string",
      "enum": ["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT", "SYSTEM"],
      "description": "Rôle de l'initiateur"
    },
    "target_entity": {
      "type": "string",
      "enum": ["client", "submission", "order", "proof", "invoice", "project", "user"],
      "description": "Type d'entité cible"
    },
    "target_id": {
      "type": "string",
      "format": "uuid",
      "description": "ID de l'entité cible"
    },
    "context": {
      "type": "object",
      "description": "Contexte métier de l'action",
      "properties": {
        "ip_address": { "type": "string", "format": "ipv4" },
        "user_agent": { "type": "string" },
        "session_id": { "type": "string" },
        "client_version": { "type": "string" }
      }
    },
    "payload": {
      "type": "object",
      "description": "Données spécifiques à l'action"
    },
    "preconditions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Conditions requises avant l'action"
    },
    "postconditions": {
      "type": "array",
      "items": { "type": "string" },
      "description": "État résultant après l'action"
    },
    "result": {
      "type": "object",
      "properties": {
        "success": { "type": "boolean" },
        "error_code": { "type": "string" },
        "error_message": { "type": "string" },
        "data": { "type": "object" }
      },
      "required": ["success"]
    },
    "occurred_at": {
      "type": "string",
      "format": "date-time",
      "description": "Horodatage de l'action"
    },
    "duration_ms": {
      "type": "integer",
      "minimum": 0,
      "description": "Durée d'exécution en millisecondes"
    },
    "trace_id": {
      "type": "string",
      "description": "ID de trace pour le suivi distribué"
    }
  },
  "required": ["id", "type", "target_entity", "occurred_at"],
  "additionalProperties": false
}
```

### 1.3 Schéma générique de fonction

```json
{
  "$id": "FunctionSpec",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Spécification de fonction",
  "description": "Schéma pour documenter les fonctions système",
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-zA-Z][a-zA-Z0-9_-]*$",
      "description": "Nom de la fonction"
    },
    "version": {
      "type": "string",
      "pattern": "^\\d+\\.\\d+\\.\\d+$",
      "description": "Version sémantique"
    },
    "type": {
      "type": "string",
      "enum": ["edge_function", "db_function", "trigger", "view", "hook", "service"],
      "description": "Type de fonction"
    },
    "inputs": {
      "type": "object",
      "description": "Schéma des paramètres d'entrée",
      "properties": {
        "schema": { "$ref": "http://json-schema.org/draft-07/schema#" },
        "examples": {
          "type": "array",
          "items": { "type": "object" }
        }
      }
    },
    "outputs": {
      "type": "object",
      "description": "Schéma des données de sortie",
      "properties": {
        "schema": { "$ref": "http://json-schema.org/draft-07/schema#" },
        "examples": {
          "type": "array",
          "items": { "type": "object" }
        }
      }
    },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "code": { "type": "string" },
          "message": { "type": "string" },
          "http_status": { "type": "integer", "minimum": 400, "maximum": 599 }
        },
        "required": ["code", "message"]
      },
      "description": "Erreurs possibles"
    },
    "dependencies": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Dépendances externes"
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT", "PUBLIC"]
      },
      "description": "Rôles autorisés"
    },
    "rate_limit": {
      "type": "object",
      "properties": {
        "requests_per_minute": { "type": "integer", "minimum": 1 },
        "burst_size": { "type": "integer", "minimum": 1 }
      }
    },
    "sla": {
      "type": "object",
      "properties": {
        "response_time_ms": { "type": "integer", "minimum": 1 },
        "availability_percent": { "type": "number", "minimum": 90, "maximum": 100 }
      }
    }
  },
  "required": ["name", "type", "inputs", "outputs"],
  "additionalProperties": false
}
```

### 1.4 Schéma entité métier

```json
{
  "$id": "BusinessEntity",
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "title": "Entité métier générique",
  "description": "Base pour toutes les entités métier",
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "Identifiant unique"
    },
    "entity_type": {
      "type": "string",
      "enum": ["client", "submission", "order", "proof", "invoice", "project"],
      "description": "Type d'entité"
    },
    "status": {
      "type": "string",
      "description": "Statut actuel (spécifique au type)"
    },
    "metadata": {
      "type": "object",
      "description": "Métadonnées flexibles"
    },
    "audit_trail": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "action": { "type": "string" },
          "user_id": { "type": "string", "format": "uuid" },
          "timestamp": { "type": "string", "format": "date-time" },
          "changes": { "type": "object" }
        },
        "required": ["action", "timestamp"]
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    },
    "updated_at": {
      "type": "string",
      "format": "date-time"
    },
    "created_by": {
      "type": "string",
      "format": "uuid"
    },
    "updated_by": {
      "type": "string",
      "format": "uuid"
    }
  },
  "required": ["id", "entity_type", "status", "created_at"],
  "additionalProperties": true
}
```

## 2. Types TypeScript

### 2.1 Types de base

```typescript
// Types de rôles
export type Role = "ADMIN" | "MANAGER" | "EMPLOYEE" | "CLIENT";

// Types de statuts
export type SubmissionStatus = "draft" | "pending" | "approved" | "rejected" | "modification_requested";
export type OrderStatus = "pending" | "in_production" | "quality_check" | "ready_for_delivery" | "delivered";
export type ProofStatus = "pending" | "approved" | "rejected" | "expired";
export type InvoiceStatus = "draft" | "sent" | "partial" | "paid" | "overdue" | "void";
export type ProjectStatus = "open" | "paused" | "completed" | "archived";
export type PaymentMethod = "card" | "ach" | "cash" | "check" | "wire" | "other";

// Types génériques
export type UUID = string;
export type Timestamp = string; // ISO 8601
export type Currency = "CAD" | "USD" | "EUR";
```

### 2.2 Interfaces utilisateur

```typescript
export interface User {
  id: UUID;
  full_name?: string;
  email: string;
  role: Role;
  job_title?: string;
  phone?: string;
  avatar_url?: string;
  password_reset_required?: boolean;
  last_login?: Timestamp;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

export interface UserProfile extends User {
  hire_date?: string; // YYYY-MM-DD
  employment_status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  permissions?: string[];
  preferences?: Record<string, any>;
}

export interface UserSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: Timestamp;
  permissions: string[];
}
```

### 2.3 Interfaces d'actions

```typescript
export interface AppAction<TPayload = any> {
  id: UUID;
  type: string;
  initiator_id?: UUID;
  initiator_role?: Role;
  target_entity: string;
  target_id?: UUID;
  context?: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
    client_version?: string;
    [key: string]: any;
  };
  payload?: TPayload;
  preconditions?: string[];
  postconditions?: string[];
  result?: {
    success: boolean;
    error_code?: string;
    error_message?: string;
    data?: any;
  };
  occurred_at: Timestamp;
  duration_ms?: number;
  trace_id?: string;
}

// Actions spécifiques
export interface CreateClientAction extends AppAction<{
  client_data: Partial<Client>;
}> {
  type: "create_client";
  target_entity: "client";
}

export interface SendSubmissionAction extends AppAction<{
  submission_id: UUID;
  client_email: string;
}> {
  type: "send_submission";
  target_entity: "submission";
}

export interface ApproveProofAction extends AppAction<{
  approval_token: string;
  comments?: string;
}> {
  type: "approve_proof";
  target_entity: "proof";
}
```

### 2.4 Interfaces de fonctions

```typescript
export interface FunctionSpec<I = any, O = any> {
  name: string;
  version?: string;
  type: "edge_function" | "db_function" | "trigger" | "view" | "hook" | "service";
  inputs: I;
  outputs: O;
  errors?: Array<{
    code: string;
    message: string;
    http_status?: number;
  }>;
  dependencies?: string[];
  permissions?: Role[];
  rate_limit?: {
    requests_per_minute: number;
    burst_size?: number;
  };
  sla?: {
    response_time_ms: number;
    availability_percent: number;
  };
}

// Spécialisations pour Edge Functions
export interface EdgeFunctionSpec<I = any, O = any> extends FunctionSpec<I, O> {
  type: "edge_function";
  cors_enabled: boolean;
  jwt_verification: boolean;
  secrets_required?: string[];
}

// Spécialisations pour DB Functions
export interface DbFunctionSpec<I = any, O = any> extends FunctionSpec<I, O> {
  type: "db_function";
  security_definer: boolean;
  search_path: string;
  language: "plpgsql" | "sql";
}
```

### 2.5 Interfaces entités métier

```typescript
export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at?: Timestamp;
  created_by?: UUID;
  updated_by?: UUID;
}

export interface Client extends BaseEntity {
  client_number: string;
  business_name: string;
  contact_name: string;
  email: string;
  phone_number: string;
  status?: string;
  billing_address?: {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  };
  shipping_address?: {
    street?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  };
  assigned_user_id?: UUID;
  industry?: string;
  client_type?: string;
  general_notes?: string;
}

export interface Submission extends BaseEntity {
  submission_number: string;
  client_id: UUID;
  status: SubmissionStatus;
  total_price?: number;
  sent_at?: Timestamp;
  deadline?: Timestamp;
  valid_until: Timestamp;
  approval_token?: string;
  acceptance_token: string;
  approved_by?: string;
  modification_request_notes?: string;
  items?: SubmissionItem[];
  client?: Client;
}

export interface SubmissionItem extends BaseEntity {
  submission_id: UUID;
  product_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  product_id?: UUID;
}

export interface Order extends BaseEntity {
  order_number: string;
  submission_id: UUID;
  client_id: UUID;
  status: OrderStatus;
  total_price: number;
  submission?: Submission;
  proofs?: Proof[];
  invoices?: Invoice[];
}

export interface Proof extends BaseEntity {
  order_id: UUID;
  version: number;
  status: ProofStatus;
  file_url?: string;
  approval_token?: string;
  validation_token?: string;
  client_comments?: string;
  approved_by_name?: string;
  approved_at?: Timestamp;
  uploaded_by?: UUID;
  uploaded_at?: Timestamp;
  is_active: boolean;
}

export interface Invoice extends BaseEntity {
  number: string;
  client_id: UUID;
  submission_id?: UUID;
  order_id?: UUID;
  status: InvoiceStatus;
  currency: Currency;
  subtotal: number;
  taxes: number;
  total: number;
  balance_due: number;
  issued_at?: Timestamp;
  due_at?: Timestamp;
  paid_at?: Timestamp;
  lines?: InvoiceLine[];
  payments?: Payment[];
}

export interface InvoiceLine extends BaseEntity {
  invoice_id: UUID;
  product_id?: UUID;
  service_id?: UUID;
  label: string;
  qty: number;
  unit_price: number;
  tax_codes?: string[];
  total: number; // computed
}

export interface Payment extends BaseEntity {
  invoice_id: UUID;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  provider?: Record<string, any>;
  received_at: Timestamp;
}

export interface Project extends BaseEntity {
  client_id: UUID;
  manager_id?: UUID;
  title: string;
  status: ProjectStatus;
  priority?: string;
  start_date?: string; // YYYY-MM-DD
  due_date?: string; // YYYY-MM-DD
  budget?: number;
  notes?: string;
  members?: ProjectMember[];
  files?: ProjectFile[];
}

export interface ProjectMember {
  project_id: UUID;
  profile_id: UUID;
  role?: string;
}

export interface ProjectFile extends BaseEntity {
  project_id: UUID;
  file_url: string;
  label?: string;
  uploaded_by?: UUID;
}
```

### 2.6 Types API et hooks

```typescript
// Types pour les hooks React Query
export interface UseQueryResult<T> {
  data?: T;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export interface UseMutationResult<T, V> {
  mutate: (variables: V) => void;
  mutateAsync: (variables: V) => Promise<T>;
  data?: T;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
}

// Types pour les filtres
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams<T = any> extends PaginationParams {
  search?: string;
  sort_by?: keyof T;
  sort_order?: "asc" | "desc";
  status?: string[];
  date_from?: string;
  date_to?: string;
  [key: string]: any;
}

// Types pour les responses API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    pages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  http_status: number;
}

// Types pour les forms
export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormHandlers<T> {
  handleChange: (field: keyof T, value: any) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  reset: () => void;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
}
```

### 2.7 Types de configuration

```typescript
export interface AppConfig {
  api: {
    base_url: string;
    timeout_ms: number;
    retry_attempts: number;
  };
  auth: {
    token_refresh_threshold_ms: number;
    session_duration_ms: number;
  };
  features: {
    invoicing_enabled: boolean;
    projects_enabled: boolean;
    hr_enabled: boolean;
    real_time_updates: boolean;
  };
  ui: {
    theme: "light" | "dark" | "auto";
    language: "fr" | "en";
    timezone: string;
    currency: Currency;
  };
  limits: {
    max_file_size_mb: number;
    max_files_per_upload: number;
    session_timeout_minutes: number;
  };
}

export interface EnvironmentConfig {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  RESEND_API_KEY?: string;
  STRIPE_PUBLISHABLE_KEY?: string;
  SENTRY_DSN?: string;
  NODE_ENV: "development" | "production" | "test";
}
```

## 3. Schémas de validation Zod

### 3.1 Validateurs de base

```typescript
import { z } from "zod";

export const UUIDSchema = z.string().uuid("Format UUID invalide");
export const EmailSchema = z.string().email("Format email invalide");
export const PhoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide");
export const CurrencySchema = z.enum(["CAD", "USD", "EUR"]);
export const RoleSchema = z.enum(["ADMIN", "MANAGER", "EMPLOYEE", "CLIENT"]);

export const TimestampSchema = z.string().datetime("Format date-time invalide");
export const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format date invalide (YYYY-MM-DD)");

export const PaginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  offset: z.number().int().min(0).optional(),
});
```

### 3.2 Validateurs entités

```typescript
export const UserSchema = z.object({
  id: UUIDSchema,
  full_name: z.string().min(2).max(100).optional(),
  email: EmailSchema,
  role: RoleSchema,
  job_title: z.string().max(100).optional(),
  phone: PhoneSchema.optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.optional(),
});

export const ClientSchema = z.object({
  id: UUIDSchema,
  client_number: z.string().min(1),
  business_name: z.string().min(1).max(200),
  contact_name: z.string().min(1).max(100),
  email: EmailSchema,
  phone_number: PhoneSchema,
  status: z.string().optional(),
  industry: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema.optional(),
});

export const SubmissionSchema = z.object({
  id: UUIDSchema,
  submission_number: z.string().min(1),
  client_id: UUIDSchema,
  status: z.enum(["draft", "pending", "approved", "rejected", "modification_requested"]),
  total_price: z.number().min(0).optional(),
  valid_until: TimestampSchema,
  created_at: TimestampSchema,
});

export const InvoiceSchema = z.object({
  id: UUIDSchema,
  number: z.string().min(1),
  client_id: UUIDSchema,
  status: z.enum(["draft", "sent", "partial", "paid", "overdue", "void"]),
  currency: CurrencySchema,
  subtotal: z.number().min(0),
  taxes: z.number().min(0),
  total: z.number().min(0),
  balance_due: z.number().min(0),
  created_at: TimestampSchema,
});
```

### 3.3 Validateurs formulaires

```typescript
export const CreateClientFormSchema = z.object({
  business_name: z.string().min(1, "Nom d'entreprise requis").max(200),
  contact_name: z.string().min(1, "Nom de contact requis").max(100),
  email: EmailSchema,
  phone_number: PhoneSchema,
  industry: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().optional(),
  billing_province: z.string().optional(),
  billing_postal_code: z.string().optional(),
  general_notes: z.string().max(1000).optional(),
});

export const CreateSubmissionFormSchema = z.object({
  client_id: UUIDSchema,
  items: z.array(z.object({
    product_name: z.string().min(1, "Nom de produit requis"),
    description: z.string().optional(),
    quantity: z.number().int().min(1, "Quantité minimum 1"),
    unit_price: z.number().min(0, "Prix doit être positif"),
  })).min(1, "Au moins un item requis"),
  deadline: DateSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const RecordPaymentFormSchema = z.object({
  invoice_id: UUIDSchema,
  amount: z.number().min(0.01, "Montant doit être positif"),
  method: z.enum(["card", "ach", "cash", "check", "wire", "other"]),
  reference: z.string().optional(),
  received_at: TimestampSchema.optional(),
});
```

## 4. Documentation des types

### 4.1 Conventions de nommage

- **Interfaces**: PascalCase (ex: `UserProfile`)
- **Types unions**: PascalCase (ex: `Role`)
- **Constantes**: UPPER_SNAKE_CASE (ex: `MAX_FILE_SIZE`)
- **Fonctions**: camelCase (ex: `validateEmail`)
- **Propriétés**: snake_case pour correspondre à la DB (ex: `created_at`)

### 4.2 Organisation des fichiers

```
src/types/
├── base.ts          # Types de base (UUID, Timestamp, etc.)
├── entities/        # Types d'entités métier
│   ├── user.ts
│   ├── client.ts
│   ├── submission.ts
│   ├── order.ts
│   ├── invoice.ts
│   └── project.ts
├── api/            # Types API et responses
│   ├── requests.ts
│   ├── responses.ts
│   └── errors.ts
├── forms/          # Types et schémas de formulaires
│   ├── validation.ts
│   └── schemas.ts
├── hooks/          # Types pour hooks React
│   └── query.ts
└── index.ts        # Exports centralisés
```

### 4.3 Best practices

1. **Immutabilité**: Utiliser `Readonly<T>` pour les données en lecture seule
2. **Optionalité**: Préférer `T | undefined` à `T?` pour la clarté
3. **Unions discriminées**: Utiliser des unions avec champ discriminant
4. **Génériques**: Limiter la complexité, préférer des types concrets
5. **Documentation**: Ajouter des JSDoc pour les types complexes
6. **Validation**: Coupler chaque type avec un schéma Zod correspondant