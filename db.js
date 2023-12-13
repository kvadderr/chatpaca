const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pacany.db');

function createDB() {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, referral INTEGER, balance INTEGER, earned INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, userID INTEGER, path STRING)");
    db.run("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, userID INTEGER, orderID STRING)");
  });
}

function createOrder(orderID, userID) {
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO orders (userID, orderID) VALUES (?, ?)");
    stmt.run(userID, orderID);
    stmt.finalize();
  });
}

function getOrder(orderID) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM orders WHERE orderID = ?', orderID, (err, row) => {
      if (err) {
        console.error(err.message);
        return reject(err)
      }
      return resolve(row)
    });
  });
}

function createUser(user) {
  db.get("SELECT id FROM users WHERE id = ?", user.id, (err, existingUser) => {
    if (err) {
      console.error(err.message);
      return;
    }
    if (!existingUser) {
      db.serialize(() => {
        const stmt = db.prepare("INSERT INTO users (id, referral, balance, earned) VALUES (?, ?, ?, ?)");
        stmt.run(user.id, user.referral, 0, 0);
        stmt.finalize();
      });
    }
  });
}

function getUser(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM users WHERE id = ?', id, (err, row) => {
      if (err) {
        console.error(err.message);
        return reject(err)
      }
      return resolve(row)
    });
  });
}


function getReferralCount(id) {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(referral) AS referralCount FROM users WHERE referral = ? ', id, (err, row) => {
      if (err) {
        console.error(err.message);
        return reject(err);
      }
      return resolve(row)
    });
  });
}

function updateBalance(userId, amount) {
  const query = `UPDATE users SET balance = balance + ? WHERE id = ?`;
  db.run(query, [amount, userId], function (err) {
    if (err) {
      console.error('Error updating balance:', err.message);
    } else {
      console.log(`Balance updated successfully. Rows affected: ${this.changes}`);
    }
  });
}

function updateEarned(userId, amount) {
  const query = `UPDATE users SET earned = earned + ? WHERE id = ?`;
  db.run(query, [amount, userId], function (err) {
    if (err) {
      console.error('Error updating balance:', err.message);
    } else {
      console.log(`Balance updated successfully. Rows affected: ${this.changes}`);
    }
  });
}

function savePhoto(userID, path1, path2, path3) {
  db.serialize(() => {
    const stmt = db.prepare("INSERT INTO photos (userID, path) VALUES (?, ?)");
    stmt.run(userID, path1);
    stmt.run(userID, path2);
    stmt.run(userID, path3);
    stmt.finalize();
  });
}


function getPhotoPath(userID) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM photos WHERE userID = ? ORDER BY id DESC LIMIT 3', userID, (err, rows) => {
      if (err) {
        console.error(err.message);
        return reject(err);
      }
      return resolve(rows);
    });
  });
}


module.exports = {
  createDB,
  createUser,
  getUser,
  getReferralCount,
  savePhoto,
  getPhotoPath,
  updateBalance,
  createOrder,
  getOrder,
  updateEarned
}