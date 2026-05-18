import iconv from 'iconv-lite';

// Функция для перекодирования строки из WIN1251 в UTF-8
export const win1251ToUtf8 = (str: string | null | undefined): string => {
  if (!str) return str || '';
  // Преобразуем строку из Windows-1251 в UTF-8
  const buffer = Buffer.from(str, 'binary');
  return iconv.decode(buffer, 'win1251');
};

// Функция для рекурсивного перекодирования всех строк в объекте
export const convertObjectToUtf8 = <T>(obj: T): T => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return win1251ToUtf8(obj) as any;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertObjectToUtf8(item)) as any;
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertObjectToUtf8(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
};