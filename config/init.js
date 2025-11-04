'use strict';

const Globals = require('./globals');

// termination function
const terminate = (options = { coredump: false, timeout: 500 }) => {
    const exit = (code) => {
        options.coredump ? process.abort() : process.exit(code);
    };

    return (code, reason, server) => (err, promise) => {
        if (err && err instanceof Error) {
            // Log error information
            console.log(`Process Terminated (${reason}): ${err.message}\n${err.stack}`);
        }

        if (server == null) {
            console.log('Process terminated before server started.');
            exit(code);
        } else {
            // Attempt a graceful shutdown
            console.log('Process terminated after server started.');
            server.close(exit);
            setTimeout(exit, options.timeout).unref();
        }
    }
}

// one-time initialization settings
module.exports = {
    // server initialization settings
    serverInit: {
        // private key and public cert of server
        keyFilePath: './certs/127.0.0.1.key', publicCertPath: './certs/127.0.0.1.cert',
        // tls and port
        tls: true, port: 443,
        // compression options
        compression: { minBytes: 1024 },
        // router options
        router: { isCaseSensitive: false, stripTrailingSlash: true },
        //exit handler
        exitHandler: terminate() // use default options
    },

    // logger options
    loggerInit: {
        blippOptions: { showAuth: true, showScope: true, showStart: Globals.env.isDev ? true : false },
        pinoOptions: {
            prettyPrint: Globals.env.isProd ? false : true,
            logPayload: Globals.env.isDev ? true : false,
            level: Globals.env.isDev ? 'debug' : 'info',
            redact: ['req.headers.authorization'],
            ignorePaths: null
        }
    },

    // auth settings for api endpoints
    authInit: {
        strategy: 'appCode+key',
        scheme: 'basic',
        options: { validate: require('../core/auth_validate').validate, unauthorizedAttributes: { realm: 'simply-route' } }
    },

    // auth settings for admin api endpoints
    adminAuthInit: {
        strategy: Globals.admin.adminAuthStrategy,
        scheme: 'basic',
        options: { validate: require('../core/admin_auth_validate').validate, unauthorizedAttributes: { realm: 'simply-route-admin' } }
    }
}