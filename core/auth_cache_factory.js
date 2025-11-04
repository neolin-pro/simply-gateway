'use strict';

// auth cache factory returns a new auth cache object
const authCacheFactory = (authCacheName, initFn, validateFn) => {
    // creates a new auth cache
    // initFn: () => { return [Credentials] }; // Credentials: {app: string, scope: [string]}
    // validateFn: (request, appCode, key, h) => { return {credentials: Credentials, isValid: boolean}; }
    let newCache = new Object();
    // internal properties
    newCache._cacheData = { }; // holds valid credentials
    newCache._cacheKeys = { }; // holds valid keys
    // public properties
    newCache.name = authCacheName;
    newCache.total = 0; // holds number of valid credentials
    newCache.deleted = 0; // holds number of credentials removed in last load
    newCache.timestamp = 0; // holds the last updated timestamp
    // methods
    newCache.get = (key) => { return newCache._cacheData[key]; };
    newCache.set = (key, value) => { return newCache._cacheData[key] = value; };
    newCache.getSummaryInfo = () => {
        return {
            name: newCache.name,
            total: newCache.total, 
            deleted: newCache.deleted,
            timestamp: newCache.timestamp
        };
    };
    newCache.init = initFn; // init returns valid credentials list to be populated into cache
    newCache.validate = validateFn; // validate returns credentials and a validity flag
    newCache.load = (credentialsList) => {
        // loads credentialsList into cache, replaces existing cache
        // returns cache object

        let newKeys = { };
        let count = 0;
        let deleted = 0;
        // add new valid credentials
        credentialsList.forEach(credentials => {
            newKeys[credentials.app] = true; // add to key list
            newCache._cacheData[credentials.app] = credentials; // add to data list
            count++;
            delete newCache._cacheKeys[credentials.app]; // remove key from current list
        });
        // remove invalid credentials
        for (let [key, value] of Object.entries(newCache._cacheKeys)) {
            delete newCache._cacheData[key];
            deleted++;
        }
        // set to new key list
        newCache._cacheKeys = newKeys;
        newCache.total = count;
        newCache.deleted = deleted;
        newCache.timestamp = Date.now();
        console.info(JSON.stringify({
            level: 30,
            time: Date.now(),
            context: 'Auth Cache: Load credentials',
            cacheName: newCache.name,
            lastUpdated: newCache.timestamp,
            cacheTotal: newCache.total,
            cacheDeleted: newCache.deleted
        }, null, 2));
        return newCache;
    };
    return newCache.load(newCache.init());
};

module.exports = authCacheFactory;