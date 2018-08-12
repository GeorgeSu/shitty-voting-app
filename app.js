var express =	require("express"), // import Express package
    app =		express(), // store Express package in app Object
    bodyParser =	require("body-parser"), // BodyParser package for receiving user post form info
    request =		require("request"), // Request package for making HTTP requests for API calls
    methodOverride = require("method-override"), // Method-Override package for PUT/DELETE route method over-rides
    mongoose =	require("mongoose"); // Mongoose package for interacting with MongoDB
// Connect Mongoose Server to DB; use new syntax (mongoose.connect("mongodb://localhost:27017/app_name", { useNewUrlParser: true });) if Mongo Version 5.2.1 or higher
mongoose.connect("mongodb://localhost/elections"); // connects mongoose to database server; replace database_name with app’s database; if database_name doesn’t exist, creates the database

// BodyParser + Method-Override Boilerplate
app.use(bodyParser.urlencoded({extended: true})); // Boilerplate for using BodyParser
app.use(methodOverride("_method")); // Method-Override boilerplate

// Set Public Folder as Default directory and Set EJS as View Enginer
app.use(express.static(__dirname + "/public")); // tells view files to use "public" folder as root node for linking to other files (such as stylesheets)
app.set("view engine", "ejs"); // sets .ejs extension as default view type, so you don’t have to type .ejs for all render file paths


var Election = require("./models/election.js")
var Ballot = require("./models/ballot.js")
var Nomination = require("./models/nomination.js")

app.get("/", function(req, res) {
    res.render("index");
})

app.get("/elections", function(req, res) {
    Election.find({}, function(err, allElections) {
        if (err) {
            console.log(err);
        } else {
            res.render("elections", {elections: allElections});
        }
    })
}) 

app.get("/elections/:id", function(req, res) {
    Election.findById(req.params.id).populate("nominations").populate("ballots").exec(function(err, electionFound) {
        if (err) {
            console.log(err);
        } else {
            res.render("election", {election: electionFound});
        }
    })
});

app.post("/elections", function(req, res) {
    Election.create({name: req.body.name}, function(err, newElection) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/elections/" + newElection._id)
        }
    })
})

app.post("/elections/:id/nomination", function(req, res) {
    Nomination.create(req.body.nomination, function(err, newNomination) {
        if (err) {
            console.log(err);
        } else {
            Election.findById(req.params.id, function(err, currentElection) {
                if (err) {
                    console.log(err);
                } else {
                    currentElection.nominations.push(newNomination);
                    currentElection.numEntries++;
                    currentElection.save();
                    res.redirect("/elections/" + currentElection._id);
            }});
        }
    })
})

app.post("/elections/:id/ballot", function(req, res) {
    Election.findById(req.params.id, function(err, currentElection) {
        if (err) {
            console.log(err);
        } else {
            var ballot = new Ballot({
                ordering: {},
                voter: req.body.voter
            })
            for (var key in req.body) {
                if ((key != "voter") && (key)) {
                    ballot.ordering.set(key, req.body[key])
                }
            }
            console.log(ballot.ordering);
            Ballot.create(ballot, function(err, newBallot) {
                if (err) {
                    console.log(err);
                } else {
                    currentElection.ballots.push(newBallot);
                    currentElection.save();
                    res.redirect("/elections/" + currentElection._id);
                }
            })
        }
    })
})

app.get("/elections/:id/results", function(req, res) {
    Election.findById(req.params.id).populate("nominations").populate("ballots").exec(function(err, currentElection) {
        if (err) {
            console.log(err);
        } else {
            var electionResults = {}
            currentElection.nominations.forEach(function(nomination) {
                electionResults[nomination.name] = 0;
            })
            currentElection.ballots.forEach(function(ballot) {
                currentElection.nominations.forEach(function(nomination) {
                    electionResults[nomination.name] += ballot.ordering.get(nomination._id.toString());
                })
            })
            // console.log('electionResults');
            // console.log(electionResults);
            // Election.findByIdAndUpdate(req.params.id, {results: electionResults}, function(err, currentElection) {
            //     if (err) {
            //         console.log(err);
            //     } else {
            //         res.render("results", {election: currentElection});
            //     }
            // })
            res.render("results", {results: electionResults});
        }
    }
)})

app.listen(process.env.PORT, process.env.IP); // runs app on server with selected port and IP