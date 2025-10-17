import { MessageReactionOut } from "./MessageReaction.model";

// Message.model.ts
export interface MessageOut {
  id: number;
  groupeId: number;
  userId: number;
  type: 'texte' | 'image' | 'video' | 'fichier';
  content: string;
  createdAt: string; // UTC string depuis l'API
  parentId?: number | null;

  // Infos utilisateur
  userEmail: string;
  userPseudo: string;
  userUrlImage?: string | null;
  userIsAdmin: boolean;

  isRead: boolean;
  reactions: MessageReactionOut[];

  // Infos message parent
  parentGroupeId?: number | null;
  parentUserId?: number | null;
  parentType?: 'texte' | 'image' | 'video' | 'fichier' | null;
  parentContent?: string | null;
  parentCreatedAt?: string | null;

  parentUserEmail?: string | null;
  parentUserPseudo?: string | null;
  parentUserUrlImage?: string | null;
  parentUserIsAdmin?: boolean | null;
}

export interface MessageIn {
  userId: number; // optionnel si récupéré depuis JWT
  type?: 'texte' | 'image' | 'video' | 'fichier';
  content: string;
  parentId?: number | null;
}
