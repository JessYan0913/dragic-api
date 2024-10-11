export interface UserService<T = Record<string, any>> {
  findUniqueUserByUsername(username: string): Promise<T | null>;
}
