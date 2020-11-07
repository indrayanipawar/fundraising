const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const session = require("express-session");


const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "Secret.",
    resave: false,
    saveUninitialized: false
}))


let name = '';
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/FundraisingWeb", {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.set('useCreateIndex', true);

const userSchema = new mongoose.Schema({
    email: String,
    phoneNumber: Number,
    password: String
});

const dataSchema = new mongoose.Schema({
    username: String,
    firstname: String,
    lastname: String,
    phonenumber: String,
    age: Number,
    gender: String,
    file: String,
    cause: String,
    reason: String
});

// const dataSchema = new mongoose.Schema({
//     username: String,
//     data: String
// });

userSchema.plugin(passportLocalMongoose);
const User = new mongoose.model("users",userSchema);
const Campaign = new mongoose.model("Campaign",dataSchema);



let user = 'none';
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/form', function(req,res){
    res.render("newCampaign");
})

app.post('/form',function(req,res){
    const newCampaign = new Campaign({
        username: name,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phonenumber: req.body.phonenumber,
        age: req.body.age,
        gender: req.body.gender,
        file: req.body.file,
        cause: req.body.cause,
        reason: req.body.reason,
    });
    newCampaign.save(function(err){
    if(err){
        console.log(err);
    }else{
        console.log(req.body)
        res.render("success");
    }
    });
});

app.get('/success',function(req,res){
    res.render("success");
})
// Main Root
app.get("/", function(req, res){
    if(!req.isAuthenticated()){
        console.log(req.query)
        res.render("index");
    }
    else{
        res.redirect("/logged");
    }
});


app.get("/login_signup", function(req, res){
    if(!req.isAuthenticated()){
        res.render("login_new");
    }
    else{
        res.redirect('/logged');
    }
});
app.post("/login", function(req, res){
    const user = new User({
        username : req.body.username,
        password : req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/logged");
            })
        }
    });
});



// Logout Page
app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});


// Logged
app.get("/logged",function(req,res){
    if(req.isAuthenticated()){
        res.render("newCampaign");
    } else {
        res.redirect("/login");
    }
});


//Register
app.post("/register", function(req, res){
    name = req.body.username
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.send(err);
        } else {
            passport.authenticate("local")(req,res,function(){
                res.redirect("/logged");
            });
        }
    });
});



//Submit
app.get("/submit", function(req, res){
    res.render("submit", {qs: req.query})
});

/*
app.post("/submit", function(req,res){
    console.log(req);
    
    const newCampaign = new Campaign({
                 username: name,
                 data: req.body.data,
             });
    newCampaign.save(function(err){
        if(err){
             console.log('error');
        }else{
             res.render("success");
        }
    })
    
});
*/

const port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(`Express server listening on port ${port}`);
});