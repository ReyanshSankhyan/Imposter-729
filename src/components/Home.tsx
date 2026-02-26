import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createLobby, joinLobby } from '../store/useGame';
import { User, Users, Play, LogIn } from 'lucide-react';
import { cn } from '../utils/cn';

export const Home = ({ onJoin }: { onJoin: (lobbyId: string, playerId: string) => void }) => {
  const [name, setName] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    try {
      const { lobbyId, playerId } = await createLobby(name);
      onJoin(lobbyId, playerId);
    } catch (err) {
      setError('Failed to create lobby');
    }
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!lobbyCode.trim()) {
      setError('Please enter a lobby code');
      return;
    }
    try {
      const playerId = await joinLobby(lobbyCode.toUpperCase(), name);
      if (playerId) {
        onJoin(lobbyCode.toUpperCase(), playerId);
      } else {
        setError('Lobby not found');
      }
    } catch (err) {
      setError('Failed to join lobby');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-zinc-200/50 p-8 border border-zinc-100"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">Impostor</h1>
          <p className="text-zinc-500 font-medium">Find the fake among you.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Your Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-zinc-400" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                placeholder="Enter your name"
                maxLength={15}
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-sm text-red-500 font-medium"
            >
              {error}
            </motion.p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleCreate}
              className="flex items-center justify-center gap-2 w-full py-3.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Create Game
            </button>
            <button
              onClick={() => setIsJoining(!isJoining)}
              className={cn(
                "flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl font-medium transition-all border",
                isJoining 
                  ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                  : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
              )}
            >
              <LogIn className="w-4 h-4" />
              Join Game
            </button>
          </div>

          <AnimatePresence>
            {isJoining && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value.toUpperCase())}
                    className="block w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono font-medium uppercase tracking-widest"
                    placeholder="CODE"
                    maxLength={6}
                  />
                  <button
                    onClick={handleJoin}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors whitespace-nowrap"
                  >
                    Join
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
