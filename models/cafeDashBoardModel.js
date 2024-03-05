const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    banner: [{
        price: String,
        itemName: String,
        image:String,
    }],
    category: [{
        price: String,
        itemName: String,
        image:String,
    }],
    recommend: [{
        price: String,
        itemName: String,
        image:String,
    }]
});

const CafeDashBoardModel = mongoose.model('cafeApp', userSchema);

module.exports = CafeDashBoardModel;
