const mongoose = require('mongoose');

const ContactFormSchema = mongoose.Schema({
    name: String,
    email: String,
    subject: String,
    message: String
});

module.exports = mongoose.model("contact-form-responses", ContactFormSchema);