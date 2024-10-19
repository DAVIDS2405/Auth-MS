import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RegisterUserDto, LoginUserDto } from './dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('AuthService');
  constructor(private readonly jwtService: JwtService) {
    super();
  }
  onModuleInit() {
    this.$connect();
    this.logger.log('Mongo Db connect');
  }
  async singJWT(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
  async create(registerUserDto: RegisterUserDto) {
    try {
      const { email, password, name } = registerUserDto;
      const userExist = await this.user.findUnique({
        where: { email: email },
      });
      if (userExist) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'User already exist',
        });
      }
      const newUser = await this.user.create({
        data: {
          email: email,
          password: bcrypt.hashSync(password, 10),
          name: name,
        },
      });

      const { password: _, ...rest } = newUser;
      return {
        user: rest,
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const { email, password } = loginUserDto;
      const userExist = await this.user.findUnique({
        where: { email },
      });
      if (!userExist) {
        throw new RpcException({
          status: HttpStatus.CONFLICT,
          message: 'User not exist',
        });
      }
      const isPasswordValid = bcrypt.compareSync(password, userExist.password);
      if (!isPasswordValid) {
        throw new RpcException({
          status: HttpStatus.NOT_ACCEPTABLE,
          message: 'User/Password not correct',
        });
      }

      const { password: _, ...rest } = userExist;
      return {
        user: rest,
        token: await this.singJWT(rest),
      };
    } catch (error) {
      throw new RpcException({
        status: 400,
        message: error.message,
      });
    }
  }
  async verify(token: string) {
    try {
      const { sub, iat, exp, ...user } = this.jwtService.verify(token, {
        secret: envs.jwtSecret,
      });
      console.log(await this.singJWT(user));

      return {
        user: user,
        token: await this.singJWT(user),
      };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Invalid Token',
      });
    }
  }
}
