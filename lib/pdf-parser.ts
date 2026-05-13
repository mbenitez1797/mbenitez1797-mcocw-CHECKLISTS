import type { HousekeepingForecast, ParsedReportData } from './types'

// Room type code mapping based on the Agilysys report format
const ROOM_TYPE_CODES: Record<string, string> = {
  'ROH': 'Run of House',
  'RM1K0007': 'Deluxe Room, 1 King Bed, Sofa bed',
  'RM2QA003': 'Deluxe Room, 2 Queen Beds, Water View',
  'RM1K0006': 'Deluxe Room, 1 King Bed, Sofa bed, Hearing Accessible',
  'RM2Q0002': 'Deluxe Room, 2 Queen Beds',
  'RM1KA009': 'Deluxe Room, 1 King Bed, Sofa bed, Mobility Accessible with Roll-In Shower',
  'SU1B0010': '1 Bedroom Suite, 1 King Bed, Sitting Area, Sofa bed',
  'SU1BA011': '1 Bedroom Suite, 1 King Bed, Sitting Area, Hearing Accessible, Mobility Accessible with Bathtub, Sofa bed',
  'RM1KA008': 'Deluxe Room, 1 King Bed, Water View, Sofa bed',
  'RM2QA004': 'Deluxe Room, 2 Queen Beds, Water View, Hearing Accessible',
  'RM2QA005': 'Deluxe Room, 2 Queen Beds, Water View, Mobility Accessible with Bathtub',
  'RM2Q0001': 'Deluxe Room, 2 Queen Beds, Water View, Mobility Accessible with Roll-In Shower',
}

const MONTH_MAP: Record<string, string> = {
  'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
  'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
  'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
}

function parseDate(dateStr: string): string | null {
  const cleanDate = dateStr.replace(/\s+/g, ' ').replace(/,/g, '').trim()
  
  // Match patterns like "May 13 2026" or "May 13, 2026"
  const match = cleanDate.match(/(\w{3})\s*(\d{1,2})\s*(\d{4})/)
  if (match) {
    const [, month, day, year] = match
    const monthNum = MONTH_MAP[month]
    if (monthNum) {
      return `${year}-${monthNum}-${day.padStart(2, '0')}`
    }
  }
  
  return null
}

function normalizeRoomTypeName(parts: string[]): string {
  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/,\s+/g, ', ')
    .replace(/\s,/g, ',')
    .trim()
}

interface DataRow {
  date: string
  roomType: string
  numbers: number[]
}

