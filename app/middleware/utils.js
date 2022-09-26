const mongoose = require('mongoose')
const requestIp = require('request-ip')
const { validationResult } = require('express-validator')

/**
 * Removes extension from file
 * @param {string} file - filename
 */
exports.removeExtensionFromFile = (file) => {
  return file.split('.').slice(0, -1).join('.').toString()
}

/**
 * Gets IP from user
 * @param {*} req - request object
 */
exports.getIP = (req) => requestIp.getClientIp(req)

/**
 * Gets browser info from user
 * @param {*} req - request object
 */
exports.getBrowserInfo = (req) => req.headers['user-agent']

/**
 * Gets country from user using CloudFlare header 'cf-ipcountry'
 * @param {*} req - request object
 */
exports.getCountry = (req) =>
  req.headers['cf-ipcountry'] ? req.headers['cf-ipcountry'] : 'XX'

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {Object} err - error object
 */
exports.handleError = (res, err) => {
  // Prints error in console
  if (process.env.NODE_ENV === 'development') {
    console.log(err)
  }
  // Sends error to user
  res.status(err.code).json({
    errors: {
      msg: err.message
    }
  })
}

/**
 * Builds error object
 * @param {number} code - error code
 * @param {string} message - error text
 */
exports.buildErrObject = (code, message) => {
  return {
    code,
    message
  }
}

/**
 * Builds error for validation files
 * @param {Object} req - request object
 * @param {Object} res - response object
 * @param {Object} next - next object
 */
exports.validationResult = (req, res, next) => {
  try {
    validationResult(req).throw()
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase()
    }
    return next()
  } catch (err) {
    return this.handleError(res, this.buildErrObject(422, err.array()))
  }
}

/**
 * Builds success object
 * @param {string} message - success text
 */
exports.buildSuccObject = (message) => {
  return {
    msg: message
  }
}

/**
 * Checks if given ID is good for MongoDB
 * @param {string} id - id to check
 */
exports.isIDValid = async (id) => {
  return new Promise((resolve, reject) => {
    const goodID = mongoose.Types.ObjectId.isValid(id)
    return goodID
      ? resolve(id)
      : reject(this.buildErrObject(422, 'ID_MALFORMED'))
  })
}

/**
 * Item not found
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemNotFound = (err, item, reject, message) => {
  if (err) {
    reject(this.buildErrObject(422, err.message))
  }
  if (!item) {
    reject(this.buildErrObject(404, message))
  }
}

/**
 * Item already exists
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemAlreadyExists = (err, item, reject, message) => {
  if (err) {
    reject(this.buildErrObject(422, err.message))
  }
  if (item) {
    reject(this.buildErrObject(422, message))
  }
}

exports.itemReferenceExists = (err, item, reject, message) => {
  if (err) {
    reject(this.buildErrObject(403, err.message))
  }
  if (item) {
    reject(this.buildErrObject(403, message))
  }

}

exports.sideloadAndTransformModels = (modelTransformed, model, options = null) => {
  if (options !== null && options.include !== null && typeof options.include === "object") {
    options.include.forEach((item) => {
      console.log('Loading :' + item['model'].options.name.singular.capitalize());
      //building the name of the transformer.
      let ModelTransformer = autoload('app/transformers/' + item['model'].options.name.singular.capitalize() + 'Transformer');

      //checking if we need to transform a single item
      if (model[item['model'].options.name.singular] && typeof model[item['model'].options.name.singular] === "object") {
        modelTransformed[item['model'].options.name.singular] = ModelTransformer.transform(model[item['model'].options.name.singular]);
      }
      //checking if we need to transform a collection
      if (model[item['model'].options.name.plural] && typeof model[item['model'].options.name.plural] === "object") {
        modelTransformed[item['model'].options.name.plural] = ModelTransformer.transformCollection(model[item['model'].options.name.plural]);
      }
    });
  }
  return modelTransformed;
}

exports.addMonths = (date, months) => {
  date.setMonth(date.getMonth() + months);
  return date;
}
