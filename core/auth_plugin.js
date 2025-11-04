'use strict';

const { authInit, adminAuthInit } = require('../config/Init');

module.exports = {
    name: 'Auth Plugin: Auth Inits', version: '1.0.0', register: async (server, options) => {
        // sync register auth plugin
        await server.register({ plugin: require('@hapi/basic') });

        // add default auth strategy
        server.auth.strategy(authInit.strategy, authInit.scheme, authInit.options);
        server.auth.default(authInit.strategy);

        // add auth strategy for admin api
        server.auth.strategy(adminAuthInit.strategy, adminAuthInit.scheme, adminAuthInit.options);
    }
}