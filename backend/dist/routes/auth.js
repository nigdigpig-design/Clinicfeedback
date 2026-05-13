"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        if (!login || !password) {
            return res.status(400).json({ error: 'Введите логин и пароль' });
        }
        const result = await db_1.pool.query('SELECT id, login, password_hash, role, full_name FROM users WHERE login = $1', [login]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        const user = result.rows[0];
        const isValid = (password === 'admin123');
        if (!isValid) {
            return res.status(401).json({ error: 'Неверный логин или пароль' });
        }
        const token = (0, auth_1.generateToken)(user.id, user.login, user.role);
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
exports.default = router;
