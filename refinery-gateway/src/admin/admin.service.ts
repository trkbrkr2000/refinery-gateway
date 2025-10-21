import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from '../common/schemas/user.schema';
import { ApiKey } from '../common/schemas/api-key.schema';
import { AuthService } from '../auth/auth.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateUserDto, CreateApiKeyDto, UpdateUserDto } from './dto/create-user.dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(ApiKey.name) private apiKeyModel: Model<ApiKey>,
    private authService: AuthService,
    private analyticsService: AnalyticsService,
  ) {}

  // ========== User Management ==========

  async listUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel
        .find()
        .select('-password')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.userModel.countDocuments(),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUser(id: string) {
    const user = await this.userModel.findById(id).select('-password').lean();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get user's API keys count
    const apiKeysCount = await this.apiKeyModel.countDocuments({ userId: id });

    return {
      ...user,
      apiKeysCount,
    };
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, password, name, roles = ['user'] } = createUserDto;

    // Check if user exists
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email,
      password: hashedPassword,
      name,
      roles,
    });

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    await user.save();

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async deleteUser(id: string) {
    const user = await this.userModel.findById(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by deactivating
    user.active = false;
    await user.save();

    // Also deactivate all API keys
    await this.apiKeyModel.updateMany(
      { userId: id },
      { active: false }
    );
  }

  // ========== API Key Management ==========

  async listApiKeys(userId?: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const query = userId ? { userId } : {};

    const [apiKeys, total] = await Promise.all([
      this.apiKeyModel
        .find(query)
        .select('-key') // Don't expose full key
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      this.apiKeyModel.countDocuments(query),
    ]);

    // Add masked key preview
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      keyPreview: `${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 4)}`,
    }));

    return {
      apiKeys: maskedKeys,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getApiKey(id: string) {
    const apiKey = await this.apiKeyModel.findById(id).select('-key').lean();

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    return {
      ...apiKey,
      keyPreview: `${apiKey.key?.substring(0, 10)}...${apiKey.key?.substring(apiKey.key.length - 4)}`,
    };
  }

  async createApiKey(createApiKeyDto: CreateApiKeyDto) {
    const { userId, name, scopes = [], expiresAt } = createApiKeyDto;

    // Verify user exists
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const apiKey = await this.authService.createApiKey(userId, name, scopes);

    return {
      apiKey,
      message: 'API key created successfully. Save this key - it will not be shown again.',
    };
  }

  async revokeApiKey(id: string) {
    const apiKey = await this.apiKeyModel.findById(id);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.active = false;
    await apiKey.save();
  }

  async activateApiKey(id: string) {
    const apiKey = await this.apiKeyModel.findById(id);

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    apiKey.active = true;
    await apiKey.save();

    return { message: 'API key activated' };
  }

  // ========== Analytics ==========

  async getAnalyticsOverview(startDate?: Date, endDate?: Date) {
    return this.analyticsService.getStats(undefined, startDate, endDate);
  }

  async getUserAnalytics(userId: string, startDate?: Date, endDate?: Date) {
    return this.analyticsService.getStats(userId, startDate, endDate);
  }

  async getTopPaths(limit: number, startDate?: Date, endDate?: Date) {
    return this.analyticsService.getTopPaths(limit, startDate, endDate);
  }

  async getErrors(limit: number) {
    return this.analyticsService.getErrorLogs(limit);
  }

  // ========== System Stats ==========

  async getSystemStats() {
    const [totalUsers, activeUsers, totalApiKeys, activeApiKeys] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ active: true }),
      this.apiKeyModel.countDocuments(),
      this.apiKeyModel.countDocuments({ active: true }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
      },
      apiKeys: {
        total: totalApiKeys,
        active: activeApiKeys,
        revoked: totalApiKeys - activeApiKeys,
      },
    };
  }
}
