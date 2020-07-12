const express = require("express");
const app = express();
const db = require("./db");

const bodyParser = require("body-parser");

const port = 8080;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
const hb = require("express-handlebars");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    let first = req.body.first;
    let last = req.body.last;
    let signature = req.body.signature;
    // console.log("req.body.signature :", req.body.signature);

    if (!first || !last || !signature) {
        return res.render("petition", {
            layout: "main",
            err: "please fill out all the fields!",
        });
    }

    db.addData(first, last, signature)
        .then((results) => {
            // any code I write here will run after addData has run
            // console.log("results in addData :", results);
            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in POST /addData :", err);
            res.render("petition", {
                layout: "main",
                err: "something went wrong",
            });
        });
});

app.get("/thanks", (req, res) => {
    console.log("req.query :", req.query);

    db.getData()
        .then((results) => {
            let data = results.rows;
            res.render("thanks", {
                layout: "main",
                data,
            });
        })
        .catch((err) => {
            console.log("err in GET /getData :", err);
        });
});

app.get("/signers", (req, res) => {
    db.getData()
        .then((results) => {
            let data = results.rows;
            res.render("signers", {
                layout: "main",
                data,
            });
        })
        .catch((err) => {
            console.log("err in GET /getData :", err);
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
