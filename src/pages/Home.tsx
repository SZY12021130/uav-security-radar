import { useDataset } from '@/hooks/useDataset'
import Hero from '@/sections/Hero'
import Dashboard from '@/sections/Dashboard'
import VenueExplorer from '@/sections/VenueExplorer'

export default function Home() {
  const { data, error } = useDataset()

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-400">数据加载失败：{error}</div>
  }
  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
          正在加载文献数据…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Hero data={data} />
      <Dashboard data={data} />
      <VenueExplorer venues={data.venues} />
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-600">
        数据来源：OpenAlex / dblp / Semantic Scholar · CCF 推荐目录（第七版，2026年3月）· 覆盖 {data.range}
        <br />
        无人机安全 × 密码学 × 人工智能 · 生成于 {data.generated}
      </footer>
    </div>
  )
}
