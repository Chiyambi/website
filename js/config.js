// ============================================
// EPH-B.com — Supabase Configuration
// ============================================
// 1. Go to https://supabase.com and create a project
// 2. Copy your Project URL and anon public key
// 3. Paste them below
// 4. Run the SQL schema in supabase/schema.sql

const SUPABASE_URL = 'https://nklpofapqtlwrnuewgvy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbHBvZmFwcXRsd3JudWV3Z3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMTQyNDUsImV4cCI6MjA4OTU5MDI0NX0.Xv7qvW1cs-__1E8pHe5E6oCwsdXMiepfOzfBMWUXSDU';




let supabaseClient = null;
let supabaseAdminClient = null;

function initSupabase() {
  if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabaseClient;
  }
  console.error('Supabase client not loaded. Make sure the CDN script is included.');
  return null;
}

// Helper: Get public URL from storage path
function getPublicUrl(bucket, path) {
  if (!supabaseClient) return '';
  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || '';
}

// Helper: Upload file to storage
async function uploadFile(bucket, file, folder = '') {
  if (!supabaseClient) throw new Error('Supabase not initialized');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
  const filePath = folder ? `${folder}/${fileName}` : fileName;

  const { data, error } = await supabaseClient.storage
    .from(bucket)
    .upload(filePath, file, { cacheControl: '3600', upsert: false });

  if (error) throw error;
  return { path: filePath, publicUrl: getPublicUrl(bucket, filePath) };
}

// Helper: Delete file from storage
async function deleteFile(bucket, path) {
  if (!supabaseClient) throw new Error('Supabase not initialized');
  const { error } = await supabaseClient.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// Helper: Extract path from public URL
function extractPathFromUrl(url) {
  if (!url) return '';
  try {
    const urlObj = new URL(url);
    const parts = urlObj.pathname.split('/');
    // Remove empty strings and the first part (bucket name)
    const filtered = parts.filter(p => p && p !== 'object' && p !== 'public' && p !== 'storage' && p !== 'v1');
    return filtered.slice(1).join('/');
  } catch {
    return '';
  }
}
