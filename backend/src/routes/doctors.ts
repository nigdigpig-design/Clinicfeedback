import { Router } from 'express';
import { pool } from '../db';

const router = Router();

// GET /api/doctors — получить всех врачей
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.id, d.full_name, s.name as specialty_name
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.is_active = true
      ORDER BY s.sort_order, d.full_name
    `);
    
    // Устанавливаем кодировку UTF-8 перед отправкой
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения списка врачей' });
  }
});

// GET /api/doctors/specialties — получить все специальности
router.get('/specialties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name FROM specialties ORDER BY sort_order, name
    `);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения специальностей' });
  }
});

export default router;