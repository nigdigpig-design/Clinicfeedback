import { Router } from 'express';
import { pool } from '../db';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

// GET /api/admin/feedbacks — получить все отзывы с фильтрацией
router.get('/feedbacks', async (req: AuthRequest, res) => {
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
    
    const params: any[] = [];
    let idx = 1;
    
    if (specialty_id && specialty_id !== '') {
      query += ` AND s.id = $${idx++}`;
      params.push(specialty_id);
    }
    
    if (rating && rating !== '') {
      const ratingNum = parseInt(rating as string);
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
    
    const result = await pool.query(query, params);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения отзывов' });
  }
});

// GET /api/admin/specialties — список специальностей для фильтра
router.get('/specialties', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name FROM specialties ORDER BY name
    `);
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения специальностей' });
  }
});

export default router;