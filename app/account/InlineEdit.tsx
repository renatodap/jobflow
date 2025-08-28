'use client'

import { useState, useEffect, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Check, X, Edit2 } from 'lucide-react'

interface InlineEditProps {
  label: string
  value: string | number | null
  fieldName: string
  onSave: (fieldName: string, value: string) => Promise<boolean>
  placeholder?: string
  type?: 'text' | 'email' | 'url' | 'number' | 'textarea'
  required?: boolean
  readOnly?: boolean
}

export function InlineEdit({
  label,
  value,
  fieldName,
  onSave,
  placeholder = '',
  type = 'text',
  required = false,
  readOnly = false
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value?.toString() || '')
  const [originalValue, setOriginalValue] = useState(value?.toString() || '')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setEditValue(value?.toString() || '')
    setOriginalValue(value?.toString() || '')
  }, [value])

  const validateValue = (): boolean => {
    setError('')

    if (required && !editValue.trim()) {
      setError('This field is required')
      return false
    }

    if (type === 'email' && editValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(editValue)) {
        setError('Invalid email format')
        return false
      }
    }

    if (type === 'url' && editValue) {
      try {
        new URL(editValue)
      } catch {
        setError('Invalid URL format')
        return false
      }
    }

    if (type === 'number' && editValue) {
      if (isNaN(Number(editValue))) {
        setError('Must be a number')
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateValue()) return
    if (editValue === originalValue) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const success = await onSave(fieldName, editValue)
      if (success) {
        setOriginalValue(editValue)
        setIsEditing(false)
      } else {
        setError('Failed to save')
      }
    } catch (err) {
      console.error('Error saving:', err)
      setError('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(originalValue)
    setError('')
    setIsEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      handleCancel()
    } else if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault()
      handleSave()
    }
  }

  const displayValue = value || placeholder

  if (readOnly) {
    return (
      <div className="py-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="text-gray-900">
          {displayValue}
        </div>
      </div>
    )
  }

  if (!isEditing) {
    return (
      <div className="py-3 group">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div 
          onClick={() => setIsEditing(true)}
          className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-400'}>
            {displayValue}
          </span>
          <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    )
  }

  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex items-start gap-2">
        <div className="flex-1">
          {type === 'textarea' ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
              rows={4}
              autoFocus
            />
          ) : (
            <input
              type={type}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={placeholder}
              autoFocus
            />
          )}
          {error && (
            <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
        <div className="flex gap-1">
          {editValue !== originalValue && (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !!error}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}