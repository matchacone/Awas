export type ReportType = 'outage' | 'low_pressure'

export type ReactionType = 'upvote' | 'downvote'

export type Comment = {
  id: string
  reportId: string
  user: string
  description: string
  createdAt: string
}

export type Reaction = {
  id: string
  reactionType: ReactionType
  reportId: string
  user: string
  createdAt: string
  commentId?: string
}

export type Report = {
  id: string
  type: ReportType
  lat: number
  lng: number
  description?: string
  timestamp: string
  active?: boolean
  comments: Comment[]
  reactions: Reaction[]
}
