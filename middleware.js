exports.requireLoggedOutUser = function requireLoggedOutUser(req, res, next) {
    // if logged in
    if (req.session.userId) {
        res.redirect('/petition')
    } else {
        next()
    }
}

exports.requireLoggedInUser = function requireLoggedInUser(req, res, next) {
    // if logged out
    if (!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

exports.requireSignature = function requireSignature(req, res, next) {
    // if has not signed
    if (!req.session.signatureId) {
        res.redirect('/petition')
    } else {
        next()
    }
}

exports.requireNoSignature = function requireNoSignature(req, res, next) {
    // has the user signed the petition?
    if (req.session.signatureId) {
        res.redirect("/thanks");
    } else {
        next();
    }
};