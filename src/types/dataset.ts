export interface Paper {
  title: string
  authors: string[]
  year: number
  date: string
  doi: string
  abstract: string
  keywords: string[]
  tags: string[]
  cited: number
}

export interface Venue {
  short: string
  full: string
  publisher: string
  level: 'A' | 'B' | 'C'
  category: string
  type: 'journal' | 'conference'
  count: number
  years: Record<string, number>
  papers: Paper[]
}

export interface Dataset {
  generated: string
  range: string
  total: number
  tags: string[]
  venues: Venue[]
}

export const LEVEL_STYLE: Record<string, { badge: string; bar: string; label: string }> = {
  A: { badge: 'bg-amber-500/15 text-amber-400 border-amber-500/40', bar: '#f59e0b', label: 'CCF-A' },
  B: { badge: 'bg-sky-500/15 text-sky-400 border-sky-500/40', bar: '#38bdf8', label: 'CCF-B' },
  C: { badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40', bar: '#34d399', label: 'CCF-C' },
}

export const TAG_COLORS = [
  '#a78bfa', '#f472b6', '#fb923c', '#22d3ee', '#facc15',
  '#4ade80', '#f87171', '#818cf8', '#2dd4bf', '#e879f9', '#94a3b8',
]