export function parseHousekeepingReport(text: string): ParsedReportData {
  const forecasts: HousekeepingForecast[] = []
  const seenRecords = new Set<string>()
  
  let propertyName = 'Courtyard By Marriott Winter Haven'
  let startDate = ''
  let endDate = ''
  let reportDate = ''
  
  // Extract header info
  const headerMatch = text.match(/Agilysys Stay\s*-\s*([^\n]+)/)
  if (headerMatch) {
    propertyName = headerMatch[1].trim()
  }
  
  const dateRangeMatch = text.match(/start date\s*([\w\s,]+)\s*\|\|\s*end date\s*([\w\s,]+)/i)
  if (dateRangeMatch) {
    startDate = parseDate(dateRangeMatch[1]) || ''
    endDate = parseDate(dateRangeMatch[2]) || ''
  }
  
  const reportDateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s*\d{1,2}:\d{2}/i)
  if (reportDateMatch) {
    const parts = reportDateMatch[1].split('/')
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
    reportDate = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
  }

  // Strategy: Find all rows with 9 consecutive numbers, then look backwards for date and room type
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  // First pass: find lines containing exactly 9 numbers (the data values)
  const numberPattern = /^[\d\s]+$/
  const dataRows: DataRow[] = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // Skip header rows, URLs, and page numbers
    if (line.includes('DATE') || line.includes('ROOM TYPE') || 
        line.includes('ARRIVALS') || line.includes('https://') ||
        line.match(/^\d+\/\d+$/) || line.includes('DEPARTURES')) {
      continue
    }
    
    // Look for lines that contain the 9 numbers
    // Pattern: numbers embedded in text like "13, 1 King Bed, 10 10 11 12 19 21 0 0 0"
    const numbers = line.match(/\d+/g)
    if (numbers && numbers.length >= 9) {
      // This line contains data values
      // Look backwards to build the context (date and room type)
      
      let dateContext = ''
      let roomTypeContext: string[] = []
      let year = '2026'
      
      // Look at the current line and surrounding lines for context
      const contextWindow = lines.slice(Math.max(0, i - 5), i + 3).join(' ')
      
      // Extract date from context
      const monthMatch = contextWindow.match(/(May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr)\s*(\d{1,2})[,\s]*(?:(\d{4})|$)/i)
      if (monthMatch) {
        const month = monthMatch[1]
        const day = monthMatch[2]
        // Look for year
        const yearMatch = contextWindow.match(/\b(2024|2025|2026|2027)\b/)
        if (yearMatch) {
          year = yearMatch[1]
        }
        dateContext = parseDate(`${month} ${day} ${year}`) || ''
      }
      
      // Extract room type from context
      const roomTypeKeywords = [
        'Deluxe Room', '1 Bedroom Suite', 'Suite',
        '1 King Bed', '2 Queen Beds', 'King Bed', 'Queen',
        'Sofa bed', 'Water View', 'Hearing Accessible', 
        'Mobility Accessible', 'Roll-In Shower', 'Bathtub',
        'Sitting Area'
      ]
      
      // Check the line itself and previous lines for room type info
      for (let j = Math.max(0, i - 4); j <= i; j++) {
        const checkLine = lines[j]
        for (const keyword of roomTypeKeywords) {
          if (checkLine.includes(keyword) && !roomTypeContext.includes(keyword)) {
            // Extract the relevant part
            const match = checkLine.match(new RegExp(`(${keyword}[^\\d]*)`, 'i'))
            if (match) {
              roomTypeContext.push(match[1].replace(/[,\s]+$/, ''))
            }
          }
        }
      }
      
      // Get the 9 numbers from the end of the array
      const dataNumbers = numbers.slice(-9).map(n => parseInt(n, 10))
      
      if (dateContext && roomTypeContext.length > 0) {
        const roomTypeName = normalizeRoomTypeName(roomTypeContext)
        const recordKey = `${dateContext}|${roomTypeName}`
        
        if (!seenRecords.has(recordKey) && dataNumbers.length === 9) {
          seenRecords.add(recordKey)
          dataRows.push({
            date: dateContext,
            roomType: roomTypeName,
            numbers: dataNumbers
          })
        }
      }
    }
  }

  // Alternative approach: scan for the specific pattern in the OCR output
  // Pattern like: "May\n13,\n2026" followed by room type parts, then numbers
  const textBlocks = text.split(/(?=May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr)/i)
  
  for (const block of textBlocks) {
    if (block.length < 10) continue
    
    // Try to extract date
    const dateMatch = block.match(/^(May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr)\s*(\d{1,2})[,\s]*/i)
    if (!dateMatch) continue
    
    const month = dateMatch[1]
    const day = dateMatch[2]
    
    // Find year
    let year = '2026'
    const yearMatch = block.match(/\b(2024|2025|2026|2027)\b/)
    if (yearMatch) {
      year = yearMatch[1]
    }
    
    const dateStr = parseDate(`${month} ${day} ${year}`)
    if (!dateStr) continue
    
    // Extract numbers (looking for patterns of 9 consecutive)
    const allNumbers = block.match(/\d+/g)
    if (!allNumbers || allNumbers.length < 9) continue
    
    // Find the data sequence (typically after room type text)
    // Look for a sequence of 9 numbers that starts after the date/day portion
    let numbersStartIdx = 0
    for (let i = 0; i < allNumbers.length - 8; i++) {
      // Skip if this is likely the day or year
      if (allNumbers[i] === day || allNumbers[i] === year) {
        continue
      }
      // Check if next 9 are the data (should include small numbers and possibly 0s)
      const candidateNumbers = allNumbers.slice(i, i + 9).map(n => parseInt(n, 10))
      const hasReasonableValues = candidateNumbers.every(n => n >= 0 && n < 1000)
      const hasZeros = candidateNumbers.some(n => n === 0)
      
      if (hasReasonableValues && hasZeros) {
        numbersStartIdx = i
        break
      }
    }
    
    const dataNumbers = allNumbers.slice(numbersStartIdx, numbersStartIdx + 9).map(n => parseInt(n, 10))
    if (dataNumbers.length !== 9) continue
    
    // Extract room type
    const roomTypeWords: string[] = []
    const textParts = block.split(/\d+/).map(s => s.trim()).filter(s => s.length > 1)
    
    for (const part of textParts) {
      const cleaned = part.replace(/[,\s]+/g, ' ').trim()
      if (cleaned.includes('Deluxe') || cleaned.includes('Suite') || 
          cleaned.includes('King') || cleaned.includes('Queen') ||
          cleaned.includes('Accessible') || cleaned.includes('Sofa') ||
          cleaned.includes('View') || cleaned.includes('Bedroom') ||
          cleaned.includes('Sitting') || cleaned.includes('Area') ||
          cleaned.includes('Bathtub') || cleaned.includes('Shower') ||
          cleaned.includes('Mobility') || cleaned.includes('Hearing') ||
          cleaned.includes('Roll-In') || cleaned.includes('bed')) {
        roomTypeWords.push(cleaned)
      }
    }
    
    if (roomTypeWords.length > 0) {
      const roomTypeName = normalizeRoomTypeName(roomTypeWords)
      const recordKey = `${dateStr}|${roomTypeName}`
      
      if (!seenRecords.has(recordKey)) {
        seenRecords.add(recordKey)
        forecasts.push({
          forecast_date: dateStr,
          room_type_name: roomTypeName,
          arrivals: dataNumbers[0],
          arriving_guests: dataNumbers[1],
          departures: dataNumbers[2],
          departing_guests: dataNumbers[3],
          stay_overs: dataNumbers[4],
          stay_over_guests: dataNumbers[5],
          otm: dataNumbers[6],
          o00: dataNumbers[7],
          rooms_on_hold: dataNumbers[8],
        })
      }
    }
  }

  // Add records from first pass
  for (const row of dataRows) {
    const recordKey = `${row.date}|${row.roomType}`
    if (!seenRecords.has(recordKey)) {
      seenRecords.add(recordKey)
      forecasts.push({
        forecast_date: row.date,
        room_type_name: row.roomType,
        arrivals: row.numbers[0],
        arriving_guests: row.numbers[1],
        departures: row.numbers[2],
        departing_guests: row.numbers[3],
        stay_overs: row.numbers[4],
        stay_over_guests: row.numbers[5],
        otm: row.numbers[6],
        o00: row.numbers[7],
        rooms_on_hold: row.numbers[8],
      })
    }
  }

  return {
    reportDate,
    startDate,
    endDate,
    propertyName,
    forecasts: forecasts.sort((a, b) => 
      a.forecast_date.localeCompare(b.forecast_date) || 
      a.room_type_name.localeCompare(b.room_type_name)
    ),
  }
}

