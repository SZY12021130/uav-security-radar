import { useEffect, useRef, useState } from 'react'
import type { Dataset } from '@/types/dataset'

function Counter({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const ref = useRef<number>(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration)
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current!)
  }, [target, duration])
  return <span>{val}</span>
}

export default function Hero({ data }: { data: Dataset }) {
  const journals = data.venues.filter((v) => v.type === 'journal')
  const confs = data.venues.filter((v) => v.type === 'conference')
  const top = data.venues[0]
  const stats = [
    { label: '收录论文', value: data.total, suffix: '篇' },
    { label: 'CCF 期刊', value: journals.length, suffix: '种' },
    { label: 'CCF 会议', value: confs.length, suffix: '个' },
    { label: '高产榜首', value: top?.count ?? 0, suffix: ` · ${top?.short ?? ''}` },
  ]
  return (
    <header className="relative overflow-hidden border-b border-slate-800">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.12),transparent_60%)]" />
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex items-center gap-3 text-sky-400 text-sm font-medium tracking-widest">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          UAV SECURITY LITERATURE RADAR
        </div>
        <h1 className="mt-4 text-4xl font-bold text-slate-50 md:text-5xl">
          无人机安全文献雷达
        </h1>
        <p className="mt-4 max-w-2xl text-slate-400 leading-relaxed">
          基于 CCF 推荐目录（第七版 · 2026年3月），聚合 <span className="text-slate-200">{data.range}</span> 期间
          网络与信息安全、计算机网络、人工智能等领域期刊/会议上发表的无人机安全研究论文，
          重点关注密码学与 AI 相结合的方向。数据抓取于 {data.generated}。
        </p>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
              <div className="text-3xl font-bold text-slate-50">
                <Counter target={s.value} />
                <span className="ml-1 text-sm font-normal text-sky-400">{s.suffix}</span>
              </div>
              <div className="mt-1 text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
