import { useState } from 'react';
import { motion } from 'motion/react';
import { LobbyData, updateLobbyMode, updateCustomWord, startGame, leaveLobby } from '../store/useGame';
import { CATEGORIES, Category } from '../utils/words';
import { Users, Copy, Check, LogOut, Settings2, Play, Crown } from 'lucide-react';
import { cn } from '../utils/cn';

export const Lobby = ({ lobby, playerId, onLeave }: { lobby: LobbyData, playerId: string, onLeave: () => void }) => {
  const [copied, setCopied] = useState(false);
  const isHost = lobby.hostId === playerId;
  const playersList = Object.values(lobby.players || {});
  
  const [customWord, setCustomWord] = useState(lobby.customWord || '');
  const [customHint, setCustomHint] = useState(lobby.customHint || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(lobby.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    if (lobby.mode === 'custom' && (!customWord || !customHint)) {
      alert("Please enter a custom word and hint");
      return;
    }
    if (lobby.mode === 'custom') {
      updateCustomWord(lobby.id, customWord, customHint);
    }
    startGame(lobby.id);
  };

  const handleLeave = async () => {
    await leaveLobby(lobby.id, playerId);
    onLeave();
  };

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 leading-tight">Lobby</h2>
            <div className="flex items-center gap-2 text-sm font-mono text-zinc-500">
              Code: <span className="text-zinc-900 font-bold tracking-widest">{lobby.id}</span>
              <button onClick={handleCopy} className="hover:text-indigo-600 transition-colors">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </header>

      <div className="grid md:grid-cols-[1fr_300px] gap-6 flex-1">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
            <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-400" />
              Players ({playersList.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {playersList.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={cn(
                    "p-3 rounded-xl flex items-center gap-3 border transition-colors",
                    p.id === playerId ? "bg-indigo-50 border-indigo-100" : "bg-zinc-50 border-zinc-100"
                  )}
                >
                  <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-sm font-bold text-zinc-700">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {p.name} {p.id === playerId && "(You)"}
                    </p>
                    {p.isHost && (
                      <p className="text-xs text-amber-600 font-medium flex items-center gap-1">
                        <Crown className="w-3 h-3" /> Host
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {isHost && (
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100">
              <h3 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-zinc-400" />
                Game Settings
              </h3>
              
              <div className="flex gap-2 p-1 bg-zinc-100 rounded-xl mb-6">
                <button
                  onClick={() => updateLobbyMode(lobby.id, 'auto', lobby.category)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                    lobby.mode === 'auto' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  Auto-Assign
                </button>
                <button
                  onClick={() => updateLobbyMode(lobby.id, 'custom')}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg transition-all",
                    lobby.mode === 'custom' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  Custom Word
                </button>
              </div>

              {lobby.mode === 'auto' ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-700">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.keys(CATEGORIES) as Category[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => updateLobbyMode(lobby.id, 'auto', cat)}
                        className={cn(
                          "py-3 px-4 rounded-xl text-sm font-medium border transition-all text-left",
                          lobby.category === cat 
                            ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                            : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm font-medium border border-amber-200/50">
                    In Custom mode, you (the host) will sit out and act as the game master.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Secret Word</label>
                    <input
                      type="text"
                      value={customWord}
                      onChange={(e) => setCustomWord(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. Eiffel Tower"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Hint for Impostor</label>
                    <input
                      type="text"
                      value={customHint}
                      onChange={(e) => setCustomHint(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      placeholder="e.g. A famous landmark in Europe"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {isHost ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col justify-between sticky top-6 h-fit">
            <div>
              <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready?</h3>
              <p className="text-zinc-500 text-sm mb-6">
                Make sure everyone is here. {lobby.mode === 'custom' ? "You will sit out." : "You will play."}
              </p>
            </div>
            <button
              onClick={handleStart}
              disabled={(playersList.length < 3 && lobby.mode === 'auto') || (lobby.mode === 'custom' && playersList.length < 4)}
              className="w-full py-4 bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className="w-5 h-5" />
              Start Game
            </button>
            {((playersList.length < 3 && lobby.mode === 'auto') || (lobby.mode === 'custom' && playersList.length < 4)) && (
              <p className="text-center text-xs text-red-500 mt-3 font-medium">
                Need at least {lobby.mode === 'custom' ? '4' : '3'} players
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-zinc-100 flex flex-col items-center justify-center min-h-[200px] sticky top-6 h-fit">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-zinc-500 font-medium">Waiting for host to start...</p>
              <p className="text-sm text-zinc-400">
                Mode: <span className="font-semibold text-zinc-600">{lobby.mode === 'auto' ? `Auto (${lobby.category})` : 'Custom'}</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
