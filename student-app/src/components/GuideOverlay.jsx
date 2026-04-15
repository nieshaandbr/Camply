import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function GuideOverlay({
  visible,
  steps = [],
  onFinish,
  title = 'Quick Guide',
}) {
  const [currentStep, setCurrentStep] = useState(0);

  // Resetting on close would require parent control.
  // For pilot, parent remount/reopen behavior is enough.

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
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.stepLabel}>
            Step {currentStep + 1} of {steps.length}
          </Text>

          {/* This is the name of the area being explained */}
          <Text style={styles.sectionName}>{step.heading}</Text>

          {/* This explains what the user can do in that area */}
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>
                {isLast ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.72)',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 22,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D3E6E',
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 16,
  },
  sectionName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 22,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  skipBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  skipText: {
    color: '#6b7280',
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1D3E6E',
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontWeight: '700',
  },
});