const express = require('express')
const router = express.Router();
const fs = require('fs')
const routesPath = `${__dirname}/`
const { removeExtensionFromFile } = require('../middleware/utils')

/*
 * Load routes statically and/or dynamically
 */

// Load Auth route
const voucherRoute = require('./voucher/voucher');

router.use('/', voucherRoute);

/*
 * Setup routes for index
 */
router.get('/', (req, res) => {
  res.render('index')
})

/*
 * Handle 404 error
 */
router.use('*', (req, res) => {
  res.status(404).json({
    errors: {
      msg: 'URL_NOT_FOUND'
    }
  })
})
module.exports = router;

