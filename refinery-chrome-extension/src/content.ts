// ClaimReady VA Tracker Chrome Extension
// Content script for scraping VA.gov data

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

interface ScrapedData {
  veteranInfo: VeteranInfo;
  claims: Claim[];
  scrapedAt: string;
}

interface MessageRequest {
  action: string;
}

interface MessageResponse {
  authenticated?: boolean;
  success?: boolean;
  data?: ScrapedData;
  error?: string;
}

class VaGovScraper {
  private isAuthenticated: boolean = false;
  private claimsData: ScrapedData | null = null;

  constructor() {
    this.init();
  }

  private init(): void {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request: MessageRequest, sender, sendResponse: (response: MessageResponse) => void) => {
      this.handleMessage(request, sendResponse);
    });

    // Check if user is authenticated
    this.checkAuthentication();
  }

  private async handleMessage(request: MessageRequest, sendResponse: (response: MessageResponse) => void): Promise<void> {
    try {
      switch (request.action) {
        case 'checkAuth':
          sendResponse({ authenticated: this.isAuthenticated });
          break;

        case 'checkVaAuth':
          await this.checkAuthentication();
          sendResponse({ authenticated: this.isAuthenticated });
          break;

        case 'scrapeClaims':
          const data = await this.scrapeClaimsData();
          sendResponse({ success: true, data });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error: any) {
      sendResponse({ success: false, error: error.message });
    }
  }

  private async checkAuthentication(): Promise<boolean> {
    try {
      // Check if user is logged in by looking for authentication indicators
      const authIndicators = [
        '.va-button-primary', // VA.gov primary buttons
        '[data-testid="sign-in-link"]', // Sign in link
        '.usa-button--primary', // USA.gov primary buttons
        '.va-button--primary' // VA.gov primary buttons
      ];

      let isLoggedIn = false;
      
      for (const selector of authIndicators) {
        const element = document.querySelector(selector);
        if (element && !element.textContent?.toLowerCase().includes('sign in')) {
          isLoggedIn = true;
          break;
        }
      }

      // Additional check: look for user profile elements
      const profileElements = document.querySelectorAll('[data-testid*="profile"], [data-testid*="user"], .profile-menu');
      if (profileElements.length > 0) {
        isLoggedIn = true;
      }

      this.isAuthenticated = isLoggedIn;
      return isLoggedIn;

    } catch (error) {
      console.error('Error checking authentication:', error);
      this.isAuthenticated = false;
      return false;
    }
  }

  private async scrapeClaimsData(): Promise<ScrapedData> {
    if (!this.isAuthenticated) {
      throw new Error('User not authenticated with VA.gov');
    }

    try {
      // Navigate to claims page if not already there
      if (!window.location.href.includes('/track-claims')) {
        window.location.href = 'https://www.va.gov/track-claims';
        return { veteranInfo: {} as VeteranInfo, claims: [], scrapedAt: new Date().toISOString() };
      }

      // Wait for page to load
      await this.waitForPageLoad();

      // Scrape veteran information
      const veteranInfo = await this.scrapeVeteranInfo();

      // Scrape claims data
      const claims = await this.scrapeClaims();

      return {
        veteranInfo,
        claims,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error scraping claims data:', error);
      throw error;
    }
  }

  private async scrapeVeteranInfo(): Promise<VeteranInfo> {
    const veteranInfo: VeteranInfo = {
      name: '',
      ssn: '',
      vaFileNumber: '',
      dateOfBirth: ''
    };

    try {
      // Look for veteran name in various locations
      const nameSelectors = [
        '.veteran-name',
        '[data-testid="veteran-name"]',
        '.profile-name',
        'h1, h2, h3'
      ];

      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent?.trim()) {
          veteranInfo.name = element.textContent.trim();
          break;
        }
      }

      // Look for SSN (usually redacted)
      const ssnElement = document.querySelector('[data-testid*="ssn"], .ssn, [class*="ssn"]');
      if (ssnElement) {
        veteranInfo.ssn = ssnElement.textContent?.trim() || '';
      }

      // Look for VA file number
      const fileNumberElement = document.querySelector('[data-testid*="file-number"], .file-number, [class*="file-number"]');
      if (fileNumberElement) {
        veteranInfo.vaFileNumber = fileNumberElement.textContent?.trim() || '';
      }

    } catch (error) {
      console.error('Error scraping veteran info:', error);
    }

    return veteranInfo;
  }

  private async scrapeClaims(): Promise<Claim[]> {
    const claims: Claim[] = [];

    try {
      // Look for claims in various table/list formats
      const claimSelectors = [
        '.claim-item',
        '[data-testid*="claim"]',
        '.va-table tbody tr',
        '.claims-list .claim'
      ];

      let claimElements: NodeListOf<Element> | null = null;
      for (const selector of claimSelectors) {
        claimElements = document.querySelectorAll(selector);
        if (claimElements.length > 0) break;
      }

      if (claimElements) {
        for (const element of claimElements) {
          try {
            const claim = await this.extractClaimData(element);
            if (claim) {
              claims.push(claim);
            }
          } catch (error) {
            console.error('Error extracting claim data:', error);
          }
        }
      }

      // If no claims found in tables, try alternative selectors
      if (claims.length === 0) {
        const alternativeSelectors = [
          '.claim-card',
          '.claim-summary',
          '[role="row"]'
        ];

        for (const selector of alternativeSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const claim = await this.extractClaimData(element);
            if (claim) {
              claims.push(claim);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error scraping claims:', error);
    }

    return claims;
  }

  private async extractClaimData(element: Element): Promise<Claim | null> {
    try {
      const claim: Claim = {
        id: '',
        condition: '',
        status: '',
        filedDate: '',
        lastUpdated: '',
        evidence: [],
        timeline: []
      };

      // Extract claim ID
      const idElement = element.querySelector('[data-testid*="id"], .claim-id, [class*="id"]');
      if (idElement) {
        claim.id = idElement.textContent?.trim() || '';
      }

      // Extract condition/description
      const conditionSelectors = [
        '[data-testid*="condition"]',
        '[data-testid*="description"]',
        '.claim-description',
        '.condition',
        'h3, h4, h5'
      ];

      for (const selector of conditionSelectors) {
        const conditionElement = element.querySelector(selector);
        if (conditionElement && conditionElement.textContent?.trim()) {
          claim.condition = conditionElement.textContent.trim();
          break;
        }
      }

      // Extract status
      const statusSelectors = [
        '[data-testid*="status"]',
        '.claim-status',
        '.status',
        '.badge'
      ];

      for (const selector of statusSelectors) {
        const statusElement = element.querySelector(selector);
        if (statusElement && statusElement.textContent?.trim()) {
          claim.status = statusElement.textContent.trim();
          break;
        }
      }

      // Extract dates
      const dateElements = element.querySelectorAll('[data-testid*="date"], .date, [class*="date"]');
      for (const dateElement of dateElements) {
        const text = dateElement.textContent?.trim() || '';
        if (text.includes('Filed') || text.includes('Submitted')) {
          claim.filedDate = text;
        } else if (text.includes('Updated') || text.includes('Modified')) {
          claim.lastUpdated = text;
        }
      }

      // Only return claim if it has essential data
      if (claim.condition || claim.id) {
        return claim;
      }

      return null;

    } catch (error) {
      console.error('Error extracting claim data:', error);
      return null;
    }
  }

  private async waitForPageLoad(): Promise<void> {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', resolve);
      }
    });
  }
}

// Initialize scraper
new VaGovScraper();
