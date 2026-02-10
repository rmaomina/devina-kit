import { useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

const STORAGE_KEY = 'devina-kit-favorites'

function loadLocal(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function useFavorites() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<string[]>(loadLocal)
  const [synced, setSynced] = useState(false)

  // 로그인 시 Supabase에서 즐겨찾기 로드
  useEffect(() => {
    if (!user || !supabase) return
    setSynced(false)
    supabase
      .from('user_favorites')
      .select('tool_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const ids = data.map((r) => r.tool_id)
          setFavorites(ids)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
        }
        setSynced(true)
      })
  }, [user])

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const removing = prev.includes(id)
        const next = removing ? prev.filter((x) => x !== id) : [...prev, id]

        // localStorage 폴백 (항상)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))

        // 로그인 + Supabase 연동
        if (user && supabase && synced) {
          if (removing) {
            supabase
              .from('user_favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('tool_id', id)
              .then()
          } else {
            supabase
              .from('user_favorites')
              .insert({ user_id: user.id, tool_id: id })
              .then()
          }
        }

        return next
      })
    },
    [user, synced],
  )

  return { favorites, toggle }
}
