import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Doctor {
  id: number;
  full_name: string;
  specialty_name: string;
}

interface Feedback {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
}

interface RatingInfo {
  total_reviews: number;
  average_rating: string | null;
}

const API_URL = 'https://clinic-feedback-backend.onrender.com/api';

// Функция для преобразования кракозябр в русские буквы
const fixCyrillic = (str: string): string => {
  if (!str) return str;
  try {
    return decodeURIComponent(escape(str));
  } catch (e) {
    return str;
  }
};

// Функция для рекурсивного исправления всех строк в объекте
const fixObjectStrings = <T,>(obj: T): T => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'string') return fixCyrillic(obj) as any;
  if (Array.isArray(obj)) return obj.map(item => fixObjectStrings(item)) as any;
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = fixObjectStrings(obj[key]);
      }
    }
    return result;
  }
  return obj;
};

const FeedbackForm: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | ''>('');
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [ratingInfo, setRatingInfo] = useState<RatingInfo | null>(null);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/doctors`);
        const fixedData = fixObjectStrings(response.data);
        console.log('Загружены врачи:', fixedData);
        setDoctors(fixedData);
        setError('');
      } catch (err) {
        console.error('Ошибка загрузки врачей:', err);
        setError('Не удалось загрузить список врачей. Убедитесь, что бэкенд запущен.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctorId) {
      const fetchFeedbacks = async () => {
        setLoadingFeedbacks(true);
        try {
          const feedbacksResponse = await axios.get(`${API_URL}/feedback/doctor/${selectedDoctorId}`);
          setFeedbacks(fixObjectStrings(feedbacksResponse.data));
          
          const ratingResponse = await axios.get(`${API_URL}/feedback/doctor/${selectedDoctorId}/rating`);
          setRatingInfo(fixObjectStrings(ratingResponse.data));
        } catch (err) {
          console.error('Ошибка загрузки отзывов:', err);
        } finally {
          setLoadingFeedbacks(false);
        }
      };
      fetchFeedbacks();
    } else {
      setFeedbacks([]);
      setRatingInfo(null);
    }
  }, [selectedDoctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDoctorId) {
      setError('Пожалуйста, выберите врача');
      return;
    }

    try {
      await axios.post(`${API_URL}/feedback`, {
        doctor_id: selectedDoctorId,
        rating,
        comment,
        is_anonymous: true,
      });
      setSubmitted(true);
      setError('');
    } catch (err) {
      console.error('Ошибка отправки отзыва:', err);
      setError('Не удалось отправить отзыв. Попробуйте позже.');
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (ratingValue: number) => {
    return '★'.repeat(ratingValue) + '☆'.repeat(5 - ratingValue);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Загрузка списка врачей...</h2>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Спасибо за ваш отзыв! ❤️</h2>
        <p>Ваше мнение помогает нам становиться лучше.</p>
        <button
          onClick={() => {
            setSubmitted(false);
            setSelectedDoctorId('');
            setRating(5);
            setComment('');
          }}
          style={{
            marginTop: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
        >
          Оставить ещё отзыв
        </button>
      </div>
    );
  }

  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Отзывы о врачах</h1>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', border: '1px solid red', borderRadius: '5px' }}>
          {error}
        </div>
      )}
      
      <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h2>Оставить отзыв</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Выберите врача:</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(Number(e.target.value))}
              style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              required
            >
              <option value="">-- Выберите врача --</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.full_name} ({doctor.specialty_name})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Оценка:</label>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <label key={star} style={{ marginRight: '15px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="rating"
                    value={star}
                    checked={rating === star}
                    onChange={() => setRating(star)}
                    style={{ marginRight: '5px' }}
                  />
                  {star} ★
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Комментарий (необязательно):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '8px', fontSize: '14px' }}
              placeholder="Расскажите о вашем опыте приёма..."
            />
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            Отправить отзыв
          </button>
        </form>
      </div>

      {selectedDoctorId && (
        <div>
          <h2>
            Отзывы о {selectedDoctor?.full_name} 
            {ratingInfo && ratingInfo.total_reviews > 0 && (
              <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>
                ⭐ {ratingInfo.average_rating || 'Нет оценок'} • {ratingInfo.total_reviews} {getDeclension(ratingInfo.total_reviews, 'отзыв', 'отзыва', 'отзывов')}
              </span>
            )}
          </h2>
          
          {loadingFeedbacks ? (
            <p>Загрузка отзывов...</p>
          ) : feedbacks.length === 0 ? (
            <p style={{ color: '#666', padding: '20px', textAlign: 'center', backgroundColor: '#f9f9f9', borderRadius: '10px' }}>
              Пока нет отзывов об этом враче. Будьте первым!
            </p>
          ) : (
            <div>
              {feedbacks.map((fb) => (
                <div key={fb.id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  marginBottom: '10px', 
                  borderRadius: '8px',
                  backgroundColor: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '18px' }}>
                      {renderStars(fb.rating)}
                    </span>
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {formatDate(fb.created_at)}
                    </span>
                  </div>
                  {fb.comment && <p style={{ margin: '10px 0', color: '#333' }}>{fb.comment}</p>}
                  <div style={{ color: '#888', fontSize: '12px', marginTop: '10px' }}>
                    Анонимно
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function getDeclension(count: number, one: string, two: string, five: string): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

export default FeedbackForm;