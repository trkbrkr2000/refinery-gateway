import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../common/schemas/user.schema';
import { ApiKey } from '../common/schemas/api-key.schema';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email, active: true });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      roles: user.roles
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        roles: user.roles,
      },
    };
  }

  async register(email: string, password: string, name: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      name,
      roles: ['user'],
    });

    await user.save();

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async validateApiKey(apiKey: string): Promise<any> {
    const key = await this.apiKeyModel.findOne({
      key: apiKey,
      active: true,
    });

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check expiration
    if (key.expiresAt && key.expiresAt < new Date()) {
      throw new UnauthorizedException('API key expired');
    }

    // Update last used
    await this.apiKeyModel.updateOne(
      { _id: key._id },
      { lastUsedAt: new Date() }
    );

    return {
      userId: key.userId,
      scopes: key.scopes,
      keyId: key._id,
    };
  }

  async createApiKey(userId: string, name: string, scopes: string[] = []): Promise<string> {
    const key = `rfy_${crypto.randomBytes(32).toString('hex')}`;

    await this.apiKeyModel.create({
      key,
      name,
      userId,
      scopes,
      active: true,
    });

    return key;
  }

  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    await this.apiKeyModel.updateOne(
      { _id: keyId, userId },
      { active: false }
    );
  }
}
