import { useEffect, useState } from 'react'
import type { Dataset } from '@/types/dataset'

export function useDataset() {
  const [data, setData] = useState<Dataset | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/uav_sec_data.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(String(e)))
  }, [])

  return { data, error }
}
