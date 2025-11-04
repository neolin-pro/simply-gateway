'use strict';

const Joi = require('@hapi/joi');

module.exports.samplesId = Joi.string().alphanum().max(10).required();
module.exports.linesId = Joi.number().integer().min(0).required();