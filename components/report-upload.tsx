'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { parseHousekeepingReport, parseStructuredData } from '@/lib/pdf-parser'
import type { HousekeepingForecast, UploadResult } from '@/lib/types'

interface ReportUploadProps {
  onUploadComplete: (result: UploadResult) => void
}

export function ReportUpload({ onUploadComplete }: ReportUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewData, setPreviewData] = useState<HousekeepingForecast[] | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setError(null)
    setFileName(file.name)
    setUploadResult(null)

    try {
      const text = await file.text()
      
      // Try both parsers and use the one with more results
      const result1 = parseHousekeepingReport(text)
      const result2 = parseStructuredData(text)
      
      const forecasts = result1.forecasts.length >= result2.forecasts.length 
        ? result1.forecasts 
        : result2.forecasts

      if (forecasts.length === 0) {
        setError('Could not parse any forecast data from the file. Please ensure this is an Agilysys Housekeeping Forecasting report.')
        setPreviewData(null)
      } else {
        setPreviewData(forecasts)
      }
    } catch (err) {
      setError(`Error processing file: ${err}`)
      setPreviewData(null)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file) {
      processFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) return

    setIsProcessing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('parsedData', JSON.stringify({ forecasts: previewData }))
      if (fileName) {
        formData.append('file', new Blob(), fileName)
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result: UploadResult = await response.json()

      if (!response.ok) {
        throw new Error(result.errors?.join(', ') || 'Upload failed')
      }

      setUploadResult(result)
      onUploadComplete(result)
    } catch (err) {
      setError(`Upload failed: ${err}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetUpload = () => {
    setPreviewData(null)
    setFileName(null)
    setError(null)
    setUploadResult(null)
  }

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
          }
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          accept=".pdf,.txt,.csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center gap-3">
          {isProcessing ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          
          <div>
            <p className="text-lg font-medium">
              {isProcessing ? 'Processing...' : 'Drop your report here'}
            </p>
            <p className="text-sm text-muted-foreground">
              or click to select a file (PDF, TXT, or CSV)
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-destructive">Error</p>
            <p className="text-sm text-destructive/80">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-green-700">Upload Successful</p>
            <div className="text-sm text-green-600 mt-1 space-y-1">
              <p>Processed: {uploadResult.recordsProcessed} records</p>
              <p>Inserted: {uploadResult.recordsInserted} new records</p>
              <p>Updated: {uploadResult.recordsUpdated} existing records</p>
              {uploadResult.newDatesAdded.length > 0 && (
                <p>New dates added: {uploadResult.newDatesAdded.join(', ')}</p>
              )}
            </div>
            <button
              onClick={resetUpload}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Upload another report
            </button>
          </div>
        </div>
      )}

      {/* Preview Data */}
      {previewData && previewData.length > 0 && !uploadResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">{fileName}</span>
              <span className="text-sm text-muted-foreground">
                ({previewData.length} records parsed)
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isProcessing}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Date</th>
                    <th className="px-3 py-2 text-left font-medium">Room Type</th>
                    <th className="px-3 py-2 text-right font-medium">Arrivals</th>
                    <th className="px-3 py-2 text-right font-medium">Arr. Guests</th>
                    <th className="px-3 py-2 text-right font-medium">Departures</th>
                    <th className="px-3 py-2 text-right font-medium">Dep. Guests</th>
                    <th className="px-3 py-2 text-right font-medium">Stay Overs</th>
                    <th className="px-3 py-2 text-right font-medium">SO Guests</th>
                    <th className="px-3 py-2 text-right font-medium">OTM</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {previewData.slice(0, 50).map((forecast, index) => (
                    <tr key={index} className="hover:bg-muted/30">
                      <td className="px-3 py-2 whitespace-nowrap">{forecast.forecast_date}</td>
                      <td className="px-3 py-2 max-w-[200px] truncate" title={forecast.room_type_name}>
                        {forecast.room_type_name}
                      </td>
                      <td className="px-3 py-2 text-right">{forecast.arrivals}</td>
                      <td className="px-3 py-2 text-right">{forecast.arriving_guests}</td>
                      <td className="px-3 py-2 text-right">{forecast.departures}</td>
                      <td className="px-3 py-2 text-right">{forecast.departing_guests}</td>
                      <td className="px-3 py-2 text-right">{forecast.stay_overs}</td>
                      <td className="px-3 py-2 text-right">{forecast.stay_over_guests}</td>
                      <td className="px-3 py-2 text-right">{forecast.otm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {previewData.length > 50 && (
              <div className="px-3 py-2 text-sm text-muted-foreground bg-muted/30">
                Showing 50 of {previewData.length} records
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
