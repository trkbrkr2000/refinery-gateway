import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class RequestLog extends Document {
  @Prop({ required: true })
  method: string;

  @Prop({ required: true })
  path: string;

  @Prop({ required: true })
  statusCode: number;

  @Prop({ required: true })
  responseTime: number;

  @Prop()
  userId?: string;

  @Prop()
  apiKeyId?: string;

  @Prop()
  ip: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  requestBody?: Record<string, any>;

  @Prop({ type: Object })
  responseBody?: Record<string, any>;

  @Prop()
  errorMessage?: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);

// Index for analytics queries
RequestLogSchema.index({ createdAt: -1, userId: 1 });
RequestLogSchema.index({ path: 1, statusCode: 1 });
