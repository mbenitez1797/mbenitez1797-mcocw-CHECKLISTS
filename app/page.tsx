'use client'

import { useState, useCallback } from 'react'
import useSWR, { mutate } from 'swr'
import { ReportUpload } from '@/components/report-upload'
import { ForecastTable } from '@/components/forecast-table'
import { SummaryCards } from '@/components/summary-cards'
import { DataValidationReport } from '@/components/data-validation-report'
import { ReconciliationReport } from '@/components/reconciliation-report'
import { 
  Upload, 
  BarChart3, 
  Table, 
  RefreshCw,
  FileText,
  AlertTriangle
} from 'lucide-react'
import type { HousekeepingForecast, UploadResult } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

type Tab = 'upload' | 'dashboard' | 'data' | 'validation' | 'reconciliation'

interface SummaryData {
  date: string
  totalArrivals: number
  totalArrivingGuests: number
  totalDepartures: number
  totalDepartingGuests: number
  totalStayOvers: number
  totalStayOverGuests: number
  totalOTM: number
  totalO00: number
  totalRoomsOnHold: number
  roomTypeCount: number
}

interface SummaryResponse {
  summary: SummaryData[]
  roomTypes: string[]
  dates: string[]
  totalRecords: number
}

interface ForecastResponse {
  data: HousekeepingForecast[]
}

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [selectedDate, setSelectedDate] = useState<string>('')

  const { data: summaryData, error: summaryError, isLoading: summaryLoading } = useSWR<SummaryResponse>(
    '/api/summary',
    fetcher,
    { refreshInterval: 0 }
  )

  const { data: forecastData, error: forecastError, isLoading: forecastLoading } = useSWR<ForecastResponse>(
    selectedDate ? `/api/forecasts?startDate=${selectedDate}&endDate=${selectedDate}` : '/api/forecasts',
    fetcher,
    { refreshInterval: 0 }
  )

  const handleUploadComplete = useCallback((result: UploadResult) => {
    // Refresh data after successful upload
    mutate('/api/summary')
    mutate('/api/forecasts')
    
    // Switch to dashboard tab to show the results
    if (result.recordsProcessed > 0) {
      setActiveTab('dashboard')
    }
  }, [])

  const handleDeleteForecast = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/forecasts?id=${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        mutate('/api/summary')
        mutate('/api/forecasts')
      }
    } catch (error) {
      console.error('[v0] Delete error:', error)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    mutate('/api/summary')
    mutate('/api/forecasts')
  }, [])

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(prevDate => prevDate === date ? '' : date)
  }, [])

  const tabs = [
    { id: 'upload' as Tab, label: 'Upload Report', icon: Upload },
    { id: 'dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
    { id: 'data' as Tab, label: 'All Data', icon: Table },
    { id: 'validation' as Tab, label: 'Data Validation', icon: AlertTriangle },
    { id: 'reconciliation' as Tab, label: 'Reconciliation', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Housekeeping Forecast</h1>
                <p className="text-xs text-muted-foreground">AGM Checklist Upload System</p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${activeTab === tab.id 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }
                `}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'data' && summaryData?.totalRecords ? (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-muted rounded-full">
                    {summaryData.totalRecords}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error States */}
        {(summaryError || forecastError) && (
          <div className="mb-6 flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">Error loading data</p>
              <p className="text-sm text-destructive/80">
                Please check your connection and try refreshing.
              </p>
            </div>
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Housekeeping Report</h2>
              <p className="text-muted-foreground">
                Upload your Agilysys Housekeeping Forecasting report. The system will parse the data,
                update existing records, and add new dates automatically.
              </p>
            </div>
            
            <ReportUpload onUploadComplete={handleUploadComplete} />

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-6">
              <h3 className="font-semibold mb-3">How it works</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">1.</span>
                  Upload your Agilysys Housekeeping Forecasting report (PDF or text file)
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">2.</span>
                  The system parses dates, room types, arrivals, departures, and stay-overs
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">3.</span>
                  Existing records are updated; new dates are added automatically
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-primary">4.</span>
                  View your data in the Dashboard or All Data tabs
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Forecast Dashboard</h2>
              <p className="text-muted-foreground">
                Overview of housekeeping forecast data. Click a date card to filter the table below.
              </p>
            </div>

            {summaryLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : summaryData?.summary && summaryData.summary.length > 0 ? (
              <>
                <SummaryCards 
                  summary={summaryData.summary}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
                
                {selectedDate && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">
                        Details for {selectedDate}
                      </h3>
                      <button
                        onClick={() => setSelectedDate('')}
                        className="text-sm text-primary hover:underline"
                      >
                        Clear filter
                      </button>
                    </div>
                    <ForecastTable 
                      forecasts={forecastData?.data || []}
                      isLoading={forecastLoading}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No forecast data available</p>
                <p className="text-sm mt-1">Upload a report to get started</p>
              </div>
            )}
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Forecast Data</h2>
              <p className="text-muted-foreground">
                Complete view of all housekeeping forecast records. Use filters to narrow down the data.
              </p>
            </div>

            <ForecastTable 
              forecasts={forecastData?.data || []}
              onDelete={handleDeleteForecast}
              isLoading={forecastLoading}
            />
          </div>
        )}

        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Data Validation</h2>
              <p className="text-muted-foreground">
                Validate the integrity and accuracy of your housekeeping forecast data. 
                This tool checks for common errors and inconsistencies.
              </p>
            </div>

            <DataValidationReport />
          </div>
        )}

        {/* Reconciliation Tab */}
        {activeTab === 'reconciliation' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Reconciliation Report</h2>
              <p className="text-muted-foreground">
                Compare current data with previous uploads to identify changes and verify data integrity.
              </p>
            </div>

            <ReconciliationReport />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-muted-foreground text-center">
            Housekeeping Forecast System - Maintaining data integrity between AGM checklist and inventory
          </p>
        </div>
      </footer>
    </div>
  )
}
