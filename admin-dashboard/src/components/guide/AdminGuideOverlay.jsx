import React, { useEffect, useState } from 'react';

export default function AdminGuideOverlay({
  visible,
  steps = [],
  title = 'Quick Guide',
  onFinish,
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Reset guide to first step whenever it opens.
  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  if (!visible || !steps.length) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onFinish?.();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    onFinish?.();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.stepLabel}>
          Step {currentStep + 1} of {steps.length}
        </p>

        <h3 style={styles.heading}>{step.heading}</h3>
        <p style={styles.description}>{step.description}</p>

        <div style={styles.actions}>
          <button type="button" style={styles.skipBtn} onClick={handleSkip}>
            Skip
          </button>

          <button type="button" style={styles.nextBtn} onClick={handleNext}>
            {isLast ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(17, 24, 39, 0.72)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '24px',
    zIndex: 9999,
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#fff',
    borderRadius: '18px',
    padding: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  title: {
    marginTop: 0,
    marginBottom: '4px',
    color: '#1D3E6E',
  },
  stepLabel: {
    marginTop: 0,
    marginBottom: '16px',
    color: '#6b7280',
    fontSize: '12px',
  },
  heading: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#111827',
  },
  description: {
    marginTop: 0,
    marginBottom: '22px',
    color: '#374151',
    lineHeight: 1.6,
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  skipBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#6b7280',
    fontWeight: '700',
    cursor: 'pointer',
  },
  nextBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '10px',
    border: 'none',
    background: '#1D3E6E',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
};