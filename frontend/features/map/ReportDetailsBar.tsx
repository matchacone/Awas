'use client'

import { useMemo, useState } from 'react'
import type { ReactionType, Report } from './types'
import { XIcon, ArrowUpIcon, ArrowDownIcon } from '@phosphor-icons/react'

 type Props = {
   report: Report
   onClose: () => void
   // onAddComment now only accepts the comment text; the parent should resolve the user's name.
   onAddComment: (description: string) => void
   onAddReaction: (reactionType: ReactionType, commentId?: string, user?: string) => void
 }

export default function ReportDetailsBar({ report, onClose, onAddComment, onAddReaction }: Props) {
  const statusLabel = report.type === 'outage' ? 'Critical' : 'In Progress'
  const statusClasses =
    report.type === 'outage'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-amber-500/20 text-amber-400'

  const [commentText, setCommentText] = useState('')
  const [isCommentFormOpen, setIsCommentFormOpen] = useState(false)

  const reportReactions = useMemo(
    () => report.reactions.filter(reaction => !reaction.commentId),
    [report.reactions],
  )
  const reportReactionCounts = useMemo(
    () =>
      reportReactions.reduce(
        (acc, reaction) => {
          acc[reaction.reactionType] += 1
          return acc
        },
        { upvote: 0, downvote: 0 } as Record<ReactionType, number>,
      ),
    [reportReactions],
  )

  function handleSubmitComment() {
    const trimmed = commentText.trim()
    if (!trimmed) return
    // Do not collect a name here; the parent should determine the user's name
    // (e.g. from auth) and display it when rendering comments.
    onAddComment(trimmed)
    setCommentText('')
    setIsCommentFormOpen(false)
  }

  return (
    <div className="h-full w-80 shrink-0 bg-gray-700/65 backdrop-blur-md border-l border-white/10 shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm font-bold uppercase tracking-widest">
            Report Details
          </span>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${statusClasses}`}
          >
            {statusLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white transition-colors"
          aria-label="Close report details"
        >
          <XIcon size={18} weight="bold" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-white text-xs font-medium">
            {report.type === 'outage' ? 'No Water' : 'Low Pressure'}
          </p>
          {report.description ? (
            <p className="text-zinc-400 text-[11px]">{report.description}</p>
          ) : (
            <p className="text-zinc-500 text-[11px]">No description provided.</p>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Timestamp
          </p>
          <p className="text-zinc-300 text-xs">
            {new Date(report.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Location
          </p>
          <p className="text-zinc-300 text-xs">
            📍 {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Reactions
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onAddReaction('upvote')}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white hover:border-white/30"
              type="button"
              aria-label="Upvote"
            >
              <ArrowUpIcon size={12} weight="bold" />
              {reportReactionCounts.upvote}
            </button>
            <button
              onClick={() => onAddReaction('downvote')}
              className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white hover:border-white/30"
              type="button"
              aria-label="Downvote"
            >
              <ArrowDownIcon size={12} weight="bold" />
              {reportReactionCounts.downvote}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Comments
          </p>
          {report.comments.length ? (
            <div className="space-y-2">
              {report.comments.map(comment => {
                const commentReactions = report.reactions.filter(
                  reaction => reaction.commentId === comment.id,
                )
                const commentReactionCounts = commentReactions.reduce(
                  (acc, reaction) => {
                    acc[reaction.reactionType] += 1
                    return acc
                  },
                  { upvote: 0, downvote: 0 } as Record<ReactionType, number>,
                )

                return (
                  <div
                    key={comment.id}
                    className="rounded-md border border-white/10 bg-white/5 px-3 py-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-white">{comment.user}</p>
                      <p className="text-[10px] text-zinc-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1">{comment.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onAddReaction('upvote', comment.id)}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white hover:border-white/30"
                        type="button"
                        aria-label="Upvote comment"
                      >
                        <ArrowUpIcon size={10} weight="bold" />
                        {commentReactionCounts.upvote}
                      </button>
                      <button
                        onClick={() => onAddReaction('downvote', comment.id)}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white hover:border-white/30"
                        type="button"
                        aria-label="Downvote comment"
                      >
                        <ArrowDownIcon size={10} weight="bold" />
                        {commentReactionCounts.downvote}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500">No comments yet.</p>
          )}
          <div className="border-t border-white/5 pt-3 space-y-2">
            <button
              onClick={() => setIsCommentFormOpen(prev => !prev)}
              className="w-full rounded-md border border-white/10 bg-white/5 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:border-white/30"
              type="button"
            >
              {isCommentFormOpen ? 'Cancel' : 'Add Comment'}
            </button>
            {isCommentFormOpen && (
              <div className="space-y-2">
                {/* Name field removed — user's name will be provided by auth and shown automatically */}
                <textarea
                  value={commentText}
                  onChange={event => setCommentText(event.target.value)}
                  placeholder="Add a comment..."
                  rows={2}
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-white/30"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="w-full rounded-md bg-white/10 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  type="button"
                >
                  Post Comment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
