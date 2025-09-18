const mongoose = require('mongoose')
const Schema = mongoose.Schema

const dynamicStuffSchema = new Schema({
    MainSlider: { image: { type: String }, text: String },

    midSliderOne: { image: { type: String }, text: String },
    midSliderTwo: { image: { type: String }, text: String },
    midSliderThree: { image: { type: String }, text: String },


    pillsSlideOne: { image: { type: String }, text: String },
    pillsSlideTwo: { image: { type: String }, text: String },
    pillsSlideThree: { image: { type: String }, text: String },

    bottomImage: { image: { type: String }, text: String },

    aboutUs: { type: String },
    contactUs: {
        phone1: { type: String },
        phone2: { type: String },
        address: { type: String },
        email: { type: String }
    }

})



const DynamicStuff = mongoose.model('dynamicStuff', dynamicStuffSchema)


exports.DynamicStuff = DynamicStuff

