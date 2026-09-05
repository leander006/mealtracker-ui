import { apiClient } from './client'
import type { ScanResponse } from '@/types/inference'

export async function scanMealImage(imageFile: File): Promise<ScanResponse> {
  const formData = new FormData()
  formData.append('image', imageFile)

  const { data } = await apiClient.post<ScanResponse>('/api/inference/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    // Scanning involves classifier + LLM + USDA calls chained together -
    // give it real headroom, especially since Render free-tier services
    // may be cold-starting.
    timeout: 60000,
  })
  return data
}
