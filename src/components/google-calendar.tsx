"use client"

import { useState, useEffect } from 'react'
import { Calendar, Plus, Settings, ExternalLink, Save, Eye } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface CalendarSettings {
  calendarId: string
  apiKey: string
  embedCode: string
}

export function GoogleCalendar() {
  const [settings, setSettings] = useState<CalendarSettings>({
    calendarId: '',
    apiKey: '',
    embedCode: ''
  })
  const [isEditing, setIsEditing] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // Get current user and their calendar settings
    const getCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me')
        const data = await response.json()
        setCurrentUser(data.user)
        
        // Load user's calendar settings (you'd implement this API endpoint)
        const calendarResponse = await fetch('/api/user/calendar-settings')
        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json()
          setSettings(calendarData)
        }
      } catch (error) {
        console.error('Error getting user data:', error)
      }
    }
    getCurrentUser()
  }, [])

  const saveSettings = async () => {
    setIsSaving(true)
    try {
      // Save calendar settings via API
      await fetch('/api/user/calendar-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save calendar settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const renderCalendarEmbed = () => {
    if (settings.embedCode) {
      return (
        <div 
          className="w-full h-96 border-none rounded-lg overflow-hidden"
          dangerouslySetInnerHTML={{ __html: settings.embedCode }}
        />
      )
    }

    // Default calendar view if no embed code
    return (
      <div className="w-full h-96 border-none rounded-lg bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Calendar className="h-12 w-12 mx-auto text-gray-400" />
          <div>
            <h3 className="font-medium text-gray-600">No Calendar Connected</h3>
            <p className="text-sm text-gray-500">Add your Google Calendar to see your schedule</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Setup Calendar
          </Button>
        </div>
      </div>
    )
  }

  const renderCalendarSetup = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 space-y-2">
        <p>To integrate your Google Calendar:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Go to <a href="https://calendar.google.com/calendar/u/0/embedhelper" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Calendar</a></li>
          <li>Change the width into 300, and customize anything u want.</li>
          <li>Copy the "Embed code" and paste it below</li>
        </ol>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="embedCode" className="text-sm font-medium">
            Google Calendar Embed Code
          </Label>
          <Textarea
            id="embedCode"
            placeholder="Paste your Google Calendar embed code here..."
            value={settings.embedCode}
            onChange={(e) => setSettings(prev => ({ ...prev, embedCode: e.target.value }))}
            className="mt-1 h-32 text-xs"
          />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div>
            <Label htmlFor="calendarId" className="text-sm font-medium">
              Calendar ID (Optional)
            </Label>
            <Input
              id="calendarId"
              placeholder="your-email@gmail.com"
              value={settings.calendarId}
              onChange={(e) => setSettings(prev => ({ ...prev, calendarId: e.target.value }))}
              className="mt-1 text-xs"
            />
          </div>

          <div>
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Google API Key (Optional)
            </Label>
            <Input
              id="apiKey"
              placeholder="For advanced features"
              value={settings.apiKey}
              onChange={(e) => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
              className="mt-1 text-xs"
              type="password"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            size="sm"
            onClick={saveSettings}
            disabled={isSaving || !settings.embedCode}
            className="flex-1"
          >
            {isSaving ? (
              'Saving...'
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(false)}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Card className="sticky top-4">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>My Schedule</span>
          </div>
          <div className="flex space-x-1">
            {settings.embedCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <Eye className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              </Button>
            )}
            {settings.embedCode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open('https://calendar.google.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? renderCalendarSetup() : renderCalendarEmbed()}
        
        {!isEditing && !settings.embedCode && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-sm text-blue-900 mb-2">Quick Setup Tips:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Connect your Google Calendar to see class schedules</li>
              <li>• Share your calendar with classmates</li>
              <li>• Track assignment deadlines</li>
              <li>• Never miss a lecture again!</li>
            </ul>
          </div>
        )}
        
        {settings.embedCode && !isEditing && (
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://calendar.google.com/calendar/u/0/r/week', '_blank')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
