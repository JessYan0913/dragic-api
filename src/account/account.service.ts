import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@pictode-api/auth';
import { UserInsert } from '@pictode-api/drizzle';

@Injectable()
export class AccountService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(user: UserInsert) {}

  async register() {}
}
