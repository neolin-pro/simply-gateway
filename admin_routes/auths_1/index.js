'use strict';

const Globals = require('../../config/globals');
const Config = require('./config');
const { auths } = require('./controller');

// list of all routes under this resource
const routes = [
    { method: 'GET', path: `${Config.baseRoute}`, handler: auths.getSummaryInfo, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // no cache
        ext: Config.routeExtensions
    } },
    { method: 'PUT', path: `${Config.baseRoute}`, handler: auths.putList, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // may consider allowing auths to be passed in but has higher security risks
        // no cache
        ext: Config.routeExtensions
    } }
];

module.exports = { name: Config.pluginName, version: Config.versionString, register: async function (server, options) {
        server.route(routes);
    }
};