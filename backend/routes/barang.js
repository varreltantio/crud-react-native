const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/upload');
const db = require('../db'); 
const fs = require('fs');
const path = require('path');

// CREATE
router.post('/', authenticateToken, upload, async (req, res) => {
    const { name, description, condition } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!name || !condition || !photo) {
        return res.status(400).json({ message: 'Nama, kondisi, dan foto wajib diisi' });
    }

    try {
        await db.promise().query(
            'INSERT INTO barang (name, description, `condition`, photo) VALUES (?, ?, ?, ?)',
            [name, description, condition, photo]
        );
        res.json({ message: 'Barang berhasil ditambahkan' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// READ ALL
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM barang');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// READ BY ID
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// UPDATE
router.put('/:id', authenticateToken, upload, async (req, res) => {
    const { name, description, condition } = req.body;
    const photo = req.file ? req.file.filename : null;

    try {
        const [rows] = await db.promise().query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });

        const oldPhoto = rows[0].photo;

        // Hapus foto lama jika ada foto baru
        if (photo && oldPhoto) {
            const oldPhotoPath = path.join(__dirname, '../uploads', oldPhoto);
            if (fs.existsSync(oldPhotoPath)) {
                fs.unlinkSync(oldPhotoPath);
            }
        }

        const updatedPhoto = photo || oldPhoto;

        await db.promise().query(
            'UPDATE barang SET name = ?, description = ?, `condition` = ?, photo = ? WHERE id = ?',
            [name || rows[0].name, description || rows[0].description, condition || rows[0].condition, updatedPhoto, req.params.id]
        );
        res.json({ message: 'Barang berhasil diperbarui' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

// DELETE
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.promise().query('SELECT * FROM barang WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Barang tidak ditemukan' });

        const photo = rows[0].photo;
        if (photo) {
            const photoPath = path.join(__dirname, '../uploads', photo);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }

        await db.promise().query('DELETE FROM barang WHERE id = ?', [req.params.id]);
        res.json({ message: 'Barang berhasil dihapus' });
    } catch (err) {
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
});

module.exports = router;
