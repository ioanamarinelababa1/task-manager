-- =====================================================================
-- Task Manager — Row Level Security (RLS) Policies
-- =====================================================================
-- Database  : Supabase (PostgreSQL)
-- Auth model: Custom NestJS JWT (not Supabase Auth)
-- Connection: TypeORM connects via service_role key, which bypasses
--             RLS natively in Supabase. These policies therefore act
--             as defense-in-depth for direct DB access (psql, Supabase
--             dashboard, data-API calls, future non-service-role connections).
--
-- HOW TO RUN
--   Open the Supabase Dashboard → SQL Editor and paste + execute this file.
--   All statements are idempotent: re-running after the first apply is safe
--   as long as the policies do not already exist (DROP IF EXISTS guards are
--   included on the policy blocks).
--
-- TABLE NAMES (as created by TypeORM)
--   task            — Task entity  (@Entity() → lowercase class name)
--   users           — User entity  (@Entity('users'))
--   refresh_tokens  — RefreshToken (@Entity('refresh_tokens'))
--
-- COLUMN NAMES
--   TypeORM uses the TypeScript property name as the DB column name by
--   default (no snake_case conversion). "userId" in the entity is
--   "userId" in Postgres — double-quotes required for the mixed-case name.
-- =====================================================================


-- ─────────────────────────────────────────────────────────────────────
-- STEP 1  Configure Supabase to recognise the custom NestJS JWT
-- ─────────────────────────────────────────────────────────────────────
-- The backend signs tokens with JWT_SECRET (see backend/.env).
-- To let Supabase verify the same tokens (needed for auth.jwt() helpers):
--
--   Dashboard → Project Settings → API → JWT Secret
--   Set value = the same string as JWT_SECRET in backend/.env
--
-- IMPORTANT: our JWT sub claim is an integer user id, not a UUID, so
-- Supabase's built-in auth.uid() will not return a useful value. The
-- session-variable approach in Step 4 is used instead.
-- ─────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────
-- STEP 2  Enable Row Level Security on all tables
-- ─────────────────────────────────────────────────────────────────────
-- Once RLS is enabled, every role except service_role and the postgres
-- superuser must have an explicit policy to read or write rows.
-- TypeORM's service_role connection is unaffected.

ALTER TABLE task            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens  ENABLE ROW LEVEL SECURITY;


-- ─────────────────────────────────────────────────────────────────────
-- STEP 3  Service-role full-access policies
-- ─────────────────────────────────────────────────────────────────────
-- The Supabase service_role key bypasses RLS by default (pg_roles has
-- bypassrls = true for that role). These explicit policies are
-- belt-and-suspenders: they survive if that role attribute is ever
-- changed and make the intent clear in pg_policies.

DROP POLICY IF EXISTS "service_role_task_all"           ON task;
DROP POLICY IF EXISTS "service_role_users_all"          ON users;
DROP POLICY IF EXISTS "service_role_refresh_tokens_all" ON refresh_tokens;

CREATE POLICY "service_role_task_all"
  ON task FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_users_all"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_refresh_tokens_all"
  ON refresh_tokens FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────
-- STEP 4  Session-variable ownership policies
-- ─────────────────────────────────────────────────────────────────────
-- For any connection that is NOT the service_role, ownership is
-- enforced by checking a session-local variable:
--
--   SET LOCAL app.current_user_id = '<id>';   -- set before each query
--
-- NestJS / TypeORM does not set this variable today (service_role is
-- used, which bypasses RLS). These policies therefore protect:
--   • Direct psql sessions
--   • Supabase dashboard query runner (authenticated role)
--   • Future anon/authenticated REST API calls via PostgREST
--   • Any future code path that connects without the service_role key
--
-- nullif(..., '') casts safely: if the variable is unset (empty string
-- returned by the true/false flag), the expression evaluates to NULL,
-- which causes the USING check to fail (no rows visible). This is the
-- correct fail-closed behaviour.

-- ── task ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_own_tasks_select" ON task;
DROP POLICY IF EXISTS "users_own_tasks_insert" ON task;
DROP POLICY IF EXISTS "users_own_tasks_update" ON task;
DROP POLICY IF EXISTS "users_own_tasks_delete" ON task;

CREATE POLICY "users_own_tasks_select"
  ON task FOR SELECT
  USING (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  );

CREATE POLICY "users_own_tasks_insert"
  ON task FOR INSERT
  WITH CHECK (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  );

CREATE POLICY "users_own_tasks_update"
  ON task FOR UPDATE
  USING (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  )
  WITH CHECK (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  );

CREATE POLICY "users_own_tasks_delete"
  ON task FOR DELETE
  USING (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  );

-- ── users ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_own_profile_select" ON users;
DROP POLICY IF EXISTS "users_own_profile_update" ON users;

CREATE POLICY "users_own_profile_select"
  ON users FOR SELECT
  USING (
    nullif(current_setting('app.current_user_id', true), '')::integer = id
  );

-- Writes to the users table go through the service_role only (registration,
-- password change). No direct-connection UPDATE policy is intentional.

-- ── refresh_tokens ────────────────────────────────────────────────────

DROP POLICY IF EXISTS "users_own_refresh_tokens_all" ON refresh_tokens;

CREATE POLICY "users_own_refresh_tokens_all"
  ON refresh_tokens FOR ALL
  USING (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  )
  WITH CHECK (
    nullif(current_setting('app.current_user_id', true), '')::integer = "userId"
  );


-- ─────────────────────────────────────────────────────────────────────
-- STEP 5  (Optional) Activate session-variable RLS in TypeORM
-- ─────────────────────────────────────────────────────────────────────
-- If you want TypeORM queries to go through RLS (instead of bypassing
-- it via service_role), update TypeOrmModule.forRootAsync in
-- backend/src/app.module.ts to subscribe to the afterConnect event and
-- issue SET LOCAL before each transaction:
--
--   afterConnect: async (client) => {
--     // set once per connection checkout — guards non-service-role paths
--   }
--
-- Or inject a per-request DataSource and call:
--   await dataSource.query(`SET LOCAL app.current_user_id = '${userId}'`);
--
-- This requires NestJS request-scoped injection and is not implemented
-- in the current codebase. Application-level enforcement (guards +
-- service userId checks) is the primary ownership layer. These RLS
-- policies are the database-level backstop.
-- ─────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES (run after applying)
-- ─────────────────────────────────────────────────────────────────────
-- Check RLS is enabled:
--   SELECT tablename, rowsecurity
--   FROM pg_tables
--   WHERE tablename IN ('task', 'users', 'refresh_tokens');
--
-- List all active policies:
--   SELECT schemaname, tablename, policyname, roles, cmd, qual
--   FROM pg_policies
--   WHERE tablename IN ('task', 'users', 'refresh_tokens')
--   ORDER BY tablename, policyname;
-- ─────────────────────────────────────────────────────────────────────
