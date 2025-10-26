// ClaimReady VA Tracker Chrome Extension
// Popup script for managing VA.gov sync

interface SyncData {
  lastSync: string;
  claimsCount: number;
  claimsData?: any;
}

interface ClaimsData {
  claims: Claim[];
  veteranInfo: VeteranInfo;
  lastSync: string;
}

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
  ssn: string;
  vaFileNumber: string;
  dateOfBirth: string;
}

class ClaimReadyTracker {
  private apiBaseUrl: string = 'https://api.claimready.io/v1';
  private isConnected: boolean = false;
  private isSyncing: boolean = false;
  private lastSync: string = 'Never';
  private claimsCount: number = 0;

  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    // Check connection status
    await this.checkConnectionStatus();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update UI based on current state
    this.updateUI();
  }

  private setupEventListeners(): void {
    // Open VA.gov button
    const openVaGovBtn = document.getElementById('openVaGov');
    if (openVaGovBtn) {
      openVaGovBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://www.va.gov/track-claims' });
      });
    }

    // Sync now button
    const syncNowBtn = document.getElementById('syncNow');
    if (syncNowBtn) {
      syncNowBtn.addEventListener('click', () => {
        this.startSync();
      });
    }

    // Retry sync button
    const retrySyncBtn = document.getElementById('retrySync');
    if (retrySyncBtn) {
      retrySyncBtn.addEventListener('click', () => {
        this.startSync();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('settings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        chrome.tabs.create({ url: 'https://claimready.io/settings' });
      });
    }
  }

  private async checkConnectionStatus(): Promise<void> {
    try {
      // Check if user is logged into VA.gov
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab.url?.includes('va.gov')) {
        // Check if we can access VA.gov data
        const result = await chrome.tabs.sendMessage(tab.id!, { action: 'checkVaAuth' });
        this.isConnected = result?.authenticated || false;
      } else {
        this.isConnected = false;
      }

      // Get last sync data from storage
      const syncData = await chrome.storage.local.get(['lastSync', 'claimsCount']) as SyncData;
      this.lastSync = syncData.lastSync || 'Never';
      this.claimsCount = syncData.claimsCount || 0;

    } catch (error) {
      console.error('Error checking connection status:', error);
      this.isConnected = false;
    }
  }

  private async startSync(): Promise<void> {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.showState('syncing');
    this.updateProgress(0);

    try {
      // Step 1: Authenticate with VA.gov
      this.updateStep(1, 'authenticating');
      await this.authenticateWithVa();
      this.updateProgress(25);

      // Step 2: Fetch claims data
      this.updateStep(2, 'fetching');
      const claimsData = await this.fetchClaimsData();
      this.updateProgress(50);

      // Step 3: Process and clean data
      this.updateStep(3, 'processing');
      const processedData = await this.processClaimsData(claimsData);
      this.updateProgress(75);

      // Step 4: Sync to FormReady
      this.updateStep(4, 'syncing');
      await this.syncToFormReady(processedData);
      this.updateProgress(100);

      // Success
      this.isConnected = true;
      this.lastSync = new Date().toLocaleString();
      this.claimsCount = processedData.claims.length;

      // Save to storage
      await chrome.storage.local.set({
        lastSync: this.lastSync,
        claimsCount: this.claimsCount,
        claimsData: processedData
      });

      this.showState('connected');
      this.updateUI();

    } catch (error: any) {
      console.error('Sync failed:', error);
      this.showError(error.message);
    } finally {
      this.isSyncing = false;
    }
  }

  private async authenticateWithVa(): Promise<any> {
    // Check if user is logged into VA.gov
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes('va.gov')) {
      throw new Error('Please navigate to VA.gov first');
    }

    // Send message to content script to check authentication
    const result = await chrome.tabs.sendMessage(tab.id!, { action: 'checkAuth' });
    
    if (!result.authenticated) {
      throw new Error('Please log into your VA.gov account first');
    }

    return result;
  }

  private async fetchClaimsData(): Promise<any> {
    // Send message to content script to scrape claims data
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.tabs.sendMessage(tab.id!, { action: 'scrapeClaims' });
    
    if (!result.success) {
      throw new Error('Failed to fetch claims data from VA.gov');
    }

    return result.data;
  }

  private async processClaimsData(rawData: any): Promise<ClaimsData> {
    // Process and structure the scraped data
    const processedClaims: Claim[] = rawData.claims.map((claim: any) => ({
      id: claim.id,
      condition: claim.condition,
      status: claim.status,
      filedDate: claim.filedDate,
      lastUpdated: claim.lastUpdated,
      evidence: claim.evidence || [],
      timeline: claim.timeline || []
    }));

    return {
      claims: processedClaims,
      veteranInfo: rawData.veteranInfo,
      lastSync: new Date().toISOString()
    };
  }

  private async syncToFormReady(data: ClaimsData): Promise<any> {
    // Send data to FormReady API
    const response = await fetch(`${this.apiBaseUrl}/chrome-extension/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await this.getAuthToken()}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync with FormReady');
    }

    return await response.json();
  }

  private async getAuthToken(): Promise<string> {
    // Get user's ClaimReady auth token
    const result = await chrome.storage.local.get(['claimReadyToken']);
    return result.claimReadyToken;
  }

  private showState(state: string): void {
    // Hide all states
    document.querySelectorAll('.state-section').forEach(el => {
      el.classList.add('hidden');
    });

    // Show specific state
    const stateElement = document.getElementById(state);
    if (stateElement) {
      stateElement.classList.remove('hidden');
    }
  }

  private updateStep(stepNumber: number, status: string): void {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
      if (index < stepNumber - 1) {
        step.innerHTML = `✓ ${step.textContent?.replace(/^[✓⏳] /, '') || ''}`;
      } else if (index === stepNumber - 1) {
        step.innerHTML = `⏳ ${step.textContent?.replace(/^[✓⏳] /, '') || ''}`;
      }
    });
  }

  private updateProgress(percentage: number): void {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
      progressFill.style.width = `${percentage}%`;
    }
  }

  private showError(message: string): void {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
      errorMessage.textContent = message;
    }
    this.showState('error');
  }

  private updateUI(): void {
    // Update status indicator
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    
    if (this.isConnected) {
      if (statusDot) statusDot.className = 'status-dot connected';
      if (statusText) statusText.textContent = 'Connected';
      this.showState('connected');
    } else {
      if (statusDot) statusDot.className = 'status-dot disconnected';
      if (statusText) statusText.textContent = 'Not Connected';
      this.showState('notConnected');
    }

    // Update sync info
    const lastSyncElement = document.getElementById('lastSync');
    const claimsCountElement = document.getElementById('claimsCount');
    
    if (lastSyncElement) lastSyncElement.textContent = this.lastSync;
    if (claimsCountElement) claimsCountElement.textContent = this.claimsCount.toString();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new ClaimReadyTracker();
});
