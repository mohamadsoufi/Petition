const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/caper-petition");

module.exports.getData = function () {
    //q for query
    // let q = "SELECT * FROM signatures ";
    // let params = [first, last, signature];
    // return db.query(q, params);
    let q = "SELECT * FROM signatures";
    return db.query(q);
};

module.exports.addData = (first, last, signature) => {
    let q =
        "INSERT INTO signatures (first, last, signature) VALUES ($1, $2, $3)";

    let params = [first, last, signature];
    return db.query(q, params);
};

module.exports.getLastPerson = function () {
    let q =
        "SELECT TIMESTAMP, first FROM signatures ORDER BY TIMESTAMP DESC LIMIT 1";
    return db.query(q);
};
