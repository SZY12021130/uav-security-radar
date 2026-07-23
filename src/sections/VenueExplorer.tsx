import { useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import type { Paper, Venue } from '@/types/dataset'
import { LEVEL_STYLE, TAG_COLORS } from '@/types/dataset'

const PAGE_SIZE = 9
const YEARS = ['2024', '2025', '2026']

type SortKey = 'year-desc' | 'year-asc' | 'cited'

function matchPaper(p: Paper, q: string) {
  if (!q) return true
  const s = `${p.title} ${p.abstract} ${p.authors.join(' ')} ${p.keywords.join(' ')} ${p.tags.join(' ')}`.toLowerCase()
  return q.toLowerCase().split(/\s+/).every((w) => s.includes(w))
}

function PaperCard({ p }: { p: Paper }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-4 transition hover:border-slate-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={p.doi ? `https://doi.org/${p.doi}` : undefined}
            target="_blank"
            rel="noreferrer"
            className="font-medium leading-snug text-slate-100 hover:text-sky-300"
          >
            {p.title}
          </a>
          <div className="mt-1 truncate text-xs text-slate-500">
            {p.authors.slice(0, 5).join(', ')}{p.authors.length > 5 ? ' et al.' : ''}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="rounded bg-sky-500/15 px-2 py-0.5 text-xs font-semibold text-sky-300">{p.year}</span>
          {p.cited > 0 && <span className="text-xs text-slate-500">被引 {p.cited}</span>}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {p.tags.map((t, i) => (
          <span key={t} className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px]" style={{ color: TAG_COLORS[i % TAG_COLORS.length] }}>
            {t}
          </span>
        ))}
        {p.keywords.slice(0, 3).map((k) => (
          <span key={k} className="rounded-full bg-slate-800/70 px-2 py-0.5 text-[11px] text-slate-400">{k}</span>
        ))}
      </div>
      {p.abstract ? (
        <div className="mt-2">
          <button onClick={() => setOpen(!open)} className="text-xs text-sky-400 hover:text-sky-300">
            {open ? '收起摘要 ▲' : '展开摘要 ▼'}
          </button>
          {open && <p className="mt-2 text-[13px] leading-relaxed text-slate-400">{p.abstract}</p>}
        </div>
      ) : (
        <div className="mt-2 text-xs text-slate-600">摘要暂未收录</div>
      )}
    </div>
  )
}

