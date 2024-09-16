const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const contentSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        default: ''
    },
    content : {
        type: String,
        default: ''
    },
    date : {
        type: Date,
        default: Date.now, 

    },
    imgUrl: { type: String, default: '' },


});

module.exports = mongoose.model('Content', contentSchema);