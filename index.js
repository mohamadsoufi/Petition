const express = require("express");
const app = express();
const db = require("./db");
// const canvas = require("./public/canvas");
const port = 8080;

app.use(express.static("public"));

const hb = require("express-handlebars");
const { runCLI } = require("jest");
app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.get("/petition", (req, res) => {
    // console.log("req.query.first in get:", req.query.first);

    res.render("petition", {
        layout: "main",
        // canvas,
    });
});

app.get("/get-data", (req, res) => {
    let first = req.query.first;
    let last = req.query.last;
    let signature = req.query.signature;
    // console.log("dataURL server :", dataURL);
    console.log("first in get/data:", first);
    console.log("last in get/data:", last);
    console.log("signature in get/data:", signature);
    db.getData(first, last, signature)
        .then((results) => {
            //results = data
            // look for 'rows'

            console.log("results :", results);
        })
        .catch((err) => {
            console.log("err in GET /getData :", err);
        });
});

app.post("/add-data", (req, res) => {
    let first = req.query.first;
    let last = req.query.last;
    let signature = req.query.signature;
    console.log("req.query in post:", req.query);
    db.addData(first, last, signature)
        .then((results) => {
            // any code I write here will run after addData has run
            console.log("tesults in addData :", results);
        })
        .catch((err) => {
            console.log("err in POST /addData :", err);
        });
    res.redirect("/thanks");
});

app.get("/thanks", (req, res) => {
    console.log("req.query.first in thanks:");

    console.log("<h1>thanks</h1>");
    res.send("<h1>thanks</h1>");
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
