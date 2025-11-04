'use strict';

const Http2 = require('http2');
const Fs = require('fs');

const Joi = require('@hapi/joi');
const Glue = require('@hapi/glue');
const Boom = require('@hapi/boom');

const Manifest = require('./config/manifest');
const Globals = require('./config/globals'); // load global constants
const { serverInit } = require('./config/init');
const UnavailableCache = require('./core/unavailable_cache');

// log unhandled rejection / uncaught exception before terminating process
// register handler to provide stack trace on unexpected errors before server is started
process.on('unhandledRejection', serverInit.exitHandler(1, 'Unhandled Promise', null));
process.on('uncaughtException', serverInit.exitHandler(1, 'Unhandled Error', null));

// create a http2 server with the defined private key and public certificate
const http2Listener = Http2.createSecureServer({
    key: Fs.readFileSync(serverInit.keyFilePath),
    cert: Fs.readFileSync(serverInit.publicCertPath),
    allowHTTP1: true
});

const gluePreRegister = async (server) => {
    // enables Glue to set JOI validator for server
    server.validator(Joi);
    // provision server cache async
    server.cache.provision(Globals.responseCache);
}

const startServer = async () => {
    // create server using Glue manifest
    const listener = http2Listener;
    const server = await Glue.compose(Manifest(listener), { preRegister: gluePreRegister });

    // add server extension service unavailable pre-processing logic for all requests
    server.ext([{
        type: 'onRequest',
        method: (request, h) => {
            request.app.additionalResponseHeaders = []; // init additional response headers
            return UnavailableCache.checkRules(request, h);
        }
    }, {
        type: 'onPreResponse',
        method: Globals.header.addResponseHeaders   
    }]);

    // catch all route to return 404 if authentication passed, else return 401 - minimize exposure of implemention details
    server.route({  
        method: '*',
        path: Globals.route.anyPath,
        handler: (request, h) => {
            return Boom.notFound(Globals.error.genericMessage);
        },
        options: { auth: false }
    })

    await server.start();
    // log before terminating process after server is started where possible, windows may not support the signals
    process.on('unhandledRejection', serverInit.exitHandler(1, 'Unhandled Promise', server));
    process.on('uncaughtException', serverInit.exitHandler(1, 'Unhandled Error', server));
    process.on('SIGTERM', serverInit.exitHandler(0, 'Terminate Signal', server));
    process.on('SIGTINT', serverInit.exitHandler(0, 'Interrupt Signal', server));
};

startServer();