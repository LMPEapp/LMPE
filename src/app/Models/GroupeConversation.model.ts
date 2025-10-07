export interface GroupeConversation {
  id: number;
  name: string;
  lastActivity: Date;
  createdAt: Date;
  unReadCount: number;
}

export interface GroupeConversationIn {
  name: string;
}

export interface UserGroupeIn {
  userIds: number[];
}
