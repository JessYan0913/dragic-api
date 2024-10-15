import { UserService } from '@/user/user.service';
import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

@Module({
  controllers: [AccountController],
  providers: [AccountService, UserService],
})
export class AccountModule {}
