import { http } from '@/shared/api'

export interface FeedbackValues {
  name: string
  message: string
}

export interface FeedbackResult {
  success: boolean
  receivedMessage: string
}

interface FeedbackResultDto {
  success: boolean
  received_message: string
}

export async function submitFeedback(values: FeedbackValues): Promise<FeedbackResult> {
  const { data } = await http.post<FeedbackResultDto>('/api/demo/feedback', values)
  return { success: data.success, receivedMessage: data.received_message }
}
