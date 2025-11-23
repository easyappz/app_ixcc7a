import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentMember } from '../../api/members';
import './styles.css';

const Profile = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    loadProfile();
  }, [navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCurrentMember();
      setMember(data);
    } catch (err) {
      setError('Ошибка загрузки профиля');
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  const handleBackToChat = () => {
    navigate('/chat');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="profile-container" data-easytag="id4-react/src/components/Profile/index.jsx">
        <div className="profile-card">
          <div className="loading-spinner">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container" data-easytag="id4-react/src/components/Profile/index.jsx">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {member?.username?.charAt(0).toUpperCase() || 'П'}
          </div>
          <h1 className="profile-title">Профиль пользователя</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {member && (
          <div className="profile-info">
            <div className="info-card">
              <div className="info-label">Имя пользователя</div>
              <div className="info-value">{member.username}</div>
            </div>

            <div className="info-card">
              <div className="info-label">Дата регистрации</div>
              <div className="info-value">{formatDate(member.created_at)}</div>
            </div>

            <div className="info-card">
              <div className="info-label">Статус</div>
              <div className="status-badge">
                <span className={`status-indicator ${member.is_online ? 'online' : 'offline'}`}></span>
                <span className="status-text">
                  {member.is_online ? 'В сети' : 'Не в сети'}
                </span>
              </div>
            </div>

            {member.last_activity && (
              <div className="info-card">
                <div className="info-label">Последняя активность</div>
                <div className="info-value">{formatDate(member.last_activity)}</div>
              </div>
            )}
          </div>
        )}

        <div className="profile-actions">
          <button 
            onClick={handleBackToChat} 
            className="action-button back-button"
          >
            <span className="button-icon">💬</span>
            Вернуться в чат
          </button>

          <button 
            onClick={handleLogout} 
            className="action-button logout-button"
          >
            <span className="button-icon">🚪</span>
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
