// app/page.tsx - Main anonymous expression interface

'use client';

import React, { useState } from 'react';
import AnonymousForm from '@/components/AnonymousForm';
import Feed from '@/components/Feed';
import styles from './page.module.css';

export default function Home() {
  const [submitted, setSubmitted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSubmitSuccess = () => {
    setSubmitted(true);
    setRefreshTrigger((prev) => prev + 1);
    
    // Show success message briefly
    setTimeout(() => {
      setSubmitted(false);
    }, 2000);
  };

  return (
    <main className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>💭</h1>
        <p className={styles.subtitle}>What is something you feel but cannot tell anyone?</p>
      </div>

      <div className={styles.content}>
        {/* Anonymous Submission Form */}
        <section className={styles.formSection}>
          <AnonymousForm onSuccess={handleSubmitSuccess} />
          {submitted && (
            <div className={styles.successMessage}>
              ✓ Anonymous submission sent
            </div>
          )}
        </section>

        {/* Anonymous Feed */}
        <section className={styles.feedSection}>
          <Feed key={refreshTrigger} />
        </section>
      </div>

      <footer className={styles.footer}>
        <p>🔐 Completely anonymous • No accounts • No tracking • Fully encrypted</p>
      </footer>
    </main>
  );
}
