import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RegisterUserDto, LoginUserDto } from './dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  onModuleInit() {
    this.$connect();
    this.logger.log('Mongo Db connect');
  }
  create(registerUserDto: RegisterUserDto) {
    return registerUserDto;
  }
  login(loginUserDto: LoginUserDto) {
    return loginUserDto;
  }
  verify() {}
}
