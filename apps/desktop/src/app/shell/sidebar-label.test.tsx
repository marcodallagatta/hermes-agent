import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { ChatSidebar } from '@/app/chat/sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'
import { $connectionsRegistry } from '@/store/connection-registry-state'
import { $cronJobs } from '@/store/cron'
import { $sidebarMessagingOpenIds } from '@/store/layout'
import { $profiles } from '@/store/profile'
import { $messagingSessions, $messagingTruncated, $sessions, $sessionsLoading } from '@/store/session'
import { makeSessionInfo } from '@/test/session-info'

const noop = () => {}

const noopAsync = async () => {}

beforeEach(() => {
  $connectionsRegistry.set({
    version: 2,
    primary: 'local',
    secureTokenStorage: true,
    connections: [{ id: 'local', label: 'This computer', kind: 'local', tokenSet: false, tokenPreview: null }]
  } as NonNullable<typeof $connectionsRegistry.value>)
  $profiles.set([{ name: 'default', is_default: true }] as typeof $profiles.value)
  $sessions.set([makeSessionInfo({ id: 'chat', connection_id: 'local', profile: 'default', title: 'Chat' })])
  $messagingSessions.set([
    makeSessionInfo({
      id: 'telegram',
      connection_id: 'local',
      profile: 'default',
      source: 'telegram',
      title: 'Message'
    })
  ])
  $messagingTruncated.set(false)
  $sidebarMessagingOpenIds.set([])
  $sessionsLoading.set(false)
  $cronJobs.set([{ enabled: true, id: 'job-1', name: 'Daily', schedule_display: '30 8 * * *' }])
})

afterEach(() => {
  cleanup()
  $connectionsRegistry.set(null)
  $profiles.set([])
  $sessions.set([])
  $messagingSessions.set([])
  $sidebarMessagingOpenIds.set([])
  $cronJobs.set([])
})

function renderSidebar() {
  render(
    <MemoryRouter>
      <SidebarProvider>
        <ChatSidebar
          currentView="chat"
          onArchiveSession={noop}
          onBranchSession={noop}
          onDeleteSession={noop}
          onLoadMoreSessions={noop}
          onManageCronJob={noop}
          onNavigate={noop}
          onNewSessionInWorkspace={noop}
          onNewSessionSplit={noop}
          onResumeSession={noop}
          onRetrySessions={noopAsync}
          onTriggerCronJob={noopAsync}
        />
      </SidebarProvider>
    </MemoryRouter>
  )
}

function markerFor(label: string) {
  const button = screen.getByRole('button', { name: label })
  const text = within(button).getByText(label, { selector: 'span' })

  return { button, marker: text.previousElementSibling }
}

describe('sidebar section markers', () => {
  it('shows the calendar as the Cron heading marker without a second dot', () => {
    renderSidebar()

    const { button, marker } = markerFor('Cron jobs')

    expect(marker?.querySelector('.codicon-calendar')).toBeTruthy()
    expect(button.querySelector('.dither')).toBeNull()
  })

  it('keeps the Telegram icon in the heading marker slot without a second dot', () => {
    renderSidebar()

    const { button, marker } = markerFor('Telegram')

    expect(marker?.querySelector('svg')).toBeTruthy()
    expect(button.querySelector('.dither')).toBeNull()
  })
})
