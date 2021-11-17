const express = require('express');
const router = express.Router();

const User = require('../models/User');

const passport = require('passport');

//Sign in  routes
router.get('/users/signin', (req,res) => {
    res.render('users/signin');
});

router.post('/users/signin', passport.authenticate('local', {
    successRedirect: '/notes',
    failureRedirect: '/users/signin',
    failureFlash: true
}));

//Sign up routes
router.get('/users/signup', (req,res) => {
    res.render('users/signup');
});

router.post('/users/signup', async (req, res) => {
    const { name, email, password, confirmPassword } = req.body;
    let errors = 0;
    if(name.length == 0){
        errors += 1;
        req.flash('error_msg', 'Please insert your name.');
    }
    if(email.length == 0){
        errors += 1;
        req.flash('error_msg', 'Please insert your email.');
    }
    if(password != confirmPassword){
        errors += 1;
        req.flash('error_msg', 'Passwords does not match.');
    }
    if(password.length < 4 || confirmPassword.length < 4){
        errors += 1;
        req.flash('error_msg', 'Passwords must be at least 4 characters long.');
    }
    if(errors != 0 ){
        res.redirect('/users/signup');
    }else{
        const userEmail = await User.findOne({email: email});
        if(userEmail != null){
            req.flash('error_msg', 'The email is already in use.');
            res.redirect('/users/signup');
        } else {
            const newUser = new User( {name, email, password} ); 
            newUser.password = await newUser.encryptPassword(password);
            await newUser.save();
            req.flash('success_msg', 'Account created successfully.');
            res.redirect('/users/signin');
        }
    }
});

//Signout routes
router.get('/users/signout', (req, res) =>{
    req.logout();
    res.redirect('/');
});

module.exports = router; 