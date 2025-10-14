'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, MessageSquare, Calendar, Users } from 'lucide-react'
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'

interface SearchResult {
  id: string
  type: 'module' | 'lesson' | 'discussion' | 'event' | 'member'
  title: string
  description?: string
  link: string
  metadata?: Record<string, any>
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const searchResults: SearchResult[] = []

      // Search modules
      const { data: modules } = await (supabase
        .from('modules')
        .select('id, title, description')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5)) as any

      modules?.forEach((module: any) => {
        searchResults.push({
          id: module.id,
          type: 'module',
          title: module.title,
          description: module.description,
          link: `/modules/${module.id}`
        })
      })

      // Search lessons
      const { data: lessons } = await (supabase
        .from('lessons')
        .select('id, title, module_id')
        .ilike('title', `%${searchQuery}%`)
        .limit(5)) as any

      lessons?.forEach((lesson: any) => {
        searchResults.push({
          id: lesson.id,
          type: 'lesson',
          title: lesson.title,
          link: `/modules/${lesson.module_id}/lessons/${lesson.id}`
        })
      })

      // Search discussions
      const { data: discussions } = await (supabase
        .from('discussion_threads')
        .select('id, title')
        .ilike('title', `%${searchQuery}%`)
        .limit(5)) as any

      discussions?.forEach((discussion: any) => {
        searchResults.push({
          id: discussion.id,
          type: 'discussion',
          title: discussion.title,
          link: `/discussions/${discussion.id}`
        })
      })

      // Search events
      const { data: events } = await (supabase
        .from('events')
        .select('id, title, event_type, start_time')
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(5)) as any

      events?.forEach((event: any) => {
        searchResults.push({
          id: event.id,
          type: 'event',
          title: event.title,
          description: new Date(event.start_time).toLocaleDateString(),
          link: `/calendar`,
          metadata: { event_type: event.event_type }
        })
      })

      // Search members
      const { data: members } = await (supabase
        .from('profiles')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .limit(5)) as any

      members?.forEach((member: any) => {
        searchResults.push({
          id: member.id,
          type: 'member',
          title: member.full_name || member.email,
          description: member.email,
          link: `/members/${member.id}`
        })
      })

      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }, [supabase])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        performSearch(query)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  const handleSelect = (result: SearchResult) => {
    router.push(result.link)
    setIsOpen(false)
    setQuery('')
    setResults([])
  }

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'module':
      case 'lesson':
        return <BookOpen className="h-4 w-4 text-rogue-forest" />
      case 'discussion':
        return <MessageSquare className="h-4 w-4 text-rogue-gold" />
      case 'event':
        return <Calendar className="h-4 w-4 text-rogue-copper" />
      case 'member':
        return <Users className="h-4 w-4 text-rogue-sage" />
    }
  }

  const getResultBadge = (type: SearchResult['type']) => {
    const badges = {
      module: { label: 'Module', className: 'bg-rogue-forest/10 text-rogue-forest' },
      lesson: { label: 'Lesson', className: 'bg-rogue-pine/10 text-rogue-pine' },
      discussion: { label: 'Discussion', className: 'bg-rogue-gold/10 text-rogue-gold' },
      event: { label: 'Event', className: 'bg-rogue-copper/10 text-rogue-copper' },
      member: { label: 'Member', className: 'bg-rogue-sage/10 text-rogue-sage' }
    }
    return badges[type]
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-rogue-slate bg-rogue-sage/5 rounded-lg hover:bg-rogue-sage/10 transition-colors w-full max-w-sm"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto px-2 py-0.5 text-xs font-semibold text-rogue-slate bg-white rounded border border-rogue-sage/20">
          ⌘K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <div className="flex items-center border-b border-rogue-sage/20 px-4">
            <Search className="h-4 w-4 text-rogue-slate" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search modules, lessons, discussions, events, members..."
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {isSearching ? (
              <div className="py-8 text-center text-sm text-rogue-slate">
                Searching...
              </div>
            ) : results.length === 0 && query ? (
              <div className="py-8 text-center text-sm text-rogue-slate">
                No results found for "{query}"
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 text-center text-sm text-rogue-slate">
                Start typing to search...
              </div>
            ) : (
              <div className="space-y-1">
                {results.map((result) => {
                  const badge = getResultBadge(result.type)
                  return (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-rogue-sage/10 transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        {getResultIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-rogue-forest truncate">
                          {result.title}
                        </p>
                        {result.description && (
                          <p className="text-xs text-rogue-slate truncate">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`text-xs ${badge.className}`}>
                        {badge.label}
                      </Badge>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}




