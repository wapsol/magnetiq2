import { useState, useCallback } from 'react'

interface FileUploadState {
  file: File | null
  progress: number
  isUploading: boolean
  error: string | null
  success: boolean
}

interface FileValidation {
  maxSize?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

interface UseFileUploadOptions extends FileValidation {
  onSuccess?: (result: any) => void
  onError?: (error: string) => void
  onProgress?: (progress: number) => void
}

const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions = ['.pdf', '.doc', '.docx'],
    onSuccess,
    onError,
    onProgress
  } = options

  const [state, setState] = useState<FileUploadState>({
    file: null,
    progress: 0,
    isUploading: false,
    error: null,
    success: false
  })

  // Validate file
  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    if (file.size > maxSize) {
      return `File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`
    }

    // Check file extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!allowedExtensions.includes(fileExtension)) {
      return `Invalid file extension. Allowed extensions: ${allowedExtensions.join(', ')}`
    }

    return null
  }, [maxSize, allowedTypes, allowedExtensions])

  // Select file
  const selectFile = useCallback((file: File) => {
    const validationError = validateFile(file)
    
    if (validationError) {
      setState(prev => ({
        ...prev,
        error: validationError,
        file: null
      }))
      onError?.(validationError)
      return false
    }

    setState(prev => ({
      ...prev,
      file,
      error: null,
      success: false,
      progress: 0
    }))

    return true
  }, [validateFile, onError])

  // Upload file with form data
  const uploadFile = useCallback(async (
    url: string,
    formData: FormData,
    options: RequestInit = {}
  ) => {
    if (!state.file) {
      const error = 'No file selected'
      setState(prev => ({ ...prev, error }))
      onError?.(error)
      return null
    }

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      success: false
    }))

    try {
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()
      
      return new Promise<any>((resolve, reject) => {
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100)
            setState(prev => ({ ...prev, progress }))
            onProgress?.(progress)
          }
        })

        // Handle completion
        xhr.addEventListener('load', async () => {
          try {
            if (xhr.status >= 200 && xhr.status < 300) {
              const result = JSON.parse(xhr.responseText)
              setState(prev => ({
                ...prev,
                isUploading: false,
                progress: 100,
                success: true
              }))
              onSuccess?.(result)
              resolve(result)
            } else {
              let errorMessage = 'Upload failed'
              try {
                const errorResult = JSON.parse(xhr.responseText)
                errorMessage = errorResult.detail || errorResult.message || errorMessage
              } catch {
                errorMessage = `Upload failed with status ${xhr.status}`
              }
              
              setState(prev => ({
                ...prev,
                isUploading: false,
                error: errorMessage
              }))
              onError?.(errorMessage)
              reject(new Error(errorMessage))
            }
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            setState(prev => ({
              ...prev,
              isUploading: false,
              error: errorMessage
            }))
            onError?.(errorMessage)
            reject(error)
          }
        })

        // Handle errors
        xhr.addEventListener('error', () => {
          const errorMessage = 'Network error during upload'
          setState(prev => ({
            ...prev,
            isUploading: false,
            error: errorMessage
          }))
          onError?.(errorMessage)
          reject(new Error(errorMessage))
        })

        // Handle abort
        xhr.addEventListener('abort', () => {
          const errorMessage = 'Upload was cancelled'
          setState(prev => ({
            ...prev,
            isUploading: false,
            error: errorMessage
          }))
          onError?.(errorMessage)
          reject(new Error(errorMessage))
        })

        // Start upload
        xhr.open('POST', url)
        
        // Set headers (excluding Content-Type to let browser set it with boundary for FormData)
        Object.entries(options.headers || {}).forEach(([key, value]) => {
          if (key.toLowerCase() !== 'content-type') {
            xhr.setRequestHeader(key, value as string)
          }
        })

        xhr.send(formData)
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage
      }))
      onError?.(errorMessage)
      return null
    }
  }, [state.file, onSuccess, onError, onProgress])

  // Reset state
  const reset = useCallback(() => {
    setState({
      file: null,
      progress: 0,
      isUploading: false,
      error: null,
      success: false
    })
  }, [])

  // Remove file
  const removeFile = useCallback(() => {
    setState(prev => ({
      ...prev,
      file: null,
      progress: 0,
      error: null,
      success: false
    }))
  }, [])

  return {
    // State
    file: state.file,
    progress: state.progress,
    isUploading: state.isUploading,
    error: state.error,
    success: state.success,
    
    // Actions
    selectFile,
    uploadFile,
    removeFile,
    reset,
    
    // Validation
    validateFile
  }
}

export default useFileUpload