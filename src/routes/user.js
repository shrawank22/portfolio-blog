const express = require('express');
const router = express.Router();
const User = require('../models/User');	
const Blogs = require('../models/Blog');
const passport = require('passport');


//forgot password
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");


// ============Auth routes  =======================

router.get('/register', (req, res)=>{
	res.render('user/register', {page: 'register'});
});

router.post('/register', (req, res)=>{
	User.register(new User(
		{
			username: req.body.username, 
			name: req.body.name, 
			email: req.body.email, 
			avatar: req.body.avatar
		}), req.body.password, (err, user)=>{
		if(err){
			// console.log(err);
			req.flash('error', err.message);
			return res.redirect('/register');
		} else {
			passport.authenticate("local")(req, res, ()=>{
                // console.log(user.username);
				req.flash('success', "Welcome to My Space " + user.username);
				res.redirect('/#blog')
			});
		}
	});
});

router.get('/login', (req, res)=>{
	res.render('user/login', {page: 'login'});
});

router.post('/login', (req, res, next)=>{
	passport.authenticate("local", {
	successRedirect: "/#blog", 
	failureRedirect: "/login",
	failureFlash: true,
	successFlash: "Welcome to My Space, " + req.body.username + "!"
})(req, res);
});

router.get('/logout', (req, res)=>{
    req.logout((err) => {
        if (err) 
        { 
            return next(err); 
        } else {
            req.flash("success", "Successfully Logged you out");
            res.redirect('/login');
        }
    });
	//res.redirect('/#blogs');
});


// forgot password
router.get('/forgot', function(req, res) {
    res.render('user/forgot');
});

router.post('/forgot', function(req, res, next) {
    async.waterfall([
        function(done) {
        crypto.randomBytes(20, function(err, buf) {
            const token = buf.toString('hex');
            done(err, token);
        });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            const smtpTransport = nodemailer.createTransport({
                service: 'Gmail', 
                auth: {
                    user: process.env.GMAIL,
                    pass: process.env.GMAILPW
                }
            });
            const mailOptions = {
                to: user.email,
                from: 'dummy@gmail.com',
                subject: 'Portfolio Blog Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };

            smtpTransport.sendMail(mailOptions, function(err) {
                console.log('mail sent');
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('user/reset', {token: req.params.token});
    });
});

router.post('/reset/:token', function(req, res) {
    async.waterfall([
        function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
            if (!user) {
                // console.log("No User");
                req.flash('error', 'Password reset token is invalid or has expired.');
                return res.redirect('back');
            }
            // console.log(req.body.pass);
            // console.log(req.body.confirm);
            if(req.body.password === req.body.confirm) {
                // console.log("matches");
                user.setPassword(req.body.password, function(err) {
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                })
            } else {
                // console.log("not match");
                req.flash("error", "Passwords do not match.");
                return res.redirect('back');
            }
        });
        },
        function(user, done) {
            const smtpTransport = nodemailer.createTransport({
            service: 'Gmail', 
            auth: {
                user: process.env.GMAIL,
                pass: process.env.GMAILPW
            }
            });

            const mailOptions = {
                to: user.email,
                from: 'dummy@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' + 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/#blog');
    });
});

// USER PROFILE
router.get("/users/:id", function(req, res) {
    User.findById(req.params.id, function(err, foundUser) {
        if(err) {
            req.flash("error", "Something went wrong.");
            res.redirect("/");
        }
        Blogs.find().where('author.id').equals(foundUser._id).exec(function(err, blogs) {
            if(err) {
                req.flash("error", "Something went wrong.");
                res.redirect("/");
            }
            res.render("user/profile", {user: foundUser, blogs: blogs});
        });
    });
});

module.exports = router;