import { UserService } from '@/user/user.service';
import { Injectable } from '@nestjs/common';
import { AuthService } from '@dragic/auth';
import { UserInsert } from '@dragic/database';

@Injectable()
export class AccountService {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async login(user: UserInsert) {}

  async register() {}
}
