const journeyTransformer = require('../../transformers/autotrust/journey.transformer');
const model = require('../../models/autotrust/journey')
const db = require('../../middleware/db')
const utils = require('../../middleware/utils')

const service = {

    createItem: async (req) => {
        try {
            const body = req.body;
            const fieldToCheck = {
            }
            const itemExists = await db.checkItemExists(fieldToCheck, model);
            if (!itemExists) {
                const res = await db.createItem(body, model)
                return journeyTransformer.transform(res, null);
            }
        } catch (error) {
            throw error;
        }
    },

    getItems: async (req) => {
        try {
            let query = {
                isdeleted: { $ne: true }
            }
            if (req.query.journeyId) {
                query = { ...query, id: req.query.journeyId }
            }
            if (req.query.code) {
                query = { ...query, code: req.query.code }
            }
            const res = await db.getItems(req, model, query)
            return res;
        } catch (error) {
            throw error;
        }
    },

    getItem: async (id) => {
        try {
            const res = await db.getPopulatedItem(id, model, {})
            console.log(res)
            return res;
        } catch (error) {
            throw error;
        }
    }


};

module.exports = service;
