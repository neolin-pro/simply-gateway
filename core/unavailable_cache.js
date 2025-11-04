'use strict';

const Boom = require('@hapi/boom');

const _getSummaryInfo = () => {
    return { 
        timestamp: unavailableCache.lastUpdated, 
        datetime: new Date(unavailableCache.lastUpdated).toString(), 
        count: unavailableCache._rules.length, 
        previewMode: unavailableCache.previewMode
    };
};

const _setRules = (regexStrArray) => {
    // takes in a string array and converts them to RegEx array to be used as rules for matching
    // `${request.method} ${request.path}`
    // care MUST be taken to ensure the correct strings are passed - preview mode is 
    unavailableCache._rules = []; // init to new array
    regexStrArray.forEach(str => unavailableCache._rules.push(new RegExp(str))); // convert to RegEx
    unavailableCache.lastUpdated = Date.now();
    unavailableCache.previewMode = true; // always set as preview and require call to enforceRules to change mode
    console.info(JSON.stringify({
        level: 30,
        time: Date.now(),
        context: 'Unavailable cache: set rules',
        lastUpdated: unavailableCache.lastUpdated,
        rulesCount: unavailableCache._rules.length
    }, null, 2));
};

const _enforceRules = () => {
    let count = unavailableCache._rules.length;
    if (count > 0) {
        unavailableCache.previewMode = false;
        unavailableCache.lastUpdated = Date.now();
    }
    console.info(JSON.stringify({
        level: 30,
        time: Date.now(),
        context: 'Unavailable cache: enforce rules',
        lastUpdated: unavailableCache.lastUpdated,
        rulesCount: count
    }, null, 2));
};

const _flushRules = () => {
    unavailableCache._rules = [];
    unavailableCache.previewMode = true;
    unavailableCache.lastUpdated = Date.now();
    console.info(JSON.stringify({
        level: 30,
        time: Date.now(),
        context: 'Unavailable cache: flush rules',
        lastUpdated: unavailableCache.lastUpdated,
        rulesCount: unavailableCache._rules.length
    }, null, 2));
};

const _checkRules = (request, h) => {
    // method and path are in lowercase
    let endpoint = `${request.method} ${request.path}`;
    unavailableCache._rules.forEach(rule => {
        if (rule.test(endpoint)) {
            if (unavailableCache.previewMode) {
                // preview mode header
                request.app.additionalResponseHeaders.push({ name: 'X-Unavailable-Preview', value: `rule=${rule}; endpoint=${endpoint}` });
            } else {
                console.info(JSON.stringify({
                    level: 30,
                    time: Date.now(),
                    context: 'Unavailable cache: enforce rules',
                    lastUpdated: unavailableCache.lastUpdated,
                    rule: rule.toString(),
                    endpoint: endpoint
                }, null, 2));
                throw Boom.serverUnavailable();
            }
        }
    })
    return h.continue;
}

// holds rules for temporarily unavailable services
// these rules should only be used for short periods and should be kept to a minimum
const unavailableCache = {
    _rules: null,
    lastUpdated: 0,
    previewMode: true,
    getSummaryInfo: _getSummaryInfo,
    setRules: _setRules,
    enforceRules: _enforceRules,
    flushRules: _flushRules,
    checkRules: _checkRules
};

const _init = () => {
    // init private properties
    unavailableCache._rules = [];

    // init public properties
    unavailableCache.lastUpdated = Date.now();
    unavailableCache.previewMode = true;
}

_init();

module.exports = unavailableCache;