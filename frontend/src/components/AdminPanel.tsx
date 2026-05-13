import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AdminPanel: React.FC = () => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [filters, setFilters] = useState({ specialty_id: '', min_rating: '', start_date: '', end_date: '' });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadSpecialties = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/admin/specialties`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSpecialties(res.data);
    } catch (err) {
      console.error('Ошибка загрузки специальностей:', err);
    }
  }, [navigate]);

  const loadFeedbacks = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Формируем параметры с правильным именем "rating"
    const params: any = {};
    
    if (filters.specialty_id) {
      params.specialty_id = filters.specialty_id;
    }
    
    // Меняем название параметра с min_rating на rating
    if (filters.min_rating) {
      params.rating = filters.min_rating;
    }
    
    if (filters.start_date) {
      params.start_date = filters.start_date;
    }
    
    if (filters.end_date) {
      params.end_date = filters.end_date;
    }
    
    console.log('Отправляем параметры:', params);
    
    try {
      const res = await axios.get(`${API_URL}/admin/feedbacks`, { 
        params: params,
        headers: { Authorization: `Bearer ${token}` } 
      });
      console.log('Получено отзывов:', res.data.length);
      console.log('Оценки:', res.data.map((f: any) => f.rating));
      setFeedbacks(res.data);
    } catch (err: any) { 
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [filters, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      loadSpecialties();
      loadFeedbacks();
    }
  }, [loadSpecialties, loadFeedbacks, navigate]);

  const logout = () => { 
    localStorage.clear(); 
    navigate('/login'); 
  };

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Панель руководителя</h1>
        <button onClick={logout} style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}>
          Выйти
        </button>
      </div>

      <div style={{ background: '#f5f5f5', padding: 15, marginBottom: 20, borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Фильтры</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select 
            value={filters.specialty_id} 
            onChange={e => setFilters({ ...filters, specialty_id: e.target.value })}
            style={{ padding: 8, borderRadius: 5 }}
          >
            <option value="">Все специальности</option>
            {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          
          <select 
            value={filters.min_rating} 
            onChange={e => setFilters({ ...filters, min_rating: e.target.value })}
            style={{ padding: 8, borderRadius: 5 }}
          >
            <option value="">Любая оценка</option>
            <option value="5">5 ★</option>
            <option value="4">4 ★</option>
            <option value="3">3 ★</option>
            <option value="2">2 ★</option>
            <option value="1">1 ★</option>
          </select>
          
          <input 
            type="date" 
            value={filters.start_date} 
            onChange={e => setFilters({ ...filters, start_date: e.target.value })}
            style={{ padding: 8, borderRadius: 5 }}
            placeholder="С даты"
          />
          
          <input 
            type="date" 
            value={filters.end_date} 
            onChange={e => setFilters({ ...filters, end_date: e.target.value })}
            style={{ padding: 8, borderRadius: 5 }}
            placeholder="По дату"
          />
          
          <button 
            onClick={loadFeedbacks} 
            style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: 5, cursor: 'pointer' }}
          >
            Применить фильтры
          </button>
        </div>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : feedbacks.length === 0 ? (
        <p>Нет отзывов, соответствующих фильтрам</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Врач</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Специальность</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Оценка</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Комментарий</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {feedbacks.map(fb => (
                <tr key={fb.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: 12 }}>{fb.doctor_name}</td>
                  <td style={{ padding: 12 }}>{fb.specialty_name}</td>
                  <td style={{ padding: 12 }}>{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</td>
                  <td style={{ 
  padding: 12, 
  wordBreak: 'break-word',      // Перенос длинных слов
  whiteSpace: 'normal',         // Разрешаем перенос строк
  maxWidth: '300px'             // Ограничиваем максимальную ширину
}}>
  {fb.comment || '-'}
</td>
                  <td style={{ padding: 12 }}>{new Date(fb.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;