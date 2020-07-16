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
                    req.session.userId = id;

                    res.redirect("/profile");
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

/////////////////////////
//////// PROFILE ////////
/////////////////////////

app.get("/profile", (req, res) => {
    res.render("profile", {
        layout: "main",
    });
});

app.post("/profile", function (req, res) {
    let age = req.body.age;
    let url = req.body.url;
    let cityLower = req.body.city.toLowerCase();

    if (
        url.startsWith("https://") ||
        url.startsWith("http://") ||
        url.startsWith("//")
    ) {
        // console.log("req.body :", req.body);
        // console.log("url :", url);
        let userId = req.session.userId;
        db.addProfile(age, cityLower, url, userId)
            .then((results) => {
                // console.log("results in add profile :", results);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in profile in POST", err);
                res.render("profile", {
                    layout: "main",
                    err: "something went wrong",
                });
            });
    } else {
        // check here later <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        url.prepend("http://");
        db.addProfile(age, cityLower, url)
            .then((results) => {
                console.log("results without http in add profile :", results);
                res.redirect("/petition");
            })
            .catch((err) => {
                console.log("error in profile in POST", err);
                res.render("profile", {
                    layout: "main",
                    err: "something went wrong",
                });
            });
    }
});

app.get('/profile/edit', (req, res) => {
    res.send('GET request to the homepage')
})

app.post('/profile/edit', function (req, res) {
    res.send('POST request to the homepage')
})

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

    db.getUserIdSigId(emailLogin)
        .then((result) => {
            let userId = result.rows[0].userid
            let signatureId = result.rows[0].signatureid
            let pw = result.row[0].password
            console.log('results in user id sig id:', result);

            req.session.userId = userId;
            req.session.signatureId = signatureId


            compare(passwordLogin, pw)
                .then((matchValue) => {
                    if (matchValue) {

                        res.redirect("/petition");
                    } else {
                        res.render("login", {
                            layout: "main",
                            err: "something went wrong",
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in compare in POST login:", err);
                });
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
    if (req.session.signed) {
        res.redirect('/signers')
    } else {
        res.render("petition", {
            layout: "main",
        });
    }
});

app.post("/petition", (req, res) => {
    let signature = req.body.signature;
    let userId = req.session.userId;
    console.log('userId :', userId);

    db.addSig(signature, userId)
        .then((results) => {
            let id = results.rows[0].id;
            req.session.sigSessionId = id;
            req.session.signed = true

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
//////// THANKS/SIGNATURE ////////
////////////////////////

app.get("/thanks", (req, res) => {
    db.getSig(req.session.userId)
        .then((results) => {
            let canvPicURL = results.rows[0].signature;
            let curSigId = req.session.sigSessionId;
            db.getNum().then((results) => {
                let signersNum = results.rows[0].count
                res.render("thanks", {
                    layout: "main",
                    signersNum,
                    canvPicURL,
                });
            })
        })
        .catch((err) => {
            console.log("err in GET /getSig :", err);
        });
});

app.post('/thanks/delete', function (req, res) {
    res.send('POST request to the homepage')
})

/////////////////////////
//////// signers ////////
////////////////////////

app.get("/signers", (req, res) => {
    db.getSigners()
        .then((results) => {
            let data = results.rows;
            console.log('data signers :', data);
            res.render("signers", {
                layout: "main",
                data,
                signers: true
            });
        })
        .catch((err) => {
            console.log("err in GET /get signers :", err);
        });
});

app.get("/signers/:city", (req, res) => {

    let city = req.params.city
    db.getSignersInCity(city).then((results) => {
        console.log('results in signers city:', results);

        let data = results.rows;
        res.render("signers", {
            layout: "main",
            data,
            cityTemplate: true


        })
    }).catch((err) => {
        console.log("err in GET /get city :", err);
    });
});

app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`));
