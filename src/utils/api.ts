const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxs819m4gt-tpTkAIIS91EnxhwYx-5wdbnh6Zi5_GcY14zs5XYqS9ykFuYCCcokhQ/exec";

export interface User {
  id: string;
  email: string;
  nume: string;
  prenume: string;
  rol?: string;
  kyc_status?: string;
  is_admin: boolean;
  is_driver: boolean;
  status: string;
}

interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

function jsonp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback_' + Date.now();
    const script = document.createElement('script');
    
    // FIXED: Nu șterge callback-ul imediat!
    (window as any)[callbackName] = (data: any) => {
      // Cleanup DUPĂ ce primim datele
      setTimeout(() => {
        delete (window as any)[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      }, 100);
      
      resolve(data);
    };
    
    script.src = `${url}&callback=${callbackName}`;
    
    script.onerror = () => {
      delete (window as any)[callbackName];
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      reject(new Error('JSONP request failed'));
    };
    
    document.body.appendChild(script);
    
    // Timeout după 10 secunde
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        delete (window as any)[callbackName];
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
}

export const api = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const url = `${APPS_SCRIPT_URL}?action=login&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const data = await jsonp(url);
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Connection error. Please try again.' 
      };
    }
  },

  async getUser(userId: string): Promise<User | null> {
    try {
      const url = `${APPS_SCRIPT_URL}?action=getUser&userId=${userId}`;
      const data = await jsonp(url);
      return data.success ? data.user : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  async uploadKyc() {
    try {
      const url = `${APPS_SCRIPT_URL}?action=uploadKyc`;
      const data = await jsonp(url);
      return data;
    } catch (error) {
      console.error('Upload KYC error:', error);
      return { success: false, error: 'Upload failed' };
    }
  },
};
