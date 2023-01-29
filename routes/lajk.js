var express = require('express');
var router = express.Router();
    console.log("jesam li")
    const btnLajk = document.getElementById('btn-lajk');
    // obradi klik na dugme "btn-lajk"
    btnLajk.addEventListener('click', function() {
    // dobavi ID pitanja iz atributa "data-id"
    const pitanjeId = this.getAttribute('data-id');
    // pozovi funkciju za izmenu brojača za lajk u bazi podataka
    updateLajk(pitanjeId);
});

    // funkcija za izmenu brojača za lajk u bazi podataka


module.exports = router;



