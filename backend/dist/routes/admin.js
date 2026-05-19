"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const encoding_1 = require("../utils/encoding");
const router = (0, express_1.Router)();
router.use(auth_1.verifyToken);
router.get('/feedbacks', async (req, res) => {
    try {
        const { specialty_id, rating, start_date, end_date } = req.query;
        let query = `
      SELECT 
        f.id, f.rating, f.comment, f.created_at,
        d.full_name as doctor_name,
        s.name as specialty_name
      FROM feedbacks f
      JOIN doctors d ON f.doctor_id = d.id
      JOIN specialties s ON d.specialty_id = s.id
      WHERE 1=1
    `;
        const params = [];
        let idx = 1;
        if (specialty_id && specialty_id !== '') {
            query += ` AND s.id = $${idx++}`;
            params.push(specialty_id);
        }
        if (rating && rating !== '') {
            const ratingNum = parseInt(rating);
            query += ` AND f.rating = $${idx++}`;
            params.push(ratingNum);
        }
        if (start_date && start_date !== '') {
            query += ` AND f.created_at::date >= $${idx++}`;
            params.push(start_date);
        }
        if (end_date && end_date !== '') {
            query += ` AND f.created_at::date <= $${idx++}`;
            params.push(end_date);
        }
        query += ` ORDER BY f.created_at DESC`;
        const result = await db_1.pool.query(query, params);
        // Перекодируем все строковые поля из WIN1251 в UTF-8
        const decodedRows = (0, encoding_1.convertObjectToUtf8)(result.rows);
        res.json(decodedRows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения отзывов' });
    }
});
// GET /api/admin/specialties — список специальностей для фильтра
router.get('/specialties', async (req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT id, name FROM specialties ORDER BY name
    `);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения специальностей' });
    }
});
const qrcode_1 = __importDefault(require("qrcode"));
// Добавьте этот маршрут после всех остальных, но до export default router
router.get('/generate-qr', async (req, res) => {
    try {
        const frontendUrl = process.env.FRONTEND_URL || 'https://clinic-feedback-frontend.onrender.com';
        const qrCodeDataURL = await qrcode_1.default.toDataURL(frontendUrl);
        res.json({ qrCode: qrCodeDataURL });
    }
    catch (err) {
        console.error('Ошибка генерации QR-кода:', err);
        res.status(500).json({ error: 'Ошибка генерации QR-кода' });
    }
});
// Добавление новой специальности
router.post('/specialties', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Название специальности не может быть пустым' });
        }
        const result = await db_1.pool.query('INSERT INTO specialties (name, sort_order) VALUES ($1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM specialties)) RETURNING *', [name.trim()]);
        res.json(result.rows[0]);
    }
    catch (err) {
        if (err.code === '23505') {
            res.status(400).json({ error: 'Такая специальность уже существует' });
        }
        else {
            console.error(err);
            res.status(500).json({ error: 'Ошибка добавления специальности' });
        }
    }
});
// Добавление нового врача
router.post('/doctors', async (req, res) => {
    try {
        const { full_name, specialty_id } = req.body;
        if (!full_name || full_name.trim() === '') {
            return res.status(400).json({ error: 'ФИО врача не может быть пустым' });
        }
        if (!specialty_id) {
            return res.status(400).json({ error: 'Необходимо выбрать специальность' });
        }
        const result = await db_1.pool.query('INSERT INTO doctors (full_name, specialty_id, is_active) VALUES ($1, $2, true) RETURNING *', [full_name.trim(), specialty_id]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка добавления врача' });
    }
});
exports.default = router;
