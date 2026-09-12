import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Home() {
  const { user, token, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mode, setMode] = useState('browse'); // browse or create
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
    } catch (err) {
      setError('Failed to fetch rooms');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name required');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/rooms`,
        {
          name: roomName,
          maxPlayers: 9,
          settings: { bigBlind: 20, smallBlind: 10, startingChips: 2000 }
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate(`/room/${response.data.room_code}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = (code) => {
    navigate(`/room/${code}`);
  };

  return (
    <div className="home">
      <div className="home-header">
        <div className="header-left">
          <h1>♠ Table Stakes</h1>
          <p>Welcome, {user?.username}</p>
        </div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </div>

      <div className="home-content">
        <div className="tabs">
          <button
            className={`tab ${mode === 'browse' ? 'active' : ''}`}
            onClick={() => setMode('browse')}
          >
            Browse Rooms
          </button>
          <button
            className={`tab ${mode === 'create' ? 'active' : ''}`}
            onClick={() => setMode('create')}
          >
            Create Room
          </button>
        </div>

        {mode === 'browse' && (
          <div className="rooms-container">
            <div className="section-title">Available Rooms</div>
            {rooms.length === 0 ? (
              <div className="empty-state">
                <p>No rooms available. Create one!</p>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map((room) => (
                  <div key={room.id} className="room-card">
                    <h3>{room.name}</h3>
                    <p className="room-code">Code: {room.room_code}</p>
                    <p className="room-players">{room.player_count || 0} / {room.max_players} players</p>
                    <button
                      className="btn-join"
                      onClick={() => handleJoinRoom(room.room_code)}
                    >
                      Join Room
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mode === 'create' && (
          <div className="create-room-container">
            <form onSubmit={handleCreateRoom}>
              <label>Room Name</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g., Friday Night Game"
                maxLength="100"
              />
              <button type="submit" className="btn-create" disabled={loading}>
                {loading ? 'Creating...' : 'Create Room'}
              </button>
            </form>
            {error && <div className="error-msg">{error}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
