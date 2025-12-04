const StorageUtils = {
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },
  
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  },
  
  getUser() {
    return this.get('user');
  },
  
  setUser(user) {
    return this.set('user', user);
  },
  
  removeUser() {
    return this.remove('user');
  },
  
  getTheme() {
    return this.get('theme') || 'light';
  },
  
  setTheme(theme) {
    return this.set('theme', theme);
  }
};

StorageUtils.saveTheme = function(theme) {
  return this.setTheme(theme);
};

StorageUtils.saveUser = function(user) {
  return this.setUser(user);
};

StorageUtils.saveToken = function(token) {
  return this.set('token', token);
};

StorageUtils.getToken = function() {
  return this.get('token');
};

StorageUtils.getCache = function(key) {
  return this.get('cache_' + key);
};

StorageUtils.setCache = function(key, value, ttl = 3600000) {
  const cacheData = {
    value: value,
    expires: Date.now() + ttl
  };
  return this.set('cache_' + key, cacheData);
};

StorageUtils.clearCache = function() {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if(key.startsWith('cache_')) {
      localStorage.removeItem(key);
    }
  });
};
