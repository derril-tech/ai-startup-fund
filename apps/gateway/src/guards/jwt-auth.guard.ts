// Created automatically by Cursor AI (2024-12-19)

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // TODO: Implement proper JWT validation
    // For now, allow all requests in development
    return true;
  }
}
