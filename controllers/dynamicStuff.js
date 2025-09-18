const { DynamicStuff: Stuff } = require("../models/dynamicStuff");
const _ = require('lodash');


class DynamicStuff {
    async patchStuff(req, res) {
        const id = req.query.id



        const {

            pillsSlideOne,
            pillsSlideTwo,
            pillsSlideThree,
            midSliderOne,
            midSliderTwo,
            midSliderThree,
            MainSlider,
            bottomImage,
            aboutUs,
            contactUs,
        } = req.body;

        let body = {}
        const img = req.file

        console.log(req.body);



        if (bottomImage) {
            const data = {
                text: bottomImage,
                image: img.path
            }
            body.bottomImage = data
        }
if (MainSlider) {
            const data = {
                text: MainSlider,
                image: img.path
            }
            body.MainSlider = data
        }

        if (pillsSlideOne) {
            const data = {
                text: pillsSlideOne,
                image: img.path
            }
            body.pillsSlideOne = data
        }
        if (pillsSlideTwo) {
            const data = {
                text: pillsSlideTwo,
                image: img.path
            }
            body.pillsSlideTwo = data
        }
        if (pillsSlideThree) {
            const data = {
                text: pillsSlideThree,
                image: img.path
            }
            body.pillsSlideThree = data
        }
        if (midSliderOne) {
            const data = {
                text: midSliderOne,
                image: img.path
            }
            body.midSliderOne = data
        }
        if (midSliderTwo) {
            const data = {
                text: midSliderTwo,
                image: img.path
            }
            body.midSliderTwo = data
        }
        if (midSliderThree) {
            const data = {
                text: midSliderThree,
                image: img.path
            }
            body.midSliderThree = data
        }


        // if (midSlider) {
        //     const data = {
        //         [obt]: {
        //             text: midSlider.text,
        //             image: img.path
        //         }
        //     }

        //     body.midSlider = data
        // }
        // pillsSlideOne ? body.pillsSlideOne = pillsSlideOne : body
        // pillsSlideTwo ? body.pillsSlideTwo = pillsSlideTwo : body
        // pillsSlideThree ? body.pillsSlideThree = pillsSlideThree : body
        // midSliderOne ? body.midSliderOne = midSliderOne : body
        // midSliderTwo ? body.midSliderTwo = midSliderTwo : body
        // midSliderThree ? body.midSliderThree = midSliderThree : body

        aboutUs ? body.aboutUs = aboutUs : body
        contactUs ? body.contactUs = contactUs : body

        console.log(body);
 let stuffNew = await Stuff.find()
        if (!stuffNew.length>0) {
            const stuff = await new Stuff({
                _id:id,
                ...body
            })
   await stuff.save()
 }
    
        let stuff = await Stuff.findByIdAndUpdate(id, { ...body }, { new: true })

        res.send(stuff)
    }

    async create(req, res) {
     let stuffNew = await Stuff.find()
        if (!stuffNew.length>0) {
   const stuff =  await new Stuff({...body})
   await stuff.save()
 }
}

    async getData(req, res) {
        // const id = req.query.id
        let stuff = await Stuff.find()
        res.send(stuff)
    }

}


module.exports = new DynamicStuff()