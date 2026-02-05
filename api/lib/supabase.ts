import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface User {
  id: string
  email: string
  university: string
  country_code: string
  pseudonym: string
  is_banned: boolean
  ban_reason?: string
  created_at: string
  last_active?: string
}

export interface Report {
  id: string
  reporter_id: string
  reported_user_id: string
  reason: string
  chat_context?: string
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed'
  admin_notes?: string
  created_at: string
  reviewed_at?: string
}

export interface VerificationCode {
  id: string
  email: string
  code: string
  expires_at: string
  used: boolean
  created_at: string
}

/*
SQL to create tables in Supabase:

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  university TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'MY',
  pseudonym TEXT NOT NULL,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE
);

-- Verification codes table
CREATE TABLE verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES users(id),
  reported_user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  chat_context TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Admin users table (for admin panel access)
CREATE TABLE admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert yourself as admin
INSERT INTO admins (email) VALUES ('hfyyl16@nottingham.edu.my');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_banned ON users(is_banned);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_verification_codes_email ON verification_codes(email);
*/
