const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const db = require("./db");
let csurf = require("csurf");
const { hash, compare } = require("./bc");

const cookieSession = require("cookie-session");

app.use(
    cookieSession({
        secret: `I'm always angry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

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

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

//////// ROUTES ////////

////////////////////////
//////// REGISTER ////////
////////////////////////

app.get("/", (req, res) => {
    res.redirect("/register");
});

app.get("/register", (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", (req, res) => {
    const userFirstName = req.body.userFirstName;
    const userLastName = req.body.userLastName;
    const emailRegister = req.body.emailRegister;
    const passwordRegister = req.body.passwordRegister;

    if (
        !userFirstName ||
        !userLastName ||
        !emailRegister ||
        !passwordRegister
    ) {
        return res.render("registration", {
            layout: "main",
            err: "please fill out all the fields!",
        });
    }

    hash(passwordRegister)
        .then((hashedPw) => {
            db.addUser(userFirstName, userLastName, emailRegister, hashedPw)
                .then((results) => {
                    // console.log("results in addUser :", results);
                    // console.log("results.id :", results.id);
                    let id = results.rows[0].id;
                    req.session.userRegId = id;

                    console.log("session  :", req.session);
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("err in POST /addUser :", err);
                    res.render("registration", {
                        layout: "main",
                        err: "something went wrong",
                    });
                });
        })
        .catch((err) => {
            console.log("error in hash in POST register", err);
            res.render("registration", {
                layout: "main",
                err: "something went wrong",
            });
        });
});

///////////////////////
//////// LOGIN ////////
///////////////////////

app.get("/login", (req, res) => {
    res.render("login", {
        layout: "main",
    });
});

app.post("/login", (req, res) => {
    let passwordLogin = req.body.passwordLogin;
    let emailLogin = req.body.emailLogin;
    let dbEmail;
    let dbHashedPass;
    let dbUserId;
    db.getUserHash(emailLogin)
        .then((results) => {
            results.rows.forEach((e) => {
                dbEmail = e.email;
                dbHashedPass = e.password;
                dbUserId = e.id;
            });
            if (dbEmail === emailLogin) {
                console.log("dbUserId :", dbUserId);
                compare(passwordLogin, dbHashedPass)
                    .then((matchValue) => {
                        req.session.dbUserId = dbUserId;
                        res.redirect("/petition");
                    })
                    .catch((err) => {
                        console.log("error in compare in POST login:", err);
                        res.render("login", {
                            layout: "main",
                            err: "something went wrong",
                        });
                    });
            }
        })
        .catch((err) => {
            console.log("error in hash in POST register", err);
            res.render("login", {
                layout: "main",
                err: "something went wrong",
            });
        });
});

//////////////////////////
//////// petition ////////
/////////////////////////

app.get("/petition", (req, res) => {
    res.render("petition", {
        layout: "main",
    });
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    let userRegId = req.session.userRegId;
    let dbUserId = req.session.dbUserId;
    // console.log("req.session.sigSession :", req.session);
    db.addSig(signature, userRegId)
        .then((results) => {
            console.log("results in addSig :", results);

            let id = results.rows[0].id;
            req.session.sigSession = id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("err in POST /addSig :", err);
            res.render("petition", {
                layout: "main",
                err: "something went wrong",
            });
        });
});

////////////////////////
//////// THANKS ////////
////////////////////////

app.get("/thanks", (req, res) => {
    db.getSig()
        .then((results) => {
            let canvPicURL;
            results.rows.forEach((e) => {
                let sigId = e.id;
                console.log("sigId in the loop >>>>>>>>>>>>:", sigId);
                console.log("req.session.sigSession :", req.session.sigSession);
                if (req.session.sigSession === sigId) {
                    canvPicURL = e.signature;
                }
            });
            let curSigId = req.session.id;
            console.log("req.session in  gettttt :", req.session.id); // id 21
            // console.log("req.session in thanks getDA:", req.session.sigSession);
            let data = results.rows[0];
            console.log("data in getSig!????:", data);
            res.render("thanks", {
                layout: "main",
                data,
                canvPicURL,
            });
        })
        .catch((err) => {
            console.log("err in GET /getSig :", err);
        });
});

/////////////////////////
//////// signers ////////
////////////////////////

app.get("/signers", (req, res) => {
    db.getSig()
        .then((results) => {
            let data = results.rows;
            res.render("signers", {
                layout: "main",
                data,
            });
        })
        .catch((err) => {
            console.log("err in GET /getSig :", err);
        });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
