/**
 * Supabase — ფაილების უფასო შესანახი (Firebase Storage-ის ნაცვლად).
 * შეავსე შენი პროექტის მონაცემები (Project Settings → API):
 */
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://sskhqvdukxqotssfdlgv.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNza2hxdmR1a3hxb3Rzc2ZkbGd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1Nzc1MDQsImV4cCI6MjA5OTE1MzUwNH0.4LPSyYGA30DQoPGb9EcquGWKlqiu087cVN7i2dUzaP8';
export const SUPABASE_BUCKET = 'documents'; // public bucket-ის სახელი

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
