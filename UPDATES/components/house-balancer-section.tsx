"use client"

import { useState, useCallback } from "react"
import { useInventory } from "@/contexts/inventory-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Upload, 
  Loader2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ArrowDownToLine,
  ArrowUpFromLine,
  Home,
  Percent,
  RefreshCw,
  Info,
  FileSpreadsheet,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"

// Consolidated room type groupings for the House Balancer
const CONSOLIDATED_GROUPS = {
  KINGS: {
    label: "Standard Kings",
    codes: ["RM1K0006", "RM1KA008", "RM1KA009"],
    upgradeTarget: null,
    isUpgrade: false,
  },
  QUEENS: {
    label: "Standard Queens",
    codes: ["RM2Q0001"],
    upgradeTarget: null,
    isUpgrade: false,
  },
  VIKG: {
    label: "View Kings",
    codes: ["RM1KA008"],
    upgradeTarget: "KINGS",
    isUpgrade: true,
  },
  VIQN: {
    label: "View Queens",
    codes: ["RM2Q0002", "RM2Q0002", "RM2QA003", "RM2QA004", "RM2QA005"],
    upgradeTarget: "QUEENS",
    isUpgrade: true,
  },
  SUITES: {
    label: "Suites",
    codes: ["SU1B0010", "SU1BA011"],
    upgradeTarget: "KINGS",
    isUpgrade: true,
  },
} as const

type ConsolidatedCategory = keyof typeof CONSOLIDATED_GROUPS

interface ShuffleRecommendation {
  id: string
  fromCategory: ConsolidatedCategory
  toCategory: ConsolidatedCategory
  title: string
  description: string
  completed: boolean
}

interface ParsedRoomData {
  roomCode: string
  roomName: string
  todayAvailable: number
}

interface ParsedGAData {
  occupancy: string
  arrivals: number
  departures: number
  committed: number
  availability: number
  adr: string
  totalRevenue: string
  roomTotal: number
  adults: number
  children: number
  oooOtm: string
  groupsBeddedRemaining: number
}

interface HouseBalancerSectionProps {
  onBalanceComplete?: () => void
}

