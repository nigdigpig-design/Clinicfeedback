"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const encoding_1 = require("../utils/encoding");
const router = (0, express_1.Router)();
// GET /api/feedback/doctor/:doctorId — получить отзывы о враче
router.get('/doctor/:doctorId', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const result = await db_1.pool.query(`SELECT 
        f.id, f.rating, f.comment, f.created_at,
        CASE 
          WHEN f.is_anonymous = true THEN 'Анонимно'
          ELSE 'Пациент'
        END as author_name
      FROM feedbacks f
      WHERE f.doctor_id = $1
      ORDER BY f.created_at DESC
      LIMIT 20`, [doctorId]);
        // Перекодируем результат
        const decodedRows = (0, encoding_1.convertObjectToUtf8)(result.rows);
        res.json(decodedRows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения отзывов' });
    }
});
// GET /api/feedback/doctor/:doctorId/rating — средний рейтинг врача
router.get('/doctor/:doctorId/rating', async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        const result = await db_1.pool.query(`SELECT 
        COUNT(*) as total_reviews,
        ROUND(AVG(rating)::numeric, 1) as average_rating
      FROM feedbacks
      WHERE doctor_id = $1`, [doctorId]);
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка получения рейтинга' });
    }
});
exports.default = router;
