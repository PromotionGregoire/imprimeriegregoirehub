import { supabase } from '@/integrations/supabase/client';

export type ArchiveEntityKind = 'submission' | 'order' | 'proof';
export type ArchiveFilter = 'actives' | 'archived' | 'all';

export async function archiveEntity(
  kind: ArchiveEntityKind,
  id: string,
  reason?: string,
  byUserId?: string
) {
  const fn =
    kind === 'submission' ? 'archive_submission' :
    kind === 'order'      ? 'archive_order'      :
                            'archive_proof';

  let args: any;
  if (kind === 'submission') {
    args = { p_submission_id: id, p_reason: reason ?? null, p_by: byUserId ?? null };
  } else if (kind === 'order') {
    args = { p_order_id: id, p_reason: reason ?? null, p_by: byUserId ?? null };
  } else {
    args = { p_proof_id: id, p_reason: reason ?? null, p_by: byUserId ?? null };
  }

  const { error } = await supabase.rpc(fn, args);
  if (error) throw error;
}

export async function unarchiveEntity(
  kind: ArchiveEntityKind,
  id: string
) {
  const fn =
    kind === 'submission' ? 'unarchive_submission' :
    kind === 'order'      ? 'unarchive_order'      :
                            'unarchive_proof';

  let args: any;
  if (kind === 'submission') {
    args = { p_submission_id: id };
  } else if (kind === 'order') {
    args = { p_order_id: id };
  } else {
    args = { p_proof_id: id };
  }

  const { error } = await supabase.rpc(fn, args);
  if (error) throw error;
}

export function getTableNameByFilter(
  baseTable: 'submissions' | 'orders' | 'proofs',
  filter: ArchiveFilter
): string {
  if (filter === 'actives') return `v_active_${baseTable}`;
  if (filter === 'archived') return `v_archived_${baseTable}`;
  return baseTable;
}

export function isArchived(entity: any): boolean {
  return entity?.archived_at != null;
}

export function getArchiveInfo(entity: any) {
  if (!isArchived(entity)) return null;
  
  return {
    archivedAt: entity.archived_at,
    archivedBy: entity.archived_by,
    archiveReason: entity.archive_reason
  };
}