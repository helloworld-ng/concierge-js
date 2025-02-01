const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/concierge.js", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "src", "concierge.js"));
});

app.listen(4000, () => console.log("Server ready on port 4000."));

module.exports = app;