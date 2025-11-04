'use strict';

const { responseCache } = require('../config/globals');

// response cache segment factory returns a wrapper object wrapping the Catbox Cache
// segmentName is mandatory and must be unique - use plugin name 
// statsMinInterval defines the minimum interval before cache stats are sent to console, defaults to 1 hour
// catbox cache options object with expiresIn defaulted to 1 min
const responseCacheSegmentFactory = (segmentName, statsMinInterval = 3600000, options = { expiresIn: 60000 }) => {
    // cache wrapper object
    let newCacheSegmentWrapper = new Object();

    // internal properties
    newCacheSegmentWrapper._cache = null; // not initialize until first call
    newCacheSegmentWrapper._createdTimestamp = null;
    newCacheSegmentWrapper._statsMinInterval = statsMinInterval;
    newCacheSegmentWrapper._statsNextTimestamp = 0;
    newCacheSegmentWrapper._options = options;
    // add other options values
    newCacheSegmentWrapper._options.cache = responseCache.name;
    newCacheSegmentWrapper._options.segment = segmentName;

    // public properties
    newCacheSegmentWrapper.name = `[${responseCache.name}-${segmentName}]`;
    // methods
    // get wrapper - needs server to be able to create cache segment
    newCacheSegmentWrapper.get = async (server, key) => {
        if (newCacheSegmentWrapper._cache == null) {
            // creates the cache segment once
            newCacheSegmentWrapper._cache = server.cache(newCacheSegmentWrapper._options);
            newCacheSegmentWrapper._createdTimestamp = Date.now();
        }
        return newCacheSegmentWrapper._cache.get(key);
    }
    // set wrapper - adds stats output logic, get should at least be called once before set
    newCacheSegmentWrapper.set = async (key, value, ttl) => {
        // assumes get is at least called once before to create the cache segment
        // generates stats if min interval is exceeeded
        newCacheSegmentWrapper._cache.set(key, value);
        let timestamp = Date.now();
        if (timestamp >= newCacheSegmentWrapper._statsNextTimestamp) {
            // output statistics
            let cacheHits = newCacheSegmentWrapper._cache.stats.hits;
            let cacheGets = newCacheSegmentWrapper._cache.stats.gets;
            console.info(JSON.stringify({
                level: 30,
                time: timestamp,
                context: `Response Cache Segment stats - ${newCacheSegmentWrapper.name}`,
                durationHours: ((timestamp - newCacheSegmentWrapper._createdTimestamp) / 3600000).toFixed(2),
                sets: newCacheSegmentWrapper._cache.stats.sets,
                hits: cacheHits,
                gets: cacheGets,
                hitRatio: (cacheHits / cacheGets).toFixed(2),
                generates: newCacheSegmentWrapper._cache.stats.generates,
                errors: newCacheSegmentWrapper._cache.stats.errors
            }, null, 2));
            newCacheSegmentWrapper._statsNextTimestamp = timestamp + newCacheSegmentWrapper._statsMinInterval;
        }
    }
    return newCacheSegmentWrapper;
};

module.exports = responseCacheSegmentFactory;