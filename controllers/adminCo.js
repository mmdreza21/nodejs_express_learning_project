const { User } = require("../models/user");

class AdminController {
  async getUnChecked(req, res) {
    const page = +req.query.page;
    const limit = +req.query.limit;
    let startIndex = (page - 1) * limit;
    const checked = req.query.checked;
    const iWannaCheck = req.query.iWannaCheck;

    const queries = { role: "Teacher", isTeacher: true };

    checked ? (queries.checked = checked) : queries;
    iWannaCheck ? (queries.iWannaCheck = iWannaCheck) : queries;

    const result = {};
    result.end = Math.ceil((await User.countDocuments(queries).exec()) / limit);

    result.data = await User.find(queries)
      .sort({ updatedAt: -1 })
      .populate("langs.lang classes students")
      .skip(startIndex)
      .limit(limit);
    res.send(result);
  }

  async chekTeacher(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User ENOTFOUND");
    user.checked = true;
    await user.save();
    res.send(user);
  }

  async unchekTeacher(req, res) {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User ENOTFOUND");
    user.checked = false;
    await user.save();
    res.send(user);
  }

  async deleteUser(req, res) {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) return res.status(404).send("User ENOTFOUND");
    res.send(user);
  }

  async uploadBaget(req, res) {
    const img = req.file;
    if (!img) return res.status(400).send("شما باید عکسی انتخاب کنید!");
    // console.log(img);
    const teacher = await User.findByIdAndUpdate(
      req.params.id,
      {
        degreeBadget: img.path,
      },
      { new: true }
    );
    res.send(teacher);
  }

  async getCreditTeacher(req, res) {
    const teacher = await User.find({ balance: { $gt: 1000 } }).populate(
      "langs.lang teachingLang classes students"
    );
    res.send(teacher);
  }
}

module.exports = new AdminController();
