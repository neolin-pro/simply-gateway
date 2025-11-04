'use strict';

const Boom = require('@hapi/boom');
const authCacheFactory = require("./auth_cache_factory");

const adminCredentials = [{
    app: 'CHANGEthis:&changeTHIS!', // CHANGE! although this additionally secures via localhost IP check
    scope: [] // not checking for scope and relying on just localhost and authentication
}];

const initFn = () => {
    // init function return valid admin credentials list
    return adminCredentials; // replace with actual codes to load credentials from credentials store
}

// validate function
const validateFn = (request, appCode, key, h) => {
    // check call is from localhost and hostname used is localhost
    if (request.info.remoteAddress != '127.0.0.1') {
        // throw a 403 if not calling from localhost
        throw Boom.forbidden('Caller not allowed', request.info.remoteAddress);
    }
    // check admin credentials is present
    let cacheKey = `${appCode}:${key}`;
    let returnObj = { };
    (returnObj.credentials = authCache.get(cacheKey)) ? returnObj.isValid = true : returnObj.isValid = false;
    return returnObj;
};

const authCache = authCacheFactory('Admin Auths', initFn, validateFn);

module.exports = authCache;