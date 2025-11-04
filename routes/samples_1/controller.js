'use strict';

const samplesList = [{ sampleId: '1A', sampleName: 'Test Sample 1A' }, { sampleId: '2A', sampleName: 'Test Sample 2A' }];
const samplesVersion = 2; // version of the samplesList

module.exports = {
    samples: {
        getList: (request, h) => {
            const response = h.entity({ etag: samplesVersion }); // etag header values with double quotes
            return response ? response : samplesList;
        },
        getInstance: (request, h) => {
            const samplesId = request.params.samplesId;
            const response = h.entity({ etag: samplesId }); // etag header values with double quotes
            return response ? response : { sampleId: request.params.samplesId, sampleName: `Test Sample ${samplesId}`};
        }
    },
    lines: {
        getList: (request, h) => {
            return [{ lineId: 1, lineDescription: `This is line 1 of Test Sample ${request.params.samplesId}.` }];
        },
        getInstance: (request, h) => {
            const samplesId = request.params.samplesId;
            const linesId = request.params.linesId;
            return { lineId: request.params.linesId, lineDescription: `This is line ${linesId} of Test Sample ${samplesId}.`};
        }
    }
};