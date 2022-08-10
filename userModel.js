var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema(
    {
        name: { type: String },

        password: {type:String },

        message: { type: String },
    })

module.exports = mongoose.model('user', UserSchema)