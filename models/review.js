//Joi is a validator for data
const { string, number } = require("joi");
//require mongoose for saving reviews into db
const mongoose = require("mongoose");
//shorthand
const Schema = mongoose.Schema;

//schema for a review, with the actual written review and a rating
const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
});

//export
module.exports = mongoose.model("Review", reviewSchema);