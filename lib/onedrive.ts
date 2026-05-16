import { Client } from '@microsoft/microsoft-graph-client'
import { ClientSecretCredential } from '@azure/identity'
import { TokenCredentialAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials'
import type { ChecklistType, ChecklistSubmission } from './email'

const checklistFolderNames: Record<ChecklistType, string> = {
  am: 'AM Shift Checklists',
  pm: 'PM Shift Checklists',
  night: 'Night Audit Checklists',
  admin: 'Admin Checklists',
  agm: 'AGM Checklists',
  gm: 'GM Checklists',
  sales: 'Sales Checklists',
  housekeeping: 'Housekeeping Checklists',
  engineering: 'Engineering Checklists',
}

function getGraphClient(): Client | null {
  const tenantId = process.env.MICROSOFT_TENANT_ID
  const clientId = process.env.MICROSOFT_CLIENT_ID
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET

  if (!tenantId || !clientId || !clientSecret) {
    console.error('Microsoft Graph credentials not configured')
    return null
  }

  const credential = new ClientSecretCredential(tenantId, clientId, clientSecret)
  
  const authProvider = new TokenCredentialAuthenticationProvider(credential, {
    scopes: ['https://graph.microsoft.com/.default'],
  })

  return Client.initWithMiddleware({
    authProvider,
  })
}

async function ensureFolderExists(client: Client, userId: string, folderPath: string): Promise<string | null> {
  try {
    // Try to get the folder first
    const folder = await client
      .api(`/users/${userId}/drive/root:/${folderPath}`)
      .get()
    return folder.id
  } catch {
    // Folder doesn't exist, create it
    try {
      const pathParts = folderPath.split('/')
      let currentPath = ''
      let parentId = 'root'

      for (const part of pathParts) {
        currentPath = currentPath ? `${currentPath}/${part}` : part
        
        try {
          const existingFolder = await client
            .api(`/users/${userId}/drive/root:/${currentPath}`)
            .get()
          parentId = existingFolder.id
        } catch {
          // Create this folder
          const newFolder = await client
            .api(`/users/${userId}/drive/items/${parentId}/children`)
            .post({
              name: part,
              folder: {},
              '@microsoft.graph.conflictBehavior': 'rename',
            })
          parentId = newFolder.id
        }
      }
      
      return parentId
    } catch (error) {
      console.error('Error creating folder:', error)
      return null
    }
  }
}

export async function saveChecklistToOneDrive(
  submission: ChecklistSubmission
): Promise<{ success: boolean; fileUrl?: string; error?: string }> {
  const client = getGraphClient()
  
  if (!client) {
    return { success: false, error: 'Microsoft Graph client not configured' }
  }

  const userId = process.env.ONEDRIVE_USER_ID
  if (!userId) {
    return { success: false, error: 'OneDrive user ID not configured' }
  }

  const baseFolder = process.env.ONEDRIVE_CHECKLIST_FOLDER || 'Front Desk Checklists'
  const checklistFolder = checklistFolderNames[submission.checklistType]
  const yearMonth = new Date(submission.date).toISOString().slice(0, 7) // YYYY-MM
  const folderPath = `${baseFolder}/${checklistFolder}/${yearMonth}`

  try {
    // Ensure the folder exists
    const folderId = await ensureFolderExists(client, userId, folderPath)
    
    if (!folderId) {
      return { success: false, error: 'Failed to create folder structure' }
    }

    // Create filename
    const timestamp = new Date(submission.submittedAt).toISOString().replace(/[:.]/g, '-')
    const safeName = submission.associateName.replace(/[^a-zA-Z0-9]/g, '_')
    const fileName = `${submission.date}_${safeName}_${timestamp}.json`

    // Upload the file
    const fileContent = JSON.stringify(submission, null, 2)
    
    const uploadedFile = await client
      .api(`/users/${userId}/drive/items/${folderId}:/${fileName}:/content`)
      .put(fileContent)

    return { 
      success: true, 
      fileUrl: uploadedFile.webUrl 
    }
  } catch (error) {
    console.error('OneDrive upload error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function getSavedChecklists(
  checklistType: ChecklistType,
  yearMonth?: string
): Promise<{ success: boolean; files?: Array<{ name: string; url: string; createdAt: string }>; error?: string }> {
  const client = getGraphClient()
  
  if (!client) {
    return { success: false, error: 'Microsoft Graph client not configured' }
  }

  const userId = process.env.ONEDRIVE_USER_ID
  if (!userId) {
    return { success: false, error: 'OneDrive user ID not configured' }
  }

  const baseFolder = process.env.ONEDRIVE_CHECKLIST_FOLDER || 'Front Desk Checklists'
  const checklistFolder = checklistFolderNames[checklistType]
  const folderPath = yearMonth 
    ? `${baseFolder}/${checklistFolder}/${yearMonth}`
    : `${baseFolder}/${checklistFolder}`

  try {
    const response = await client
      .api(`/users/${userId}/drive/root:/${folderPath}:/children`)
      .get()

    const files = response.value
      .filter((item: { file?: object }) => item.file)
      .map((item: { name: string; webUrl: string; createdDateTime: string }) => ({
        name: item.name,
        url: item.webUrl,
        createdAt: item.createdDateTime,
      }))

    return { success: true, files }
  } catch (error) {
    console.error('OneDrive list error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}



