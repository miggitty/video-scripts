# Authentication System PRD

## Product Overview

This document outlines the authentication system for the TRANSFORMO AI Content Strategist application using Supabase's built-in authentication with custom role-based access control.

## Core Requirements

### User Registration & Authentication
- **Sign-up Form**: Users can register with email and password
- **Sign-in Form**: Single form for both regular users and admins
- **No Email Confirmation**: Users are immediately added to database upon registration
- **Password Standards**: Minimum 8 characters with standard complexity requirements
- **Session Duration**: 24 hours (Supabase default) with automatic refresh

### Role-Based Access Control
- **Default Role**: All new users get `is_admin: false` by default
- **Admin Privilege**: Only users with `is_admin: true` can access application features
- **Manual Admin Assignment**: Admins are created by manually updating the database
- **Access Restriction**: Non-admin users cannot access any functionality

### Database Schema

#### Users Table (Supabase auth.users)
- Utilizes Supabase's built-in authentication system
- Standard fields: id, email, encrypted_password, created_at, etc.

#### User Profiles Table (Custom)
```sql
CREATE TABLE public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);
```

#### Integration with Existing Tables
- **leads Table**: Add `user_id uuid REFERENCES auth.users(id)` column to link leads to authenticated users
- **generated_scripts Table**: Ensure proper user association for admin viewing

### User Flow

#### New User Registration
1. User fills out sign-up form (email + password)
2. Account created immediately in Supabase auth
3. User profile created with `is_admin: false`
4. User redirected to "Contact Admin" page
5. Admin manually updates `is_admin: true` in database when approved

#### User Sign-in Flow
1. User enters credentials in sign-in form
2. Supabase authenticates user
3. System checks `is_admin` status:
   - **If admin**: Redirect to `/admin` dashboard
   - **If not admin**: Redirect to `/contact-admin` page

### Admin Dashboard Features

#### Admin Dashboard (`/admin`)
- **User Management**: View all registered users with full details
  - Email address
  - Registration date
  - Admin status
  - Last login (if available)
  - User ID
- **User Detail View**: Click on user to navigate to separate page showing:
  - Complete user information
  - Associated leads from `leads` table
  - All generated video scripts with details
  - Timestamps and metadata

#### Admin Capabilities
- View all user accounts and their data
- Access complete video script history per user
- Monitor user registration activity

### Security Implementation

#### Row Level Security (RLS) Policies
```sql
-- User profiles - users can read their own, admins can read all
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Leads table - only admins can access
CREATE POLICY "Admins can access all leads" ON leads
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Generated scripts - only admins can access
CREATE POLICY "Admins can access all scripts" ON generated_scripts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );
```

#### Security Best Practices
- All database tables have RLS enabled
- API routes protected with authentication middleware
- Admin routes require additional admin privilege verification
- Sensitive operations use server-side validation
- No client-side role checking for security decisions

### Pages & Routes

#### Authentication Pages
- `/sign-up` - User registration form
- `/sign-in` - User login form (shared for users and admins)
- `/contact-admin` - Non-admin user landing page

#### Admin Pages
- `/admin` - Admin dashboard with user list
- `/admin/user/[id]` - Individual user detail page with scripts

### Technical Implementation

#### Frontend Components
- `SignUpForm` - Email/password registration
- `SignInForm` - Email/password authentication
- `AdminDashboard` - User management interface
- `UserDetailPage` - Individual user view with scripts
- `ContactAdminPage` - Support page for non-admin users

#### Backend Integration
- Supabase Auth for user management
- Custom middleware for admin role verification
- Database triggers for automatic profile creation
- API routes for admin data access

#### Error Handling
- **Invalid Credentials**: "Invalid email or password" message
- **Network Errors**: "Connection error, please try again" message
- **Registration Errors**: Display specific validation errors
- **Unauthorized Access**: Redirect to appropriate page with message

### Migration Strategy

#### Database Updates
1. Create `user_profiles` table with admin flag
2. Add `user_id` column to existing `leads` table
3. Update `generated_scripts` table if needed for user association
4. Implement RLS policies on all tables
5. Create database trigger for automatic profile creation

#### Data Migration
- Existing leads data remains unchanged initially
- Future leads will be associated with authenticated users
- Admin manually assigns user relationships as needed

### Success Metrics
- Secure user registration and authentication
- Proper role-based access control
- Admin ability to view all user data and scripts
- Non-admin users properly restricted
- No unauthorized access to sensitive data

### Future Considerations
- Email verification system (currently disabled)
- Additional admin roles/permissions
- User self-service password reset
- Audit logging for admin actions
- User activity tracking

---

## Implementation Checklist
- [ ] Set up Supabase authentication configuration
- [ ] Create user profiles table with admin flag
- [ ] Implement RLS policies for all tables
- [ ] Build sign-up/sign-in forms
- [ ] Create admin dashboard
- [ ] Implement admin user detail pages
- [ ] Add contact admin page
- [ ] Set up authentication middleware
- [ ] Test role-based access control
- [ ] Deploy and configure production settings