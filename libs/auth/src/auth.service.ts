import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResourcePayload, UserPayload, UserService } from './interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject('UserService') private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<UserPayload> {
    const user = await this.userService.validateUser(username, password);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 判断用户是否有权限访问资源
  async canAccess(user: UserPayload, resource: ResourcePayload): Promise<boolean> {
    return await this.userService.canAccess(user, resource);
  }

  async login(user: UserPayload) {
    return {
      access_token: this.jwtService.sign({ ...user }),
    };
  }
}