export function HouseBalancerSection({ onBalanceComplete }: HouseBalancerSectionProps) {
  const { 
    todayMetrics, 
    updateTodayMetrics,
    syncInventory 
  } = useInventory()

  // Local inventory state for the balancer
  const [inventory, setInventory] = useState<Record<ConsolidatedCategory, number>>({
    KINGS: 0,
    QUEENS: 0,
    VIKG: 0,
    VIQN: 0,
    SUITES: 0,
  })

  // File upload states
  const [roomAvailabilityFile, setRoomAvailabilityFile] = useState<File | null>(null)
  const [gaReportFile, setGaReportFile] = useState<File | null>(null)
  const [isProcessingRoom, setIsProcessingRoom] = useState(false)
  const [isProcessingGA, setIsProcessingGA] = useState(false)
  const [roomDataParsed, setRoomDataParsed] = useState(false)
  const [gaDataParsed, setGaDataParsed] = useState(false)
  const [parsedRoomData, setParsedRoomData] = useState<ParsedRoomData[]>([])
  const [parsedGAData, setParsedGAData] = useState<ParsedGAData | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const [recommendations, setRecommendations] = useState<ShuffleRecommendation[]>([])
  const [isBalanceComplete, setIsBalanceComplete] = useState(false)

  // Parse Room Availability CSV
  const parseRoomAvailabilityCSV = useCallback((content: string) => {
    const lines = content.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim())
    
    // Find today's column (typically the 3rd column after "", "TOTAL")
    const todayColIndex = 2 // "Mon 04/27" etc.
    
    const roomData: ParsedRoomData[] = []
    const categoryTotals: Record<ConsolidatedCategory, number> = {
      KINGS: 0,
      QUEENS: 0,
      VIKG: 0,
      VIQN: 0,
      SUITES: 0,
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      // Handle CSV with quoted fields
      const values = line.match(/("([^"]*)"|[^,]+)/g)?.map(v => v.replace(/"/g, '').trim()) || []
      
      const roomCodeLine = values[0] || ''
      const todayValue = parseInt(values[todayColIndex] || '0', 10) || 0

      // Skip total lines
      if (roomCodeLine.includes('Total') || roomCodeLine === 'ROH - Run Of House') {
        continue
      }

      // Extract room code (e.g., "RM1K0006" from "RM1K0006 - Deluxe Room...")
      const codeMatch = roomCodeLine.match(/^(RM\w+|SU\w+)/)
      if (codeMatch) {
        const roomCode = codeMatch[1]
        roomData.push({
          roomCode,
          roomName: roomCodeLine,
          todayAvailable: todayValue,
        })

        // Categorize into consolidated groups
        if (roomCode.startsWith('SU')) {
          categoryTotals.SUITES += todayValue
        } else if (roomCode === 'RM1KA008') {
          // RM1KA008 is View King
          categoryTotals.VIKG += todayValue
        } else if (roomCode.startsWith('RM1K')) {
          categoryTotals.KINGS += todayValue
        } else if (roomCode.startsWith('RM2QA')) {
          categoryTotals.VIQN += todayValue
        } else if (roomCode.startsWith('RM2Q')) {
          categoryTotals.QUEENS += todayValue
        }
      }
    }

    return { roomData, categoryTotals }
  }, [])

  // Parse GA Summary CSV
  const parseGASummaryCSV = useCallback((content: string) => {
    const lines = content.trim().split('\n')
    
    // Find today's column index (after "Total" and "Bottom Line")
    const todayColIndex = 2 // "Mon 04/27"
    
    const gaData: ParsedGAData = {
      occupancy: "0%",
      arrivals: 0,
      departures: 0,
      committed: 0,
      availability: 0,
      adr: "$0",
      totalRevenue: "$0",
      roomTotal: 0,
      adults: 0,
      children: 0,
      oooOtm: "0/0",
      groupsBeddedRemaining: 0,
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const values = line.match(/("([^"]*)"|[^,]+)/g)?.map(v => v.replace(/"/g, '').trim()) || []
      
      const metric = values[0]?.toLowerCase() || ''
      const todayValue = values[todayColIndex] || ''

      if (metric.includes('occupancy')) {
        gaData.occupancy = todayValue
      } else if (metric === 'adr') {
        gaData.adr = todayValue
      } else if (metric === 'total_revenue') {
        gaData.totalRevenue = todayValue
      } else if (metric === 'availability') {
        gaData.availability = parseInt(todayValue, 10) || 0
      } else if (metric === 'committed') {
        gaData.committed = parseInt(todayValue, 10) || 0
      } else if (metric === 'arrivals') {
        gaData.arrivals = parseInt(todayValue, 10) || 0
      } else if (metric === 'departures') {
        gaData.departures = parseInt(todayValue, 10) || 0
      } else if (metric === 'room_total') {
        gaData.roomTotal = parseInt(todayValue, 10) || 0
      } else if (metric === 'adults') {
        gaData.adults = parseInt(todayValue, 10) || 0
      } else if (metric === 'children') {
        gaData.children = parseInt(todayValue, 10) || 0
      } else if (metric.includes('ooo/otm')) {
        gaData.oooOtm = todayValue
      } else if (metric.includes('groups bedded')) {
        gaData.groupsBeddedRemaining = parseInt(todayValue, 10) || 0
      }
    }

    return gaData
  }, [])

  // Generate shuffle recommendations based on current inventory
  const generateRecommendations = useCallback((inv: Record<ConsolidatedCategory, number>) => {
    const recs: ShuffleRecommendation[] = []

    if (inv.KINGS < 0) {
      const oversold = Math.abs(inv.KINGS)
      
      if (inv.VIKG > 0) {
        const canMove = Math.min(oversold, inv.VIKG)
        recs.push({
          id: `kings-to-vikg-${Date.now()}`,
          fromCategory: "KINGS",
          toCategory: "VIKG",
          title: `Upgrade ${canMove} King Arrival${canMove > 1 ? 's' : ''} to View King`,
          description: `Move ${canMove} Standard King reservation${canMove > 1 ? 's' : ''} to View King (VIKG). Complimentary upgrade.`,
          completed: false,
        })
      }

      if (inv.SUITES > 0 && (inv.VIKG <= 0 || oversold > inv.VIKG)) {
        const remainingOversold = inv.VIKG > 0 ? oversold - inv.VIKG : oversold
        const canMove = Math.min(remainingOversold, inv.SUITES)
        recs.push({
          id: `kings-to-suites-${Date.now()}`,
          fromCategory: "KINGS",
          toCategory: "SUITES",
          title: `Upgrade ${canMove} King Arrival${canMove > 1 ? 's' : ''} to Suite`,
          description: `Move ${canMove} Standard King reservation${canMove > 1 ? 's' : ''} to Suite. Premium upgrade.`,
          completed: false,
        })
      }
    }

    if (inv.QUEENS < 0 && inv.VIQN > 0) {
      const oversold = Math.abs(inv.QUEENS)
      const canMove = Math.min(oversold, inv.VIQN)
      recs.push({
        id: `queens-to-viqn-${Date.now()}`,
        fromCategory: "QUEENS",
        toCategory: "VIQN",
        title: `Upgrade ${canMove} Queen Arrival${canMove > 1 ? 's' : ''} to View Queen`,
        description: `Move ${canMove} Standard Queen reservation${canMove > 1 ? 's' : ''} to View Queen (VIQN).`,
        completed: false,
      })
    }

    return recs
  }, [])

  // Process Room Availability file
  const processRoomAvailabilityFile = async () => {
    if (!roomAvailabilityFile) return

    setIsProcessingRoom(true)
    setParseError(null)

    try {
      const content = await roomAvailabilityFile.text()
      const { roomData, categoryTotals } = parseRoomAvailabilityCSV(content)
      
      setParsedRoomData(roomData)
      setInventory(categoryTotals)
      setRecommendations(generateRecommendations(categoryTotals))
      setRoomDataParsed(true)
      syncInventory()
    } catch (error) {
      setParseError("Failed to parse Room Availability CSV. Please check the file format.")
      console.error("[v0] Room CSV parse error:", error)
    } finally {
      setIsProcessingRoom(false)
    }
  }

  // Process GA Summary file
  const processGAFile = async () => {
    if (!gaReportFile) return

    setIsProcessingGA(true)
    setParseError(null)

    try {
      const content = await gaReportFile.text()
      const gaData = parseGASummaryCSV(content)
      
      setParsedGAData(gaData)
      
      // Update global metrics
      updateTodayMetrics({
        arrivals: gaData.arrivals,
        departures: gaData.departures,
        stayovers: Math.max(0, roomTotal - departures), // Approximate stayovers
        occupancy: gaData.occupancy,
      })
      
      setGaDataParsed(true)
      syncInventory()
    } catch (error) {
      setParseError("Failed to parse GA Summary CSV. Please check the file format.")
      console.error("[v0] GA CSV parse error:", error)
    } finally {
      setIsProcessingGA(false)
    }
  }

  // Handle file selection
  const handleRoomFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      setRoomAvailabilityFile(file)
      setRoomDataParsed(false)
    }
  }

  const handleGAFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      setGaReportFile(file)
      setGaDataParsed(false)
    }
  }

  // Adjust inventory manually
  const adjustInventory = (category: ConsolidatedCategory, delta: number) => {
    setInventory(prev => {
      const updated = { ...prev, [category]: prev[category] + delta }
      setRecommendations(generateRecommendations(updated))
      return updated
    })
  }

  // Execute a shuffle recommendation
  const executeShuffle = (rec: ShuffleRecommendation) => {
    setInventory(prev => {
      const updated = {
        ...prev,
        [rec.fromCategory]: prev[rec.fromCategory] + 1,
        [rec.toCategory]: prev[rec.toCategory] - 1,
      }
      return updated
    })

    setRecommendations(prev => 
      prev.map(r => r.id === rec.id ? { ...r, completed: true } : r)
    )
  }

  // Mark balance as complete
  const markBalanceComplete = () => {
    setIsBalanceComplete(true)
    syncInventory()
    onBalanceComplete?.()
  }

  const totalAvailable = Object.values(inventory).reduce((sum, val) => sum + val, 0)
  const hasOversold = Object.values(inventory).some(val => val < 0)
  const pendingRecommendations = recommendations.filter(r => !r.completed)
  const bothFilesProcessed = roomDataParsed && gaDataParsed

  return (
    <div className="space-y-4">
      {/* Metrics Summary Banner - Show when GA data is parsed */}
      {gaDataParsed && parsedGAData && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              {parsedGAData.occupancy !== "0%" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                  <Percent className="w-4 h-4 text-indigo-400" />
                  <span className="text-lg font-bold text-indigo-200">{parsedGAData.occupancy}</span>
                </div>
              )}
              <div className="text-xs text-slate-400">
                ADR: <span className="text-white font-medium">{parsedGAData.adr}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/15 rounded border border-green-500/25">
                <ArrowDownToLine className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300/80">Arr</span>
                <span className="text-sm font-bold text-green-300">{parsedGAData.arrivals}</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-red-500/15 rounded border border-red-500/25">
                <ArrowUpFromLine className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-300/80">Dep</span>
                <span className="text-sm font-bold text-red-300">{parsedGAData.departures}</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/15 rounded border border-blue-500/25">
                <Home className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300/80">Committed</span>
                <span className="text-sm font-bold text-blue-300">{parsedGAData.committed}</span>
              </div>
            </div>
          </div>
          {/* Additional GA metrics */}
          <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center gap-4 text-xs text-slate-400">
            <span>Room Total: <span className="text-white">{parsedGAData.roomTotal}</span></span>
            <span>Available: <span className="text-white">{parsedGAData.availability}</span></span>
            <span>OOO/OTM: <span className="text-white">{parsedGAData.oooOtm}</span></span>
            <span>Groups Remaining: <span className="text-white">{parsedGAData.groupsBeddedRemaining}</span></span>
            <span>Guests: <span className="text-white">{parsedGAData.adults} adults, {parsedGAData.children} children</span></span>
          </div>
        </div>
      )}

      {/* Two Column Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GA Summary Report Upload */}
        <Card className={cn(gaDataParsed && "border-green-300 bg-green-50/30")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className={cn("w-4 h-4", gaDataParsed ? "text-green-600" : "text-indigo-600")} />
              GA Summary Report
              {gaDataParsed && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
            </CardTitle>
            <CardDescription className="text-xs">
              Occupancy, Arrivals, Departures, Revenue
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2">
              <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>StayPMS</strong> → Reports → General Availability → Export CSV
              </p>
            </div>

            <div className={cn(
              "border-2 border-dashed rounded-lg p-3 text-center transition-all",
              gaReportFile ? (gaDataParsed ? "border-green-400 bg-green-50" : "border-indigo-400 bg-indigo-50") : "border-slate-300 bg-slate-50"
            )}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleGAFileSelect}
                className="hidden"
                id="ga-file-upload"
              />
              <label htmlFor="ga-file-upload" className="cursor-pointer block">
                <FileSpreadsheet className={cn(
                  "w-6 h-6 mx-auto mb-1",
                  gaReportFile ? (gaDataParsed ? "text-green-500" : "text-indigo-500") : "text-slate-400"
                )} />
                {gaReportFile ? (
                  <p className="text-xs font-medium text-slate-700">{gaReportFile.name}</p>
                ) : (
                  <p className="text-xs text-slate-500">Click to upload GA_SUMMARY.csv</p>
                )}
              </label>
            </div>

            {gaReportFile && !gaDataParsed && (
              <Button
                size="sm"
                onClick={processGAFile}
                disabled={isProcessingGA}
                className="w-full"
              >
                {isProcessingGA ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-2" />
                    Parse GA Report
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Room Availability Report Upload */}
        <Card className={cn(roomDataParsed && "border-green-300 bg-green-50/30")}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Upload className={cn("w-4 h-4", roomDataParsed ? "text-green-600" : "text-indigo-600")} />
              Room Availability Report
              {roomDataParsed && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
            </CardTitle>
            <CardDescription className="text-xs">
              Room types available by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="bg-amber-50 border border-amber-200 rounded p-2 flex items-start gap-2">
              <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>StayPMS</strong> → Dashboard → Room Types → Export CSV
              </p>
            </div>

            <div className={cn(
              "border-2 border-dashed rounded-lg p-3 text-center transition-all",
              roomAvailabilityFile ? (roomDataParsed ? "border-green-400 bg-green-50" : "border-indigo-400 bg-indigo-50") : "border-slate-300 bg-slate-50"
            )}>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleRoomFileSelect}
                className="hidden"
                id="room-file-upload"
              />
              <label htmlFor="room-file-upload" className="cursor-pointer block">
                <FileSpreadsheet className={cn(
                  "w-6 h-6 mx-auto mb-1",
                  roomAvailabilityFile ? (roomDataParsed ? "text-green-500" : "text-indigo-500") : "text-slate-400"
                )} />
                {roomAvailabilityFile ? (
                  <p className="text-xs font-medium text-slate-700">{roomAvailabilityFile.name}</p>
                ) : (
                  <p className="text-xs text-slate-500">Click to upload roomAvailability.csv</p>
                )}
              </label>
            </div>

            {roomAvailabilityFile && !roomDataParsed && (
              <Button
                size="sm"
                onClick={processRoomAvailabilityFile}
                disabled={isProcessingRoom}
                className="w-full"
              >
                {isProcessingRoom ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-2" />
                    Parse Room Report
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Parse Error */}
      {parseError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{parseError}</p>
        </div>
      )}

      {/* Inventory Dashboard - Show when room data is parsed */}
      {roomDataParsed && (
        <>
          {/* Inventory Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.entries(CONSOLIDATED_GROUPS) as [ConsolidatedCategory, typeof CONSOLIDATED_GROUPS[ConsolidatedCategory]][]).map(([key, group]) => {
              const count = inventory[key]
              const isOversold = count < 0
              const isUpgrade = group.isUpgrade

              return (
                <Card
                  key={key}
                  className={cn(
                    "relative overflow-hidden transition-all",
                    isOversold ? "border-red-400 bg-red-50" : "border-green-200 bg-green-50/50",
                    isUpgrade && "ring-1 ring-amber-300"
                  )}
                >
                  {isUpgrade && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded">
                      Upgrade
                    </div>
                  )}
                  <CardContent className="p-3">
                    <div className="text-xs font-medium text-slate-600 mb-1">{group.label}</div>
                    <div className={cn(
                      "text-2xl font-bold tabular-nums",
                      isOversold ? "text-red-600" : "text-green-600"
                    )}>
                      {count}
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => adjustInventory(key, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0"
                        onClick={() => adjustInventory(key, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Total and Status */}
          <div className="flex items-center justify-between bg-slate-100 rounded-lg px-4 py-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Total Available:</span>
              <span className={cn(
                "text-lg font-bold tabular-nums",
                totalAvailable < 10 ? "text-amber-600" : "text-slate-900"
              )}>
                {totalAvailable}
              </span>
            </div>
            {hasOversold ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Oversold categories detected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">House is balanced</span>
              </div>
            )}
          </div>

          {/* Shuffle Recommendations */}
          {pendingRecommendations.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm text-amber-700">
                  <Sparkles className="w-4 h-4" />
                  Shuffle Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {pendingRecommendations.map(rec => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between bg-white rounded-lg border border-amber-200 p-3"
                  >
                    <div>
                      <div className="font-medium text-sm text-slate-800">{rec.title}</div>
                      <div className="text-xs text-slate-500">{rec.description}</div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-400 text-amber-700 hover:bg-amber-100"
                      onClick={() => executeShuffle(rec)}
                    >
                      Execute
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Parsed Room Data Detail */}
          {parsedRoomData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Room Type Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {parsedRoomData.map((room, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 rounded px-2 py-1">
                      <span className="text-slate-600 truncate max-w-[200px]">{room.roomCode}</span>
                      <span className={cn(
                        "font-medium tabular-nums",
                        room.todayAvailable < 0 ? "text-red-600" : "text-green-600"
                      )}>
                        {room.todayAvailable}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Complete Button */}
          {!isBalanceComplete && !hasOversold && (
            <Button
              className="w-full bg-green-600 hover:bg-green-700"
              onClick={markBalanceComplete}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Confirm House Balance & Continue
            </Button>
          )}

          {isBalanceComplete && (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">House balance confirmed</span>
            </div>
          )}
        </>
      )}
    </div>
  )
}



