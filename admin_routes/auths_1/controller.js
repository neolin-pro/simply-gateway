'use strict';

const authCache = require('../../core/auth_validate');

module.exports = {
    auths: {
        getSummaryInfo: (request, h) => {
            const response = h.entity({ etag: authCache.timestamp }); // etag header values with double quotes
            return response ? response : authCache.getSummaryInfo();
        },
        putList: (request, h) => {
            return authCache.load(authCache.init()).getSummaryInfo();
        }
    }
};