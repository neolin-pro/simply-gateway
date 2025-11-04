'use strict';

const Globals = require('../../config/globals');

// additional response headers to add eg. sunset header
// add any other name and value header pairs for additional configured headers
const additionalResponseHeaders = [
    // add the route.options.app setting for the additionalResponseHeaders and
    // uncomment the line below to add the sunset header
    { name: 'Sunset', value: 'Wed, 11 Nov 2026 11:11:11 GMT' }
];

// config values to be set for version, resource and subresources etc.
const config = {
    version: { major: 1, minor: 0, patch: 0 },
    resourceName: 'samples', // always plural
    // subresources are not defined here

    clientCache: {
        shortTermPrivate: { privacy: 'private', expiresIn: 300000, otherwise: 'no-cache' }, // 5 mins
        longTermPrivate: { privacy: 'private', expiresIn: 86400000, otherwise: 'no-cache' } // 1 day
    }
}

// derived configs
config.pluginName = `${Globals.route.pluginPrefix} ${config.resourceName} ${config.version.major}`;
config.versionString = [config.version.major, config.version.minor, config.version.patch].join('.');
config.baseRoute = `${Globals.route.versionPrefix}${config.version.major}/${config.resourceName}`;
config.catchAllPath = `${config.baseRoute}${Globals.route.anyPath}`;
config.additionalResponseHeaders = additionalResponseHeaders;

module.exports = config;