const mongoose = require('mongoose');
const cities = require('./cities');
const {descriptors, places} = require('./seedHelpers')
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/camp-app') //opens mongoose default connection to mongodb

mongoose.connection.on('error', console.error.bind(console, 'connection error')); //check if theres an error
mongoose.connection.once("open", () => { //if connected, print out database connected
    console.log('database connected');
})

const getRandomIndex = function(array){
    return array[Math.floor(Math.random() * array.length)]
}
const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i=0; i<300; i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 + 10)
        const camp = new Campground({
            author: '631a4e5f48db69674c8c020a',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${getRandomIndex(descriptors)} ${getRandomIndex(places)}`,
            description: 'lorem ipsum fdskfhkdhskfsdhfkhgsdkfsdkfgsdkf',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [cities[random1000].longitude, cities[random1000].latitude]
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/dfzsgdkgj/image/upload/v1662945067/cld-sample-2.jpg',
                  filename: 'camp-app/jtwpskk7zz8kedzx96gm',
                }
              ]
        })
        await camp.save();
    }
}

seedDB();