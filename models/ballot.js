var mongoose = require("mongoose");

var ballotSchema = new mongoose.Schema({
    ordering: {
        type: Map,
        of: Number
    },
    voter: String
})

module.exports = mongoose.model("Ballot", ballotSchema);