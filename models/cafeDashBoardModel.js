const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    banner: [{
        price: String,
        itemName: String,
    }],
    category: [{
        price: String,
        itemName: String,
    }],
    recommend: [{
        price: String,
        itemName: String,
    }]
});

const CafeDashBoardModel = mongoose.model('cafeApp', userSchema);

module.exports = CafeDashBoardModel;
