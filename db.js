const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pacany.db');

function createDB() {
  db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, referral INTEGER, balance INTEGER, earned INTEGER)");
    db.run("CREATE TABLE IF NOT EXISTS photos (id INTEGER PRIMARY KEY, userID INTEGER, path STRING)");
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

module.exports = {
  createDB,
  createUser,
  getUser,
  getReferralCount
}