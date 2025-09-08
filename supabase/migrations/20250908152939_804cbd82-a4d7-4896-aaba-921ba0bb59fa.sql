-- Supprimer temporairement la contrainte CHECK problématique
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS submissions_status_check;
ALTER TABLE submissions DROP CONSTRAINT IF EXISTS chk_submissions_status;