// Simpler line-by-line parser for cleaner formats
export function parseStructuredData(text: string): ParsedReportData {
  const forecasts: HousekeepingForecast[] = []
  const seenRecords = new Set<string>()
  
  const propertyMatch = text.match(/Courtyard By Marriott[^\n]*/i)
  const propertyName = propertyMatch ? propertyMatch[0].trim() : 'Unknown Property'
  
  let startDate = ''
  let endDate = ''
  const dateRangeMatch = text.match(/start date\s*([\w\s,]+)\s*\|\|\s*end date\s*([\w\s,]+)/i)
  if (dateRangeMatch) {
    startDate = parseDate(dateRangeMatch[1]) || ''
    endDate = parseDate(dateRangeMatch[2]) || ''
  }
  
  let reportDate = ''
  const reportDateMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{2,4})/i)
  if (reportDateMatch) {
    const parts = reportDateMatch[1].split('/')
    const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2]
    reportDate = `${year}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
  }

  // Use regex to find data patterns
  // Pattern: Month Day, Year or Month Day followed by room type and 9 numbers
  const dataPattern = /(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/g
  let match
  let currentDate: string | null = null
  let lastPosition = 0
  
  while ((match = dataPattern.exec(text)) !== null) {
    // Look backwards from this match for date context
    const beforeText = text.slice(lastPosition, match.index)
    
    // Find the most recent date mention
    const dateMatches = beforeText.matchAll(/(May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|Jan|Feb|Mar|Apr)\s*(\d{1,2})[,\s]*(\d{4})?/gi)
    for (const dm of dateMatches) {
      const month = dm[1]
      const day = dm[2]
      let year = dm[3] || '2026'
      if (!dm[3]) {
        const yearMatch = beforeText.match(/\b(2024|2025|2026|2027)\b/)
        if (yearMatch) year = yearMatch[1]
      }
      currentDate = parseDate(`${month} ${day} ${year}`)
    }
    
    if (currentDate) {
      // Extract room type from before the numbers
      const roomTypeText = beforeText.slice(-300)
      const roomTypeParts: string[] = []
      
      const keywords = ['Deluxe Room', '1 Bedroom Suite', 'King Bed', 'Queen Beds', 
                        'Sofa bed', 'Water View', 'Hearing Accessible', 
                        'Mobility Accessible', 'Roll-In Shower', 'Bathtub',
                        'Sitting Area', 'with']
      
      for (const kw of keywords) {
        if (roomTypeText.includes(kw)) {
          roomTypeParts.push(kw)
        }
      }
      
      if (roomTypeParts.length > 0) {
        const roomTypeName = normalizeRoomTypeName(roomTypeParts)
        const recordKey = `${currentDate}|${roomTypeName}`
        
        if (!seenRecords.has(recordKey)) {
          seenRecords.add(recordKey)
          forecasts.push({
            forecast_date: currentDate,
            room_type_name: roomTypeName,
            arrivals: parseInt(match[1], 10),
            arriving_guests: parseInt(match[2], 10),
            departures: parseInt(match[3], 10),
            departing_guests: parseInt(match[4], 10),
            stay_overs: parseInt(match[5], 10),
            stay_over_guests: parseInt(match[6], 10),
            otm: parseInt(match[7], 10),
            o00: parseInt(match[8], 10),
            rooms_on_hold: parseInt(match[9], 10),
          })
        }
      }
    }
    
    lastPosition = match.index + match[0].length
  }
  
  return {
    reportDate,
    startDate,
    endDate,
    propertyName,
    forecasts: forecasts.sort((a, b) => 
      a.forecast_date.localeCompare(b.forecast_date) || 
      a.room_type_name.localeCompare(b.room_type_name)
    ),
  }
}

export { ROOM_TYPE_CODES }
