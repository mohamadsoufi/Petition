const spicedPg = require("spiced-pg");
const db = spicedPg(process.env.DATABASE_URL || "postgres:postgres:postgres@localhost:5432/caper-petition");

module.exports.addSig = (signature, userId) => {
    let q =
        `INSERT INTO signatures (signature, user_id)
         VALUES ($1, $2)
          RETURNING id`;

    let params = [signature, userId];
    return db.query(q, params);
};

module.exports.getSig = function (id) {
    //q for query
    let q = `SELECT signature FROM signatures 
    WHERE signatures.user_id = $1`;
    return db.query(q, [id]);
};

module.exports.getNum = function () {
    //q for query
    let q = "SELECT COUNT(*) FROM signatures ";
    return db.query(q);
};

module.exports.addUser = (first, last, email, password) => {
    let q =
        `INSERT INTO users (first, last, email, password)
         VALUES ($1, $2, $3, $4) 
         RETURNING id`;

    let params = [first, last, email, password];
    return db.query(q, params);
};

module.exports.getUserIdSigId = function (emailLogin) {
    let q =
        `SELECT users.password AS password,
        users.id AS userId,
        signatures.user_id AS signatureId
        FROM users 
        LEFT JOIN signatures 
        ON users.id = signatures.user_id 
        WHERE users.email = $1`;

    let params = [emailLogin];
    return db.query(q, params);
};

module.exports.addProfile = (age, city, url, userId) => {
    let q =
        `INSERT INTO user_profiles (age, city, url, user_id) 
         VALUES ($1, $2, $3, $4)`;

    let params = [+age || null, city, url, userId];
    return db.query(q, params);
};


module.exports.getProfileData = function (userId) {
    let q = `SELECT first, last, age, city, url ,email
             FROM users
             LEFT JOIN user_profiles
             ON users.id = user_profiles.user_id
             WHERE users.id = $1`;
    let params = [userId]
    return db.query(q, params)

}

module.exports.updateProfile = function (age, city, url, userId) {
    let q = `INSERT INTO user_profiles (age, city, url, user_id )
             VALUES($1, $2, $3, $4)
             ON CONFLICT(user_id)
             DO UPDATE SET age = $1, city = $2, url = $3`;
    let params = [+age || null, city, url, userId]
    return db.query(q, params)
}

module.exports.updateUsers = function (first, last, email, userId) {
    let q = `UPDATE users 
            SET first =$1, last =$2, email = $3
             WHERE id = $4 `;
    let params = [first, last, email, userId]
    return db.query(q, params)
}

module.exports.updatePw = function (hashedPw, userId) {
    let q = `UPDATE users 
            SET password =$1
             WHERE id = $2 `;
    let params = [hashedPw, userId]
    return db.query(q, params)
}

module.exports.getSigners = function () {
    let q =
        `SELECT first, last, age, city, url
        FROM users 
        JOIN signatures 
        ON users.id = signatures.user_id 
        JOIN user_profiles 
        ON users.id = user_profiles.user_id`;
    return db.query(q);
};

module.exports.getSignersInCity = function (city) {
    let q =
        `SELECT first, last, age, city, url 
        FROM users 
        LEFT JOIN signatures 
        ON users.id = signatures.user_id 
        LEFT JOIN user_profiles 
        ON users.id = user_profiles.user_id 
        WHERE city = $1`;
    let params = [city]
    return db.query(q, params);
};

module.exports.deleteSig = function (sigId) {
    let q = `DELETE FROM signatures 
             WHERE signatures.user_id = $1 `;
    let params = [sigId]
    return db.query(q, params)
}
