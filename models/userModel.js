const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    termsAccepted: { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);