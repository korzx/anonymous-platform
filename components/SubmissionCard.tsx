// components/SubmissionCard.tsx - Individual submission display

'use client';

import React, { useState } from 'react';
import { AnonymousSubmission } from '@/types';
import styles from './SubmissionCard.module.css';

interface SubmissionCardProps {
  submission: AnonymousSubmission;
}

export default function SubmissionCard({ submission }: SubmissionCardProps) {
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());

  const reactions = ['❤️', '💭', '🙏', '💪', '✨', '🌙'];

  const handleReaction = (emoji: string) => {
    const newReactions = new Set(userReactions);
    if (newReactions.has(emoji)) {
      newReactions.delete(emoji);
    } else {
      newReactions.add(emoji);
    }
    setUserReactions(newReactions);
    // In a real app, send to API
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.category}>
          {submission.category.charAt(0).toUpperCase() + submission.category.slice(1)}
        </span>
        <span className={styles.time}>{formatDate(submission.created_at)}</span>
      </div>

      <p className={styles.content}>{submission.content}</p>

      <div className={styles.reactions}>
        {reactions.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`${styles.reactionButton} ${
              userReactions.has(emoji) ? styles.active : ''
            }`}
            aria-label={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </article>
  );
}
