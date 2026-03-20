import React, { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url, email }),
      });
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Scan failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return <ResultsPage result={result} url={url} email={email} onReset={() => setResult(null)} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>California Therapist Compliance Scanner</h1>
        <p>Check your practice website for AMFT compliance requirements</p>
      </div>
      <form onSubmit={handleScan} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="url">Your Practice Website URL</label>
          <input id="url" type="url" placeholder="https://yourtherapypractice.com" value={url} onChange={(e) => setUrl(e.target.value)} required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="email">Your Email</label>
          <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading} className={styles.scanButton}> {loading ? 'Scanning...' : 'Scan My Site'} </button>
      </form>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.info}>
        <h3>What We Check</h3>
        <ul>
          <li>Full AMFT title and registration number</li>
          <li>Supervisor disclosure compliance</li>
          <li>Misleading claims and language</li>
          <li>Required privacy policies</li>
          <li>Contact information completeness</li>
          <li>Telehealth clarity and disclaimers</li>
        </ul>
      </div>
    </div>
  );
}

function ResultsPage({ result, url, email, onReset }) {
  const getRiskColor = (risk) => {
    if (risk === 'Low') return '#10b981';
    if (risk === 'Moderate') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className={styles.container}>
      <button onClick={onReset} className={styles.backButton}>← Back to Scanner</button>
      <div className={styles.resultsHeader}>
        <h1>Your Compliance Score</h1>
        <div className={styles.scoreBox} style={{ borderColor: getRiskColor(result.riskLevel) }}>
          <div className={styles.score}>{result.score}</div>
          <div className={styles.riskLevel} style={{ color: getRiskColor(result.riskLevel) }}> {result.riskLevel} Risk </div>
        </div>
      </div>
      <div className={styles.issuesSection}>
        <h2>Compliance Issues Found</h2>
        {result.issues.length === 0 ? (
          <p className={styles.success}>Great! No major compliance issues detected.</p>
        ) : (
          result.issues.map((issue, idx) => (
            <div key={idx} className={`${styles.issue} ${styles[`severity-${issue.severity.toLowerCase()}`]}`}> 
              <h3>{issue.issue}</h3>
              <p><strong>Why it matters:</strong> {issue.explanation}</p>
              <p><strong>How to fix:</strong> {issue.fix}</p>
            </div>
          ))
        )}
      </div>
      <div className={styles.ctaSection}>
        <h2>Let Us Help You Fix This</h2>
        <div className={styles.ctaButtons}>
          <button className={styles.primaryCta}>Fix My Site — $199</button>
          <button className={styles.secondaryCta}>Book a Free Call</button>
        </div>
      </div>
      <div className={styles.footer}>
        <p>Scanned: {url}</p>
        <p>Email: {email}</p>
      </div>
    </div>
  );
}