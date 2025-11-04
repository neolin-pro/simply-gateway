'use strict';

const Globals = require('../../config/globals');
const Config = require('./config');
const { unavailableRules } = require('./controller');
const Schema = require('./schema');

// list of all routes under this resource
const routes = [
    { method: 'GET', path: `${Config.baseRoute}`, handler: unavailableRules.getSummaryInfo, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // no cache
        ext: Config.routeExtensions
    } },
    { method: 'PUT', path: `${Config.baseRoute}`, handler: unavailableRules.putRules, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // payload to contain a object with a rules array of regex strings
        validate: { payload: { rules: Schema.rules } },
        // no cache
        ext: Config.routeExtensions
    } },
    { method: 'POST', path: `${Config.baseRoute}`, handler: unavailableRules.enforceRules, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // no cache
        ext: Config.routeExtensions
    } },
    { method: 'DELETE', path: `${Config.baseRoute}`, handler: unavailableRules.flushRules, options: {
        auth: { strategies: [Globals.admin.adminAuthStrategy] },
        // removed check for scope
        // no cache
        ext: Config.routeExtensions
    } }
];

module.exports = { name: Config.pluginName, version: Config.versionString, register: async function (server, options) {
        server.route(routes);
    }
};