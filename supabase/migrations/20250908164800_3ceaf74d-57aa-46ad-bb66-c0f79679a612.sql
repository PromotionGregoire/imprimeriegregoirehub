-- Supprimer l'ancienne version de add_ordre_history avec moins de paramètres
DROP FUNCTION IF EXISTS add_ordre_history(uuid, text, text, jsonb, uuid, boolean);

-- Garder seulement la version avec created_by
-- La fonction add_ordre_history(uuid, text, text, jsonb, uuid, boolean, uuid) reste disponible