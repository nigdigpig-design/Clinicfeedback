"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const doctors_1 = __importDefault(require("./routes/doctors"));
const feedback_1 = __importDefault(require("./routes/feedback"));
const auth_1 = __importDefault(require("./routes/auth"));
const admin_1 = __importDefault(require("./routes/admin"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/doctors', doctors_1.default);
app.use('/api/feedback', feedback_1.default);
app.use('/api/auth', auth_1.default);
app.use('/api/admin', admin_1.default);
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Сервер работает' });
});
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
});
