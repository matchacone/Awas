'use client'

import { useMemo, useState } from 'react'
import type { ReactionType, Report } from './types'
import { XIcon, ArrowUpIcon, ArrowDownIcon, MapPinIcon } from '@phosphor-icons/react'

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
  const reportTypeLabel = report.type.replace(/_/g, ' ').toUpperCase()

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
    <div className="relative h-full w-80 shrink-0 bg-gradient-to-b from-slate-800/85 via-slate-900/80 to-slate-950/85 backdrop-blur-md border-l border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.45)] flex flex-col">
      <div className="sticky top-0 z-10 px-4 pt-4 pb-3 border-b border-white/10 bg-slate-900/70 backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            {/*<p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-500">
              Report Details
            </p>*/}
            <div className="flex items-center gap-2">
              <p className = "text-white text-md font-semibold tracking-white">
                Report Details
              </p>
              {/*<span className="text-white text-sm font-semibold tracking-wide">
                {report.type === 'outage' ? 'No Water' : 'Low Pressure'}
              </span>*/}
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-white/10 ${statusClasses}`}
              >
                {statusLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="Close report details"
          >
            <XIcon size={18} weight="bold" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className = "flex justify-between">
          <div className="text-md font-bold tracking-wider text-white/70">
            {reportTypeLabel}
          </div>

          <div className = "text-[10px] flex items-center gap-2 text-zinc-400">
            <p>
              {new Date(report.timestamp).toLocaleDateString([], {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
              })}
            </p>
            
            <p>
              {new Date(report.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        
        <div className="py-2 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            Description
          </p>
          {report.description ? (
            <p className="text-zinc-300 text-[12px] leading-relaxed">{report.description}</p>
          ) : (
            <p className="text-zinc-500 text-[11px]">No description provided.</p>
          )}
        </div>

        <div className="grid grid-cols-1">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Location
            </p>
            <p className="flex items-center gap-2 text-zinc-300 text-xs">
              <MapPinIcon size={14} />
              <span>
                {report.lat.toFixed(4)}, {report.lng.toFixed(4)}
              </span>
            </p>
          </div>
        </div>

        <div className="py-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Reactions
            </p>
            <p className="text-[10px] text-zinc-500">
              {reportReactions.length} total
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onAddReaction('upvote')}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2.5 py-2 text-[12px] text-white hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
              type="button"
              aria-label="Upvote"
            >
              <ArrowUpIcon size={14} weight="bold" />
              {reportReactionCounts.upvote}
            </button>
            <button
              onClick={() => onAddReaction('downvote')}
              className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-2.5 py-2 text-[12px] text-white hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
              type="button"
              aria-label="Downvote"
            >
              <ArrowDownIcon size={14} weight="bold" />
              {reportReactionCounts.downvote}
            </button>
          </div>
        </div>

        <div className=" space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-bold uppercase tracking-widest text-zinc-400">
              Comments
            </p>
            <p className="text-[10px] text-zinc-500">
              {report.comments.length}
            </p>
          </div>
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
                    className="rounded-lg bg-white/5 px-3 py-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold text-white truncate">user (static ni)</p>
                      <div className="flex gap-1 text-[10px] text-zinc-500 text-right">
                        <p>
                          {new Date(comment.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: '2-digit',
                          })}
                        </p>
                        <p>
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-300 mt-1">{comment.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => onAddReaction('upvote', comment.id)}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-white hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
                        type="button"
                        aria-label="Upvote comment"
                      >
                        <ArrowUpIcon size={10} weight="bold" />
                        {commentReactionCounts.upvote}
                      </button>
                      <button
                        onClick={() => onAddReaction('downvote', comment.id)}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[10px] text-white hover:border-white/30 hover:bg-white/15 active:scale-[0.98]"
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
              className="w-full rounded-md border border-white/10 bg-white/10 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:border-white/30 hover:bg-white/15"
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
                  className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:border-white/30 focus:bg-white/10"
                />
                <button
                  onClick={handleSubmitComment}
                  disabled={!commentText.trim()}
                  className="w-full rounded-md bg-white/15 py-2 text-[11px] font-semibold uppercase tracking-wider text-white hover:bg-white/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
