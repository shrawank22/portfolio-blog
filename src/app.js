//Modules imported
require('dotenv').config();
const express = require("express");
const bp = require('body-parser');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const passport = require('passport');
const localStrategy = require('passport-local');

const app = express();

//ejs template engine configuration
app.set('view engine', 'ejs');
app.set("views", "views");

//App config
app.use(express.static("public"));
app.use(express.json());
app.use(bp.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

//DB Models exports
const HomeDetails = require('./models/HomePageDetails');
const ServiceDetails = require('./models/ServicePageDetails');
const ContactDetails = require('./models/ContactPageDetails');
const Blog = require('./models/Blog');
const User = require('./models/User');

//routes imported
const routes = require('./routes/main');
const userRoutes = require('./routes/user');

//DB Connection
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_URL, (err) => {
	if (!err) {
		console.log("DB Connected successfully");

		// Blog.create({
		// 	image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80",
		// 	category: "Web Development",
		// 	title: "My Journey",
		// 	body: "Hello there, let's start talking! Hope You all are fine..",
		// 	author: "Shrawan Kumar",
		// 	author_dp: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80"
		// });
		
		// ContactDetails.create({
		// 	lead: "Always feel free to contact me. I will respond to you as soon as I can.",
		// 	address: [
		// 		{
		// 			icon: "ion-ios-location",
		// 			text: "IIT Kanpur, 208016"
		// 		},
		// 		{
		// 			icon: "ion-ios-telephone",
		// 			text: "+91-6203-xxxxxx"
		// 		},
		// 		{
		// 			icon: "ion-email",
		// 			text: "shrawan8565@gmail.com"
		// 		}
		// 	],
		// 	socials: [
		// 		{
		// 			icon: "ion-social-linkedin",
		// 			link: "https://www.linkedin.com/in/shrawank22/"
		// 		},
		// 		{
		// 			icon: "ion-social-facebook",
		// 			link: "https://www.facebook.com/shrawank22"
		// 		},
		// 		{
		// 			icon: "ion-social-instagram",
		// 			link: "ttps://www.instagram.com/shrawank22/"
		// 		},
		// 		{
		// 			icon: "ion-social-twitter",
		// 			link: "https://twitter.com/shrawank22"
		// 		},
		// 	],
		// });

		// ServiceDetails.create([
		// 	{
		// 		icon: "ion-monitor",
		// 		title: "Web Design",
		// 		desc: "As design is the silent ambassador for your brand or company. So, I will show your brand or company on web pages as you have imagined to be. "
		// 	},
		// 	{
		// 		icon: "ion-code-working",
		// 		title: "Web Development",
		// 		desc: "Web development broadly refers to the tasks associated with developing websites for hosting via intranet or internet. I will do it for you."
		// 	},
		// 	{
		// 		icon: "ion-camera",
		// 		title: "Photography",
		// 		desc: "Whenever you need to shoot pictures either for your brand or products ,I can provide the best photograper."
		// 	},
		// 	{
		// 		icon: "ion-android-phone-portrait",
		// 		title: "Responsive Desiogn",
		// 		desc: "All of us are continuously prefering smart phones or tablets.Hence we need to have responsibe web pages design so that website look great and adjust according to screen size."
		// 	},
		// 	{
		// 		icon: "ion-monitor",
		// 		title: "Web Design",
		// 		desc: "As design is the silent ambassador for your brand or company. So, I will show your brand or company on web pages as you have imagined to be. "
		// 	},
		// 	{
		// 		icon: "ion-code-working",
		// 		title: "Web Development",
		// 		desc: "Web development broadly refers to the tasks associated with developing websites for hosting via intranet or internet. I will do it for you."
		// 	},
		// 	{
		// 		icon: "ion-camera",
		// 		title: "Photography",
		// 		desc: "Whenever you need to shoot pictures either for your brand or products ,I can provide the best photograper."
		// 	},
		// 	{
		// 		icon: "ion-android-phone-portrait",
		// 		title: "Responsive Desiogn",
		// 		desc: "All of us are continuously prefering smart phones or tablets.Hence we need to have responsibe web pages design so that website look great and adjust according to screen size."
		// 	},
		// 	{
		// 		icon: "ion-monitor",
		// 		title: "Web Design",
		// 		desc: "As design is the silent ambassador for your brand or company. So, I will show your brand or company on web pages as you have imagined to be. "
		// 	},
		// ]);

		// HomeDetails.create({
		// 	intro: "Hii, I'm Shrawan Kumar",
		// 	slider: [
		// 		{
		// 			text: "IITian"
		// 		},
		// 		{
		// 			text: "MTech CSE/Cybersecurity @ IIT Kanpur"
		// 		},
		// 		{
		// 			text: "Blockchain Developer"
		// 		},
		// 		{
		// 			text: "Competitive Programmer"
		// 		},
		// 		{
		// 			text: "Full Stack Web Developer"
		// 		},
		// 		{
		// 			text: "Web Designer"
		// 		},
		// 		{
		// 			text: "SLIET'22"
		// 		}
		// 	]
		// });
	} else {
		console.log(err);
	}
});

//passport config
app.use(flash());
app.locals.moment = require('moment');

app.use(require("express-session")({
	secret: "Why should I tell you?",
	resave: false,
	saveUninitialized: false  
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next)=>{
	res.locals.user = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

//imported routes use
app.use(routes);
app.use(userRoutes);

//app listen config
const PORT = process.env.PORT || 8080;
const IP = process.env.IP || "0.0.0.0";
app.listen(PORT, IP, () => 
	console.log(`Server started on http://localhost:${PORT}`)
);
