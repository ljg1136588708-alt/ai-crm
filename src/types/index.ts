// User (mirrors Supabase users table + Clerk data)
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  gmailConnected: boolean;
  gmailEmail: string | null;
  plan: 'trial' | 'pro' | 'enterprise';
  trialEndsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  id: string;
  userId: string;
  name: string | null;
  email: string | null;
  company: string | null;
  title: string | null;
  avatarUrl: string | null;
  source: string;
  lastContactedAt: string | null;
  dealCount?: number;
  latestDeal?: Deal;
  createdAt: string;
  updatedAt: string;
}

export type DealStage = 'lead' | 'contacted' | 'negotiation' | 'won' | 'lost';

export interface Deal {
  id: string;
  userId: string;
  contactId: string | null;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  title: string;
  amount: number | null;
  currency: string;
  stage: DealStage;
  confidence: number | null;
  nextStep: string | null;
  lastActivityAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface EmailRecord {
  id: string;
  userId: string;
  contactId: string | null;
  dealId: string | null;
  gmailMessageId: string;
  threadId: string | null;
  subject: string | null;
  snippet: string | null;
  sender: string | null;
  senderEmail: string | null;
  recipient: string | null;
  direction: 'inbound' | 'outbound';
  sentAt: string | null;
  createdAt: string;
}

export interface FollowupReminder {
  id: string;
  userId: string;
  contactId: string | null;
  contactName?: string;
  contactEmail?: string;
  contactCompany?: string;
  dealId: string | null;
  dealTitle?: string;
  reason: string;
  draftEmailSubject: string | null;
  draftEmailBody: string | null;
  isDismissed: boolean;
  isSent: boolean;
  createdAt: string;
}

export interface AiActivity {
  id: string;
  userId: string;
  actionType: 'contact_extracted' | 'deal_created' | 'deal_updated' | 'followup_drafted' | 'query_answered';
  inputSummary: string | null;
  outputSummary: string | null;
  tokensUsed: number | null;
  createdAt: string;
}

export interface QueryRecord {
  id: string;
  userId: string;
  queryText: string;
  responseText: string;
  createdAt: string;
}

// Pipeline stats for dashboard
export interface PipelineStats {
  totalDeals: number;
  totalValue: number;
  stageCounts: Record<DealStage, number>;
  followupCount: number;
}

// AI extraction result from email scan
export interface ExtractionResult {
  contact: {
    name: string;
    email: string;
    company?: string;
    title?: string;
  };
  deal?: {
    title: string;
    stage: DealStage;
    confidence: number;
    amount?: number;
  };
}

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
