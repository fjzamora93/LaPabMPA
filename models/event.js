const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const eventSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {type: String, default: ''},
    date : {
        type: Date,
        default: new Date(2025, 0, 1), 

    },
    place: { type: String, default: '' },
    url: { type: String, default: '' },	
    
});

module.exports = mongoose.model('Event', eventSchema);