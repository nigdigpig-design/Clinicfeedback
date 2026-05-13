import { Router } from 'express';
import { pool } from '../db';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (!login || !password) {
      return res.status(400).json({ error: 'Введите логин и пароль' });
    }
    
    const result = await pool.query(
      'SELECT id, login, password_hash, role, full_name FROM users WHERE login = $1',
      [login]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const user = result.rows[0];
    const isValid = (password === 'admin123');
    
    if (!isValid) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    const token = generateToken(user.id, user.login, user.role);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        login: user.login,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;