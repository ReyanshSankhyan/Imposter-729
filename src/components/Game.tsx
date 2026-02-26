import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LobbyData, startDiscussion, startVoting, castVote, revealResults, returnToLobby } from '../store/useGame';
import { Eye, EyeOff, MessageCircle, AlertCircle, Users, Crown, Play, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';

export const Game = ({ lobby, playerId }: { lobby: LobbyData, playerId: string }) => {
  const isHost = lobby.hostId === playerId;
  const player = lobby.players[playerId];
  const isSpectatingHost = lobby.mode === 'custom' && isHost;
  
  const playersList = Object.values(lobby.players).filter(p => lobby.mode === 'auto' || !p.isHost);

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto flex flex-col">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900 leading-tight">Game in Progress</h2>
            <p className="text-sm text-zinc-500 font-medium">
              {lobby.mode === 'auto' ? `Auto Mode (${lobby.category})` : 'Custom Mode'}
            </p>
          </div>
        </div>
        {isSpectatingHost && (
          <div className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm font-bold flex items-center gap-2 border border-amber-200/50">
            <Crown className="w-4 h-4" /> Game Master
          </div>
        )}
      </header>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {lobby.state === 'flashcards' && (
            <FlashcardsPhase key="flashcards" lobby={lobby} player={player} isSpectatingHost={isSpectatingHost} isHost={isHost} />
          )}
          {lobby.state === 'discussion' && (
            <DiscussionPhase key="discussion" lobby={lobby} isHost={isHost} playersList={playersList} />
          )}
          {lobby.state === 'voting' && (
            <VotingPhase key="voting" lobby={lobby} player={player} isSpectatingHost={isSpectatingHost} isHost={isHost} playersList={playersList} />
          )}
          {lobby.state === 'reveal' && (
            <RevealPhase key="reveal" lobby={lobby} isHost={isHost} playersList={playersList} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const FlashcardsPhase = ({ lobby, player, isSpectatingHost, isHost }: any) => {
  const [revealed, setRevealed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full"
    >
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-zinc-900 mb-2">Your Flashcard</h3>
        <p className="text-zinc-500 font-medium">
          {isSpectatingHost ? "You are the Game Master. Wait for players to view their cards." : "Tap to reveal your secret word. Keep it hidden!"}
        </p>
      </div>

      <div 
        className="relative w-full aspect-[3/4] perspective-1000 cursor-pointer group"
        onClick={() => setRevealed(!revealed)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d"
          animate={{ rotateY: revealed ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Front of card (Hidden) */}
          <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-zinc-100 flex flex-col items-center justify-center p-8">
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <EyeOff className="w-8 h-8" />
            </div>
            <p className="text-xl font-bold text-zinc-900">Tap to Reveal</p>
          </div>

          {/* Back of card (Revealed) */}
          <div className="absolute inset-0 backface-hidden bg-zinc-900 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 text-center" style={{ transform: 'rotateY(180deg)' }}>
            {isSpectatingHost ? (
              <>
                <p className="text-zinc-400 font-medium mb-2">The Word is</p>
                <h2 className="text-4xl font-bold text-white mb-6">{player.word}</h2>
                <p className="text-zinc-400 font-medium mb-2">Impostor Hint</p>
                <p className="text-xl font-medium text-white">{player.hint}</p>
              </>
            ) : player.isImpostor ? (
              <>
                <h2 className="text-4xl font-bold text-red-500 mb-6 uppercase tracking-widest">Impostor</h2>
                <p className="text-zinc-400 font-medium mb-2">Your Hint</p>
                <p className="text-xl font-medium text-white">{player.hint}</p>
              </>
            ) : (
              <>
                <p className="text-zinc-400 font-medium mb-2">The Word is</p>
                <h2 className="text-4xl font-bold text-white mb-6">{player.word}</h2>
                <p className="text-zinc-400 font-medium mb-2">Category</p>
                <p className="text-xl font-medium text-white">{lobby.mode === 'custom' ? 'Custom' : lobby.category}</p>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {isHost && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => startDiscussion(lobby.id)}
          className="mt-12 w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200"
        >
          <MessageCircle className="w-5 h-5" />
          Start Discussion
        </motion.button>
      )}
    </motion.div>
  );
};

const DiscussionPhase = ({ lobby, isHost, playersList }: any) => {
  const startingPlayer = playersList.find((p: any) => p.id === lobby.startingPlayerId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
    >
      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-8 rotate-12">
        <MessageCircle className="w-10 h-10" />
      </div>
      
      <h3 className="text-3xl font-bold text-zinc-900 mb-4 text-center">Discussion Time</h3>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 w-full text-center mb-12">
        <p className="text-zinc-500 font-medium mb-2">The player to start the discussion is...</p>
        <p className="text-3xl font-bold text-indigo-600">{startingPlayer?.name}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full mb-12">
        {playersList.map((p: any) => (
          <div key={p.id} className="bg-white p-3 rounded-xl border border-zinc-100 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-sm font-bold text-zinc-700">
              {p.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-sm font-medium text-zinc-900 truncate">{p.name}</p>
          </div>
        ))}
      </div>

      {isHost && (
        <button
          onClick={() => startVoting(lobby.id)}
          className="w-full max-w-md py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <AlertCircle className="w-5 h-5" />
          Begin Voting
        </button>
      )}
    </motion.div>
  );
};

const VotingPhase = ({ lobby, player, isSpectatingHost, isHost, playersList }: any) => {
  const hasVoted = !!player?.votedFor;
  const allVoted = playersList.every((p: any) => p.votedFor);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-10">
        <h3 className="text-3xl font-bold text-zinc-900 mb-2">Who is the Impostor?</h3>
        <p className="text-zinc-500 font-medium">
          {isSpectatingHost ? "Waiting for players to vote..." : hasVoted ? "Waiting for others to vote..." : "Cast your vote!"}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 w-full mb-12">
        {playersList.map((p: any) => {
          const isMe = p.id === player?.id;
          const isSelected = player?.votedFor === p.id;
          const hasThisPlayerVoted = !!p.votedFor;
          
          if (isSpectatingHost) {
            return (
              <div
                key={p.id}
                className={cn(
                  "p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                  hasThisPlayerVoted ? "border-emerald-200 bg-emerald-50" : "border-zinc-200 bg-white"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                    hasThisPlayerVoted ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-700"
                  )}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-lg text-zinc-900">{p.name}</p>
                    {hasThisPlayerVoted ? (
                      <p className="text-xs font-medium text-emerald-600">Voted</p>
                    ) : (
                      <p className="text-xs font-medium text-zinc-400">Waiting...</p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={p.id}
              disabled={hasVoted || isMe}
              onClick={() => castVote(lobby.id, player.id, p.id)}
              className={cn(
                "p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between",
                isSelected 
                  ? "border-indigo-600 bg-indigo-50" 
                  : isMe || hasVoted
                    ? "border-zinc-100 bg-zinc-50 opacity-50 cursor-not-allowed"
                    : "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  isSelected ? "bg-indigo-600 text-white" : "bg-zinc-200 text-zinc-700"
                )}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={cn("font-bold text-lg", isSelected ? "text-indigo-900" : "text-zinc-900")}>
                    {p.name} {isMe && "(You)"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {isHost && (
        <button
          onClick={() => revealResults(lobby.id)}
          disabled={!allVoted}
          className="w-full max-w-md py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="w-5 h-5" />
          Reveal Results
        </button>
      )}
    </motion.div>
  );
};

const RevealPhase = ({ lobby, isHost, playersList }: any) => {
  const eliminatedPlayer = playersList.find((p: any) => p.id === lobby.eliminatedPlayerId);
  const impostor = playersList.find((p: any) => p.id === lobby.impostorId);
  const isTie = lobby.eliminatedPlayerId === 'tie';
  
  const impostorWon = isTie || (eliminatedPlayer && eliminatedPlayer.id !== impostor?.id);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full"
    >
      <div className="text-center mb-12">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className={cn(
            "inline-flex items-center justify-center px-6 py-2 rounded-full text-sm font-bold mb-8 uppercase tracking-widest",
            impostorWon ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          )}
        >
          {impostorWon ? "Impostor Wins" : "Crew Wins"}
        </motion.div>
        
        <h3 className="text-4xl font-bold text-zinc-900 mb-4">
          {isTie ? "It was a tie!" : `${eliminatedPlayer?.name} was eliminated.`}
        </h3>
        
        <p className="text-xl text-zinc-500 font-medium">
          The Impostor was <span className="text-red-500 font-bold">{impostor?.name}</span>
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-100 w-full mb-12">
        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-6 text-center">Voting Results</h4>
        <div className="space-y-4">
          {playersList.map((p: any) => {
            const votesForThisPlayer = playersList.filter((voter: any) => voter.votedFor === p.id);
            if (votesForThisPlayer.length === 0) return null;
            
            return (
              <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                    p.id === impostor?.id ? "bg-red-500" : "bg-zinc-400"
                  )}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-zinc-900">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-500">
                    {votesForThisPlayer.length} {votesForThisPlayer.length === 1 ? 'vote' : 'votes'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isHost && (
        <button
          onClick={() => returnToLobby(lobby.id)}
          className="w-full max-w-md py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Play Again
        </button>
      )}
    </motion.div>
  );
};
