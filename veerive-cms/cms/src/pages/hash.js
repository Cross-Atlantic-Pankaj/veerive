const bcrypt = require('bcryptjs');
bcrypt.hash('Password@123', 10, (err, hash) => {
  if (err) throw err;
});