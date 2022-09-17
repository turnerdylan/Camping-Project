const { cloudinary } = require('../cloudinary');
const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding')
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken})

//displays all campgrounds
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find();
    res.render('campgrounds/index', { campgrounds })
}

//render the form to create a new campground
module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}


//create new campground
module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    const campground = new Campground(req.body.campground)

    campground.geometry = geoData.body.features[0].geometry;                        //add location geometry
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })) //add image files
    campground.author = req.user._id;                                               //add author

    await campground.save();
    console.log(campground);
    req.flash('success', 'New campground created!')
    res.redirect(`/campgrounds/${campground._id}`)
}

//render a specific campground
module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author')
    if (!campground) {
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground })
}

//renders the edit page for a specific campground
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Campground not found')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
}

//edits and updates a specific campground with new info
module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    campground.images.push(...images)
    await campground.save();
    //check to see if there are any images to delete
    if (req.body.deleteImages) {
        //delete fiels off cloudinary
        for(let filename of req.body.deleteImages){
            cloudinary.uploader.destroy(filename)
        }
        //pull images from campground array
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }

    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${campground._id}`)
}

//deletes a campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Campground deleted')
    res.redirect('/campgrounds')
}