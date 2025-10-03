export interface AgendaOut {
  id: number;
  title: string;
  description?: string | null;
  startDate: Date;      // en ISO string depuis l'API
  endDate: Date;        // en ISO string depuis l'API
  isPublic: boolean;
  createdAt: string;      // en ISO string depuis l'API

  // Infos créateur
  createdBy?: number | null;
  creatorEmail?: string | null;
  creatorPseudo?: string | null;
  creatorUrlImage?: string | null;
  creatorIsAdmin: boolean;
}

export interface AgendaIn {
  title: string;
  description?: string | null;
  startDate: Date;  // format ISO 'yyyy-MM-ddTHH:mm:ss'
  endDate: Date;
  createdBy?: number | null;
  isPublic: boolean;
}

export interface AgendaUserIn {
  userIds: number[];
}
