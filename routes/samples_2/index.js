'use strict';

const Globals = require('../../config/globals');
const Config = require('./config');
const Schema = require('./schema');
const { samples, lines } = require('./controller');

// list of all routes under this resource
const routes = [
    { method: 'GET', path: `${Config.baseRoute}`, handler: samples.getList, options: {
        app: { additionalResponseHeaders: Config.additionalResponseHeaders },
        auth: false,
        cache: Config.clientCache.shortTermPrivate, // ignored when doing passthru
    } },
    { method: 'GET', path: `${Config.baseRoute}/{samplesId}`, handler: samples.getInstance, options: {
        app: { additionalResponseHeaders: Config.additionalResponseHeaders },
        auth: { access: { scope: `GET ${Config.baseRoute}/*` } },
        validate: { params: { samplesId: Schema.samplesId } },
        cache: Config.clientCache.shortTermPrivate,
    } },
    { method: 'GET', path: `${Config.baseRoute}/{samplesId}/lines`, handler: lines.getList, options: {
        app: { additionalResponseHeaders: Config.additionalResponseHeaders },
        auth: { access: { scope: `GET ${Config.baseRoute}/*/lines` } },
        validate: { params: { samplesId: Schema.samplesId } },
        // no cache headers
    } },
    { method: 'GET', path: `${Config.baseRoute}/{samplesId}/lines/{linesId}`, handler: lines.getInstance, options: {
        app: { additionalResponseHeaders: Config.additionalResponseHeaders },
        auth: { access: { scope: `GET ${Config.baseRoute}/*/lines/*` } },
        validate: { params: { samplesId: Schema.samplesId, linesId: Schema.linesId }, options: { abortEarly: false }, 
                    failAction: Globals.validation.validationErrorHandler },
        // no cache headers
    } }
];

module.exports = { name: Config.pluginName, version: Config.versionString, register: async function (server, options) {
        server.route(routes);
    }
};