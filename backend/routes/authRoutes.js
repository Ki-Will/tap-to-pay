const express = require('express');
const UserService = require('../services/userService');

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  try {
    await UserService.createUser(username, password, role || 'user');
    res.json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ error: 'User exists or error' });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserService.authenticateUser(username, password);
    const token = UserService.generateToken(user);
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

module.exports = router;
