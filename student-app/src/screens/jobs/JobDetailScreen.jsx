import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';
import { useGuideStore } from '../../store/guideStore';
import GuideOverlay from '../../components/GuideOverlay';

export default function JobDetailScreen({ route, navigation }) {
  const { post } = route.params;
  const { user } = useAuthStore();
  const { seenGuides, isLoaded, loadGuides, markGuideSeen } = useGuideStore();

  const [selectedCv, setSelectedCv] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  const pickCv = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const file = result.assets?.[0];
      if (!file) return;

      if (file.mimeType && file.mimeType !== 'application/pdf') {
        Alert.alert('Invalid File', 'Please select a PDF only.');
        return;
      }

      setSelectedCv(file);
    } catch (error) {
      console.error('Document picker error:', error);
      Alert.alert('Error', 'Could not open document picker.');
    }
  };

  const uploadCvToStorage = async () => {
    if (!selectedCv?.uri) {
      throw new Error('Please choose a PDF before applying.');
    }

    const localFile = new File(selectedCv.uri);
    const arrayBuffer = await localFile.arrayBuffer();

    const safeName = `${Date.now()}-${(selectedCv.name || 'cv.pdf').replace(/\s+/g, '-')}`;
    const filePath = `${user.id}/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('cv-files')
      .upload(filePath, arrayBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`CV upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('cv-files').getPublicUrl(filePath);

    return {
      cv_url: data?.publicUrl || null,
      cv_path: filePath,
    };
  };

  const handleApply = async () => {
    if (!selectedCv) {
      return Alert.alert('Required', 'Please upload your CV as a PDF before applying.');
    }

    setLoading(true);

    try {
      const { cv_url } = await uploadCvToStorage();

      const { error } = await supabase.from('applications').insert([
        {
          job_id: post.id,
          student_id: user.id,
          cv_url,
          status: 'pending',
        },
      ]);

      if (error) {
        console.error('Application insert error:', error);
        Alert.alert('Error', error.message || 'Could not submit your application.');
        return;
      }

      Alert.alert('Success', 'Your application was submitted successfully.');
      navigation.goBack();
    } catch (err) {
      console.error('Apply error:', err);
      Alert.alert('Error', err.message || 'Something went wrong while applying.');
    } finally {
      setLoading(false);
    }
  };

  const showGuide = isLoaded && !seenGuides.job_apply;

  return (
    <SafeAreaView style={styles.container}>
      <GuideOverlay
        visible={showGuide}
        title="Job Application Guide"
        steps={[
          {
            heading: 'Job Details',
            description:
              'This page explains the opportunity and lets you decide whether you want to apply.',
          },
          {
            heading: 'Choose PDF',
            description:
              'Select your CV as a PDF from your device before submitting your application.',
          },
          {
            heading: 'Submit Application',
            description:
              'Once your CV is selected, use the submit button to send your application to your university admin.',
          },
        ]}
        onFinish={() => markGuideSeen('job_apply')}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.typeTag}>JOB OPPORTUNITY</Text>

        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.description}>{post.description}</Text>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Apply for this job</Text>
          <Text style={styles.label}>Upload your CV as a PDF</Text>

          <TouchableOpacity style={styles.pickBtn} onPress={pickCv} disabled={loading}>
            <Text style={styles.pickBtnText}>
              {selectedCv ? 'Replace PDF' : 'Choose PDF'}
            </Text>
          </TouchableOpacity>

          {selectedCv ? (
            <View style={styles.fileInfoBox}>
              <Text style={styles.fileName}>{selectedCv.name}</Text>
              <Text style={styles.fileMeta}>
                {selectedCv.size ? `${Math.round(selectedCv.size / 1024)} KB` : 'PDF selected'}
              </Text>
            </View>
          ) : (
            <Text style={styles.helperText}>
              Select a PDF file stored on your device.
            </Text>
          )}

          <TouchableOpacity
            style={[styles.applyBtn, loading && styles.disabledBtn]}
            onPress={handleApply}
            disabled={loading}
          >
            <Text style={styles.applyText}>
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20 },
  typeTag: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 10,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  description: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#111827',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  pickBtn: {
    backgroundColor: '#e0ecff',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
  },
  pickBtnText: {
    color: '#001DAF',
    fontWeight: '700',
    textAlign: 'center',
  },
  fileInfoBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 18,
  },
  fileName: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  fileMeta: {
    color: '#6b7280',
    fontSize: 12,
  },
  helperText: {
    marginBottom: 18,
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
  applyBtn: {
    backgroundColor: '#001DAF',
    padding: 16,
    borderRadius: 12,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  applyText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});