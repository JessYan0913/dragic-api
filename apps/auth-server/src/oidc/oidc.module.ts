import { Module } from '@nestjs/common';
import { OidcController } from './oidc.controller';
import { OidcService } from './oidc.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [OidcController],
  providers: [OidcService],
  exports: [OidcService],
})
export class OidcModule {}
