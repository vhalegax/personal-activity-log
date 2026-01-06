-- Migration: Add password column to users and update sync trigger
-- Timestamp: 2026-01-07 09:00:00

-- Add nullable password column
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Replace trigger function to also sync password (from auth.users JSON)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.users (id, email, created_at, updated_at, password)
  VALUES (
    NEW.id,
    NEW.email,
    NOW(),
    NOW(),
    to_json(NEW)->>'encrypted_password'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password = COALESCE(EXCLUDED.password, public.users.password),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Backfill existing users with password hash from auth.users (only when available)
-- This copies the `encrypted_password` field from `auth.users` into `public.users.password`.
-- It only updates rows where `public.users.password` is NULL or empty, and where `auth.users` has a non-null value.
UPDATE public.users u
SET password = a_hash.auth_hash
FROM (
  SELECT id, to_json(a)->>'encrypted_password' AS auth_hash
  FROM auth.users a
) a_hash
WHERE u.id = a_hash.id
  AND (u.password IS NULL OR u.password = '')
  AND a_hash.auth_hash IS NOT NULL;

-- Security note: ensure `encrypted_password` is a password hash (never plaintext). If unsure, skip the backfill.
