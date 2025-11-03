// ClaimReady VA Tracker Chrome Extension
// Content script for fetching VA.gov data via API

// Inline types (can't use imports in content scripts)
interface Claim {
  id: string;
  condition: string;
  status: string;
  filedDate: string;
  lastUpdated: string;
  evidence: any[];
  timeline: any[];
}

interface VeteranInfo {
  name: string;
  ssn?: string;
  vaFileNumber?: string;
  dateOfBirth?: string;
}

interface ClaimsData {
  claims: Claim[];
  veteranInfo: VeteranInfo;
  fetchedAt?: string;
  lastSync?: string;
}

interface MessageRequest {
  action: string;
  url?: string;
}

interface MessageResponse {
  authenticated?: boolean;
  success?: boolean;
  status?: number;
  data?: any;
  error?: string;
}

class VaGovApiClient {
  private apiBaseUrl: string = 'https://api.va.gov';
  private isAuthenticated: boolean = false;

  constructor() {
    this.init();
  }

  private init(): void {
    console.log('🚀 VA.gov API Client initialized');

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
      this.handleMessage(request, sendResponse);
      return true; // Required for async sendResponse
    });

    // Check authentication on load
    this.checkAuthentication();
  }

  private async handleMessage(request: MessageRequest, sendResponse: (response: MessageResponse) => void): Promise<void> {
    try {
      switch (request.action) {
        case 'checkAuth':
        case 'checkVaAuth':
          const isAuth = await this.checkAuthentication();
          sendResponse({ authenticated: isAuth });
          break;

        case 'scrapeClaims':
        case 'fetchClaims':
          const data = await this.fetchClaimsData();
          sendResponse({ success: true, data });
          break;

        case 'fetchUrl':
          const result = await this.fetchUrl(request.url || '');
          sendResponse(result);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error: any) {
      console.error('❌ Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Fetch any URL using the VA session
   */
  private async fetchUrl(url: string): Promise<MessageResponse> {
    try {
      console.log('🌐 Fetching URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include', // Include session cookies
        headers: {
          'Accept': 'application/json',
        }
      });

      const status = response.status;
      let data: any;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log(`✅ Fetch complete: ${status}`, data);

      return {
        success: response.ok,
        status,
        data,
        error: response.ok ? undefined : `HTTP ${status}`
      };
    } catch (error: any) {
      console.error('❌ Fetch error:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch URL'
      };
    }
  }

  /**
   * Check if user is authenticated by calling VA API
   */
  private async checkAuthentication(): Promise<boolean> {
    try {
      console.log('🔐 Checking VA.gov authentication...');

      const response = await fetch(`${this.apiBaseUrl}/v0/user`, {
        method: 'GET',
        credentials: 'include', // Include session cookies
        headers: {
          'Content-Type': 'application/json',
        }
      });

      this.isAuthenticated = response.ok;

      if (this.isAuthenticated) {
        console.log('✅ User is authenticated');
      } else {
        console.log('❌ User is NOT authenticated');
      }

      return this.isAuthenticated;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  /**
   * Fetch claims data from VA.gov API
   */
  private async fetchClaimsData(): Promise<ClaimsData> {
    console.log('📊 Fetching claims from VA.gov API...');

    // Check auth first
    if (!await this.checkAuthentication()) {
      throw new Error('Not authenticated. Please login to VA.gov first.');
    }

    // Fetch claims
    const claims = await this.fetchClaims();

    // Fetch veteran profile
    const veteranInfo = await this.fetchVeteranProfile();

    const data: ClaimsData = {
      claims,
      veteranInfo,
      fetchedAt: new Date().toISOString(),
    };

    console.log(`✅ Successfully fetched ${claims.length} claims`);
    return data;
  }

  /**
   * Fetch all claims from VA API
   */
  private async fetchClaims(): Promise<Claim[]> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/v0/evss_claims_async`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Claims API returned ${response.status}`);
      }

      const json = await response.json();
      const claims: Claim[] = json.data.map((apiClaim: any) => this.formatClaim(apiClaim));

      return claims;
    } catch (error) {
      console.error('❌ Error fetching claims:', error);
      throw new Error('Failed to fetch claims from VA.gov API');
    }
  }

  /**
   * Convert VA API claim format to our format
   */
  private formatClaim(apiClaim: any): Claim {
    const attrs = apiClaim.attributes || {};

    return {
      id: apiClaim.id || attrs.claimId || 'unknown',
      condition: this.extractConditions(attrs),
      status: this.formatStatus(attrs.status || attrs.claimPhaseDates?.phaseType),
      filedDate: attrs.dateFiled || attrs.claimDate || '',
      lastUpdated: attrs.phaseChangeDate || attrs.updatedAt || attrs.claimPhaseDates?.phaseChangeDate || '',
      evidence: attrs.evss_claim_documents || attrs.documents || [],
      timeline: attrs.events_timeline || attrs.eventsTimeline || [],
    };
  }

  /**
   * Extract condition names from claim
   */
  private extractConditions(attrs: any): string {
    // Try different possible locations for conditions
    if (attrs.contentionList && attrs.contentionList.length > 0) {
      return attrs.contentionList.join(', ');
    }
    if (attrs.claimType) {
      return attrs.claimType;
    }
    if (attrs.conditions && Array.isArray(attrs.conditions)) {
      return attrs.conditions.map((c: any) => c.name || c).join(', ');
    }
    return 'Unknown Condition';
  }

  /**
   * Format claim status to be human-readable
   */
  private formatStatus(status: string): string {
    if (!status) return 'Unknown';

    // Convert API status codes to readable format
    const statusMap: Record<string, string> = {
      'CLAIM_RECEIVED': 'Claim Received',
      'UNDER_REVIEW': 'Under Review',
      'GATHERING_OF_EVIDENCE': 'Gathering Evidence',
      'REVIEW_OF_EVIDENCE': 'Review of Evidence',
      'PREPARATION_FOR_DECISION': 'Preparation for Decision',
      'PENDING_DECISION_APPROVAL': 'Pending Decision',
      'PREPARATION_FOR_NOTIFICATION': 'Preparing Notification',
      'COMPLETE': 'Complete',
      'CLOSED': 'Closed',
    };

    return statusMap[status] || status.replace(/_/g, ' ');
  }

  /**
   * Fetch veteran profile information
   */
  private async fetchVeteranProfile(): Promise<VeteranInfo> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/v0/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        console.warn('⚠️ Profile API returned', response.status);
        return this.getDefaultVeteranInfo();
      }

      const json = await response.json();
      const profile = json.data?.attributes?.profile || {};

      return {
        name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Unknown',
        vaFileNumber: profile.vaFileNumber || profile.vaProfile?.vaFileNumber,
        ssn: profile.ssn ? this.maskSSN(profile.ssn) : undefined,
        dateOfBirth: profile.birthDate || profile.dob,
      };
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return this.getDefaultVeteranInfo();
    }
  }

  /**
   * Default veteran info if API fails
   */
  private getDefaultVeteranInfo(): VeteranInfo {
    return {
      name: 'Unknown Veteran',
    };
  }

  /**
   * Mask SSN for privacy
   */
  private maskSSN(ssn: string): string {
    if (!ssn || ssn.length < 4) return '***-**-****';
    return `***-**-${ssn.slice(-4)}`;
  }
}

// Initialize the API client
const vaApiClient = new VaGovApiClient();

console.log('✅ VA.gov API content script loaded');
console.log('📍 Current URL:', window.location.href);
console.log('📍 Script running on:', document.domain);
