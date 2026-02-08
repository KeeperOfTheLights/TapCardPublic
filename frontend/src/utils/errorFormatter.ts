/**
 * Helper function to format API error responses into user-friendly messages
 * Handles FastAPI validation errors (422) and other error formats
 */
export function formatErrorMessage(err: any, defaultMessage: string = 'Произошла ошибка'): string {
  // If no response data, return default message
  if (!err.response?.data) {
    return defaultMessage
  }

  const detail = err.response.data.detail

  // If detail is a string, return it
  if (typeof detail === 'string') {
    return detail
  }

  // If detail is an array of validation errors (FastAPI 422 format)
  // Example: [{type: "missing", loc: ["body", "file"], msg: "Field required", input: {...}}]
  if (Array.isArray(detail)) {
    return detail.map((error: any) => {
      const field = error.loc?.slice(1).join('.') || 'поле' // Skip 'body' in path
      const fieldName = field === 'поле' ? '' : `${field}: `
      return `${fieldName}${error.msg || 'ошибка валидации'}`
    }).join('; ')
  }

  // If detail is an object, try to extract meaningful info
  if (typeof detail === 'object') {
    return detail.msg || detail.message || JSON.stringify(detail)
  }

  return defaultMessage
}
