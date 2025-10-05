// CourbeCA.model.ts

import { DateOnly } from "../Helper/DateOnly";

export interface CourbeCA {
  id: number;
  userId: number;
  datePoint: string;
  datePointDateOnly: DateOnly;
  amount: number;
  description?: string;
  createdAt: Date;

  // Infos utilisateur complètes
  userEmail: string;
  userPseudo: string;
  userUrlImage?: string;
  userIsAdmin: boolean;
}

export interface CourbeCAGroupByDatePoint {
  ids: string;
  datePoint: string;
  datePointDateOnly: DateOnly;
  totalAmount: number;
  countItems: number;
}

// Pour la création d'un point CA
export interface CourbeCAIn {
  userId: number;
  datePoint: string;
  datePointDateOnly: DateOnly;
  amount: number;
  description?: string;
}
