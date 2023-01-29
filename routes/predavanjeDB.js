const mongoose = require('mongoose');

const predavanjeSchema = new mongoose.Schema({
    kod: String,
    ime: String,
    start_date: Date,
    end_date: Date,
    repeat_days: [],
    predavac_id: String,
    pozadina: String,
    broj_postavljenih: { type: Number, default: 0},
    broj_odgovorenih: { type: Number, default: 0}

});
const predavanje = mongoose.model('predavanje', predavanjeSchema);






module.exports = mongoose.model('predavanje', predavanjeSchema);





