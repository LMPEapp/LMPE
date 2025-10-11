export interface MessageReactionIn {
  messageId: number;   // Id du message concerné
  userId: number;      // Id de l'utilisateur qui réagit
  emoji: string;       // Emoji (ex: "👍", "❤️")
}

export interface MessageReactionOut {
  id: number;             // Id de la réaction
  messageId: number;      // Id du message
  userId: number;         // Id de l'utilisateur
  emoji: string;          // Emoji
  createdAt: string;      // UTC string depuis l'API

  // Infos utilisateur
  userEmail: string;
  userPseudo: string;
  userUrlImage?: string;
  userIsAdmin: boolean;
}

