const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
  },
  password: {
    type: String,
    required: true
  },
  recipes: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
  }],

  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: { type: Number, required: true }
      }
    ]
  },
  bookmark: [{
    type: Schema.Types.ObjectId,
    ref: 'Recipe',
  }]
});

userSchema.methods.addBookmark = function(recipe) {
    const updatedBookmark = [...this.bookmark];
    updatedBookmark.push(recipe);
    this.bookmark = updatedBookmark;
    return this.save();
};


// userSchema.methods.removeFromCart = function(productId) {
//   const updatedCartItems = this.cart.items.filter(item => {
//     return item.productId.toString() !== productId.toString();
//   });
//   this.cart.items = updatedCartItems;
//   return this.save();
// };

// userSchema.methods.clearCart = function() {
//   this.cart = { items: [] };
//   return this.save();
// };

module.exports = mongoose.model('User', userSchema);

