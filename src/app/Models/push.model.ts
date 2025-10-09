export interface Keys {
  p256dh: string;
  auth: string;
}

export interface PushKeys {
  endpoint: string;
  keys: Keys;
}

export interface PushSubscriptionDto {
  userId: number;
  subscription: PushKeys;
}
