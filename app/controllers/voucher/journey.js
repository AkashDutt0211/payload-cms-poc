const utils = require('../../middleware/utils')
const service = require('../../services/autotrust/journey.service');

exports.getItems = async (req, res) => {
    try {
        res.status(200).json(await service.getItems(req))
    } catch (error) {
        utils.handleError(res, error)
    }
}

exports.createItem = async (req, res) => {
    try {
        res.status(201).json(await service.createItem(req))
    } catch (error) {
        utils.handleError(res, error)
    }
}

exports.getItem = async (req, res) => {
    try {
        console.log(req.params.id)
        const id = req.params.id
        res.status(200).json(await service.getItem(id))
    } catch (error) {
        utils.handleError(res, error)
    }
}

