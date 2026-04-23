// components/AnonymousForm.tsx - Anonymous submission form

'use client';

import React, { useState, useRef } from 'react';
import { CATEGORIES } from '@/lib/constants';
import { SubmitResponse } from '@/types';
import styles from './AnonymousForm.module.css';

interface AnonymousFormProps {
  onSuccess: () => void;
}

export default function AnonymousForm({ onSuccess }: AnonymousFormProps) {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          category,
        }),
      });

      const data = (await response.json()) as SubmitResponse;

      if (!response.ok) {
        setError(data.message || 'Submission failed. Please try again.');
        return;
      }

      // Clear form
      setContent('');
      setCategory(CATEGORIES[0]);

      // Notify parent
      onSuccess();
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 300)}px`;
    }
  };

  const characterCount = content.length;
  const maxLength = 5000;
  const isValid = content.trim().length >= 10;

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            handleAutoResize();
          }}
          placeholder="Write what you feel but cannot tell anyone..."
          maxLength={maxLength}
          rows={6}
          className={styles.textarea}
          disabled={isLoading}
          aria-label="Anonymous thoughts"
        />
        <div className={styles.hint}>
          <span className={characterCount > maxLength * 0.9 ? styles.warning : ''}>
            {characterCount} / {maxLength}
          </span>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category" className={styles.label}>
          Category (optional)
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.select}
          disabled={isLoading}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className={styles.button}
      >
        {isLoading ? 'Submitting...' : 'Submit Anonymously'}
      </button>

      <p className={styles.privacy}>
        🔐 Your submission is completely anonymous and encrypted
      </p>
    </form>
  );
}
