// Message.model.ts
export interface MessageOut {
  id: number;
  groupeId: number;
  userId: number;
  type: 'texte' | 'image' | 'video' | 'fichier';
  content: string;
  createdAt: string; // UTC string depuis l'API
  userEmail: string;
  userPseudo: string;
  userUrlImage: string;
  userIsAdmin: boolean;
}

export interface MessageIn {
  userId: number; // peut être optionnel si tu le prends depuis JWT
  type?: 'texte' | 'image' | 'video' | 'fichier';
  content: string;
}
