var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const gost = require('./gostDB');
const predavanje = require("./predavanjeDB");
const pitanja = require("./pitanjaDB");
const bcrypt = require("bcrypt");
const predavac = require("./predavacDB");
const session = require("express-session");
const zabranjene_rijeci = require("./zabranjene_rijeciDB");
const ban = require("./banDB");


const administrator = require('./adminDB');
const {log} = require("debug");




router.use(session({
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 60000 // 1 minute
    }
}));




router.get('/login', function (req, res){
    res.render('admin')

})


router.post('/login', async function (req, res){
    const saltRounds = 10;
    const hashedPassword =  await bcrypt.hash(req.body.sifra, saltRounds);
    const hash = await bcrypt.hash("1234" , saltRounds);
    console.log(hash);


    administrator.findOne({email: req.body.email}, (error, admin) => {
        if (error) {
            console.log(error);
        } else if (admin) {
            req.session.adminSessija ={
                email: req.body.email

            }
            bcrypt.compare(req.body.sifra,admin.hashed_password, function(err, resS) {
                if (resS) {
                    // Lozinka je ispravna
                    console.log("lozinka ispravna")
                    res.cookie('id_admina', admin._id.toString())
                    res.redirect('/admin/naslovna')

                } else {
                    console.log(hashedPassword+"   "+admin.hashed_password)
                    console.log("lozinka nije ispravna")
                    // Lozinka nije ispravna
                    res.redirect('/');
                }
            });

        } else {
            console.log("jesam li ovde ? ")
            res.redirect("/");
        }
    });
});

router.get('/naslovna', (req, res)=>{

    if(req.cookies.id_admina){
        res.render("admin", {predavaci: predavac, predavanja: predavanje, pitanja: pitanja});

    }
    else
    {
        res.send(404);
    }

})


router.get('/predavaci', async (req, res)=>{

    if(req.cookies.id_admina){
        var p  = [];
        var b = [] ;
        await predavac.find().then(predavaci =>{
            p = predavaci;
        })

        await ban.find().then(banovani => {
            b = banovani
        })

        res.render("predavaciAdmin", { title: "predavaci", predavaci : p, banovani: b});

    }
    else
    {
        res.send(404);
    }

})

router.get('/predavac/izbrisi', async (req, res)=>{
    const id = mongoose.Types.ObjectId(req.query.id);
    if(req.cookies.id_admina){
        console.log(id);
        await predavanje.deleteMany({predavac_id: id});
        console.log("izbrisao predavanja")

        await predavac.findByIdAndRemove(id)
            .then(() => {
                res.redirect('/admin/predavaci');

            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
            });



    }
    else
    {
        res.send(404);
    }

})




router.get('/predavanja', (req, res)=>{

    if(req.cookies.id_admina){

        predavanje.find().then(predavanja =>{
            res.render("predavanjaAdmin", { title: "predavanja", predavanjaa: predavanja});



        })


    }
    else
    {
        res.send(404);
    }

})

router.get('/predavanja/izbrisi', (req, res)=>{
    console.log("usao u izbrisi")
    const id = mongoose.Types.ObjectId(req.query.id);
    console.log(id)

    if(req.cookies.id_admina){

        predavanje.findByIdAndRemove(id)
            .then(() => {
                res.redirect('/admin/predavanja');

            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
            });



    }
    else
    {
        res.send(404);
    }

})



router.get('/zabranjene_rijeci', (req, res)=>{

    if(req.cookies.id_admina) {
        zabranjene_rijeci.find().then(rijec => {
            res.render("zabranjene_rijeci", {title: "Zabranjene riječi", rijec: rijec});
        })
    }
    else
    {
        res.send(404);
    }

});

router.get('/zabranjene_rijeci/izbrisi', (req, res)=>{
    const id = mongoose.Types.ObjectId(req.query.id);;
    if(req.cookies.id_admina){

        zabranjene_rijeci.findByIdAndRemove(id)
            .then(() => {
                res.redirect('/admin/zabranjene_rijeci');

            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
            });



    }
    else
    {
        res.send(404);
    }

})

router.get('/banuj30',  (req, res)=>{
    const id = ""+req.query.id.toString();
    if(req.cookies.id_admina){
        console.log(req.query.id)

        var bann = new ban({
            id_predavaca: id,
            dana: 30,
            pocetak: new Date().getTime()

        })


         ban.findOne({id_predavaca: id.toString()}).then(  (p)=>
        {
            if (p){
                console.log(p)

                res.redirect("/admin/predavaci")
            }
            else {
                console.log(id)
                 bann.save()
                    .then(() => {
                        res.redirect('/admin/predavaci');

                    })
                    .catch(error => {
                        console.log(`Error deleting user by ID: ${error.message}`);
                    });

            }
        })





    }
    else
    {
        res.send(404);
    }

})

router.get('/banuj15', async (req, res)=>{
    const id = mongoose.Types.ObjectId(req.query.id);;
    if(req.cookies.id_admina){

        var bann = new ban({
            id_predavaca: id,
            dana: 15,
            pocetak: new Date().getTime()

        })

        await bann.save()
            .then(() => {
                res.redirect('/admin/predavaci');

            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
            });



    }
    else
    {
        res.send(404);
    }

})

router.get('/odbanuj', async (req, res)=>{
    const id = mongoose.Types.ObjectId(req.query.id);;
    if(req.cookies.id_admina){

        await ban.findOneAndDelete({id_predavaca: id})
            .then( () => {

                res.redirect('/admin/predavaci');

            })
            .catch(error => {
                console.log(`Error deleting user by ID: ${error.message}`);
            });



    }
    else
    {
        res.send(404);
    }

})


router.post('/zabranjene_rijeci/dodaj', (req, res)=>{
    const rijec = req.body.rijec;
    console.log(rijec)
    const zabranjena_rijec = new zabranjene_rijeci({
        rijec: rijec
    })

    if(req.cookies.id_admina){

        zabranjena_rijec.save({new: true}).then(()=>{
                res.redirect('/admin/zabranjene_rijeci');

            }
        )



    }
    else
    {
        res.send(404);
    }

})






module.exports = router;
