// API CLIENT

const API_URL = 'https://script.google.com/macros/s/AKfycbwoOj_KfueJtDqHrwHUAornkQrNJAHIBpf78BI4YUndw-yAgWqXA5x7e4Yimn8y4R5K/exec';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }
  
  async call(action, data = {}) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          token: this.token,
          ...data
        })
      });
      
      const result = await response.json();
      
      if (!result.success && result.error === 'Authentication failed') {
        this.logout();
      }
      
      return result;
      
    } catch(error) {
      console.error('API Error:', error);
      return {success: false, error: error.toString()};
    }
  }
  
  async login(email, password) {
    const result = await this.call('login', {email, password});
    
    if (result.success && result.data.token) {
      this.token = result.data.token;
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = 'index.html';
  }
  
  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  // Sites
  async getAllSites(filters = {}) {
    return this.call('getAllSites', {filters});
  }
  
  async createSite(siteData) {
    return this.call('createSite', siteData);
  }
  
  async getSiteDashboard(url) {
    return this.call('getSiteDashboard', {url});
  }
  
  async getSiteSEO(url) {
    return this.call('getSiteSEO', {url});
  }
  
  async getSiteAds(url) {
    return this.call('getSiteAds', {url});
  }
  
  async getSiteLeads(url) {
    return this.call('getSiteLeads', {url});
  }
  
  async compareAllSites() {
    return this.call('compareAllSites');
  }
  
  async getRecommendations(url) {
    return this.call('getRecommendations', {url});
  }
}

const api = new APIClient();
```

---

## 🎯 **ACUM FAĂ ASTA:**

**1. Deschide:**
```
https://github.com/SuperPartyByAI/superparty-frontend/blob/main/api-client.js
