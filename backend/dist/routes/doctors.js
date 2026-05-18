"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const encoding_1 = require("../utils/encoding");
const router = (0, express_1.Router)();
router.get('/', async (req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT d.id, d.full_name, s.name as specialty_name
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.is_active = true
      ORDER BY s.sort_order, d.full_name
    `);
        // Перекодируем результат из WIN1251 в UTF-8
        const decodedRows = (0, encoding_1.convertObjectToUtf8)(result.rows);
        res.json(decodedRows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения списка врачей' });
    }
});
// GET /api/doctors/specialties — получить все специальности
router.get('/specialties', async (req, res) => {
    try {
        const result = await db_1.pool.query(`
      SELECT id, name FROM specialties ORDER BY sort_order, name
    `);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения специальностей' });
    }
});
exports.default = router;
