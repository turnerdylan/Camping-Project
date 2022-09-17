const User = require("../models/user");
const catchAsync = require('../utils/catchAsync')

//render the register page
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}

//register a user
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password} = req.body;
        const user = new User({email, username})
        const registeredUser = await User.register(user, password);
        //log in user immediately after registering them
        req.login(registeredUser, err => {
            if(err) return next(err)
            req.flash('success', 'Registration successful!')
            res.redirect('/campgrounds')
        })
    } catch(e) {
        req.flash('error', e.message)
        res.redirect('register')
    }
}

//render login page
module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

//log in
module.exports.login = (req, res) => {
    req.flash('success', `Welcome back, ${req.body.username}!`)
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo;
    console.log('logged in');
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) => {
    req.logout(catchAsync);
    console.log('logged out');
    req.flash('success', 'Successfully logged out')
    res.redirect('/campgrounds')
}