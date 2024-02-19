const mongoose = require('mongoose');

const blackListSchama = new mongoose.Schema(
    {
        token: {
            type: String,
            required: true
        }
    },
    { timestamps: true },
);

module.exports = mongoose.model("BlackList", blackListSchama);