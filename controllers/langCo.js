const { Lang, validate } = require("../models/lang");

const _ = require('lodash');


class LangController {
    async sendLang(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)


        let lang = await Lang.findOne({ fullTitle: req.body.fullTitle })
        if (lang) return res.status(400).send({ e: "this languege already exist!", p: "شما این زبان را وارد کرده اید!" })

        lang = await new Lang(_.pick(req.body, ["title", "fullTitle", "level"]))
        await lang.save()
        res.send(lang);

    }
    async allLang(req, res) {
        const lang = await Lang.find().collation({ locale: "en" }).sort({ title: 1 })
        res.send(lang);
    }
    async updateLang(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message)

        const lang = await Lang.findByIdAndUpdate(req.params.id, { ..._.pick(req.body, ["title", "fullTitle", "level"]) }, { new: true })
        res.send(lang)
    }
    async removeLang(req, res) {
        const lang = await Lang.findByIdAndRemove(req.params.id)
        if (!lang) return res.status(400).send('lang ENotFound')
        res.send(lang)
    }

}

module.exports = new LangController()