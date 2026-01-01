import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../data/user.js';
import { FileDB } from '../db/filedb.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const TOKEN_EXPIRES_IN = '7d';

function createToken(user) {
  return jwt.sign({ sub: user._id, email: user.email }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN });
}

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      city, 
      state, 
      zipCode, 
      country, 
      dateOfBirth, 
      gender, 
      newsletter 
    } = req.body || {};
    
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    
    if (process.env.USE_FILE_DB === 'true') {
      const existing = FileDB.list('users').find(u => u.email?.toLowerCase() === String(email).toLowerCase());
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      
      const passwordHash = await bcrypt.hash(String(password), 10);
      const userData = {
        name: name || String(email).split('@')[0],
        email,
        passwordHash,
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || '',
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        newsletter: newsletter || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const user = FileDB.insert('users', userData);
      const token = createToken(user);
      return res.status(201).json({ 
        token, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country
        } 
      });
    } else {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'Email already in use' });
      
      const passwordHash = await bcrypt.hash(String(password), 10);
      const userData = {
        name: name || email.split('@')[0],
        email,
        passwordHash,
        phone: phone || '',
        address: address || '',
        city: city || '',
        state: state || '',
        zipCode: zipCode || '',
        country: country || '',
        dateOfBirth: dateOfBirth || '',
        gender: gender || '',
        newsletter: newsletter || false
      };
      
      const user = await User.create(userData);
      const token = createToken(user);
      return res.status(201).json({ 
        token, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country
        } 
      });
    }
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
    if (process.env.USE_FILE_DB === 'true') {
      const user = FileDB.list('users').find(u => u.email?.toLowerCase() === String(email).toLowerCase());
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(String(password), user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = createToken(user);
      return res.json({ 
        token, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          newsletter: user.newsletter
        } 
      });
    } else {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const ok = await bcrypt.compare(String(password), user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
      const token = createToken(user);
      return res.json({ 
        token, 
        user: { 
          _id: user._id, 
          name: user.name, 
          email: user.email,
          phone: user.phone,
          address: user.address,
          city: user.city,
          state: user.state,
          zipCode: user.zipCode,
          country: user.country,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          newsletter: user.newsletter
        } 
      });
    }
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Me (requires Authorization: Bearer <token>)
router.get('/me', async (req, res) => {
  try {
    const auth = req.headers.authorization || '';
    const [, token] = auth.split(' ');
    if (!token) return res.status(401).json({ error: 'Missing token' });
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (process.env.USE_FILE_DB === 'true') {
        const user = FileDB.getById('users', payload.sub);
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ 
          user: { 
            _id: user._id, 
            name: user.name, 
            email: user.email,
            phone: user.phone,
            address: user.address,
            city: user.city,
            state: user.state,
            zipCode: user.zipCode,
            country: user.country,
            dateOfBirth: user.dateOfBirth,
            gender: user.gender,
            newsletter: user.newsletter
          } 
        });
      } else {
        const user = await User.findById(payload.sub).select('_id name email phone address city state zipCode country dateOfBirth gender newsletter');
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ user });
      }
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;


