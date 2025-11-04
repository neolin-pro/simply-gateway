'use strict';

const envConstants = { prod: 'PROD', stg: 'STG', dev: 'DEV' }
// determine running env
const nodeEnv = process.env.NODE_ENV == undefined ? envConstants.prod : process.env.NODE_ENV; // PROD, STG, DEV

const routeLifeCycleBaseExt = {
    // route request lifecycle extension points
    //onRequest - not supported at route level
    //onPreAuth: [], // called regardless of whether authentication is performed
    //onCredentials: [], // called only if authentication is performed
    //onPostAuth: [], // called regardless of whether authorization is performed
    //onPreHandler: [], // before route pre handlers defined in the options
    //onPostHandler: [], // after route handler
    //onPreResponse: [] // always called unless aborted
};

module.exports = {
    // current env
    env: {
        isProd: nodeEnv == envConstants.prod,
        isStg: nodeEnv == envConstants.stg,
        isDev: nodeEnv == envConstants.dev,
        isProdOrStg: (nodeEnv == envConstants.prod || nodeEnv == envConstants.stg) ? true : false,
        isDevOrStg: (nodeEnv == envConstants.dev || nodeEnv == envConstants.stg) ? true : false,
    },

    // error constants
    error: {
        // generic error message
        genericMessage: 'An error occurred. Please contact the system administrator.'
    },

    // admin api constants
    admin: {
        // root admin api prefix
        adminApiRoot: '/admin-api',
        // admin auth strategy
        adminAuthStrategy: 'localhost+appCode+key'
    },

    // route constants
    route: {
        // route plugin name prefix
        pluginPrefix: 'Route Plugin: ',
        // version prefix
        versionPrefix: '/v',
        // root api prefix
        apiRoot: '/api',
        // matches any path
        anyPath: '/{p*}',
        // route lifecycle extension - create a new instance to be used
        lifeCycleExt: () => {
            return {...routeLifeCycleBaseExt};
        }
    },

    // headers
    header: {
        addResponseHeaders: (request, h) => {
            // combine the additional headers in request.app and route.options.app
            let additionalHeaders = request.route.settings.app.additionalResponseHeaders ?
                request.app.additionalResponseHeaders.concat(request.route.settings.app.additionalResponseHeaders) :
                request.app.additionalResponseHeaders;
            // insert any additional response headers
            let { response } = request;
            additionalHeaders.forEach(header => {
                if (response.isBoom) {
                    // check if response is a Boom object - happens even when it is a 200
                    response.output.headers[header.name] = header.value;
                } else {
                    request.response.header(header.name, header.value);
                }
            });
            return h.continue;
        }   
    },

    responseCache: {
        name: 'responseCache',
        provider: {
            constructor: require('@hapi/catbox-memory'),
            options: {
                partition: 'responses',
                maxByteSize: 104857600, // 100MB
                minCleanupIntervalMsec: 5000 // 5 secs
            }
        }
    },

    // validation
    validation: {
        validationErrorHandler: (request, h, err) => {
            throw err; // need to handle the error properly
        }
    }
}