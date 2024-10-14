import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ResourcePayload } from '../interfaces/user.interface';

@Injectable()
export class ResourceAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // 假设用户信息已经通过之前的认证中间件添加到请求中

    if (!user) {
      throw new UnauthorizedException();
    }

    const requiredPermission = this.getRequiredPermission(context);
    const hasPermission = await this.authService.canAccess(user, requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException('您没有访问该资源的权限');
    }

    return true;
  }

  private getRequiredPermission(context: ExecutionContext): ResourcePayload {
    // 如果没有自定义权限，则使用默认的路径+动作格式
    const request = context.switchToHttp().getRequest();
    const path = request.route.path;
    const method = request.method.toLowerCase();
    return {
      action: method,
      resource: path,
    };
  }
}
