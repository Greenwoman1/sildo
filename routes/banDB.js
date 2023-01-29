const mongoose = require('mongoose');


const banSchema = new mongoose.Schema({
    id_predavaca: String,
    dana: Number,
    pocetak: Date
});




module.exports = mongoose.model('ban', banSchema);






