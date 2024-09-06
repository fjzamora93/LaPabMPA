const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required:true
  },
  permissionLevel: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
},
  password: {
    type: String,
    default: 'lapab'
  },
  cargo: {
    type: String,
    default: ''
  },
  descripcion: {
    type: String,
    default: ''
  },
  //Posts es una lista de objetos que tienen un título y una url
  posts: [{
    title: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    }
}],

  image: {
    type: String,
    default: 'images/equipo/retrato-silueta.png'
    },

status: {
    type: String,
    enum: ['tesista', 'collab', 'tech'],
    default: 'tesista'
    },

  bookmark: [{
    type: Schema.Types.ObjectId,
    ref: 'Post',
  }]
});

userSchema.methods.addBookmark = function(recipe) {
    const updatedBookmark = [...this.bookmark];
    updatedBookmark.push(recipe);
    this.bookmark = updatedBookmark;
    return this.save();
};


module.exports = mongoose.model('User', userSchema);

