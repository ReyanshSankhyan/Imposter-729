import { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { Game } from './components/Game';
import { useGame } from './store/useGame';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [lobbyId, setLobbyId] = useState<string | null>(() => localStorage.getItem('lobbyId'));
  const [playerId, setPlayerId] = useState<string | null>(() => localStorage.getItem('playerId'));

  useEffect(() => {
    if (lobbyId) localStorage.setItem('lobbyId', lobbyId);
    else localStorage.removeItem('lobbyId');
    
    if (playerId) localStorage.setItem('playerId', playerId);
    else localStorage.removeItem('playerId');
  }, [lobbyId, playerId]);

  const { lobby, loading } = useGame(lobbyId, playerId);

  if (loading && lobbyId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="animate-pulse text-zinc-400 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <AnimatePresence mode="wait">
        {!lobbyId || !lobby ? (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Home onJoin={(lId, pId) => {
              setLobbyId(lId);
              setPlayerId(pId);
            }} />
          </motion.div>
        ) : lobby.state === 'lobby' ? (
          <motion.div
            key="lobby"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <Lobby 
              lobby={lobby} 
              playerId={playerId!} 
              onLeave={() => {
                setLobbyId(null);
                setPlayerId(null);
              }} 
            />
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            <Game lobby={lobby} playerId={playerId!} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
