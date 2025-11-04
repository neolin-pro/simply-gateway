'use strict';

const Joi = require('@hapi/joi');

// an array of at least 1 non-empty string
module.exports.rules = Joi.array().items(Joi.string().required());