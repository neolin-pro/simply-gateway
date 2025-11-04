'use strict';

const Globals = require('../../config/globals');

// config values to be set for version, resource and subresources etc.
const config = {
    version: { major: 1, minor: 0, patch: 0 },
    resourceName: 'auths', // always plural
    // subresources are not defined here

    clientCache: {
        shortTermPrivate: { privacy: 'private', expiresIn: 300000, otherwise: 'no-cache' }, // 5 mins
        longTermPrivate: { privacy: 'private', expiresIn: 86400000, otherwise: 'no-cache' } // 1 day
    }
}

// creates the route extensions
const routeExtensions = () => {
    // get new instance of extensions - left here but admin apis may not need to have this support
    let extensions = Globals.route.lifeCycleExt();

    // no sunset header handling needed for admin apis
    return extensions;
}

// derived admin configs
config.pluginName = `${Globals.route.pluginPrefix} admin-api/${config.resourceName} ${config.version.major}`;
config.versionString = [config.version.major, config.version.minor, config.version.patch].join('.');
config.baseRoute = `${Globals.route.versionPrefix}${config.version.major}/${config.resourceName}`;
config.catchAllPath = `${config.baseRoute}${Globals.route.anyPath}`;
config.routeExtensions = routeExtensions();

module.exports = config;