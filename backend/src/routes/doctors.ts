import { Router } from 'express';
import { pool } from '../db';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const specialtyId = req.query.specialty;
    
    let query = `
      SELECT d.id, d.full_name, s.id as specialty_id, s.name as specialty_name
      FROM doctors d
      JOIN specialties s ON d.specialty_id = s.id
      WHERE d.is_active = true
    `;
    const params: any[] = [];
    
    if (specialtyId) {
      query += ` AND s.id = $1`;
      params.push(specialtyId);
    }
    
    query += ` ORDER BY s.sort_order, d.full_name`;
    
    const result = await pool.query(query, params);
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения списка врачей' });
  }
});

router.get('/specialties', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name FROM specialties ORDER BY sort_order, name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения специальностей' });
  }
});

export default router;