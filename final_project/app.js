const express = require('express');
const mongoose = require('mongoose');
const mongo = require('mongodb');
const bcrypt = require('bcrypt');
const dir_name = "/Users/drewbies/Documents/web dev/cpsc-314-web-development-final-project-dbies34/";
const {MongoClient} = require('mongodb');
const uri = "mongodb+srv://dev-drew:nubH26mMi3BmqWQ@clustermain.amfw2.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

const PORT = 3000;


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

var User = mongoose.model('User', UserSchema);
module.exports = User;

// user Schema
var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
    },
    work: {
        type: String,
    },
    education: {
        type: String
    },
    hobbies: {
        type: [String],
    },
    friends: {
        type: [userSchema]
    },
});

// hash password before saving to database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err){
            return next(err);
        }
        user.password = hash;
        next();
    })
});

// authenticate the user against the database
UserSchema.statics.authenticate = function (userData, req, res) {
    User.findOne({
        username: userData.username
    })
    .exec(function (err, user) {
        if (err) {
            return res.render("error.ejs", {
                errors: 2
            });
        } else if (!user){
            var err = new Error('User not found.');
            err.status = 401;
            return res.render("error.ejs", {
                errors: 2
            });
        }

        bcrypt.compare(userData.password, user.password, function (err, result) {
            if (result === true) {
                req.session.userId = user._id;
                return res.render("form.ejs");
            } else {
                return res.redirect("/login");
            }
        })
    });
}

const session = require("express-session");

app.use(session({
    secret: "secret string",
    resave: true,
    saveUninitialized: false
}));

const sanitize = require("mongo-sanitize");
const validator = require("validatorjs");

app.set("view engine", "ejs");
 


// create a new user
async function createUser(newUser){
    

    

    
}

// find a user using their username
async function findUser(client, userName){
    const r = await client.db("user_data").collection("data").findOne({username: userName});
    if (r){
        console.log("found user!");
    } else{
        console.log("cant find user")
    }
}

// update a user when they edit their info
async function updateUser(client, userName, updatedUser){
    const r = await client.db("user_data").collection("data").updateOne({username: userName}, {$set: updatedUser});
    console.log(r);
}

// async function main(){
//     const uri = "mongodb+srv://dev-drew:nubH26mMi3BmqWQ@clustermain.amfw2.mongodb.net/test?retryWrites=true&w=majority";
//     const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true});

//     try{
//         // connect to the MongoDB cluster
//         await client.connect();

        
//         //await updateUser(client, "drew1", {password: "newPassword"});

        
//     } catch (e){
//         console.error(e);
//     } finally {
//         await client.close();
//     }
    
// }
//main().catch(console.error);

// root URL
app.get("/", (req,res) => {
    if (req.session.userId){
        // authenticate
        validateSession(req.session.userId, res);
        res.redirect("/show");
    } else {
        return res.redirect("/login");
    }
});

// CRUD methods
// create
app.post("/show", (req, res) => {
    console.log(req.body);

});

// read
app.get("/profile", (req, res) => {
    if (req.session.userId){
        validateSession(req.session.userId, res);

    } else {
        return res.redirect("/login");
    }
});


app.get("/profile", (req,res) => {
    return res.render("profile.ejs");
});

app.get("/create_user", (req,res) => {
    return res.render("create_user.ejs");
});


// create a new account
app.post("/create_user", async (res,req) => {
    var name = req.body.name;
    var userName = req.body.username;
    var pass = req.body.password;

    var newUser = {
        name: name,
        username: userName,
        password: pass
    }

    try{
        // connect to the MongoDB cluster
        await client.connect();

        const r = await client.db("user_data").collection("data").insertOne(newUser);
        console.log(r);

        
    } catch (e){
        console.error(e);
    } finally {
        await client.close();
    }
    
    return res.redirect('index.html')
});

// login the user and authenticate
app.route("/login")
    .get((req,res) => {
        let errors = {usernameError: ""}
        res.render("login.ejs", errors);
    }).post((req,res) => {
        if (req.body.username && req.body.password){
            var userData = {
                username: req.body.username,
                password: req.body.password,
            }
            let temp = User.authenticate(userData, req, res);
        }
    })

// validate the session with the user id
function validateSession(_id, res){
    if (_id != "") {
        //authenticate
        User.findOne({
            _id: _id
        }).exec(function (err, user) {
            if (err) {
                return res.render("error.ejs", {
                    errors: 2
                });
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                //error
                return res.render("error.ejs", {
                    errors: 2
                });
            }
            //if authenticated give access to show all
            return; // res.redirect("/show");
        });

    } else {
        //redirect to log in
        return res.redirect("/login");
    }
};

// log the user out
app.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});



app.listen(PORT, () => {
    console.log("listening on port " + PORT);
});

