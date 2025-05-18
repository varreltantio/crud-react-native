const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');

// Register
router.post('/register', upload, async (req, res) => {
    const { name, email, password } = req.body;
    const photo = req.file ? req.file.filename : null;

    // Validasi input kosong
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Nama, email, dan password wajib diisi' });
    }

    // Validasi wajib upload foto
    if (!photo) {
        return res.status(400).json({ message: 'Foto wajib diunggah' });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
    }

    // Validasi panjang minimal password
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }

    try {
        const [existingUser] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
        return res.status(400).json({ message: 'Email sudah terdaftar' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.promise().query(
            'INSERT INTO users (name, email, password, photo) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, photo]
        );

        res.json({ message: 'Pendaftaran berhasil' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validasi input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email dan password wajib diisi' });
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Format email tidak valid' });
  }

  try {
    const [users] = await db.promise().query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) return res.status(400).json({ message: 'Email tidak ditemukan' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Password salah' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// Ambil data user (protected)
router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const [users] = await db.promise().query('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
  
      res.json(users[0]);
    } catch (err) {
      res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});
  
// Update profil user (protected)
router.put('/profile', authenticateToken, upload, async (req, res) => {
    const { name, email, password } = req.body;
    const photo = req.file?.filename;

     // Validasi email wajib diisi
    if (!email || email.trim() === '') {
        return res.status(400).json({ message: 'Email tidak boleh kosong' });
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Format email tidak valid' });
    }

     // Validasi name wajib diisi
    if (!name || name.trim() === '') {
        return res.status(400).json({ message: 'Nama tidak boleh kosong' });
    }

    // Validasi password jika diisi
    if (password && password.length < 6) {
        return res.status(400).json({ message: 'Password minimal 6 karakter' });
    }
  
    try {
        // Cek apakah user ada
        const [users] = await db.promise().query('SELECT * FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });

        // Optional: Cek apakah email sudah digunakan user lain
        const [existingEmail] = await db.promise().query(
            'SELECT id FROM users WHERE email = ? AND id != ?',
            [email, req.user.id]
        );

        if (existingEmail.length > 0) {
            return res.status(400).json({ message: 'Email sudah digunakan oleh user lain' });
        }

        let query = 'UPDATE users SET email = ?, name = ?';
        let params = [email, name];
    
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = ?';
            params.push(hashedPassword);
        }

        if (photo) {
            query += ', photo = ?';
            params.push(photo);
        }
    
        query += ' WHERE id = ?';
        params.push(req.user.id);
    
        await db.promise().query(query, params);
    
        res.json({ message: 'Profil berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
