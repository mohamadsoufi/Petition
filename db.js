const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/caper-petition");

module.exports.addSig = (signature, userId) => {
    let q =
        "INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id";

    let params = [signature, userId];
    return db.query(q, params);
};

module.exports.getSig = function () {
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

module.exports.getUserHash = function () {
    let q = "SELECT * FROM users";
    return db.query(q);
};
