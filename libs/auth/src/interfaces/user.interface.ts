export interface UserPayload {
  id: string | number;
  roles?: string[];
  [key: string]: any;
}

export interface ResourcePayload {
  action: string;
  resource: string;
}

export interface UserService<T extends UserPayload = UserPayload> {
  validateUser(username: string, password: string): T | Promise<T | null>;
  canAccess(user: T, permission: ResourcePayload): boolean | Promise<boolean>;
}
