'use strict';

const { route, admin } = require('./globals');
const { serverInit, loggerInit } = require('./init');

// creates the glue manifest for configuring the server and registering the plugins
module.exports = (serverListener) => ({
    // server options
    server: { listener: serverListener, port: serverInit.port, tls: serverInit.tls, compression: serverInit.compression, router: serverInit.router },
    register: {
        // list of plugins
        plugins: [
            // logging plugins
            { plugin: require('blipp'), options: loggerInit.blippOptions },
            { plugin: require('hapi-pino'), options: loggerInit.pinoOptions },

            // wrapped basic authentication plugin to set default auth strategy
            { plugin: require('../core/auth_plugin') },

            // api routes
            { plugin: require('../routes/samples_1'), routes: { prefix: route.apiRoot } },
            { plugin: require('../routes/samples_2'), routes: { prefix: route.apiRoot } },
            
            // admin api routes
            { plugin: require('../admin_routes/auths_1'), routes: { prefix: admin.adminApiRoot } },
            { plugin: require('../admin_routes/unavailable_rules_1'), routes: { prefix: admin.adminApiRoot } }
        ],
        options: { once: true }
    }
});