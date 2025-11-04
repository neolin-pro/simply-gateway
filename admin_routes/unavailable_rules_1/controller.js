'use strict';

const Boom = require('@hapi/boom');
const UnavailableCache = require('../../core/unavailable_cache');

module.exports = {
    unavailableRules: {
        getSummaryInfo: (request, h) => {
            const response = h.entity({ etag: UnavailableCache.lastUpdated }); // etag header values with double quotes
            return response ? response : UnavailableCache.getSummaryInfo();
        },
        putRules: (request, h) => { 
            try {
                if (request.payload) {
                    UnavailableCache.setRules(request.payload.rules);
                    return UnavailableCache.getSummaryInfo();    
                }
                throw Boom.badRequest('putRules: No payload!')
            } catch (error) {
                throw Boom.badRequest(error);
            }
        },
        enforceRules: (request, h) => {
            UnavailableCache.enforceRules();
            return UnavailableCache.getSummaryInfo();
        },
        flushRules: (request, h) => { 
            UnavailableCache.flushRules();
            return UnavailableCache.getSummaryInfo();
        }
    }
};