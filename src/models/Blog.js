const mongoose = require('mongoose');


const blogSchema = new mongoose.Schema({
    image: String,
    category: String,
    title: String,
    content: String,
    author: String,
    author_dp: String,
    created: {type: Date, default: Date.now},
    author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}, 
		username: String
	},
});


module.exports = mongoose.model("Blog", blogSchema);
