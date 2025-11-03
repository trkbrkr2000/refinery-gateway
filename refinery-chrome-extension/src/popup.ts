// ClaimReady VA Tracker Chrome Extension
// Popup script for testing VA.gov API

class VaApiTester {
  constructor() {
    this.init();
  }

  async init(): Promise<void> {
    this.setupEventListeners();
    this.updateStatus('Ready');
  }

  private setupEventListeners(): void {
    const fetchBtn = document.getElementById('fetchBtn');
    if (fetchBtn) {
      fetchBtn.addEventListener('click', () => {
        this.fetchApiData();
      });
    }

    // Allow Enter key to submit
    const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
    if (apiUrlInput) {
      apiUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          this.fetchApiData();
        }
      });
    }
  }

  private async fetchApiData(): Promise<void> {
    const apiUrlInput = document.getElementById('apiUrl') as HTMLInputElement;
    const url = apiUrlInput?.value?.trim();

    if (!url) {
      this.showError('Please enter a URL');
      return;
    }

    // Hide previous results
    this.hideResponse();
    this.hideError();

    // Update button state
    const fetchBtn = document.getElementById('fetchBtn') as HTMLButtonElement;
    if (fetchBtn) {
      fetchBtn.disabled = true;
      fetchBtn.textContent = 'Fetching...';
    }

    this.updateStatus('Fetching...');

    try {
      // Send message to content script to make the fetch
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      if (!tab?.id) {
        throw new Error('No active tab found');
      }

      // Check if on VA.gov
      if (!tab.url?.includes('va.gov')) {
        throw new Error('⚠️ Please navigate to a VA.gov page first.\n\nThe extension needs to run on VA.gov to access your session cookies.');
      }

      try {
        const result = await chrome.tabs.sendMessage(tab.id, {
          action: 'fetchUrl',
          url: url
        });

        if (result.success) {
          this.showResponse(result.status, result.data);
          this.updateStatus('Success');
        } else {
          this.showError(result.error || 'Failed to fetch data');
          this.updateStatus('Error');
        }
      } catch (msgError: any) {
        // Better error message for connection errors
        if (msgError.message?.includes('Receiving end does not exist')) {
          throw new Error('⚠️ Extension not ready.\n\nPlease:\n1. Make sure you\'re on a VA.gov page\n2. Refresh the page (F5)\n3. Try again');
        }
        throw msgError;
      }

    } catch (error: any) {
      console.error('Fetch error:', error);
      this.showError(error.message || 'Failed to fetch data');
      this.updateStatus('Error');
    } finally {
      // Reset button state
      if (fetchBtn) {
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Data';
      }
    }
  }

  private showResponse(status: number, data: any): void {
    const responseSection = document.getElementById('responseSection');
    const responseStatus = document.getElementById('responseStatus');
    const responseBody = document.getElementById('responseBody');

    if (responseSection) {
      responseSection.classList.remove('hidden');
    }

    if (responseStatus) {
      const statusColor = status >= 200 && status < 300 ? '#4caf50' : '#f44336';
      responseStatus.innerHTML = `<strong style="color: ${statusColor};">Status: ${status}</strong>`;
    }

    if (responseBody) {
      try {
        responseBody.textContent = JSON.stringify(data, null, 2);
      } catch {
        responseBody.textContent = String(data);
      }
    }
  }

  private showError(message: string): void {
    const errorSection = document.getElementById('errorSection');
    const errorBody = document.getElementById('errorBody');

    if (errorSection) {
      errorSection.classList.remove('hidden');
    }

    if (errorBody) {
      errorBody.style.whiteSpace = 'pre-wrap';
      errorBody.textContent = message;
    }
  }

  private hideResponse(): void {
    const responseSection = document.getElementById('responseSection');
    if (responseSection) {
      responseSection.classList.add('hidden');
    }
  }

  private hideError(): void {
    const errorSection = document.getElementById('errorSection');
    if (errorSection) {
      errorSection.classList.add('hidden');
    }
  }

  private updateStatus(text: string): void {
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    if (statusText) {
      statusText.textContent = text;
    }

    if (statusDot) {
      if (text === 'Success') {
        statusDot.className = 'status-dot connected';
      } else if (text === 'Error') {
        statusDot.className = 'status-dot disconnected';
      } else {
        statusDot.className = 'status-dot';
      }
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new VaApiTester();
});
