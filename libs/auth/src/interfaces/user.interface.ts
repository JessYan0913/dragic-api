export interface UserPayload {
  id: string | number;
  roles?: string[];
  [key: string]: any;
}

export interface UserService<T extends UserPayload = UserPayload> {
  validateUser(username: string, password: string): Promise<T | null>;
}
