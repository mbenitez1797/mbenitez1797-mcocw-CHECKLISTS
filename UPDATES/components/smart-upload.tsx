"use client"

import { useState, useCallback } from "react"
import { useInventory } from "@/contexts/inventory-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Upload, Image, Loader2, CheckCircle2, AlertCircle, Camera, Monitor } from "lucide-react"

interface SmartUploadProps {
  isForTomorrow?: boolean
  onExtractComplete?: () => void
}

// Mock AI extraction function - simulates 3 second processing delay
async function mockAIExtraction(): Promise<{
  arrivals: number
  departures: number
  stayovers: Math.max(0, roomTotal - departures)
  occupancy: string
  parsedRooms: { KING: number; QUEENS: number; VIKG: number; SUITES: number }
}> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        arrivals: 22,
        departures: 25,
        stayovers: Math.max(0, roomTotal - departures),
        occupancy: "51.1%",
        parsedRooms: {
          KING: 129,
          QUEENS: 325,
          VIKG: 79,
          SUITES: 26,
        },
      })
    }, 3000)
  })
}

export function SmartUpload({ isForTomorrow = false, onExtractComplete }: SmartUploadProps) {
  const {
    updateTodayMetrics,
    updateTomorrowMetrics,
    setExtractedRoomTotals,
  } = useInventory()

  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [extractionComplete, setExtractionComplete] = useState(false)
  const [extractedData, setExtractedData] = useState<{
    arrivals: number
    departures: number
    stayovers: Math.max(0, roomTotal - departures)
    occupancy: string
    parsedRooms: { KING: number; QUEENS: number; VIKG: number; SUITES: number }
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }, [])

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG or PNG)")
      return
    }

    setError(null)
    setUploadedFile(file)
    setExtractionComplete(false)
    setExtractedData(null)

    // Create preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const processImage = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError(null)

    try {
      // Call mock AI extraction
      const data = await mockAIExtraction()
      setExtractedData(data)
      setExtractionComplete(true)

      // Auto-populate the inventory context
      const updateMetrics = isForTomorrow ? updateTomorrowMetrics : updateTodayMetrics
      updateMetrics({
        arrivals: data.arrivals,
        departures: data.departures,
        stayovers: Math.max(0, roomTotal - departures),
        occupancy: data.occupancy,
      })

      // Set room totals
      setExtractedRoomTotals(data.parsedRooms, isForTomorrow)

      onExtractComplete?.()
    } catch (err) {
      setError("Failed to process image. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setPreviewUrl(null)
    setExtractionComplete(false)
    setExtractedData(null)
    setError(null)
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Camera className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Smart Upload</h3>
          <p className="text-sm text-muted-foreground">AI-powered screenshot scanner</p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/60 rounded-lg p-4 mb-4 border border-indigo-100">
        <div className="flex items-start gap-3">
          <Monitor className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How to capture the screenshot:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open <span className="font-medium">StayPMS</span></li>
              <li>Go to <span className="font-medium">Dashboard</span> → <span className="font-medium">General Availability</span></li>
              <li>Select the first line <span className="font-medium">(Occupancy)</span></li>
              <li>Ensure screen is defaulted to <span className="font-medium">Available</span></li>
              <li>Take a screenshot and upload below</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      {!uploadedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
            isDragging
              ? "border-indigo-400 bg-indigo-50"
              : "border-slate-300 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
          )}
        >
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-indigo-100" : "bg-slate-100"
            )}>
              <Upload className={cn(
                "w-7 h-7 transition-colors",
                isDragging ? "text-indigo-500" : "text-slate-400"
              )} />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isDragging ? "Drop your screenshot here" : "Upload General Availability Screenshot"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Drag & drop or click to browse (.jpg, .png)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-start gap-4">
              {previewUrl && (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                  <img
                    src={previewUrl}
                    alt="Screenshot preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4 text-slate-400" />
                  <p className="font-medium text-foreground truncate">{uploadedFile.name}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
                {!extractionComplete && !isProcessing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetUpload}
                    className="mt-2 text-slate-500 hover:text-slate-700"
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Process Button */}
          {!extractionComplete && !isProcessing && (
            <Button
              onClick={processImage}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Process Image
            </Button>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <p className="font-medium text-indigo-700">AI extracting metrics...</p>
              <p className="text-sm text-indigo-500 mt-1">Analyzing screenshot for availability data</p>
            </div>
          )}

          {/* Extraction Complete */}
          {extractionComplete && extractedData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-700">Extraction Complete</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Arrivals</p>
                  <p className="text-xl font-bold text-foreground">{extractedData.arrivals}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Departures</p>
                  <p className="text-xl font-bold text-foreground">{extractedData.departures}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Stayovers</p>
                  <p className="text-xl font-bold text-foreground">{extractedData.stayovers}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Occupancy</p>
                  <p className="text-xl font-bold text-foreground">{extractedData.occupancy}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="bg-blue-50 rounded p-2 text-center border border-blue-100">
                  <p className="text-xs text-blue-600 font-medium">KING</p>
                  <p className="text-lg font-bold text-blue-700">{extractedData.parsedRooms.KING}</p>
                </div>
                <div className="bg-emerald-50 rounded p-2 text-center border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-medium">QUEENS</p>
                  <p className="text-lg font-bold text-emerald-700">{extractedData.parsedRooms.QUEENS}</p>
                </div>
                <div className="bg-amber-50 rounded p-2 text-center border border-amber-100">
                  <p className="text-xs text-amber-600 font-medium">VIKG</p>
                  <p className="text-lg font-bold text-amber-700">{extractedData.parsedRooms.VIKG}</p>
                </div>
                <div className="bg-purple-50 rounded p-2 text-center border border-purple-100">
                  <p className="text-xs text-purple-600 font-medium">SUITES</p>
                  <p className="text-lg font-bold text-purple-700">{extractedData.parsedRooms.SUITES}</p>
                </div>
              </div>

              <p className="text-sm text-green-600 mt-3 text-center">
                Data has been auto-populated in the input fields below. Please verify before submitting.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={resetUpload}
                className="w-full mt-3"
              >
                Upload New Screenshot
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  )
}



