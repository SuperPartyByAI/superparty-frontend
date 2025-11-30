// APP.JS - Main application logic

// Check authentication
function checkAuth() {
  if (!api.token && window.location.pathname !== '/index.html') {
    window.location = 'index.html';
  }
}

// Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await api.login(email, password);
  
  if (result.success) {
    window.location = 'dashboard.html';
  } else {
    document.getElementById('error').textContent = result.error || 'Login failed';
  }
});

// Dashboard
async function loadDashboard() {
  const user = api.getUser();
  if (!user) return;
  
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userRole').textContent = user.role;
  
  // Load sites
  const sites = await api.getAllSites({status: 'active'});
  
  if (sites.success && sites.data) {
    document.getElementById('totalSites').textContent = sites.data.length;
    
    // Display sites list
    const sitesList = document.getElementById('sitesList');
    sitesList.innerHTML = sites.data.map(site => `
      <div class="site-card">
        <h3>${site.name}</h3>
        <p>${site.url}</p>
        <span class="status ${site.status}">${site.status}</span>
        <button onclick="viewSite('${site.url}')">View Details</button>
      </div>
    `).join('');
  }
}

function viewSite(url) {
  window.location = `site-manager.html?url=${encodeURIComponent(url)}`;
}

// Site Manager
async function loadSiteManager() {
  const urlParams = new URLSearchParams(window.location.search);
  const siteUrl = urlParams.get('url');
  
  if (!siteUrl) {
    window.location = 'dashboard.html';
    return;
  }
  
  const dashboard = await api.getSiteDashboard(siteUrl);
  
  if (dashboard.success && dashboard.data) {
    const data = dashboard.data;
    
    document.getElementById('siteName').textContent = data.site.name;
    document.getElementById('siteUrl').textContent = data.site.url;
    document.getElementById('siteStatus').textContent = data.site.status;
    document.getElementById('siteStatus').className = `status ${data.site.status}`;
    
    // Load overview
    document.getElementById('overviewContent').innerHTML = `
      <div class="overview-grid">
        <div>
          <h4>SEO</h4>
          <p>Pages: ${data.seo.totalPages}</p>
          <p>Keywords: ${data.seo.totalKeywords}</p>
        </div>
        <div>
          <h4>Ads</h4>
          <p>Campaigns: ${data.ads.totalCampaigns}</p>
          <p>Budget: ${data.ads.totalBudget} RON</p>
        </div>
        <div>
          <h4>Leads</h4>
          <p>Total: ${data.leads.totalLeads}</p>
          <p>Converted: ${data.leads.convertedLeads}</p>
        </div>
        <div>
          <h4>Performance</h4>
          <p>Uptime: ${data.performance.uptime}%</p>
          <p>Health: ${data.performance.healthScore}</p>
        </div>
      </div>
    `;
  }
}

// Tabs
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

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  api.logout();
});

// Init
checkAuth();

if (window.location.pathname.includes('dashboard.html')) {
  loadDashboard();
}

if (window.location.pathname.includes('site-manager.html')) {
  loadSiteManager();
}
