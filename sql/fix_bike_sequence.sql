-- Fix for: "duplicate key value violates unique constraint bikes_pkey"
-- This resets the sequence ONLY for the bikes table (which uses numeric IDs).
-- Other tables like offers/employees use text/UUIDs and don't need this.

SELECT setval('bikes_id_seq', COALESCE((SELECT MAX(id) FROM bikes), 0)::bigint);
