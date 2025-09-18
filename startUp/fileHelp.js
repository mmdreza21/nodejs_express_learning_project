const { unlink } = require('fs').promises;

module.exports.deleteImage = async (filePath) => {
    try {
        const dI = unlink(filePath)
    } catch (e) {
        throw e
    }
}


