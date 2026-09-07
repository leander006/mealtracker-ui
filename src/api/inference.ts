import { apiClient } from './client'
import type { ScanResponse } from '@/types/inference'

export async function scanMealImage(imageFile: File): Promise<ScanResponse> {
  const formData = new FormData()
  formData.append('image', imageFile)
  const { data } = await apiClient.post<ScanResponse>('/api/inference/scan', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return data
}
