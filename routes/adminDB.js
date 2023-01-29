const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    email: String,
    hashed_password: String
});


var admin = mongoose.model('admin', adminSchema);





module.exports = mongoose.model('admin', adminSchema);