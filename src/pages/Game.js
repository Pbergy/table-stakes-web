import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './Game.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3000';

const RANK_CHAR = { 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
const SUIT_CHAR = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SEATS = 9;

const SLOT_POS = [
  { left: '50%', top: '90%' },
  { left: '79%', top: '80%' },
  { left: '95%', top: '50%' },
  { left: '80%', top: '18%' },
  { left: '58%', top: '5%' },
  { left: '42%', top: '5%' },
  { left: '20%', top: '18%' },
  { left: '5%', top: '50%' },
  { left: '21%', top: '80%' }
];

function Game() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, token, logout } = useContext(AuthContext);
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [mySeat, setMySeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logPanel, setLogPanel] = useState(false);
  const [log, setLog] = useState([]);
  const wsRef = useRef(null);

  useEffect(() => {
    fetchRoom();
    const pollInterval = setInterval(fetchRoom, 2000);
    return () => clearInterval(pollInterval);
  }, [roomCode, token]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [room, user, token]);

  const fetchRoom = async () => {
    try {
      const roomRes = await axios.get(`${API_URL}/rooms/${roomCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoom(roomRes.data);

      const playersRes = await axios.get(`${API_URL}/players/room/${roomRes.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayers(playersRes.data);

      const myPlayer = playersRes.data.find(p => p.user_id === user?.id);
      setMySeat(myPlayer?.seat || null);

      const gameRes = await axios.get(`${API_URL}/game/rooms/${roomRes.data.id}/state`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGameState(gameRes.data);

      const logRes = await axios.get(`${API_URL}/game/rooms/${roomRes.data.id}/log`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLog(logRes.data);

      setLoading(false);
    } catch (err) {
      setError('Failed to load room');
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    if (!room || !user || !token) return;

    try {
      wsRef.current = new WebSocket(WS_URL);
      wsRef.current.onopen = () => {
        wsRef.current.send(JSON.stringify({
          type: 'join',
          userId: user.id,
          roomId: room.id
        }));
      };

      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'game_update') {
          setGameState(data.data);
        } else if (data.type === 'chat') {
          // Handle chat if needed
        }
      };
    } catch (err) {
      console.error('WebSocket error:', err);
    }
  };

  const handleJoinGame = async () => {
    try {
      await axios.post(
        `${API_URL}/rooms/${room.id}/join`,
        { seat: null },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRoom();
    } catch (err) {
      setError('Failed to join game');
    }
  };

  const handleLeaveGame = async () => {
    if (confirm('Leave the game?')) {
      try {
        await axios.post(
          `${API_URL}/rooms/${room.id}/leave`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        navigate('/');
      } catch (err) {
        setError('Failed to leave game');
      }
    }
  };

  const handleAction = async (type, amount = null) => {
    try {
      await axios.post(
        `${API_URL}/game/rooms/${room.id}/action`,
        { type, amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRoom();
    } catch (err) {
      setError('Action failed');
    }
  };

  if (loading) return <div className="game-loading">Loading room...</div>;
  if (error) return <div className="game-error">{error}</div>;
  if (!room) return <div className="game-error">Room not found</div>;

  const inGame = players.some(p => p.user_id === user.id);

  return (
    <div className="game-container">
      <div className="game-topbar">
        <div className="topbar-left">
          <h1>{room.name}</h1>
          <span className="stage-pill">{gameState?.stage || 'waiting'}</span>
        </div>
        <div className="topbar-right">
          <button className="icon-btn" onClick={() => setLogPanel(!logPanel)}>Log</button>
          <button className="icon-btn danger" onClick={handleLeaveGame}>Leave</button>
        </div>
      </div>

      <div className="game-main">
        <div className="table-wrap">
          <div className="felt">
            <div className="center-area">
              <div className="stage-label">Room Code: {room.room_code}</div>
              <div className="community">
                {gameState?.game_state?.community?.map((card, i) => (
                  <div key={i} className="playing-card">{card}</div>
                ))}
              </div>
              <div className="pot-line">
                Pot <span className="amt">{gameState?.game_state?.pot || 0}</span>
              </div>
            </div>

            {/* Seats */}
            {players.map((player, idx) => {
              const slot = SLOT_POS[idx];
              return (
                <div key={player.id} className="seat" style={slot}>
                  <div className={`seat-pod ${mySeat === player.seat ? 'me' : ''}`}>
                    <div className="seat-name">{player.username}</div>
                    <div className="seat-chips">{player.chips} chips</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Log Panel */}
        {logPanel && (
          <div className="side-panel open">
            <div className="side-panel-head">
              <h2>Hand Log</h2>
              <button className="close-x" onClick={() => setLogPanel(false)}>✕</button>
            </div>
            <div className="side-panel-body">
              {log.slice(0, 20).map((entry, i) => (
                <div key={i} className="log-entry">{entry.message}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Bar */}
      <div className="game-action-bar">
        {!inGame ? (
          <button className="btn-join-game" onClick={handleJoinGame}>
            Join Game
          </button>
        ) : (
          <div className="actions">
            <button className="act-fold" onClick={() => handleAction('fold')}>Fold</button>
            <button className="act-check" onClick={() => handleAction('check')}>Check</button>
            <button className="act-raise" onClick={() => handleAction('call')}>Call</button>
            <button className="act-raise" onClick={() => handleAction('raise', 100)}>Raise</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;
