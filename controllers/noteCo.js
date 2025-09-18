"use-strick"
const { Note, validate } = require("../models/note");


class NoteController {

    async createNote(req, res) {
        const { error } = validate(req.body)
        if (error) return res.status(400).send(error.details[0].message);

        const note = await new Note({
            text: req.body.text,
            userId: req.user._id
        })
        await note.save()
        res.send(note);
    }

    async getForUser(req, res) {
        const userId = req.user._id

        const note = await Note.find({ userId })
        if (!note) return res.status(404).send('شما هیج یادداشتی ندارید!');
        res.send(note)
    }

    async removeNote(req, res) {
        const note = await Note.findByIdAndRemove(req.params.id)
        if (!note) res.status(404).send('ENotFond')
        res.send(note)
    }

    async updateNote(req, res) {
        const note = await Note.findByIdAndUpdate(req.params.id, {
            text: req.body.text
        }, { new: true })
        if (!note) res.status(404).send('ENotFond')

        res.send(note)
    }

}

module.exports = new NoteController()
