import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { CreateUserDto, CreateApiKeyDto, UpdateUserDto } from './dto/create-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ========== User Management ==========

  @Get('users')
  async listUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.listUsers(page, limit);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string) {
    return this.adminService.getUser(id);
  }

  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  // ========== API Key Management ==========

  @Get('api-keys')
  async listApiKeys(
    @Query('userId') userId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.adminService.listApiKeys(userId, page, limit);
  }

  @Get('api-keys/:id')
  async getApiKey(@Param('id') id: string) {
    return this.adminService.getApiKey(id);
  }

  @Post('api-keys')
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return this.adminService.createApiKey(createApiKeyDto);
  }

  @Delete('api-keys/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeApiKey(@Param('id') id: string) {
    return this.adminService.revokeApiKey(id);
  }

  @Put('api-keys/:id/activate')
  async activateApiKey(@Param('id') id: string) {
    return this.adminService.activateApiKey(id);
  }

  // ========== Analytics ==========

  @Get('analytics/overview')
  async getAnalyticsOverview(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getAnalyticsOverview(start, end);
  }

  @Get('analytics/users/:userId')
  async getUserAnalytics(
    @Param('userId') userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getUserAnalytics(userId, start, end);
  }

  @Get('analytics/top-paths')
  async getTopPaths(
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.adminService.getTopPaths(limit, start, end);
  }

  @Get('analytics/errors')
  async getErrors(@Query('limit') limit: number = 50) {
    return this.adminService.getErrors(limit);
  }

  // ========== System Stats ==========

  @Get('stats')
  async getSystemStats() {
    return this.adminService.getSystemStats();
  }
}