function VenuePanel({ v, globalQuery }: { v: Venue; globalQuery: string }) {
  const [expanded, setExpanded] = useState(false)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState<SortKey>('year-desc')
  const [tag, setTag] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const venueTags = useMemo(() => {
    const m = new Map<string, number>()
    v.papers.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [v])

  const papers = useMemo(() => {
    const query = q || globalQuery
    let list = v.papers.filter((p) => matchPaper(p, query))
    if (tag) list = list.filter((p) => p.tags.includes(tag))
    list = [...list].sort((a, b) => {
      if (sort === 'year-desc') return b.year - a.year || b.cited - a.cited
      if (sort === 'year-asc') return a.year - b.year || b.cited - a.cited
      return b.cited - a.cited
    })
    return list
  }, [v, q, globalQuery, sort, tag])

  const trend = YEARS.map((y) => ({ year: y, n: v.years[y] ?? 0 }))
  const visible = showAll ? papers : papers.slice(0, 6)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-800/40"
      >
        <span className={`rounded border px-1.5 py-0.5 text-[11px] font-bold ${LEVEL_STYLE[v.level].badge}`}>
          {v.level}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">{v.short}</span>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">
              {v.type === 'journal' ? '期刊' : '会议'}
            </span>
          </div>
          <div className="mt-0.5 truncate text-xs text-slate-500">{v.full}</div>
        </div>
        {/* 迷你趋势 */}
        <div className="hidden h-9 w-24 sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trend}>
              <Bar isAnimationActive={false} dataKey="n" radius={[2, 2, 0, 0]}>
                {trend.map((t, i) => (
                  <Cell key={t.year} fill={['#334155', '#38bdf8', '#a78bfa'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <span className="rounded-full bg-sky-500/15 px-3 py-1 text-sm font-bold text-sky-300">{v.count}</span>
        <svg
          className={`h-4 w-4 shrink-0 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4">
          {/* 工具行 */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={`在 ${v.short} 内检索标题 / 摘要 / 作者 / 关键词…`}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-500"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 outline-none focus:border-sky-500"
            >
              <option value="year-desc">时间 · 新→旧</option>
              <option value="year-asc">时间 · 旧→新</option>
              <option value="cited">被引量 · 高→低</option>
            </select>
          </div>

          {/* 标签过滤 + 年份趋势 */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setTag(null)}
              className={`rounded-full px-2.5 py-1 text-[11px] transition ${!tag ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              全部方向
            </button>
            {venueTags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(tag === t ? null : t)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition ${tag === t ? 'bg-sky-500/20 text-sky-300' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
              >
                {t}
              </button>
            ))}
            <div className="ml-auto hidden h-14 w-44 md:block">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend}>
                  <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 'dataMax']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8, fontSize: 12 }}
                    formatter={(n: number) => [`${n} 篇`, '发文量']}
                  />
                  <Bar isAnimationActive={false} dataKey="n" radius={[3, 3, 0, 0]}>
                    {trend.map((t, i) => (
                      <Cell key={t.year} fill={['#334155', '#38bdf8', '#a78bfa'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-3 text-xs text-slate-500">
            命中 <span className="font-semibold text-sky-300">{papers.length}</span> / {v.count} 篇
          </div>
          <div className="mt-3 grid gap-3">
            {visible.map((p) => <PaperCard key={p.doi || p.title} p={p} />)}
            {papers.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-600">没有符合条件的论文</div>
            )}
          </div>
          {papers.length > 6 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="mt-3 w-full rounded-lg border border-slate-800 py-2 text-sm text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              {showAll ? '收起列表' : `显示全部 ${papers.length} 篇`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function VenueExplorer({ venues }: { venues: Venue[] }) {
  const [q, setQ] = useState('')
  const [type, setType] = useState<'all' | 'journal' | 'conference'>('all')
  const [level, setLevel] = useState<'all' | 'A' | 'B' | 'C'>('all')
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    let list = venues
    if (type !== 'all') list = list.filter((v) => v.type === type)
    if (level !== 'all') list = list.filter((v) => v.level === level)
    if (q) {
      list = list.filter(
        (v) =>
          `${v.short} ${v.full}`.toLowerCase().includes(q.toLowerCase()) ||
          v.papers.some((p) => matchPaper(p, q)),
      )
    }
    return list
  }, [venues, q, type, level])

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const cur = Math.min(page, pages)
  const pageVenues = filtered.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE)

  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <h2 className="text-2xl font-bold text-slate-100">期刊 / 会议浏览</h2>
      <p className="mt-1 text-sm text-slate-500">按发文量排序，点击任意一栏展开该期刊/会议下的全部论文。</p>

      {/* 全局工具栏 */}
      <div className="sticky top-0 z-10 mt-6 rounded-xl border border-slate-800 bg-slate-950/90 p-3 backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1) }}
              placeholder="全局检索：跨所有期刊/会议搜索论文标题、摘要、作者、关键词（支持空格多词）…"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none focus:border-sky-500"
            />
          </div>
          <div className="flex gap-2">
            {([['all', '全部'], ['journal', '期刊'], ['conference', '会议']] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => { setType(k); setPage(1) }}
                className={`rounded-lg px-3 py-2 text-sm transition ${type === k ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {label}
              </button>
            ))}
            <span className="my-2 w-px bg-slate-800" />
            {(['all', 'A', 'B', 'C'] as const).map((k) => (
              <button
                key={k}
                onClick={() => { setLevel(k); setPage(1) }}
                className={`rounded-lg px-3 py-2 text-sm transition ${level === k ? 'bg-sky-500/20 text-sky-300' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {k === 'all' ? '全部等级' : `CCF-${k}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-500">
        共 <span className="text-sky-300">{filtered.length}</span> 个期刊/会议 · 第 {cur} / {pages} 页
      </div>

      <div className="mt-3 grid gap-3">
        {pageVenues.map((v) => <VenuePanel key={v.short} v={v} globalQuery={q} />)}
      </div>

      {/* 分页 */}
      {pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            disabled={cur === 1}
            onClick={() => setPage(cur - 1)}
            className="rounded-lg border border-slate-800 px-3 py-1.5 text-sm text-slate-400 disabled:opacity-30 hover:border-slate-600"
          >
            上一页
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`rounded-lg px-3 py-1.5 text-sm transition ${n === cur ? 'bg-sky-500/25 text-sky-300' : 'border border-slate-800 text-slate-400 hover:border-slate-600'}`}
            >
              {n}
            </button>
          ))}
          <button
            disabled={cur === pages}
            onClick={() => setPage(cur + 1)}
            className="rounded-lg border border-slate-800 px-3 py-1.5 text-sm text-slate-400 disabled:opacity-30 hover:border-slate-600"
          >
            下一页
          </button>
        </div>
      )}
    </section>
  )
}
