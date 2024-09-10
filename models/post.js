const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {type: String, default: ''},
    content : {
        type: String,
        default: ''
    },
    tags: { type: [String], default: [] },
    url: { type: String, default: '' },	
    imgUrl: { type: String, default: '' },
    attachedFile: { type: String, default: '' },
    date: { type: String, default: '' },


    //Campos del post relacionados con la visita
    status: { type: String },
    author:[{ type: Schema.Types.ObjectId, ref: 'author' }],

});

module.exports = mongoose.model('Post', postSchema);