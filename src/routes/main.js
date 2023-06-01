require('dotenv').config();
const express = require("express");
const nodemailer = require('nodemailer');
const bp = require('body-parser');
const HomeDetails = require('../models/HomePageDetails');
const ServiceDetails = require('../models/ServicePageDetails');
const ContactForm = require('../models/ContactForm');
const ContactDetails = require('../models/ContactPageDetails');
const Blogs = require('../models/Blog');
const router = express.Router();

const middleware = require('../../middleware');
const { application } = require('express');


//Index router
router.get('/', async (req, res)=>{
	const homeDetails = await HomeDetails.findOne({
		"_id": process.env.HomeID
	});
	const serviceDetails = await ServiceDetails.find();

	const contactDetails = await ContactDetails.findOne({
		"_id": process.env.ContactID
	});

	const blogs = await Blogs.find();

	// console.log(blogs);
	
	res.render('index', {
		homeDetails: homeDetails, 
		serviceDetails: serviceDetails, 
		contactDetails: contactDetails,
		blogs: blogs
	});
});


//contact router
router.post("/", async (req, res)=> {
	const transporter = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			user: process.env.GMAIL, 
			pass: process.env.GMAILPW 
		}
	});

	var textBody = `FROM: ${req.body.name} EMAIL: ${req.body.email} MESSAGE: ${req.body.message}`;
	var htmlBody = `<h2>Mail From Contact Form</h2><p>from: ${req.body.name} <a href="mailto:${req.body.email}">${req.body.email}</a></p><p>${req.body.message}</p>`;
	var mail = {
		from: process.env.GMAIL, 
		to: process.env.GMAIL, 
		subject: `Mail From Contact Form(Subject - ${req.body.subject})`,
		text: textBody,
		html: htmlBody
	};
	transporter.sendMail(mail, function (err, info) {
		if(err) {
			console.log(err);
			res.send(err);
			res.json({ message: "message not sent: an error occured; check the server's console log" });
		}
		else {
			res.json({ message: `message sent: ${info.messageId}` });
			res.send("message sent");
		}
	});

	try{
		const data = await ContactForm.create(req.body);
		//console.log(data);
	} catch(e) {
		console.log(e);
	}
});

//Cv
router.get('/cv', (req, res)=> {
	res.sendFile(__dirname + "/cv.pdf");
});

//Blog router 
//NEW ROUTE
router.get("/blogs/new", middleware.isLoggedIn, (req, res)=>{
    res.render("blog/new");
});

//CREATE ROUTE
router.post("/blogs", middleware.isLoggedIn, (req, res)=>{
    //console.log(req.body);
	//console.log(req.body.blog.image);

	const category = req.sanitize(req.body.blog.category);
	const title = req.sanitize(req.body.blog.title);
	const image = req.sanitize(req.body.blog.image);
	const content = req.sanitize(req.body.blog.content);
	// console.log(content);
	const author = {
		id: req.user._id,
		username: req.user.username
	};

	const blog = {category: category, title: title, image: image, content: content, author: author}

    Blogs.create(blog, (err, newBlog)=>{
        if(err){
            res.render("new");
        }
        else{
            res.redirect("/#blog");
        }
    });
});

//SHOW ROUTE
router.get("/blogs/:id", (req, res)=>{
    Blogs.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.render("blog/show", {blog: foundBlog});
        }
    });
});

//EDIT ROUTE
router.get("/blogs/:id/edit", middleware.checkBlogOwnership, (req, res)=>{
    Blogs.findById(req.params.id, (err, foundBlog)=>{
        if(err){
			console.log(err);
            res.redirect("/blogs");
        }
        else{
			//console.log(foundBlog);
            res.render("blog/edit", {blog: foundBlog});
        }
    });
});

//UPDATE ROUTE
router.put("/blogs/:id", middleware.checkBlogOwnership, (req,res)=>{
    Blogs.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog)=>{
        if(err){
            res.redirect("/blogs");
        }
        else{
            res.redirect("/blogs/" + req.params.id);      
        }
    });
});

//DELETE ROUTE
router.delete("/blogs/:id", (req, res)=>{
    Blogs.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.redirect("/#blog");
        }
        else{
            res.redirect("/#blog");
        }
    });
});

module.exports = router;