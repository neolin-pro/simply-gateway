'use strict';

const Globals = require('../../config/globals');
const ResponseCacheSegmentFactory = require('../../core/response_cache_segment_factory');

// additional response headers to add eg. sunset header
// add any other name and value header pairs for additional configured headers
const additionalResponseHeaders = [
    // add the route.options.app setting for the additionalResponseHeaders and
    // uncomment the line below to add the sunset header
    // { name: 'Sunset', value: 'Wed, 11 Nov 2026 11:11:11 GMT' }
];

// config values to be set for version, resource and subresources etc.
const config = {
    version: { major: 2, minor: 0, patch: 0 },
    resourceName: 'samples', // always plural
    // subresources are not defined here

    // wreck defaults
    wreckDefaults: {
        baseUrl: 'https://127.0.0.1/api/v1/samples/',
        // wreck doesn't support configured decompression for deflate via parameter
        // wreck only supports http/1.1 instead of http/2 so need keep-alive header
        headers: { 'Accept-Encoding': 'gzip', 'Connection': 'keep-alive' }, 
        redirects: 0,
        timeout: 5000, // slower methods will need to extend this
        rejectUnauthorized: false // when using self-signed certs, can remove or set to true if using CA certified certs
    },

    // auth info
    auth: {
        appCode: 'appCode',
        key: 'key'
    },

    clientCache: {
        shortTermPrivate: { privacy: 'private', expiresIn: 300000, otherwise: 'no-cache' }, // 5 mins
        longTermPrivate: { privacy: 'private', expiresIn: 86400000, otherwise: 'no-cache' }, // 1 day
    }
}

// derived configs
config.pluginName = `${Globals.route.pluginPrefix} ${config.resourceName} ${config.version.major}`;
config.versionString = [config.version.major, config.version.minor, config.version.patch].join('.');
config.baseRoute = `${Globals.route.versionPrefix}${config.version.major}/${config.resourceName}`;
config.catchAllPath = `${config.baseRoute}${Globals.route.anyPath}`;
config.additionalResponseHeaders = additionalResponseHeaders;
config.responseCacheSegment = ResponseCacheSegmentFactory(config.pluginName, 10000); // using default options

module.exports = config;