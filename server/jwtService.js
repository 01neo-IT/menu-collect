// jwtService.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

class JwtService {
  constructor() {
    this.secret = process.env.JWT_SECRET;
    this.expiresIn = process.env.JWT_EXPIRES;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token) {
    return jwt.verify(token, this.secret);
  }
}

module.exports = JwtService;
