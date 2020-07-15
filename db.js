const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/caper-petition");

module.exports.addSig = (signature, userId) => {
    let q =
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id";

    let params = [signature, userId];
    return db.query(q, params);
};

module.exports.getSig = function (id) {
    //q for query
    let q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.addUser = (first, last, email, password) => {
    let q =
        "INSERT INTO users (first, last, email, password) VALUES ($1, $2, $3, $4) RETURNING id";

    let params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.getUserIdSigId = function (emailLogin) {
    let q =
        "SELECT users.password AS password, users.id AS userId, signatures.id AS signatureId FROM users LEFT JOIN signatures ON users.id = signatures.user_id WHERE users.email = $1";

    let params = [emailLogin];
    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, userId) => {
    let q =
        "INSERT INTO user_profiles (age, city, url, user_id) VALUES ($1, $2, $3, $4) RETURNING id";

    let params = [+age || null, city, url, userId];
    return db.query(q, params);
};


module.exports.getSigners = function () {
    let q =
        "SELECT first, last, age, city, url FROM users LEFT JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id";
    return db.query(q);
};

module.exports.getSignersInCity = function (city) {
    let q =
        "SELECT first, last, age, city, url FROM users LEFT JOIN signatures ON users.id = signatures.user_id LEFT JOIN user_profiles ON users.id = user_profiles.user_id WHERE city = $1";
    let params = [city]
    return db.query(q, params);
};


