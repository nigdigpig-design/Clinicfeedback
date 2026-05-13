import { Router } from 'express';
import { pool } from '../db';
import { verifyToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(verifyToken);

router.get('/feedbacks', async (req: AuthRequest, res) => {
  try {
    // ПРИНИМАЕМ ПАРАМЕТР rating (не min_rating)
    const { specialty_id, rating, start_date, end_date } = req.query;
    
    console.log('ПАРАМЕТРЫ:', { specialty_id, rating, start_date, end_date });
    
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
    
    // ТОЧНЫЙ ФИЛЬТР ПО ОЦЕНКЕ (используем rating, а не min_rating)
    if (rating !== undefined && rating !== '') {
      const ratingNum = parseInt(rating as string);
      console.log(`Фильтр по оценке: rating = ${ratingNum}`);
      query += ` AND f.rating = $${idx++}`;
      params.push(ratingNum);
    } else {
      console.log('Нет фильтра по оценке');
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
    
    console.log('SQL:', query);
    console.log('Params:', params);
    
    const result = await pool.query(query, params);
    console.log(`Найдено отзывов: ${result.rows.length}`);
    console.log('Оценки в результате:', result.rows.map(r => r.rating));
    
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения отзывов' });
  }
});

router.get('/specialties', async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`SELECT id, name FROM specialties ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения специальностей' });
  }
});

export default router;