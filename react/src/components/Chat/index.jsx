import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getCurrentMember, logoutUser } from '../../api/auth';
import { getMessages, sendMessage } from '../../api/messages';
import { getOnlineMembers } from '../../api/members';
import './styles.css';

const Chat = () => {
  const [currentMember, setCurrentMember] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadCurrentMember = async () => {
    try {
      const data = await getCurrentMember();
      setCurrentMember(data);
    } catch (err) {
      console.error('Failed to load current member:', err);
      setError('Ошибка загрузки данных пользователя');
    }
  };

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const loadOnlineMembers = async () => {
    try {
      const data = await getOnlineMembers();
      setOnlineMembers(data);
    } catch (err) {
      console.error('Failed to load online members:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    const initializeChat = async () => {
      await loadCurrentMember();
      await loadMessages();
      await loadOnlineMembers();
      setLoading(false);
    };

    initializeChat();

    const interval = setInterval(() => {
      loadOnlineMembers();
      loadMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('authToken');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      await sendMessage(messageText);
      setMessageText('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Ошибка отправки сообщения');
      setTimeout(() => setError(''), 3000);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="chat-loading" data-easytag="id3-react/src/components/Chat/index.jsx">
        <div className="loading-spinner"></div>
        <p>Загрузка чата...</p>
      </div>
    );
  }

  return (
    <div className="chat-container" data-easytag="id3-react/src/components/Chat/index.jsx">
      <header className="chat-header">
        <div className="header-left">
          <h1 className="chat-title">Групповой чат</h1>
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? '✕' : '☰'} Онлайн ({onlineMembers.length})
          </button>
        </div>
        <div className="header-right">
          <Link to="/profile" className="profile-link">Профиль</Link>
          <button onClick={handleLogout} className="logout-button">
            Выйти
          </button>
        </div>
      </header>

      <div className="chat-content">
        <aside className={`online-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <h2 className="sidebar-title">Онлайн ({onlineMembers.length})</h2>
          <div className="online-members-list">
            {onlineMembers.map((member) => (
              <div key={member.id} className="online-member">
                <span className="online-indicator"></span>
                <span className="member-username">{member.username}</span>
              </div>
            ))}
          </div>
        </aside>

        <main className="chat-main">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>Сообщений пока нет. Начните общение!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isCurrentUser = currentMember && message.sender_id === currentMember.id;
                return (
                  <div
                    key={message.id}
                    className={`message ${isCurrentUser ? 'message-own' : 'message-other'}`}
                  >
                    <div className="message-header">
                      <span className="message-sender">{message.sender_username}</span>
                      <span className="message-time">{formatTime(message.created_at)}</span>
                    </div>
                    <div className="message-text">{message.text}</div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSendMessage} className="message-form">
            <input
              type="text"
              className="message-input"
              placeholder="Введите сообщение..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              maxLength={1000}
            />
            <button type="submit" className="send-button" disabled={!messageText.trim()}>
              Отправить
            </button>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;