interface AffectedComponent {
  code: string
  name: string
  old_status: string
  new_status: string
}

interface IncidentUpdate {
  id: string
  status: string
  body: string
  incident_id: string
  created_at: string
  updated_at: string
  display_at: string
  affected_components: AffectedComponent[]
  deliver_notifications: boolean
  custom_tweet?: string | null
  tweet_id: number
}

interface Component {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  position: number
  description?: string | null
  showcase: boolean
  start_date?: string | null
  group_id?: string | null
  page_id: string
  group: boolean
  only_show_if_degraded: boolean
}

export interface ScheduledMaintainenceT {
  id: string
  name: string
  status: string
  created_at: string
  updated_at: string
  monitoring_at?: string | null
  resolved_at?: string | null
  impact: string
  shortlink: string
  started_at: string
  page_id: string
  incident_updates: IncidentUpdate[]
  components: Component[]
  scheduled_for: string
  scheduled_until: string
}

export interface StatusToastPropsT {
  id: string
  title: string
  scheduledFrom: string
  scheduledTill: string
  componentAffected: string
  shortLink: string
}
