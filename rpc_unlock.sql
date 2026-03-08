-- =====================================================================
-- ADMIN BOOTSTRAP UNLOCK
-- Run this in your Supabase SQL Editor
-- =====================================================================

-- This version of the RPC intentionally removes the "IF NOT EXISTS" admin check.
-- Because your database has been completely locked down by the Master script, 
-- you currently do not have a Super Admin account mapped to your login session!
-- Running this will let you freely create your first Admin users from the React dashboard.

CREATE OR REPLACE FUNCTION public.assign_admin_role(target_user_id uuid, target_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO public.admin_users (user_id, role)
    VALUES (target_user_id, target_role);
END;
$$;
