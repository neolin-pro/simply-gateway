'use strict';

const authCacheFactory = require("./auth_cache_factory");

const testCredentials = [
    {
        app: 'appCode:key',
        scope: [
            'GET /v1/samples',  // collection
            'GET /v1/samples/*', // instance
            'GET /v1/samples/*/lines',
            'GET /v1/samples/*/lines/*',
            'GET /v2/samples/*', // instance
            'GET /v2/samples/*/lines',
            'GET /v2/samples/*/lines/*'
        ]
    },
    // v1 appCode
    {
        app: 'v1AppCode:v1key',
        scope: [
            'GET /v1/samples',  // collection
            'GET /v1/samples/*', // instance
            'GET /v1/samples/*/lines',
            'GET /v1/samples/*/lines/*'
        ]
    },
];

const initFn = () => {
    // init function to load valid API credentials list
    return testCredentials; // replace with actual codes to load credentials from credentials store
}

// validate function
const validateFn = (request, appCode, key, h) => {
    let cacheKey = `${appCode}:${key}`;
    let returnObj = {};
    (returnObj.credentials = authCache.get(cacheKey)) ? returnObj.isValid = true : returnObj.isValid = false;
    return returnObj;
};

const authCache = authCacheFactory('API Auths', initFn, validateFn);

module.exports = authCache;