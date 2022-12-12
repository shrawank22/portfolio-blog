const mongoose = require('mongoose');

const ContactDetailsSchema = new mongoose.Schema({
    lead: String,
    address: [
        {
            icon: String,
            text: String
        }
    ],
    socials: [
        {
            icon: String,
            link: String
        }
    ],
});

module.exports = mongoose.model("contact-page-details", ContactDetailsSchema);