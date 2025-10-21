import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestLog } from '../common/schemas/request-log.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(RequestLog.name) private requestLogModel: Model<RequestLog>,
  ) {}

  async logRequest(data: {
    method: string;
    path: string;
    statusCode: number;
    responseTime: number;
    userId?: string;
    apiKeyId?: string;
    ip: string;
    userAgent?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await this.requestLogModel.create(data);
    } catch (error) {
      console.error('Failed to log request:', error);
      // Don't throw - logging failures shouldn't break the app
    }
  }

  async getStats(userId?: string, startDate?: Date, endDate?: Date) {
    const match: any = {};

    if (userId) {
      match.userId = userId;
    }

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    const [totalRequests, avgResponseTime, statusBreakdown] = await Promise.all([
      // Total requests
      this.requestLogModel.countDocuments(match),

      // Average response time
      this.requestLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            avgResponseTime: { $avg: '$responseTime' },
          },
        },
      ]),

      // Status code breakdown
      this.requestLogModel.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$statusCode',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalRequests,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    };
  }

  async getTopPaths(limit: number = 10, startDate?: Date, endDate?: Date) {
    const match: any = {};

    if (startDate || endDate) {
      match.createdAt = {};
      if (startDate) match.createdAt.$gte = startDate;
      if (endDate) match.createdAt.$lte = endDate;
    }

    return this.requestLogModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$path',
          count: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }

  async getErrorLogs(limit: number = 50) {
    return this.requestLogModel
      .find({ statusCode: { $gte: 400 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('method path statusCode errorMessage createdAt userId')
      .lean();
  }
}
