import { useToast } from './useToast'

export enum AnalysisErrorCode {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  EXTRACTION_FAILED = 'EXTRACTION_FAILED',
  ANALYSIS_TIMEOUT = 'ANALYSIS_TIMEOUT',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

interface AnalysisError {
  code: AnalysisErrorCode
  title: string
  message: string
  retryable: boolean
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const useAnalysisErrors = () => {
  const toast = useToast()

  const errorMessages: Record<AnalysisErrorCode, Omit<AnalysisError, 'code'>> = {
    [AnalysisErrorCode.FILE_TOO_LARGE]: {
      title: 'File Too Large',
      message: `Your file exceeds the maximum size of ${MAX_FILE_SIZE / 1024 / 1024}MB. Please try a smaller file.`,
      retryable: false
    },
    [AnalysisErrorCode.INVALID_FILE_TYPE]: {
      title: 'Invalid File Type',
      message: 'Only PDF files are supported. Please upload a PDF version of your VA decision letter.',
      retryable: false
    },
    [AnalysisErrorCode.UPLOAD_FAILED]: {
      title: 'Upload Failed',
      message: 'We couldn\'t upload your file. Please check your connection and try again.',
      retryable: true
    },
    [AnalysisErrorCode.EXTRACTION_FAILED]: {
      title: 'Extraction Failed',
      message: 'We couldn\'t extract text from your PDF. The file may be corrupted or contain only images.',
      retryable: true
    },
    [AnalysisErrorCode.ANALYSIS_TIMEOUT]: {
      title: 'Analysis Taking Longer Than Expected',
      message: 'Your document is still being processed. This may take a few more moments.',
      retryable: true
    },
    [AnalysisErrorCode.SERVICE_UNAVAILABLE]: {
      title: 'Service Temporarily Unavailable',
      message: 'Our analysis service is temporarily down. Please try again in a few minutes.',
      retryable: true
    },
    [AnalysisErrorCode.NETWORK_ERROR]: {
      title: 'Connection Error',
      message: 'Unable to connect to our servers. Please check your internet connection.',
      retryable: true
    },
    [AnalysisErrorCode.UNKNOWN_ERROR]: {
      title: 'Something Went Wrong',
      message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
      retryable: true
    }
  }

  const getErrorFromResponse = (error: any, stage: 'upload' | 'extraction' | 'analysis'): AnalysisError => {
    // Check for specific HTTP status codes
    if (error.response?.status === 413 || error.message?.includes('too large')) {
      return { code: AnalysisErrorCode.FILE_TOO_LARGE, ...errorMessages[AnalysisErrorCode.FILE_TOO_LARGE] }
    }

    if (error.response?.status === 415 || error.message?.includes('file type')) {
      return { code: AnalysisErrorCode.INVALID_FILE_TYPE, ...errorMessages[AnalysisErrorCode.INVALID_FILE_TYPE] }
    }

    if (error.response?.status === 503 || error.message?.includes('unavailable')) {
      return { code: AnalysisErrorCode.SERVICE_UNAVAILABLE, ...errorMessages[AnalysisErrorCode.SERVICE_UNAVAILABLE] }
    }

    if (error.message?.includes('timeout') || error.code === 'ETIMEDOUT') {
      return { code: AnalysisErrorCode.ANALYSIS_TIMEOUT, ...errorMessages[AnalysisErrorCode.ANALYSIS_TIMEOUT] }
    }

    if (error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
      return { code: AnalysisErrorCode.NETWORK_ERROR, ...errorMessages[AnalysisErrorCode.NETWORK_ERROR] }
    }

    // Stage-specific defaults
    if (stage === 'upload') {
      return { code: AnalysisErrorCode.UPLOAD_FAILED, ...errorMessages[AnalysisErrorCode.UPLOAD_FAILED] }
    }

    if (stage === 'extraction') {
      return { code: AnalysisErrorCode.EXTRACTION_FAILED, ...errorMessages[AnalysisErrorCode.EXTRACTION_FAILED] }
    }

    // Default unknown error
    return { code: AnalysisErrorCode.UNKNOWN_ERROR, ...errorMessages[AnalysisErrorCode.UNKNOWN_ERROR] }
  }

  const handleError = (error: any, stage: 'upload' | 'extraction' | 'analysis', onRetry?: () => void) => {
    const analysisError = getErrorFromResponse(error, stage)

    console.error(`[${stage}] Analysis error:`, {
      code: analysisError.code,
      originalError: error
    })

    // Show toast with retry option if error is retryable
    if (analysisError.retryable && onRetry) {
      toast.error(
        analysisError.title,
        analysisError.message,
        {
          label: 'Try Again',
          callback: onRetry,
          dismiss: true
        }
      )
    } else {
      toast.error(analysisError.title, analysisError.message)
    }

    return analysisError
  }

  const validateFile = (file: File): AnalysisError | null => {
    // Check file type
    if (file.type !== 'application/pdf') {
      return {
        code: AnalysisErrorCode.INVALID_FILE_TYPE,
        ...errorMessages[AnalysisErrorCode.INVALID_FILE_TYPE]
      }
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: AnalysisErrorCode.FILE_TOO_LARGE,
        ...errorMessages[AnalysisErrorCode.FILE_TOO_LARGE]
      }
    }

    return null
  }

  return {
    validateFile,
    handleError,
    getErrorFromResponse,
    AnalysisErrorCode,
    MAX_FILE_SIZE
  }
}
