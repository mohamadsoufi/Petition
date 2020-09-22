const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const hb = require("express-handlebars");
const db = require("./db");
let csurf = require("csurf");
const {
    requireLoggedOutUser,
    requireLoggedInUser,
    requireSignature,
    requireNoSignature,

} = require("./middleware");
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

app.use(csurf());

module.exports = { app }
app.use(function (req, res, next) {
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});
// app.use(bodyParser.json());

app.engine("handlebars", hb());
app.set("view engine", "handlebars");
//////// ROUTES ////////

////////////////////////
//////// REGISTER ////////
////////////////////////
app.get("/", (req, res) => {
    res.redirect("/petition/cause");
});

app.get("/register", requireLoggedOutUser, (req, res) => {
    res.render("registration", {
        layout: "main",
    });
});

app.post("/register", requireLoggedOutUser, requireNoSignature, (req, res) => {
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
                    let id = results.rows[0].id;
                    req.session.userId = id;

                    res.redirect("/profile");
                })
                .catch((err) => {
                    console.log("err in POST /addUser :", err);
                    res.redirect('/register')
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

app.post("/profile", requireLoggedInUser, function (req, res) {
    let age = req.body.age;
    let url = req.body.url;
    let cityLower = req.body.city.toLowerCase();
    if (!age && !url && !cityLower) {
        res.redirect("/petition/cause")
    }
    if (
        url.startsWith("https://") ||
        url.startsWith("http://") ||
        url.startsWith("//") ||
        !url
    ) {
        let userId = req.session.userId;
        db.addProfile(age, cityLower, url, userId)
            .then((results) => {
                res.redirect("/petition/cause");
            })
            .catch((err) => {
                console.log("error in profile in POST", err);
                // redirect('/petition/cause')
            });
    } else {
        // check here later <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
        if (url) {

            url.prepend("http://");
            db.addProfile(age, cityLower, url, userId)
                .then((results) => {
                    // console.log("results without http in add profile :", results);
                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("error in profile in POST prepend", err);
                    res.render("profile", {
                        layout: "main",
                        err: "something went wrong",
                    });
                });
        }
    }
});

/////////////////////////
//////// EDIT ////////
/////////////////////////

app.get('/profile/edit', requireLoggedInUser, (req, res) => {

    db.getProfileData(req.session.userId).then((results) => {
        let first = results.rows[0].first
        let last = results.rows[0].last
        let age = results.rows[0].age
        let city = results.rows[0].city
        let url = results.rows[0].url
        let email = results.rows[0].email
        res.render("editprofile", {
            layout: "main",
            first,
            last,
            age,
            city,
            url,
            email
        })

    })
})

app.post('/profile/edit', requireLoggedInUser, function (req, res) {

    let userId = req.session.userId
    let first = req.body.userFirstName
    let last = req.body.userLastName
    let age = req.body.age
    let city = req.body.city
    let url = req.body.url
    let email = req.body.emailRegister
    let password = req.body.passwordRegister
    if (password) {
        hash(password).then((hashedPw) => {
            db.updatePw(hashedPw, userId).then(() => {
            }).catch((err) => {
                console.log('err in updatePw :', err);
            })
        }).catch((err) => {
            console.log('err in hash :', err);
        })
    }

    Promise.all([
        db.updateUsers(first, last, email, userId), db.updateProfile(age, city, url, userId)

    ]).then((results) => {

        res.render('editprofile', {
            layout: 'main',
            done: 'Done!'
        }
        )
    }).catch((err) => {
        console.log('err in Promise.all :', err);
    })

})

///////////////////////
//////// LOGIN ////////
///////////////////////

app.get("/login", requireLoggedOutUser, (req, res) => {

    res.render("login", {
        layout: "main",
    });
});

app.post("/login", requireLoggedOutUser, (req, res) => {
    let passwordLogin = req.body.passwordLogin;
    let emailLogin = req.body.emailLogin;

    db.getUserIdSigId(emailLogin)
        .then((result) => {
            let userId = result.rows[0].userid
            let signatureId = result.rows[0].signatureid
            let pw = result.rows[0].password

            req.session.userId = userId;
            req.session.signatureId = signatureId

            compare(passwordLogin, pw)
                .then((matchValue) => {
                    if (matchValue) {
                        requireSignature
                        res.redirect("/thanks")

                    } else {
                        res.render("login", {
                            layout: "main",
                            err: "something went wrong, please try again!",
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in compare in POST login:", err);
                });
        })
        .catch((err) => {
            console.log("error in hash in POST login", err);
            res.render("login", {
                layout: "main",
                err: "something went wrong",
            });
        });
});

//////////////////////////
//////// petition ////////
/////////////////////////

app.get("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    res.render("petition", {
        layout: "main",
        petition: true
    });
});


app.post("/petition", requireLoggedInUser, requireNoSignature, (req, res) => {
    let signature = req.body.signature;
    let userId = req.session.userId;
    if (!signature) {
        res.redirect('./petition/cause')
        console.log('signature :', signature);
    } else {

        db.addSig(signature, userId)
            .then((results) => {

                let id = results.rows[0].id;
                req.session.signatureId = id;
                req.session.signed = true
                //come back here later!

                res.redirect("/thanks");

            })
            .catch((err) => {
                console.log("er`r in POST /addSig :", err);
                res.render("petition", {
                    layout: "main",
                    err: "something went wrong",
                });
            });
    }

});

app.get('/petition/cause', (req, res) => {
    if (req.session.userId) {
        db.getProfileData(req.session.userId).then((results) => {
            let first = results.rows[0].first
            res.render('petitioncause', {
                layout: 'main',
                first
            })
        })
    } else {
        res.render('petitioncause', {
            layout: 'main',
        })
    }
})

////////////////////////////////////
//////// THANKS/SIGNATURE /////////
//////////////////////////////////

app.get("/thanks", requireLoggedInUser, requireSignature, (req, res) => {
    let first
    db.getProfileData(req.session.userId).then((results) => {

        first = results.rows[0].first
    }).catch((err) => {
        console.log("err in GET /get profile data in thanks :", err);
    });
    db.getSig(req.session.userId)
        .then((results) => {
            let canvPicURL = results.rows[0].signature;
            db.getNum().then((results) => {
                let signersNum = results.rows[0].count
                res.render("thanks", {
                    layout: "main",
                    signersNum,
                    canvPicURL,
                    first

                });
            })
        })
        .catch((err) => {
            console.log("err in GET /getSig :", err);
        });
});

app.post('/thanks/delete', requireLoggedInUser, requireSignature, function (req, res) {
    db.deleteSig(req.session.userId).then(() => {
        req.session.signatureId = null
        res.redirect('/petition')
    })

    // res.send('POST request to delete')

})

/////////////////////////
//////// signers ////////
////////////////////////

app.get("/signers", requireLoggedInUser, (req, res) => {
    let first
    let data
    db.getProfileData(req.session.userId).then((result) => {
        first = result.rows[0].first
        db.getSigners()
            .then((results) => {
                data = results.rows;
                res.render("signers", {
                    layout: "main",
                    data,
                    first,
                    signersView: true
                });
            }).catch((err) => {
                console.log("err in GET /get signers :", err);

            });

    }).catch((err) => {
        console.log("err in GET /get profile data in signers :", err);
    });


});

app.get("/signers/:city", requireLoggedInUser, (req, res) => {

    let city = req.params.city
    db.getProfileData(req.session.userId).then((results) => {

        first = results.rows[0].first
        db.getSignersInCity(city).then((results) => {
            let data = results.rows;
            res.render("signers", {
                layout: "main",
                data,
                first,
            })
        })
    }).catch((err) => {
        console.log("err in GET /get city :", err);
    });
});

app.get('/logout', requireLoggedInUser, function (req, res) {
    req.session = null;

    res.redirect('login')
})
if (require.main === module) {

    app.listen(process.env.PORT || port, () => console.log(`Example app listening on port ${port}!`));
}
