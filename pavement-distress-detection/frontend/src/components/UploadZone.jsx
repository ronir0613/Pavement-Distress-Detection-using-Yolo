import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

const ACCEPT = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.tiff', '.tif'] }

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function UploadZone({ onFileSelect, onClear }) {
  const [preview, setPreview] = useState(null)
  const [fileInfo, setFileInfo] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (!accepted.length) return
    const file = accepted[0]
    const url = URL.createObjectURL(file)
    setPreview(url)
    setFileInfo({ name: file.name, size: file.size })
    onClear?.()
    onFileSelect(file)
  }, [onFileSelect, onClear])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  })

  return (
    <div className="space-y-2">
      <label className="section-label">Upload Image</label>

      <div
        {...getRootProps()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 overflow-hidden
          ${isDragActive
            ? 'border-brand-400 bg-brand-50 scale-[1.01]'
            : 'border-slate-200 hover:border-brand-400 hover:bg-brand-50/50 bg-white'
          }
          ${preview ? 'h-56' : 'h-44'}
        `}
      >
        <input {...getInputProps()} />

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
              <span className="text-xs font-medium text-white truncate drop-shadow">{fileInfo?.name}</span>
              <span className="text-xs text-white/70 shrink-0 drop-shadow">{formatBytes(fileInfo?.size)}</span>
            </div>
            <div className="absolute top-3 right-3 bg-brand-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              READY
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 px-4 text-center animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-brand-100 border border-brand-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">
                {isDragActive ? 'Drop it here…' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-slate-400 mt-1">JPG · PNG · WEBP · BMP · TIFF — max 50 MB</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
