export interface Submission {
  id: string;
  submission_number: string;
  client_id: string;
  sent_at: Date | null;
  deadline: Date | null;
  total_price: number;
  status: SubmissionStatus;
  priority: Priority;
  is_archived: boolean;
  assigned_to?: string | null;
  approval_token?: string | null;
  tags?: string[];
  clients?: {
    business_name: string;
    contact_name?: string;
    contact_email?: string;
  };
  created_at: Date;
  updated_at: Date;
}

export type SubmissionStatus = 
  | 'draft' 
  | 'sent' 
  | 'pending' 
  | 'accepted' 
  | 'rejected';

export type Priority = 
  | 'critical' 
  | 'high' 
  | 'normal' 
  | 'low';

export interface SubmissionFilters {
  search: string;
  status: SubmissionStatus | 'all';
  priority: Priority | 'all';
  assigned_to: string | 'all';
}

export interface DashboardStats {
  total: number;
  completed: number;
  accepted: number;
  sent: number;
  totalValue: number;
}