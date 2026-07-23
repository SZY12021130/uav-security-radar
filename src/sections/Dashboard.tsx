import { useMemo, useState } from 'react'
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, LabelList,
} from 'recharts'
import type { Dataset } from '@/types/dataset'
import { LEVEL_STYLE, TAG_COLORS } from '@/types/dataset'

const tooltipStyle = {
  backgroundColor: '#0f172a',
  border: '1px solid #334155',
  borderRadius: 8,
  fontSize: 13,
}

export default function Dashboard({ data }: { data: Dataset }) {
  const [topN, setTopN] = useState(15)

  const ranking = useMemo(
    () => data.venues.slice(0, topN).map((v) => ({
      name: v.short, count: v.count, level: v.level, type: v.type === 'journal' ? '期刊' : '会议',
    })),
    [data, topN],
  )

  const yearTrend = useMemo(() => {
    const top = data.venues.slice(0, 8)
    return ['2024', '2025', '2026'].map((y) => {
      const row: Record<string, string | number> = { year: `${y}年` }
      top.forEach((v) => { row[v.short] = v.years[y] ?? 0 })
      return row
    })
  }, [data])
  const top8 = data.venues.slice(0, 8)

  const tagDist = useMemo(() => {
    const m = new Map<string, number>()
    data.venues.forEach((v) => v.papers.forEach((p) => {
      m.set(p.tags[0], (m.get(p.tags[0]) ?? 0) + 1)
    }))
    return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [data])

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="text-2xl font-bold text-slate-100">统计总览</h2>
      <p className="mt-1 text-sm text-slate-500">哪个期刊/会议发文最多？按数量排序，一目了然。</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        {/* 期刊/会议排行 */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-200">发文量排行</h3>
            <div className="flex gap-2">
              {[10, 15, 27].map((n) => (
                <button
                  key={n}
                  onClick={() => setTopN(n)}
                  className={`rounded-md px-2.5 py-1 text-xs transition ${topN === n ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Top {n === 27 ? '全部' : n}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: Math.max(360, ranking.length * 34) }} className="mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranking} layout="vertical" margin={{ left: 8, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                <XAxis type="number" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={130} stroke="#475569" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v: number, _n, item) => [`${v} 篇`, `${item.payload.type} · CCF-${item.payload.level}`]}
                />
                <Bar isAnimationActive={false} dataKey="count" radius={[0, 4, 4, 0]}>
                  {ranking.map((r) => (
                    <Cell key={r.name} fill={LEVEL_STYLE[r.level].bar} fillOpacity={0.85} />
                  ))}
                  <LabelList dataKey="count" position="right" fill="#94a3b8" fontSize={12} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex gap-4 text-xs text-slate-500">
            {(['A', 'B', 'C'] as const).map((l) => (
              <span key={l} className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: LEVEL_STYLE[l].bar }} />
                CCF-{l}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* 年份趋势 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-semibold text-slate-200">Top 8 期刊/会议 · 年份趋势</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="year" stroke="#475569" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {top8.map((v, i) => (
                    <Bar isAnimationActive={false} key={v.short} dataKey={v.short} stackId="a" fill={TAG_COLORS[i % TAG_COLORS.length]} fillOpacity={0.85} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          {/* 研究方向分布 */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="font-semibold text-slate-200">研究方向分布（按论文主标签）</h3>
            <div className="mt-2 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie isAnimationActive={false}
                    data={tagDist}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                  >
                    {tagDist.map((t, i) => (
                      <Cell key={t.name} fill={TAG_COLORS[i % TAG_COLORS.length]} fillOpacity={0.9} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v} 篇`, name]} />
                  <Legend wrapperStyle={{ fontSize: 12 }} layout="vertical" align="right" verticalAlign="middle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
