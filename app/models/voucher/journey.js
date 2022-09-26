const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')

const autotrustJourneys = new mongoose.Schema(
    {

        id: {
            type: String, unique: true,

        },
        code: {
            type: String,

        },
        journey_image: {
            type: String,
        },
        journey_name: {
            type: String,
            default: true,
        },
        journey_header: {
            type: String,
            default: 0
        },
        journey_desc: {
            type: String,
        },
        journey_subHeader: {
            type: String,
        },
        journey_title: {
            type: String,

        },
        journey_page: {
            type: String,

        },
        journey_promos: {
            type: [String],
        },
        thanks_image: {
            type: String,
        },
        thanks_desc: {
            type: String,
            default: false,
        },
        journey_type: {
            type: String,

        },
        created_date: {
            type: Date
        },
        updated_date: {
            type: Date
        },
        deleted_date: {
            type: Date
        },
        isDeleted: {
            type: Boolean
        },
    },

)


module.exports = mongoose.model('autotrustJourneys', autotrustJourneys, "autotrustJourneys")

