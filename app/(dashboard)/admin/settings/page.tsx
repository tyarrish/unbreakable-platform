'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Container } from '@/components/layout/container'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { PageLoader } from '@/components/ui/loading-spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings, Calendar, Bell, Zap, Save, FileText } from 'lucide-react'
import { getAllSettings, updateSetting, type PlatformSetting } from '@/lib/supabase/queries/settings'
import { RichTextEditor } from '@/components/discussions/rich-text-editor'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [editedSettings, setEditedSettings] = useState<{ [key: string]: any }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAccess()
    loadSettings()
  }, [])

  async function checkAccess() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('roles')
      .eq('id', user.id)
      .single<{ roles: string[] }>()

    // Only admins can access settings
    if (!profile?.roles?.includes('admin')) {
      router.push('/admin')
    }
  }

  async function loadSettings() {
    try {
      const data = await getAllSettings()
      setSettings(data)
      
      // Initialize edited settings
      const edited: { [key: string]: any } = {}
      data.forEach(setting => {
        edited[setting.setting_key] = setting.setting_value
      })
      setEditedSettings(edited)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSave() {
    setIsSaving(true)

    try {
      // Save all edited settings
      const updates = Object.entries(editedSettings).map(([key, value]) => 
        updateSetting(key, value)
      )

      await Promise.all(updates)

      toast.success('Settings saved successfully!')
      loadSettings()
    } catch (error: any) {
      console.error('Error saving settings:', error)
      toast.error(error.message || 'Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  function updateEditedSetting(key: string, value: any) {
    setEditedSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  function getSettingsByCategory(category: string) {
    return settings.filter(s => s.category === category)
  }

  if (isLoading) {
    return <PageLoader />
  }

  return (
    <div className="py-8">
      <Container>
        <PageHeader
          heading="Platform Settings"
          description="Configure platform-wide settings and preferences"
        />

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="cohort">Cohort</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('general').map((setting) => (
                  <div key={setting.setting_key} className="space-y-2">
                    <Label htmlFor={setting.setting_key}>
                      {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Input
                      id={setting.setting_key}
                      value={editedSettings[setting.setting_key] || ''}
                      onChange={(e) => updateEditedSetting(setting.setting_key, e.target.value)}
                    />
                    {setting.description && (
                      <p className="text-xs text-rogue-slate">{setting.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Settings */}
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-rogue-gold" />
                  <CardTitle>Course Introduction</CardTitle>
                </div>
                <CardDescription>
                  Customize the introduction that appears at the top of the Modules page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Label>Course Introduction / Description</Label>
                  <p className="text-sm text-rogue-slate mb-2">
                    This content will replace "The Work" header and subtitle on the participant Modules page. Use it to welcome participants and explain the learning journey.
                  </p>
                  <RichTextEditor
                    content={editedSettings['course_introduction_html'] || ''}
                    onChange={(html) => updateEditedSetting('course_introduction_html', html)}
                    placeholder="Write a welcoming introduction to the course modules..."
                    className="tiptap-styled"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cohort Settings */}
          <TabsContent value="cohort">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-rogue-gold" />
                  <CardTitle>Cohort Settings</CardTitle>
                </div>
                <CardDescription>Configure current cohort parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {getSettingsByCategory('cohort').map((setting) => (
                  <div key={setting.setting_key} className="space-y-2">
                    <Label htmlFor={setting.setting_key}>
                      {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    {setting.setting_key === 'cohort_start_date' ? (
                      <Input
                        id={setting.setting_key}
                        type="date"
                        value={editedSettings[setting.setting_key] || ''}
                        onChange={(e) => updateEditedSetting(setting.setting_key, e.target.value)}
                      />
                    ) : (
                      <Input
                        id={setting.setting_key}
                        value={editedSettings[setting.setting_key] || ''}
                        onChange={(e) => updateEditedSetting(setting.setting_key, e.target.value)}
                      />
                    )}
                    {setting.description && (
                      <p className="text-xs text-rogue-slate">{setting.description}</p>
                    )}
                  </div>
                ))}

                {/* Partner Settings */}
                {getSettingsByCategory('partners').map((setting) => (
                  <div key={setting.setting_key} className="space-y-2">
                    <Label htmlFor={setting.setting_key}>
                      {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Select 
                      value={editedSettings[setting.setting_key] || ''} 
                      onValueChange={(value) => updateEditedSetting(setting.setting_key, value)}
                    >
                      <SelectTrigger id={setting.setting_key}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                      </SelectContent>
                    </Select>
                    {setting.description && (
                      <p className="text-xs text-rogue-slate">{setting.description}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-rogue-copper" />
                  <CardTitle>Feature Toggles</CardTitle>
                </div>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('features').map((setting) => (
                  <div key={setting.setting_key} className="flex items-center justify-between p-4 bg-rogue-sage/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-rogue-forest">
                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()).replace(' Enabled', '')}
                      </div>
                      {setting.description && (
                        <p className="text-xs text-rogue-slate mt-1">{setting.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => updateEditedSetting(setting.setting_key, !editedSettings[setting.setting_key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editedSettings[setting.setting_key] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editedSettings[setting.setting_key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-rogue-forest" />
                  <CardTitle>Notification Settings</CardTitle>
                </div>
                <CardDescription>Configure email notifications and reminders</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {getSettingsByCategory('notifications').map((setting) => (
                  <div key={setting.setting_key} className="flex items-center justify-between p-4 bg-rogue-sage/5 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-rogue-forest">
                        {setting.setting_key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                      {setting.description && (
                        <p className="text-xs text-rogue-slate mt-1">{setting.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => updateEditedSetting(setting.setting_key, !editedSettings[setting.setting_key])}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        editedSettings[setting.setting_key] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          editedSettings[setting.setting_key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save All Settings'}
          </Button>
        </div>
      </Container>
    </div>
  )
}

