const mongoose = require('mongoose');

const ServicesSchema = mongoose.Schema({
    icon: String,
    title: String,
    desc: String
});

module.exports = mongoose.model("service-page-details", ServicesSchema);