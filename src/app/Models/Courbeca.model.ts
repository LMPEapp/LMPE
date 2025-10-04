// CourbeCA.model.ts

export interface CourbeCA {
  id: number;
  userId: number;
  datePoint: Date;
  amount: number;
  description?: string;
  createdAt: Date;

  // Infos utilisateur complètes
  userEmail: string;
  userPseudo: string;
  userUrlImage?: string;
  userIsAdmin: boolean;
}

// Pour la création d'un point CA
export interface CourbeCAIn {
  userId: number;
  datePoint: string; // ISO string
  amount: number;
  description?: string;
}
