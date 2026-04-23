import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function QuestionnairesScreen() {
  const { user } = useAuthStore();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [answersByQuestionnaire, setAnswersByQuestionnaire] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  const fetchQuestionnaires = useCallback(async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch questionnaires error:', error);
        setQuestionnaires([]);
        return;
      }

      const filtered =
        (data || []).filter(
          (q) =>
            (q.target_university_ids || []).includes(user.university_id) &&
            (q.target_role === 'student' || q.target_role === 'both')
        ) || [];

      setQuestionnaires(filtered);
    } catch (error) {
      console.error('Unexpected fetch questionnaires error:', error);
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  }, [user.university_id]);

  useEffect(() => {
    fetchQuestionnaires();
  }, [fetchQuestionnaires]);

  const updateAnswer = (questionnaireId, questionIndex, value) => {
    setAnswersByQuestionnaire((prev) => ({
      ...prev,
      [questionnaireId]: {
        ...(prev[questionnaireId] || {}),
        [questionIndex]: value,
      },
    }));
  };

  const submitQuestionnaire = async (questionnaire) => {
    const rawAnswers = answersByQuestionnaire[questionnaire.id] || {};
    const orderedAnswers = questionnaire.questions.map((question, index) => ({
      question: question.question,
      type: question.type,
      answer: rawAnswers[index] ?? '',
    }));

    const hasEmptyAnswer = orderedAnswers.some(
      (item) => item.answer === '' || item.answer === null || item.answer === undefined
    );

    if (hasEmptyAnswer) {
      Alert.alert('Incomplete', 'Please answer all questions before submitting.');
      return;
    }

    setSubmittingId(questionnaire.id);

    try {
      const { error } = await supabase.from('questionnaire_responses').insert([
        {
          questionnaire_id: questionnaire.id,
          student_id: user.id,
          admin_id: null,
          responder_role: 'student',
          university_id: user.university_id,
          answers: orderedAnswers,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Submit questionnaire error:', error);
        Alert.alert('Error', error.message || 'Could not submit feedback.');
        return;
      }

      Alert.alert('Success', 'Thank you for your feedback.');

      setAnswersByQuestionnaire((prev) => ({
        ...prev,
        [questionnaire.id]: {},
      }));
    } catch (error) {
      console.error('Unexpected questionnaire submit error:', error);
      Alert.alert('Error', 'Something went wrong while submitting your feedback.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#1D3E6E" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Questionnaires</Text>
      <Text style={styles.subHeader}>
        Complete active pilot feedback forms from your university.
      </Text>

      {questionnaires.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No active questionnaires</Text>
          <Text style={styles.emptyText}>
            Any pilot feedback forms for your university will appear here.
          </Text>
        </View>
      ) : (
        questionnaires.map((questionnaire) => (
          <View key={questionnaire.id} style={styles.card}>
            <Text style={styles.title}>{questionnaire.title}</Text>
            {questionnaire.description ? (
              <Text style={styles.description}>{questionnaire.description}</Text>
            ) : null}

            {(questionnaire.questions || []).map((question, index) => {
              const answerValue =
                answersByQuestionnaire[questionnaire.id]?.[index] ?? '';

              return (
                <View key={index} style={styles.questionBlock}>
                  <Text style={styles.questionText}>
                    {index + 1}. {question.question}
                  </Text>

                  {question.type === 'yes_no' ? (
                    <View style={styles.choiceRow}>
                      <TouchableOpacity
                        style={[
                          styles.choiceBtn,
                          answerValue === 'Yes' && styles.choiceBtnActive,
                        ]}
                        onPress={() => updateAnswer(questionnaire.id, index, 'Yes')}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            answerValue === 'Yes' && styles.choiceTextActive,
                          ]}
                        >
                          Yes
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.choiceBtn,
                          answerValue === 'No' && styles.choiceBtnActive,
                        ]}
                        onPress={() => updateAnswer(questionnaire.id, index, 'No')}
                      >
                        <Text
                          style={[
                            styles.choiceText,
                            answerValue === 'No' && styles.choiceTextActive,
                          ]}
                        >
                          No
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : question.type === 'rating' ? (
                    <View style={styles.choiceRow}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <TouchableOpacity
                          key={rating}
                          style={[
                            styles.ratingBtn,
                            String(answerValue) === String(rating) &&
                              styles.choiceBtnActive,
                          ]}
                          onPress={() =>
                            updateAnswer(questionnaire.id, index, String(rating))
                          }
                        >
                          <Text
                            style={[
                              styles.choiceText,
                              String(answerValue) === String(rating) &&
                                styles.choiceTextActive,
                            ]}
                          >
                            {rating}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <TextInput
                      value={answerValue}
                      onChangeText={(value) =>
                        updateAnswer(questionnaire.id, index, value)
                      }
                      placeholder="Type your answer here"
                      style={styles.input}
                      multiline
                    />
                  )}
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={() => submitQuestionnaire(questionnaire)}
              disabled={submittingId === questionnaire.id}
            >
              <Text style={styles.submitText}>
                {submittingId === questionnaire.id ? 'Submitting...' : 'Submit Feedback'}
              </Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  loaderWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1D3E6E',
  },
  subHeader: {
    marginTop: 6,
    color: '#6b7280',
    marginBottom: 20,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  questionBlock: {
    marginBottom: 16,
  },
  questionText: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  ratingBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  choiceBtnActive: {
    backgroundColor: '#1D3E6E',
    borderColor: '#1D3E6E',
  },
  choiceText: {
    color: '#111827',
    fontWeight: '700',
  },
  choiceTextActive: {
    color: '#fff',
  },
  submitBtn: {
    marginTop: 8,
    backgroundColor: '#E89338',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '800',
  },
});