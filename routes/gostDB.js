const mongoose = require('mongoose');

const gostSchema = new mongoose.Schema({
    name: String,
    surname: String,
    password: String
});

module.exports = mongoose.model('gost', gostSchema);