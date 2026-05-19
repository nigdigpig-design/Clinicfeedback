import { Router } from 'express';
import { pool } from '../db';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { convertObjectToUtf8 } from '../utils/encoding';

const router = Router();

router.use(verifyToken);

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
    
    // Перекодируем все строковые поля из WIN1251 в UTF-8
    const decodedRows = convertObjectToUtf8(result.rows);
    
    res.json(decodedRows);
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

import QRCode from 'qrcode';

// Добавьте этот маршрут после всех остальных, но до export default router
router.get('/generate-qr', async (req: AuthRequest, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'https://clinic-feedback-frontend.onrender.com';
    const qrCodeDataURL = await QRCode.toDataURL(frontendUrl);
    res.json({ qrCode: qrCodeDataURL });
  } catch (err) {
    console.error('Ошибка генерации QR-кода:', err);
    res.status(500).json({ error: 'Ошибка генерации QR-кода' });
  }
});
// Добавление новой специальности
router.post('/specialties', async (req: AuthRequest, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Название специальности не может быть пустым' });
    }
    const result = await pool.query(
      'INSERT INTO specialties (name, sort_order) VALUES ($1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM specialties)) RETURNING *',
      [name.trim()]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') {
      res.status(400).json({ error: 'Такая специальность уже существует' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Ошибка добавления специальности' });
    }
  }
});

// Добавление нового врача
router.post('/doctors', async (req: AuthRequest, res) => {
  try {
    const { full_name, specialty_id } = req.body;
    if (!full_name || full_name.trim() === '') {
      return res.status(400).json({ error: 'ФИО врача не может быть пустым' });
    }
    if (!specialty_id) {
      return res.status(400).json({ error: 'Необходимо выбрать специальность' });
    }
    const result = await pool.query(
      'INSERT INTO doctors (full_name, specialty_id, is_active) VALUES ($1, $2, true) RETURNING *',
      [full_name.trim(), specialty_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка добавления врача' });
  }
});

export default router;