import { useEffect, useState } from 'react';
import { ref, onValue, set, update, remove, get } from 'firebase/database';
import { db } from '../firebase';
import { Category, getRandomWord } from '../utils/words';

export type GameState = 'lobby' | 'flashcards' | 'discussion' | 'voting' | 'reveal';

export type Player = {
  id: string;
  name: string;
  isHost: boolean;
  isImpostor?: boolean;
  word?: string;
  hint?: string;
  votedFor?: string;
  eliminated?: boolean;
};

export type LobbyData = {
  id: string;
  hostId: string;
  state: GameState;
  mode: 'auto' | 'custom';
  category?: Category;
  customWord?: string;
  customHint?: string;
  players: Record<string, Player>;
  startingPlayerId?: string;
  eliminatedPlayerId?: string;
  impostorId?: string;
};

export const useGame = (lobbyId: string | null, playerId: string | null) => {
  const [lobby, setLobby] = useState<LobbyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lobbyId) {
      setLobby(null);
      setLoading(false);
      return;
    }

    const lobbyRef = ref(db, `lobbies/${lobbyId}`);
    const unsubscribe = onValue(lobbyRef, (snapshot) => {
      if (snapshot.exists()) {
        setLobby(snapshot.val());
      } else {
        setLobby(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [lobbyId]);

  // Handle player disconnect
  useEffect(() => {
    if (!lobbyId || !playerId || !lobby) return;

    const handleBeforeUnload = async () => {
      await leaveLobby(lobbyId, playerId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [lobbyId, playerId, lobby]);

  return { lobby, loading };
};

export const createLobby = async (hostName: string): Promise<{ lobbyId: string, playerId: string }> => {
  const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
  const playerId = crypto.randomUUID();

  const newLobby: LobbyData = {
    id: lobbyId,
    hostId: playerId,
    state: 'lobby',
    mode: 'auto',
    category: 'Animals',
    players: {
      [playerId]: {
        id: playerId,
        name: hostName,
        isHost: true,
      }
    }
  };

  await set(ref(db, `lobbies/${lobbyId}`), newLobby);
  return { lobbyId, playerId };
};

export const joinLobby = async (lobbyId: string, playerName: string): Promise<string | null> => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  
  if (!snapshot.exists()) {
    return null;
  }

  const playerId = crypto.randomUUID();
  await update(ref(db, `lobbies/${lobbyId}/players/${playerId}`), {
    id: playerId,
    name: playerName,
    isHost: false,
  });

  return playerId;
};

export const leaveLobby = async (lobbyId: string, playerId: string) => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  
  if (!snapshot.exists()) return;
  
  const lobby = snapshot.val() as LobbyData;
  const players = lobby.players || {};
  
  if (Object.keys(players).length <= 1) {
    // Last player leaving, delete lobby
    await remove(lobbyRef);
    return;
  }

  if (lobby.hostId === playerId) {
    // Host is leaving, assign new host
    const remainingPlayerIds = Object.keys(players).filter(id => id !== playerId);
    const newHostId = remainingPlayerIds[0];
    
    const updates: any = {};
    updates[`players/${playerId}`] = null;
    updates[`hostId`] = newHostId;
    updates[`players/${newHostId}/isHost`] = true;
    
    await update(lobbyRef, updates);
  } else {
    // Normal player leaving
    await remove(ref(db, `lobbies/${lobbyId}/players/${playerId}`));
  }
};

export const updateLobbyMode = async (lobbyId: string, mode: 'auto' | 'custom', category?: Category) => {
  const updates: any = { mode };
  if (category) updates.category = category;
  await update(ref(db, `lobbies/${lobbyId}`), updates);
};

export const updateCustomWord = async (lobbyId: string, word: string, hint: string) => {
  await update(ref(db, `lobbies/${lobbyId}`), {
    customWord: word,
    customHint: hint
  });
};

export const startGame = async (lobbyId: string) => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  if (!snapshot.exists()) return;
  
  const lobby = snapshot.val() as LobbyData;
  const players = Object.values(lobby.players);
  
  let playingPlayers = players;
  if (lobby.mode === 'custom') {
    playingPlayers = players.filter(p => !p.isHost);
  }

  if (playingPlayers.length < 3) {
    alert("Need at least 3 players to start!");
    return;
  }

  const impostorIndex = Math.floor(Math.random() * playingPlayers.length);
  const impostorId = playingPlayers[impostorIndex].id;

  let word = "", hint = "";
  if (lobby.mode === 'auto' && lobby.category) {
    const randomItem = getRandomWord(lobby.category);
    word = randomItem.word;
    hint = randomItem.hint;
  } else if (lobby.mode === 'custom') {
    word = lobby.customWord || "Secret";
    hint = lobby.customHint || "A secret word";
  }

  const updates: any = {
    state: 'flashcards',
    impostorId: impostorId,
    startingPlayerId: null,
    eliminatedPlayerId: null,
  };

  players.forEach(p => {
    updates[`players/${p.id}/votedFor`] = null;
    updates[`players/${p.id}/eliminated`] = false;
    
    if (lobby.mode === 'custom' && p.isHost) {
      updates[`players/${p.id}/word`] = word;
      updates[`players/${p.id}/hint`] = hint;
      updates[`players/${p.id}/isImpostor`] = false;
    } else {
      const isImpostor = p.id === impostorId;
      updates[`players/${p.id}/isImpostor`] = isImpostor;
      updates[`players/${p.id}/word`] = isImpostor ? "Impostor" : word;
      updates[`players/${p.id}/hint`] = isImpostor ? "Try to blend in!" : hint;
    }
  });

  await update(lobbyRef, updates);
};

export const startDiscussion = async (lobbyId: string) => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  if (!snapshot.exists()) return;
  
  const lobby = snapshot.val() as LobbyData;
  const players = Object.values(lobby.players);
  
  let playingPlayers = players;
  if (lobby.mode === 'custom') {
    playingPlayers = players.filter(p => !p.isHost);
  }

  const startingPlayerIndex = Math.floor(Math.random() * playingPlayers.length);
  const startingPlayerId = playingPlayers[startingPlayerIndex].id;

  await update(lobbyRef, {
    state: 'discussion',
    startingPlayerId
  });
};

export const startVoting = async (lobbyId: string) => {
  await update(ref(db, `lobbies/${lobbyId}`), {
    state: 'voting'
  });
};

export const castVote = async (lobbyId: string, voterId: string, targetId: string) => {
  await update(ref(db, `lobbies/${lobbyId}/players/${voterId}`), {
    votedFor: targetId
  });
};

export const revealResults = async (lobbyId: string) => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  if (!snapshot.exists()) return;
  
  const lobby = snapshot.val() as LobbyData;
  const players = Object.values(lobby.players);
  
  const voteCounts: Record<string, number> = {};
  players.forEach(p => {
    if (p.votedFor) {
      voteCounts[p.votedFor] = (voteCounts[p.votedFor] || 0) + 1;
    }
  });

  let maxVotes = 0;
  let eliminatedPlayerId = null;
  let tie = false;

  for (const [id, count] of Object.entries(voteCounts)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminatedPlayerId = id;
      tie = false;
    } else if (count === maxVotes) {
      tie = true;
    }
  }

  const updates: any = {
    state: 'reveal',
  };

  if (!tie && eliminatedPlayerId) {
    updates.eliminatedPlayerId = eliminatedPlayerId;
    updates[`players/${eliminatedPlayerId}/eliminated`] = true;
  } else {
    updates.eliminatedPlayerId = 'tie';
  }

  await update(lobbyRef, updates);
};

export const returnToLobby = async (lobbyId: string) => {
  const lobbyRef = ref(db, `lobbies/${lobbyId}`);
  const snapshot = await get(lobbyRef);
  if (!snapshot.exists()) return;
  
  const lobby = snapshot.val() as LobbyData;
  const updates: any = {
    state: 'lobby',
    impostorId: null,
    startingPlayerId: null,
    eliminatedPlayerId: null,
  };

  Object.keys(lobby.players).forEach(id => {
    updates[`players/${id}/isImpostor`] = null;
    updates[`players/${id}/word`] = null;
    updates[`players/${id}/hint`] = null;
    updates[`players/${id}/votedFor`] = null;
    updates[`players/${id}/eliminated`] = false;
  });

  await update(lobbyRef, updates);
};
