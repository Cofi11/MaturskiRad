const express = require('express');
const router = express.Router();

//za kodiranje sifri (hashed passwords)
const bcrypt = require('bcrypt');

const User = require('../models/user');
const passport = require('passport');

const checkNotAuthenticated = require('../passport-auth').checkNotAuthenticated;

router.get('/', function(req, res){
    let username;
    if(req.user){
        username = req.user.username;
    }
    else username=false;
    res.render('index', {
        username: username
    });
});

router.post('/login', checkNotAuthenticated , passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true,
}));

router.get('/register', checkNotAuthenticated , function(req,res){
    res.render('registerPage', {
        user: new User()
    });
});

router.post('/register', checkNotAuthenticated , async function(req,res){
    let error = passwordCheck(req.body.password, req.body.password2);
    if(!error){
        try{
            const user1 = await User.findOne({username: req.body.username});
            const user2 = await User.findOne({email: req.body.email});
            if(user1){
                error='Username already exists';
                res.render('registerPage', {
                    errorMessage: error,
                    user:{
                        username: req.body.username,
                        email: req.body.email
                    }
                });
            }
            else if(user2){
                error='User with that email already exists';
                res.render('registerPage', {
                    errorMessage: error,
                    user:{
                        username: req.body.username,
                        email: req.body.email
                    }
                });
            }
            else{
                const hashedPassword =await bcrypt.hash(req.body.password, 10);
                const user = new User({
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword
                })
                console.log(user);
                await user.save();
                console.log('Sacuvan user');
                res.redirect('/');
            }
        } 
        catch{
            res.redirect('/register');
        }  
    }
    else{
        res.render('registerPage', {
            errorMessage: error,
            user:{
                username: req.body.username,
                email: req.body.email
            }
        });
    }
});

function passwordCheck(pw1,pw2){
    //console.log(pw1+' , '+pw2);
    let error;
    if(pw1 != pw2){
        error='Passwords do not match!'
        return error;
    }
    if(pw1.length < 6){
        error='Password to short';
        return error;
    }
}

//method-override delete
router.delete('/logout', function(req,res){
    req.logOut();
    res.redirect('/');
})

module.exports = router;