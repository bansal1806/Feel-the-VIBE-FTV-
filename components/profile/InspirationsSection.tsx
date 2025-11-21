'use client'

import { BookOpen, Plus, X } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import type { ProfileFormData } from './types'
import { useState } from 'react'

interface InspirationsSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: ProfileFormData[keyof ProfileFormData]) => void
  isEditing: boolean
}

export function InspirationsSection({ form, onUpdate, isEditing }: InspirationsSectionProps) {
  const [toolInput, setToolInput] = useState('')
  const [mediaInput, setMediaInput] = useState('')
  const [inspirationInput, setInspirationInput] = useState('')

  const addTool = () => {
    if (toolInput.trim() && !form.favoriteTools?.includes(toolInput.trim())) {
      onUpdate('favoriteTools', [...(form.favoriteTools || []), toolInput.trim()])
      setToolInput('')
    }
  }

  const removeTool = (tool: string) => {
    onUpdate('favoriteTools', (form.favoriteTools || []).filter(t => t !== tool))
  }

  const addMedia = () => {
    if (mediaInput.trim() && !form.favoriteMedia?.includes(mediaInput.trim())) {
      onUpdate('favoriteMedia', [...(form.favoriteMedia || []), mediaInput.trim()])
      setMediaInput('')
    }
  }

  const removeMedia = (media: string) => {
    onUpdate('favoriteMedia', (form.favoriteMedia || []).filter(m => m !== media))
  }

  const addInspiration = () => {
    if (inspirationInput.trim() && !form.inspirations?.includes(inspirationInput.trim())) {
      onUpdate('inspirations', [...(form.inspirations || []), inspirationInput.trim()])
      setInspirationInput('')
    }
  }

  const removeInspiration = (insp: string) => {
    onUpdate('inspirations', (form.inspirations || []).filter(i => i !== insp))
  }

  const hasContent = (form.favoriteTools && form.favoriteTools.length > 0) ||
    (form.favoriteMedia && form.favoriteMedia.length > 0) ||
    (form.inspirations && form.inspirations.length > 0)

  if (!isEditing && !hasContent) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={BookOpen} title="Favorite Tools, Media & Inspirations" color="neon-green">
        <div className="space-y-4">
          {form.favoriteTools && form.favoriteTools.length > 0 && (
            <div>
              <div className="text-xs text-white/60 mb-2">Tools:</div>
              <div className="flex flex-wrap gap-2">
                {form.favoriteTools.map(tool => (
                  <span
                    key={tool}
                    className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
          {form.favoriteMedia && form.favoriteMedia.length > 0 && (
            <div>
              <div className="text-xs text-white/60 mb-2">Media/Creators:</div>
              <div className="flex flex-wrap gap-2">
                {form.favoriteMedia.map(media => (
                  <span
                    key={media}
                    className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                  >
                    {media}
                  </span>
                ))}
              </div>
            </div>
          )}
          {form.inspirations && form.inspirations.length > 0 && (
            <div>
              <div className="text-xs text-white/60 mb-2">Inspirations:</div>
              <div className="flex flex-wrap gap-2">
                {form.inspirations.map(insp => (
                  <span
                    key={insp}
                    className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                  >
                    {insp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ProfileSection>
    )
  }

  return (
    <ProfileSection icon={BookOpen} title="Favorite Tools, Media & Inspirations" color="neon-green">
      <div className="space-y-4">
        <p className="text-xs text-white/60 mb-3">
          Give personality without clutter—favorite frameworks, creators, inspiring books, role models.
        </p>
        
        <div>
          <label className="block text-xs text-white/60 mb-2">Favorite Tools/Frameworks</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTool(); } }}
              placeholder="e.g., React, Figma, VS Code"
              className="flex-1 rounded-xl border border-neon-green/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
            />
            <button
              type="button"
              onClick={addTool}
              className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green hover:bg-neon-green/20 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.favoriteTools && form.favoriteTools.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.favoriteTools.map(tool => (
                <span
                  key={tool}
                  className="inline-flex items-center gap-1 rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                >
                  {tool}
                  <button
                    type="button"
                    onClick={() => removeTool(tool)}
                    className="hover:text-neon-green/60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-2">Favorite Media/Creators</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={mediaInput}
              onChange={(e) => setMediaInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMedia(); } }}
              placeholder="e.g., @creator, Book title"
              className="flex-1 rounded-xl border border-neon-green/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
            />
            <button
              type="button"
              onClick={addMedia}
              className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green hover:bg-neon-green/20 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.favoriteMedia && form.favoriteMedia.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.favoriteMedia.map(media => (
                <span
                  key={media}
                  className="inline-flex items-center gap-1 rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                >
                  {media}
                  <button
                    type="button"
                    onClick={() => removeMedia(media)}
                    className="hover:text-neon-green/60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs text-white/60 mb-2">Inspirations/Role Models</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={inspirationInput}
              onChange={(e) => setInspirationInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addInspiration(); } }}
              placeholder="e.g., Tony Stark-like builder"
              className="flex-1 rounded-xl border border-neon-green/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-green focus:ring-2 focus:ring-neon-green/20"
            />
            <button
              type="button"
              onClick={addInspiration}
              className="rounded-xl border border-neon-green/30 bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green hover:bg-neon-green/20 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.inspirations && form.inspirations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.inspirations.map(insp => (
                <span
                  key={insp}
                  className="inline-flex items-center gap-1 rounded-xl border border-neon-green/30 bg-neon-green/10 px-2 py-1 text-xs text-neon-green"
                >
                  {insp}
                  <button
                    type="button"
                    onClick={() => removeInspiration(insp)}
                    className="hover:text-neon-green/60"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProfileSection>
  )
}

