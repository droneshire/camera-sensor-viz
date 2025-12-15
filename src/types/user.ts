export enum ClientAction {
  NONE = "NONE",
  DELETE = "DELETE",
  ADD = "ADD",
}

export interface Preferences {
  notifications: {
    email: {
      email: string;
      updatesEnabled: boolean;
    };
  };
}

export interface ClientConfig {
  preferences: Preferences;
}

export const DEFAULT_USER_CONFIG: ClientConfig = {
  preferences: {
    notifications: {
      email: { email: "", updatesEnabled: true },
    },
  },
};
