const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;
const opts = { toJSON: { virtuals: true } }

const ImageSchema = new Schema({
    url: String,
    filename: String
})

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

//campground schema, basically a hierarchical json type structure for data
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href=/campgrounds/${this._id}>${this.title}</a>
    <br>
    <a href=/campgrounds/${this._id}>${this.location}</a>`
})

//this fires after you delete a post, and takes the object id and deletes all associated reviews
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }

})

//node.js, exposes exported object as a model
//model is a constructor made from a schema, 'Campground' will be added to a 'campgrounds' collection in the database
module.exports = mongoose.model('Campground', CampgroundSchema)