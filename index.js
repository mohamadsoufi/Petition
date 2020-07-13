const express = require("express");
const app = express();
const port = 8080;
const db = require("./db");
var csurf = require("csurf");
const cookieSession = require("cookie-session");
app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

//after url code and cookies
//USE IS AS A MIDDLEWARE (next)

// app.use(csurf());

// app.use(function (req, res, next) {
//     res.setHeader("x-frame-options", "deny");
//     res.locals.csrfToken = req.csrfToken();
//     next();
// });
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
    // let id = req.body.id;
    // console.log("id in pet body:", id);
    // console.log("req.session.sigSession :", req.session);
    // console.log("req.session.sigSession is working in petition ...");

    // console.log("req.body.signature :", req.body.signature);

    if (!first || !last || !signature) {
        return res.render("petition", {
            layout: "main",
            err: "please fill out all the fields!",
        });
    }
    req.session.sigSession = signature;
    req.session.firstSession = first;

    db.addData(first, last, signature)
        .then((results) => {
            // any code I write here will run after addData has run
            // console.log("results in addData :", results);
            // console.log("results.id :", results.id);
            let id = results.rows[0].id;
            req.session.sigSession = id;
            req.session.firstSession = id;
            // console.log("results :", results.rows[0].id);
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
    db.getData()
        .then((results) => {
            console.log("results :", results);
            let canvPicURL;
            let curFirst;
            results.rows.forEach((e) => {
                let id = e.id;

                if (req.session.firstSession === id && req.session.sigSession) {
                    canvPicURL = e.signature;
                    curFirst = e.first;
                    console.log("canvPicURL>>>>>>>:", canvPicURL);
                    // console.log("curFirst>>>> :", curFirst);
                }
            });

            console.log("req.session.firstSession in  gettttt :", req.session);
            // console.log("req.session in thanks getDA:", req.session.sigSession);
            let data = results.rows;
            res.render("thanks", {
                layout: "main",
                data,
                canvPicURL,
                curFirst,
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
