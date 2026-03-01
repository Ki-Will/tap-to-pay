const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class UserService {
  static async createUser(username, password, role = 'user') {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashed, role });
    return await user.save();
  }

  static async authenticateUser(username, password) {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    return user;
  }

  static generateToken(user) {
    return jwt.sign({ id: user._id, role: user.role }, 'secret', { expiresIn: '1h' });
  }
}

module.exports = UserService;
