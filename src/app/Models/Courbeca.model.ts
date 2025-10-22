// CourbeCA.model.ts

import { DateOnly } from "../Helper/DateOnly";

export interface CourbeCA {
  id: number;
  userId: number | null;
  datePoint: string;
  datePointDateOnly: DateOnly;
  amount: number;
  description?: string;
  createdAt: Date;

  // Infos utilisateur complètes
  userEmail: string | null;
  userPseudo: string | null;
  userUrlImage?: string | null;
  userIsAdmin: boolean | null;
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
  userId: number | null;
  datePoint: string;
  datePointDateOnly: DateOnly;
  amount: number;
  description?: string;
}
