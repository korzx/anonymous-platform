// components/Feed.tsx - Infinite scroll feed of anonymous submissions

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnonymousSubmission, FeedResponse } from '@/types';
import SubmissionCard from './SubmissionCard';
import Loading from './Loading';
import styles from './Feed.module.css';

export default function Feed() {
  const [submissions, setSubmissions] = useState<AnonymousSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch submissions
  const fetchSubmissions = useCallback(
    async (nextCursor?: string) => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('limit', '10');
        if (nextCursor) {
          queryParams.append('cursor', nextCursor);
        }

        const response = await fetch(`/api/feed?${queryParams.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = (await response.json()) as FeedResponse;

        if (nextCursor) {
          // Append to existing submissions
          setSubmissions((prev) => [...prev, ...data.submissions]);
        } else {
          // Replace all submissions
          setSubmissions(data.submissions);
        }

        setCursor(data.cursor);
        setHasMore(data.has_more);
        setError(null);
      } catch (err) {
        setError('Failed to load feed');
        console.error('Feed error:', err);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    setIsLoading(true);
    fetchSubmissions()
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [fetchSubmissions]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          fetchSubmissions(cursor)
            .then(() => setIsLoadingMore(false))
            .catch(() => setIsLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, cursor, fetchSubmissions]);

  if (isLoading) {
    return <Loading />;
  }

  if (error && submissions.length === 0) {
    return (
      <div className={styles.error}>
        <p>Failed to load feed. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className={styles.feed}>
      <div className={styles.header}>
        <h2>Shared Feelings</h2>
        <p>{submissions.length} visible</p>
      </div>

      {submissions.length === 0 ? (
        <div className={styles.empty}>
          <p>No submissions yet. Be the first to share.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
            />
          ))}
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div ref={observerTarget} className={styles.observer} />

      {isLoadingMore && <Loading />}

      {!hasMore && submissions.length > 0 && (
        <div className={styles.end}>
          <p>No more submissions</p>
        </div>
      )}
    </div>
  );
}
