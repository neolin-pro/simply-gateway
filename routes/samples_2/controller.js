'use strict';

const Wreck = require('@hapi/wreck');

const { wreckDefaults, auth, responseCacheSegment } = require('./config');
const wreck = Wreck.defaults(wreckDefaults);
const authValue = 'Basic ' + Buffer.from(`${auth.appCode}:${auth.key}`).toString('base64'); 
const additionalHeaders = { 'Authorization': authValue };
const serviceRequest = async (method, uri, options) => {
    const res = await wreck.request(method, uri, options);
    const body = await wreck.read(res, { gunzip: true, json: true });
    return { res: res, body: body };
}

// proxy requests to v1 to show how proxying can be done
module.exports = {
    samples: {
        getList: async (request, h) => {
            let res = await wreck.request('GET', '', { }); // passthrough response includes headers
            // removes sunset header from the response
            // can also be done using route request lifecycle extensions if to be done for the route
            // but may not really want to remove the header
            // this is just to show it can be done
            delete res.headers.sunset;
            return res;
        },
        getInstance: async (request, h) => {
            // sample to show server side caching
            let key = `samples/${request.params.samplesId}`;
            let returnValue = await responseCacheSegment.get(request.server, key);

            if (returnValue) {
                return returnValue;
            }

            // use service request to return the body and set own headers
            let { res, body } = await serviceRequest('GET', `${request.params.samplesId}`, { headers: additionalHeaders });
            responseCacheSegment.set(key, body); // async call, no need to wait
            return body;
        }
    },
    lines: {
        getList: async (request, h) => {
            return await wreck.request('GET', `${request.params.samplesId}/lines`, { headers: additionalHeaders });
        },
        getInstance: async (request, h) => {
            return await wreck.request('GET', `${request.params.samplesId}/lines/${request.params.linesId}`, { headers: additionalHeaders });
        }
    }
};