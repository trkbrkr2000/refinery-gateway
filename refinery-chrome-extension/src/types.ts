// Shared types for Chrome extension

export interface Claim {
  id: string;
  condition: string;
  status: string;
  filedDate: string;
  lastUpdated: string;
  evidence: any[];
  timeline: any[];
}

export interface VeteranInfo {
  name: string;
  ssn?: string;
  vaFileNumber?: string;
  dateOfBirth?: string;
}

export interface ClaimsData {
  claims: Claim[];
  veteranInfo: VeteranInfo;
  fetchedAt?: string; // From API
  lastSync?: string;  // From storage
}

export interface MessageRequest {
  action: string;
  url?: string;
}

export interface MessageResponse {
  authenticated?: boolean;
  success?: boolean;
  status?: number;
  data?: any;
  error?: string;
}
