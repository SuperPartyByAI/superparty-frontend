// APP.JS - FIXED pentru bucla infinită

// Check authentication DOAR pe paginile care cer auth
function checkAuth() {
  const currentPage = window.location.pathname;
  const isLoginPage = currentPage.includes('index.html') || currentPage === '/' || currentPage === '';
  
  // Dacă suntem pe login page, nu verifica auth
  if (isLoginPage) {
    // Dacă avem token valid, du-te la dashboard
    const token = localStorage.getItem('token');
    if (token && token !== 'null' && token !== 'undefined') {
      window.location = 'dashboard.html';
    }
    return;
  }
  
  // Pe alte pagini, verifică dacă avem token
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    window.location = 'index.html';
  }
}

// Login form handler
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    
    console.log('🔐 Attempting login...');
    
    try {
      // Login direct cu fetch (nu folosim api client care poate sa nu fie incarcat)
      const response = await fetch('https://script.google.com/macros/s/AKfycbwoOj_KfueJtDqHrwHUAornkQrNJAHIBpf78BI4YUndw-yAgWqXA5x7e4Yimn8y4R5K/exec', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          action: 'login',
          email: email,
          password: password
        })
      });
      
      const result = await response.json();
      console.log('📊 Login result:', result);
      
      if (result.success && result.data) {
        console.log('✅ Login successful!');
        
        // Salvează token și user
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        console.log('💾 Data saved, redirecting...');
        
        // Redirect la dashboard
        window.location.href = 'dashboard.html';
      } else {
        errorDiv.textContent = result.error || 'Login failed';
        errorDiv.style.display = 'block';
      }
      
    } catch(error) {
      console.error('❌ Login error:', error);
      errorDiv.textContent = 'Connection error: ' + error.message;
      errorDiv.style.display = 'block';
    }
  });
}

// Dashboard loader
async function loadDashboard() {
  console.log('📊 Loading dashboard...');
  
  const user = getUserFromStorage();
  if (!user) {
    console.log('❌ No user found, redirecting to login...');
    window.location = 'index.html';
    return;
  }
  
  console.log('✅ User found:', user);
  
  // Update UI cu user info
  const userNameEl = document.getElementById('userName');
  const userRoleEl = document.getElementById('userRole');
  
  if (userNameEl) userNameEl.textContent = user.name || user.email;
  if (userRoleEl) userRoleEl.textContent = user.role || 'User';
  
  // Load sites
  try {
    console.log('🌐 Loading sites...');
    
    const token = localStorage.getItem('token');
    const response = await fetch('https://script.google.com/macros/s/AKfycbwoOj_KfueJtDqHrwHUAornkQrNJAHIBpf78BI4YUndw-yAgWqXA5x7e4Yimn8y4R5K/exec', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        action: 'getAllSites',
        token: token,
        filters: {status: 'active'}
      })
    });
    
    const result = await response.json();
    console.log('📊 Sites result:', result);
    
    if (result.success && result.data) {
      const sites = result.data;
      
      // Update stats
      const totalSitesEl = document.getElementById('totalSites');
      if (totalSitesEl) totalSitesEl.textContent = sites.length;
      
      // Display sites list
      const sitesListEl = document.getElementById('sitesList');
      if (sitesListEl) {
        sitesListEl.innerHTML = sites.map(site => `
          <div class="site-card" style="background: white; padding: 20px; margin: 10px 0; border-radius: 5px; cursor: pointer;" onclick="viewSite('${site.url}')">
            <h3>${site.name}</h3>
            <p>${site.url}</p>
            <span class="status ${site.status}" style="background: ${site.status === 'active' ? '#2ecc71' : '#e74c3c'}; color: white; padding: 5px 10px; border-radius: 3px;">${site.status}</span>
            <p>Health: ${site.healthScore}%</p>
          </div>
        `).join('');
      }
      
      console.log('✅ Dashboard loaded successfully!');
    } else {
      console.log('⚠️ No sites found or error:', result.error);
    }
    
  } catch(error) {
    console.error('❌ Error loading dashboard:', error);
  }
}

function viewSite(url) {
  window.location = `site-manager.html?url=${encodeURIComponent(url)}`;
}

// Site Manager loader
async function loadSiteManager() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteUrl = urlParams.get('url');
  
  if (!siteUrl) {
    window.location = 'dashboard.html';
    return;
  }
  
  console.log('🌐 Loading site manager for:', siteUrl);
  
  // Load site dashboard data
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('https://script.google.com/macros/s/AKfycbwoOj_KfueJtDqHrwHUAornkQrNJAHIBpf78BI4YUndw-yAgWqXA5x7e4Yimn8y4R5K/exec', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        action: 'getSiteDashboard',
        token: token,
        url: siteUrl
      })
    });
    
    const result = await response.json();
    console.log('📊 Site dashboard:', result);
    
    if (result.success && result.data) {
      const data = result.data;
      
      // Update site info
      document.getElementById('siteName').textContent = data.site.name;
      document.getElementById('siteUrl').textContent = data.site.url;
      document.getElementById('siteStatus').textContent = data.site.status;
      document.getElementById('siteStatus').className = `status ${data.site.status}`;
      
      // Load overview
      document.getElementById('overviewContent').innerHTML = `
        <div class="overview-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h4>SEO</h4>
            <p>Pages: ${data.seo.totalPages}</p>
            <p>Keywords: ${data.seo.totalKeywords}</p>
            <p>Quality: ${data.seo.avgQuality}%</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h4>Ads</h4>
            <p>Campaigns: ${data.ads.totalCampaigns}</p>
            <p>Budget: ${data.ads.totalBudget} RON</p>
            <p>CTR: ${data.ads.avgCTR}%</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h4>Leads</h4>
            <p>Total: ${data.leads.totalLeads}</p>
            <p>Converted: ${data.leads.convertedLeads}</p>
            <p>Rate: ${data.leads.conversionRate}%</p>
          </div>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 5px;">
            <h4>Performance</h4>
            <p>Uptime: ${data.performance.uptime}%</p>
            <p>Health: ${data.performance.healthScore}</p>
          </div>
        </div>
      `;
      
      console.log('✅ Site manager loaded!');
    }
    
  } catch(error) {
    console.error('❌ Error loading site manager:', error);
  }
}

// Helper functions
function getUserFromStorage() {
  const userStr = localStorage.getItem('user');
  if (!userStr || userStr === 'null' || userStr === 'undefined') {
    return null;
  }
  try {
    return JSON.parse(userStr);
  } catch(e) {
    return null;
  }
}

// Tabs handler
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Remove active class
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    
    // Add active class
    tab.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// Logout handler
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location = 'index.html';
  });
}

// Initialize based on current page
const currentPath = window.location.pathname;

if (currentPath.includes('dashboard.html')) {
  checkAuth();
  loadDashboard();
} else if (currentPath.includes('site-manager.html')) {
  checkAuth();
  loadSiteManager();
} else {
  checkAuth();
}

console.log('✅ App.js loaded!');
