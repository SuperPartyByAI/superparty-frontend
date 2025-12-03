// ═══════════════════════════════════════════════════════════
// SUPERPARTY v7.0 - GM STATE
// State management pentru aplicația GM (General Manager)
// ═══════════════════════════════════════════════════════════

const GMState = {
    
    user: null,
    currentPage: 'dashboard',
    
    // Data
    statistics: null,
    users: [],
    events: [],
    seoData: null,
    adsData: null,
    financialData: null,
    callCenterData: null,
    
    loading: false,
    
    // Init
    init() {
        this.user = AuthSystem.getCurrentUser();
        this.loadFromCache();
    },
    
    // Load from cache
    loadFromCache() {
        const cachedStats = StorageUtils.getCache('gm_statistics');
        if (cachedStats) this.statistics = cachedStats;
        
        const cachedSEO = StorageUtils.getCache('gm_seo');
        if (cachedSEO) this.seoData = cachedSEO;
        
        const cachedAds = StorageUtils.getCache('gm_ads');
        if (cachedAds) this.adsData = cachedAds;
        
        const cachedFinancial = StorageUtils.getCache('gm_financial');
        if (cachedFinancial) this.financialData = cachedFinancial;
    },
    
    // Set page
    setPage(pageName) {
        this.currentPage = pageName;
        window.dispatchEvent(new CustomEvent('pageChanged', { 
            detail: { page: pageName } 
        }));
    },
    
    // ═══════════════════════════════════════════════════════
    // GENERAL STATISTICS
    // ═══════════════════════════════════════════════════════
    
    async loadStatistics() {
        try {
            this.loading = true;
            
            const response = await API.request('getGMStatistics', {
                gmId: this.user.id
            });
            
            this.statistics = response.statistics || this.getMockStatistics();
            StorageUtils.setCache('gm_statistics', this.statistics, 60);
            
            this.loading = false;
            return this.statistics;
            
        } catch (error) {
            console.error('❌ Load statistics error:', error);
            this.statistics = this.getMockStatistics();
            this.loading = false;
            return this.statistics;
        }
    },
    
    getMockStatistics() {
        return {
            totalEmployees: 1326,
            activeEmployees: 1280,
            totalEvents: 342,
            eventsThisMonth: 89,
            totalRevenue: 458750,
            monthlyGrowth: 12.5,
            customerSatisfaction: 4.8,
            eventsToday: 12,
            pendingEvidence: 23
        };
    },
    
    // ═══════════════════════════════════════════════════════
    // SEO MANAGEMENT (TITAN v20)
    // ═══════════════════════════════════════════════════════
    
    async loadSEOData() {
        try {
            const response = await API.request('getSEOData', {
                gmId: this.user.id
            });
            
            this.seoData = response.seo || this.getMockSEOData();
            StorageUtils.setCache('gm_seo', this.seoData, 120);
            
            return this.seoData;
            
        } catch (error) {
            console.error('❌ Load SEO error:', error);
            this.seoData = this.getMockSEOData();
            return this.seoData;
        }
    },
    
    getMockSEOData() {
        return {
            seoScore: 87,
            organicTraffic: 45230,
            keywords: {
                total: 342,
                top10: 89,
                top3: 34
            },
            backlinks: 1258,
            domainAuthority: 42,
            topKeywords: [
                { keyword: 'petreceri copii bucuresti', position: 2, volume: 2400 },
                { keyword: 'animator petreceri', position: 1, volume: 1800 },
                { keyword: 'petreceri tematice copii', position: 3, volume: 1200 },
                { keyword: 'organizare petreceri', position: 5, volume: 980 },
                { keyword: 'petreceri la domiciliu', position: 4, volume: 890 }
            ],
            competitors: [
                { name: 'Competitor A', score: 72, traffic: 32000 },
                { name: 'Competitor B', score: 68, traffic: 28000 },
                { name: 'Competitor C', score: 65, traffic: 25000 }
            ]
        };
    },
    
    // ═══════════════════════════════════════════════════════
    // ADS MANAGEMENT
    // ═══════════════════════════════════════════════════════
    
    async loadAdsData() {
        try {
            const response = await API.request('getAdsData', {
                gmId: this.user.id
            });
            
            this.adsData = response.ads || this.getMockAdsData();
            StorageUtils.setCache('gm_ads', this.adsData, 60);
            
            return this.adsData;
            
        } catch (error) {
            console.error('❌ Load ads error:', error);
            this.adsData = this.getMockAdsData();
            return this.adsData;
        }
    },
    
    getMockAdsData() {
        return {
            totalSpend: 12450,
            totalRevenue: 48750,
            roi: 291,
            campaigns: [
                {
                    id: 'C001',
                    name: 'Google Ads - Petreceri Copii',
                    platform: 'Google',
                    status: 'active',
                    budget: 5000,
                    spent: 4230,
                    clicks: 3420,
                    conversions: 87,
                    revenue: 22890
                },
                {
                    id: 'C002',
                    name: 'Facebook Ads - Familie & Evenimente',
                    platform: 'Facebook',
                    status: 'active',
                    budget: 4000,
                    spent: 3650,
                    clicks: 2890,
                    conversions: 64,
                    revenue: 16200
                },
                {
                    id: 'C003',
                    name: 'Instagram - Petreceri Premium',
                    platform: 'Instagram',
                    status: 'paused',
                    budget: 3000,
                    spent: 2570,
                    clicks: 1950,
                    conversions: 38,
                    revenue: 9660
                }
            ]
        };
    },
    
    // ═══════════════════════════════════════════════════════
    // FINANCIAL OVERVIEW
    // ═══════════════════════════════════════════════════════
    
    async loadFinancialData() {
        try {
            const response = await API.request('getFinancialData', {
                gmId: this.user.id
            });
            
            this.financialData = response.financial || this.getMockFinancialData();
            StorageUtils.setCache('gm_financial', this.financialData, 60);
            
            return this.financialData;
            
        } catch (error) {
            console.error('❌ Load financial error:', error);
            this.financialData = this.getMockFinancialData();
            return this.financialData;
        }
    },
    
    getMockFinancialData() {
        return {
            totalRevenue: 458750,
            totalCosts: 328450,
            netProfit: 130300,
            profitMargin: 28.4,
            monthlySalaries: 245000,
            operationalCosts: 83450,
            breakdown: {
                revenue: {
                    events: 425000,
                    products: 23750,
                    other: 10000
                },
                costs: {
                    salaries: 245000,
                    marketing: 32450,
                    operational: 51000
                }
            }
        };
    },
    
    // ═══════════════════════════════════════════════════════
    // CALL CENTER DATA
    // ═══════════════════════════════════════════════════════
    
    async loadCallCenterData() {
        try {
            const response = await API.request('getCallCenterData', {
                gmId: this.user.id
            });
            
            this.callCenterData = response.callCenter || this.getMockCallCenterData();
            
            return this.callCenterData;
            
        } catch (error) {
            console.error('❌ Load call center error:', error);
            this.callCenterData = this.getMockCallCenterData();
            return this.callCenterData;
        }
    },
    
    getMockCallCenterData() {
        return {
            totalCalls: 1247,
            answeredCalls: 1189,
            missedCalls: 58,
            averageWaitTime: 34,
            averageCallDuration: 4.2,
            conversionRate: 67,
            operators: [
                { name: 'Maria Ionescu', calls: 342, conversions: 234, rating: 4.8 },
                { name: 'Ana Popescu', calls: 298, conversions: 201, rating: 4.7 },
                { name: 'Elena Dumitrescu', calls: 267, conversions: 178, rating: 4.6 }
            ]
        };
    },
    
    // ═══════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════
    
    async refresh() {
        try {
            await Promise.all([
                this.loadStatistics(),
                this.loadSEOData(),
                this.loadAdsData(),
                this.loadFinancialData(),
                this.loadCallCenterData()
            ]);
            
            toast.success('Date actualizate!');
            
        } catch (error) {
            toast.error('Eroare la actualizare date');
            throw error;
        }
    },
    
    clearCache() {
        StorageUtils.removeLocal('cache_gm_statistics');
        StorageUtils.removeLocal('cache_gm_seo');
        StorageUtils.removeLocal('cache_gm_ads');
        StorageUtils.removeLocal('cache_gm_financial');
    }
};

window.GMState = GMState;

if (SUPERPARTY_CONFIG && SUPERPARTY_CONFIG.isDebug()) {
    console.log('✅ GM State loaded');
}
