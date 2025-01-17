import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UsersService } from '../users/users.service';
import { compareValueWithHash, encrypt } from '../utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as process from 'node:process';
import { TokenPayload } from './interfaces/token-payload.interface';
import { UserEntity } from '../users/entities/user.entity';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private ACCESS_TOKEN_COOKIE = 'Authentication';
  private REFRESH_TOKEN_COOKIE = 'Refresh';
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(user: UserEntity, response: Response) {
    const { accessToken, refreshToken, expireAccessToken, expireRefreshToken } =
      this.generateTokens(user.id);

    await this.setCookies(
      response,
      user.id,
      accessToken,
      refreshToken,
      expireAccessToken,
      expireRefreshToken,
    );
  }

  async signup(userData: CreateUserDto, response: Response) {
    const existingUser = await this.usersService.findOne(userData.email, false);

    if (existingUser) {
      throw new UnauthorizedException('User already exists.');
    }

    const newUser = await this.usersService.create(userData);

    const { accessToken, refreshToken, expireAccessToken, expireRefreshToken } =
      this.generateTokens(newUser.id);

    await this.setCookies(
      response,
      newUser.id,
      accessToken,
      refreshToken,
      expireAccessToken,
      expireRefreshToken,
    );
  }

  async logout(user: UserEntity, response: Response) {
    await this.usersService.update(user.id, { refreshToken: null });
    this.clearCookies(response);
  }

  private generateTokens(userId: string) {
    const expireAccessToken = new Date();
    expireAccessToken.setTime(
      expireAccessToken.getTime() +
        parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS),
    );

    const expireRefreshToken = new Date();
    expireRefreshToken.setTime(
      expireRefreshToken.getTime() +
        parseInt(process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS),
    );

    const tokenPayload: TokenPayload = {
      userId: userId,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_ACCESS_TOKEN_EXPIRATION_MS}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: `${process.env.JWT_REFRESH_TOKEN_EXPIRATION_MS}ms`,
    });

    return { expireAccessToken, expireRefreshToken, accessToken, refreshToken };
  }

  private async setCookies(
    response: Response,
    userId: string,
    accessToken: string,
    refreshToken: string,
    expireAccessToken: Date,
    expireRefreshToken: Date,
  ) {
    await this.usersService.update(userId, {
      refreshToken: await encrypt(refreshToken),
    });

    response.cookie(this.ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: true,
      expires: expireAccessToken,
    });

    response.cookie(this.REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: true,
      expires: expireRefreshToken,
    });
  }

  private clearCookies(response: Response) {
    response.clearCookie(this.REFRESH_TOKEN_COOKIE);
    response.clearCookie(this.ACCESS_TOKEN_COOKIE);
  }

  async validateUser(email: string, password: string) {
    try {
      const user = await this.usersService.findOne(email);
      const isAuthorized = await compareValueWithHash(password, user.password);

      if (!isAuthorized) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }

  async verifyUserRefreshToken(refreshToken: string, userId: string) {
    try {
      const user = await this.usersService.findOneById(userId);
      const authenticated = await compareValueWithHash(
        refreshToken,
        user.refreshToken,
      );

      if (!authenticated) {
        throw new UnauthorizedException();
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Refresh token is not valid.');
    }
  }
}
