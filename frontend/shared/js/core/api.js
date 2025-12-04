// ═══════════════════════════════════════════════════════════
// API CLIENT - GET method (no CORS issues)
// ═══════════════════════════════════════════════════════════

const API = {
  async request(action, data = {}) {
    try {
      // Build URL with parameters - flatten all data
      const params = new URLSearchParams();
      params.append('action', action);
      
      // Add all data fields as separate parameters
      for (let key in data) {
        params.append(key, data[key]);
      }
      
      const url = `${BACKEND_URL}?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      return result;
      
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }
};
