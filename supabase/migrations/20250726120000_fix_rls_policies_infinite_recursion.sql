-- Fix infinite recursion in RLS policies
-- The original policies had circular dependencies where policies on user_profiles
-- were querying the same user_profiles table, causing infinite recursion

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can access all leads" ON leads;
DROP POLICY IF EXISTS "Admins can access all scripts" ON generated_scripts;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Admin access to all profiles" ON user_profiles;

-- Create non-recursive policies for user_profiles
-- Users can always view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles (using a non-recursive approach)
-- This specifically allows the admin user without querying user_profiles table
CREATE POLICY "Admin can view all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    auth.uid() = id 
    OR 
    auth.uid() = '012c9eda-9056-47e6-b279-fa529e50f640'::uuid
  );

-- Create non-recursive policies for leads table
-- Only the specific admin user can access leads
CREATE POLICY "Admin can access all leads" ON leads
  FOR ALL TO authenticated
  USING (auth.uid() = '012c9eda-9056-47e6-b279-fa529e50f640'::uuid);

-- Create non-recursive policies for generated_scripts table
-- Only the specific admin user can access generated scripts
CREATE POLICY "Admin can access all scripts" ON generated_scripts
  FOR ALL TO authenticated
  USING (auth.uid() = '012c9eda-9056-47e6-b279-fa529e50f640'::uuid);