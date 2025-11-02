"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Persona {
  id: string
  name: string
  description: string
}

interface DebateFormProps {
  onSubmit: (data: { topic: string; duration: number; personas: Persona[] }) => void
  loading?: boolean
}

export function DebateForm({ onSubmit, loading = false }: DebateFormProps) {
  const [topic, setTopic] = useState("")
  const [duration, setDuration] = useState(5)
  const [personas, setPersonas] = useState<Persona[]>([
    { id: "1", name: "Pro Advocate", description: "Argues in favor of the topic" },
    { id: "2", name: "Skeptic", description: "Questions assumptions and challenges claims" },
  ])
  const [newPersonaName, setNewPersonaName] = useState("")
  const [newPersonaDesc, setNewPersonaDesc] = useState("")

  const handleAddPersona = () => {
    if (newPersonaName.trim() && newPersonaDesc.trim()) {
      setPersonas([
        ...personas,
        {
          id: Date.now().toString(),
          name: newPersonaName,
          description: newPersonaDesc,
        },
      ])
      setNewPersonaName("")
      setNewPersonaDesc("")
    }
  }

  const handleRemovePersona = (id: string) => {
    if (personas.length > 2) {
      setPersonas(personas.filter((p) => p.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({ topic, duration, personas })
    if (topic.trim() && personas.length >= 2) {
      onSubmit({ topic, duration, personas })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold mb-3">Debate Topic</label>
        <Input
          placeholder="e.g., Should AI be regulated by governments?"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="text-base"
          required
        />
        <p className="text-xs text-muted-foreground mt-2">Enter the topic you want to explore</p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">Debate Duration (minutes)</label>
        <Input
          type="number"
          min="1"
          max="30"
          value={duration}
          onChange={(e) => setDuration(Number.parseInt(e.target.value))}
          className="text-base"
        />
        <p className="text-xs text-muted-foreground mt-2">How long should the debate run?</p>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-3">AI Personas ({personas.length})</label>
        <div className="space-y-3 mb-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="flex items-start justify-between gap-3 p-3 bg-card/50 rounded-lg border border-border/50"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{persona.name}</p>
                <p className="text-xs text-muted-foreground">{persona.description}</p>
              </div>
              {personas.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemovePersona(persona.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 bg-card/30 rounded-lg border border-border/50">
          <div>
            <label className="block text-xs font-medium mb-2">Persona Name</label>
            <Input
              placeholder="e.g., Economist"
              value={newPersonaName}
              onChange={(e) => setNewPersonaName(e.target.value)}
              className="text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2">Description</label>
            <Input
              placeholder="e.g., Analyzes economic implications"
              value={newPersonaDesc}
              onChange={(e) => setNewPersonaDesc(e.target.value)}
              className="text-sm"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-transparent"
            onClick={handleAddPersona}
            disabled={!newPersonaName.trim() || !newPersonaDesc.trim()}
          >
            + Add Persona
          </Button>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading || personas.length < 2}>
        {loading ? "Starting Debate..." : "Start Debate"}
      </Button>
    </form>
  )
}
