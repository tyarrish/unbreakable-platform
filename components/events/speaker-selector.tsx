'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mic, Users as UsersIcon, Sparkles, X } from 'lucide-react'
import { getAllPotentialSpeakers } from '@/lib/supabase/queries/speakers'

export interface SelectedSpeaker {
  type: 'facilitator' | 'guest' | 'member'
  id: string
  name: string
  avatar_url: string | null
  subtitle: string | null
}

interface SpeakerSelectorProps {
  selectedSpeakers: SelectedSpeaker[]
  onChange: (speakers: SelectedSpeaker[]) => void
}

export function SpeakerSelector({ selectedSpeakers, onChange }: SpeakerSelectorProps) {
  const [facilitators, setFacilitators] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [members, setMembers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSpeakers()
  }, [])

  async function loadSpeakers() {
    try {
      const data = await getAllPotentialSpeakers()
      setFacilitators(data.facilitators)
      setGuests(data.guests)
      setMembers(data.members)
    } catch (error) {
      console.error('Error loading speakers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function toggleSpeaker(speaker: SelectedSpeaker) {
    const exists = selectedSpeakers.some(
      s => s.type === speaker.type && s.id === speaker.id
    )

    if (exists) {
      onChange(selectedSpeakers.filter(
        s => !(s.type === speaker.type && s.id === speaker.id)
      ))
    } else {
      onChange([...selectedSpeakers, speaker])
    }
  }

  function isSpeakerSelected(type: string, id: string) {
    return selectedSpeakers.some(s => s.type === type && s.id === id)
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return <div className="text-sm text-rogue-slate">Loading speakers...</div>
  }

  return (
    <div className="space-y-4">
      {/* Selected Speakers Preview */}
      {selectedSpeakers.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-rogue-sage/5 rounded-lg border border-rogue-sage/20">
          {selectedSpeakers.map((speaker, idx) => (
            <div
              key={`${speaker.type}-${speaker.id}`}
              className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-rogue-sage/20"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={speaker.avatar_url || undefined} />
                <AvatarFallback className="bg-rogue-sage text-white text-xs">
                  {getInitials(speaker.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-rogue-forest">{speaker.name}</span>
              <button
                type="button"
                onClick={() => toggleSpeaker(speaker)}
                className="ml-1 text-rogue-slate hover:text-red-600 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Speaker Selection Lists */}
      <ScrollArea className="h-96 border border-rogue-sage/20 rounded-lg p-4">
        <div className="space-y-6">
          {/* Facilitators */}
          <div>
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2">
              <Sparkles className="h-4 w-4 text-rogue-gold" />
              <h4 className="font-semibold text-rogue-forest">Facilitators</h4>
              <Badge variant="secondary" className="text-xs">
                {facilitators.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {facilitators.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-rogue-sage/5 cursor-pointer"
                  onClick={() => toggleSpeaker({
                    type: 'facilitator',
                    id: person.id,
                    name: person.full_name,
                    avatar_url: person.avatar_url,
                    subtitle: person.current_role || person.employer
                  })}
                >
                  <Checkbox
                    checked={isSpeakerSelected('facilitator', person.id)}
                    onCheckedChange={() => toggleSpeaker({
                      type: 'facilitator',
                      id: person.id,
                      name: person.full_name,
                      avatar_url: person.avatar_url,
                      subtitle: person.current_role || person.employer
                    })}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={person.avatar_url} />
                    <AvatarFallback className="bg-rogue-sage text-white">
                      {getInitials(person.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-rogue-forest">{person.full_name}</p>
                    {person.current_role && (
                      <p className="text-xs text-rogue-slate truncate">{person.current_role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Guest Speakers */}
          <div>
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2">
              <Mic className="h-4 w-4 text-rogue-copper" />
              <h4 className="font-semibold text-rogue-forest">Guest Speakers</h4>
              <Badge variant="secondary" className="text-xs">
                {guests.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {guests.length === 0 ? (
                <p className="text-sm text-rogue-slate/60 py-4 text-center">
                  No guest speakers added yet. Add them in Admin → Speakers.
                </p>
              ) : (
                guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-rogue-sage/5 cursor-pointer"
                    onClick={() => toggleSpeaker({
                      type: 'guest',
                      id: guest.id,
                      name: guest.full_name,
                      avatar_url: guest.avatar_url,
                      subtitle: [guest.title, guest.organization].filter(Boolean).join(' at ')
                    })}
                  >
                    <Checkbox
                      checked={isSpeakerSelected('guest', guest.id)}
                      onCheckedChange={() => toggleSpeaker({
                        type: 'guest',
                        id: guest.id,
                        name: guest.full_name,
                        avatar_url: guest.avatar_url,
                        subtitle: [guest.title, guest.organization].filter(Boolean).join(' at ')
                      })}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={guest.avatar_url} />
                      <AvatarFallback className="bg-rogue-copper text-white">
                        {getInitials(guest.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-rogue-forest">{guest.full_name}</p>
                      {(guest.title || guest.organization) && (
                        <p className="text-xs text-rogue-slate truncate">
                          {[guest.title, guest.organization].filter(Boolean).join(' at ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Members */}
          <div>
            <div className="flex items-center gap-2 mb-3 sticky top-0 bg-white py-2">
              <UsersIcon className="h-4 w-4 text-rogue-sage" />
              <h4 className="font-semibold text-rogue-forest">Cohort Members</h4>
              <Badge variant="secondary" className="text-xs">
                {members.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {members.filter(m => !m.roles?.includes('facilitator')).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-rogue-sage/5 cursor-pointer"
                  onClick={() => toggleSpeaker({
                    type: 'member',
                    id: member.id,
                    name: member.full_name || member.email,
                    avatar_url: member.avatar_url,
                    subtitle: member.current_role || member.employer
                  })}
                >
                  <Checkbox
                    checked={isSpeakerSelected('member', member.id)}
                    onCheckedChange={() => toggleSpeaker({
                      type: 'member',
                      id: member.id,
                      name: member.full_name || member.email,
                      avatar_url: member.avatar_url,
                      subtitle: member.current_role || member.employer
                    })}
                  />
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={member.avatar_url} />
                    <AvatarFallback className="bg-rogue-forest text-white">
                      {getInitials(member.full_name || member.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-rogue-forest">
                      {member.full_name || member.email}
                    </p>
                    {member.current_role && (
                      <p className="text-xs text-rogue-slate truncate">{member.current_role}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}

