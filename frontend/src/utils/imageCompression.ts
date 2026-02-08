interface CompressionOptions {
  maxWidth: number
  maxHeight: number
  maxSizeMB: number
}

const defaultAvatarOptions: CompressionOptions = {
  maxWidth: 720,
  maxHeight: 720,
  maxSizeMB: 0.5, // 500KB
}

const defaultLogoOptions: CompressionOptions = {
  maxWidth: 300,
  maxHeight: 300,
  maxSizeMB: 0.2, // 200KB
}

/**
 * Compress an image file using Canvas API
 * Always outputs PNG format for backend compatibility
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> {
  const opts = { ...defaultAvatarOptions, ...options }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (event) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let { width, height } = img
          
          // Calculate new dimensions while maintaining aspect ratio
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
          
          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Failed to get canvas context'))
            return
          }
          
          // Use better image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0, width, height)
          
          // Always output as PNG for backend compatibility
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }
              
              // Create filename with .png extension
              const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
              const newFilename = `${baseName}.png`
              
              // Create new File from blob
              const compressedFile = new File([blob], newFilename, {
                type: 'image/png',
                lastModified: Date.now(),
              })
              
              console.log(`Image processed: ${(file.size / 1024).toFixed(1)}KB → ${(compressedFile.size / 1024).toFixed(1)}KB (${width}x${height})`)
              resolve(compressedFile)
            },
            'image/png'
          )
        } catch (error) {
          reject(error)
        }
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = event.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Compress avatar image (720x720)
 */
export async function compressAvatar(file: File): Promise<File> {
  return compressImage(file, defaultAvatarOptions)
}

/**
 * Compress logo/icon image (300x300)
 */
export async function compressLogo(file: File): Promise<File> {
  return compressImage(file, defaultLogoOptions)
}
