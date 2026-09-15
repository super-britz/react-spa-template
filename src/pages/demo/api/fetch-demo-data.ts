import { http } from '@/shared/api'

export interface DemoItem {
  name: string
  kind: string
}

export interface DemoData {
  id: string
  generatedAt: string
  items: DemoItem[]
}

// 后端 DTO 只允许出现在本文件
interface DemoDataDto {
  id: string
  generated_at: string
  framework_list: { name: string; type: string }[]
}

function mapDemoData(dto: DemoDataDto): DemoData {
  return {
    id: dto.id,
    generatedAt: dto.generated_at,
    items: dto.framework_list.map((item) => ({ name: item.name, kind: item.type })),
  }
}

export async function fetchDemoData(): Promise<DemoData> {
  const { data } = await http.get<DemoDataDto>('/api/demo/data')
  return mapDemoData(data)
}
