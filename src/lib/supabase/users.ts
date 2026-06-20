import { supabase } from './client';

// Get or create user from Clerk data
export async function upsertUser(clerkId: string, email: string, name?: string, avatarUrl?: string) {
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (existing) {
    const { data } = await supabase
      .from('users')
      .update({ email, name, avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('clerk_id', clerkId)
      .select('*')
      .single();
    return data;
  }

  const { data } = await supabase
    .from('users')
    .insert({
      clerk_id: clerkId,
      email,
      name,
      avatar_url: avatarUrl,
      plan: 'trial',
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select('*')
    .single();

  return data;
}

export async function getUserByClerkId(clerkId: string) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();
  return data;
}

export async function updateGmailConnection(clerkId: string, gmailEmail: string, encryptedToken: string) {
  return supabase
    .from('users')
    .update({
      gmail_connected: true,
      gmail_email: gmailEmail,
      gmail_refresh_token_encrypted: encryptedToken,
      updated_at: new Date().toISOString(),
    })
    .eq('clerk_id', clerkId);
}

export async function updatePlan(clerkId: string, plan: string) {
  return supabase
    .from('users')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('clerk_id', clerkId);
}
