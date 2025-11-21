'use client'

import { GraduationCap, Plus, X } from 'lucide-react'
import { ProfileSection } from './ProfileSection'
import { TextArea } from './form/TextArea'
import type { ProfileFormData } from './types'
import { useState } from 'react'

interface AcademicSectionProps {
  form: ProfileFormData
  onUpdate: (field: keyof ProfileFormData, value: any) => void
  isEditing: boolean
}

export function AcademicSection({ form, onUpdate, isEditing }: AcademicSectionProps) {
  const [techStackInput, setTechStackInput] = useState('')

  const addTechStack = () => {
    if (techStackInput.trim() && !form.techStack?.includes(techStackInput.trim())) {
      onUpdate('techStack', [...(form.techStack || []), techStackInput.trim()])
      setTechStackInput('')
    }
  }

  const removeTechStack = (tech: string) => {
    onUpdate('techStack', (form.techStack || []).filter(t => t !== tech))
  }

  const hasContent = form.currentSubjects || form.ongoingProjects || form.pastProjects ||
    (form.techStack && form.techStack.length > 0)

  if (!isEditing && !hasContent) {
    return null
  }

  if (!isEditing) {
    return (
      <ProfileSection icon={GraduationCap} title="Academic & Project Details" color="neon-yellow">
        <div className="space-y-3">
          {form.currentSubjects && (
            <div>
              <div className="text-xs text-white/60 mb-1">Current Subjects:</div>
              <p className="text-sm text-white/80">{form.currentSubjects}</p>
            </div>
          )}
          {form.ongoingProjects && (
            <div>
              <div className="text-xs text-white/60 mb-1">Ongoing Projects:</div>
              <p className="text-sm text-white/80">{form.ongoingProjects}</p>
            </div>
          )}
          {form.pastProjects && (
            <div>
              <div className="text-xs text-white/60 mb-1">Past Projects:</div>
              <p className="text-sm text-white/80">{form.pastProjects}</p>
            </div>
          )}
          {form.techStack && form.techStack.length > 0 && (
            <div>
              <div className="text-xs text-white/60 mb-1">Tech Stack:</div>
              <div className="flex flex-wrap gap-2">
                {form.techStack.map(tech => (
                  <span
                    key={tech}
                    className="rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-2 py-1 text-xs text-neon-yellow"
                  >
                    {tech}
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
    <ProfileSection icon={GraduationCap} title="Academic & Project Details" color="neon-yellow">
      <div className="space-y-3">
        <p className="text-xs text-white/60 mb-3">
          Helps others find collaborators and understand your academic journey.
        </p>
        <TextArea
          label="Current Subjects"
          value={form.currentSubjects}
          onChange={(v) => onUpdate('currentSubjects', v)}
          placeholder="List your current subjects"
        />
        <TextArea
          label="Ongoing Projects"
          value={form.ongoingProjects}
          onChange={(v) => onUpdate('ongoingProjects', v)}
          placeholder="Describe your ongoing projects"
        />
        <TextArea
          label="Past Projects (short)"
          value={form.pastProjects}
          onChange={(v) => onUpdate('pastProjects', v)}
          placeholder="Brief description of past projects"
        />
        <div>
          <label className="block text-xs text-white/60 mb-2">Tools/Tech Stack</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTechStack(); } }}
              placeholder="e.g., React, Node.js, Python"
              className="flex-1 rounded-xl border border-neon-yellow/30 bg-black-deep/80 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-neon-yellow focus:ring-2 focus:ring-neon-yellow/20"
            />
            <button
              type="button"
              onClick={addTechStack}
              className="rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-4 py-2 text-sm font-semibold text-neon-yellow hover:bg-neon-yellow/20 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.techStack && form.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.techStack.map(tech => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-2 py-1 text-xs text-neon-yellow"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => removeTechStack(tech)}
                    className="hover:text-neon-yellow/60"
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

