var mongoose = require("mongoose");

// NOMINATIONS SCHEMA - name, score, nominatedBy

var nominationSchema = new mongoose.Schema({
    name: { // Name of nomination
        type: String,
        required: true
    },
    score: {    // Nomination's current score in election
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Nomination", nominationSchema);