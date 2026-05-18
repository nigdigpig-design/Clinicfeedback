"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectToUtf8 = exports.win1251ToUtf8 = void 0;
const iconv_lite_1 = __importDefault(require("iconv-lite"));
// Функция для перекодирования строки из WIN1251 в UTF-8
const win1251ToUtf8 = (str) => {
    if (!str)
        return str || '';
    // Преобразуем строку из Windows-1251 в UTF-8
    const buffer = Buffer.from(str, 'binary');
    return iconv_lite_1.default.decode(buffer, 'win1251');
};
exports.win1251ToUtf8 = win1251ToUtf8;
// Функция для рекурсивного перекодирования всех строк в объекте
const convertObjectToUtf8 = (obj) => {
    if (obj === null || obj === undefined)
        return obj;
    if (typeof obj === 'string') {
        return (0, exports.win1251ToUtf8)(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => (0, exports.convertObjectToUtf8)(item));
    }
    if (typeof obj === 'object') {
        const result = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                result[key] = (0, exports.convertObjectToUtf8)(obj[key]);
            }
        }
        return result;
    }
    return obj;
};
exports.convertObjectToUtf8 = convertObjectToUtf8;
