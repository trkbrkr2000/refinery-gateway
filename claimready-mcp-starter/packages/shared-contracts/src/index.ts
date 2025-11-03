// Shared DTOs & contracts across services

export type ClaimReadyUser = {
  id: string
  email: string
  roles: string[]
}

export type UploadMetadata = {
  id: string
  filename: string
  mimeType: string
  size: number
  uploadedAt: string
  s3Key: string
}

export type ParseRequest = {
  uploadId: string
  s3Key: string
}

export type DecisionExtraction = {
  issues: Array<{
    name: string
    decision: 'granted' | 'denied' | 'deferred' | 'increased' | 'reduced'
    percentage?: number
    effectiveDate?: string
  }>
  ratingsTable?: any
  reasons?: string[]
  meta?: Record<string, any>
}

export type ParseResponse = {
  uploadId: string
  success: boolean
  data?: DecisionExtraction
  errors?: string[]
}

export type GoldenCase = {
  id: string
  inputPath: string
  expectedPath: string
}
