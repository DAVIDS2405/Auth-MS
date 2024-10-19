import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { LoginUserDto, RegisterUserDto } from './dto';

@Controller()
export class AuthController {
  constructor(private readonly client: AuthService) {}

  @MessagePattern('auth.register.user')
  RegisterUser(@Payload() registerUserDto: RegisterUserDto) {
    return this.client.create(registerUserDto);
  }

  @MessagePattern('auth.login.user')
  LoginUser(@Payload() loginUserDto: LoginUserDto) {
    return this.client.login(loginUserDto);
  }
  @MessagePattern('auth.verify.user')
  VerifyUser(@Payload() token: string) {
    return this.client.verify(token);
  }
}
