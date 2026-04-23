import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../store/authStore';

export default function AdminQuestionnairesPage() {
  const { admin } = useAuthStore();

  const [questionnaires, setQuestionnaires] = useState([]);
  const [answersByQuestionnaire, setAnswersByQuestionnaire] = useState({});
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchQuestionnaires();
  }, []);

  const fetchQuestionnaires = async () => {
    setLoading(true);

    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('is_active', true)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch admin questionnaires error:', error);
        setQuestionnaires([]);
        return;
      }

      const filtered =
        (data || []).filter(
          (q) =>
            (q.target_university_ids || []).includes(admin.university_id) &&
            (q.target_role === 'admin' || q.target_role === 'both')
        ) || [];

      setQuestionnaires(filtered);
    } catch (error) {
      console.error('Unexpected admin questionnaire error:', error);
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

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
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmittingId(questionnaire.id);

    try {
      const { error } = await supabase.from('questionnaire_responses').insert([
        {
          questionnaire_id: questionnaire.id,
          admin_id: admin.id,
          student_id: null,
          responder_role: 'admin',
          university_id: admin.university_id,
          answers: orderedAnswers,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Submit admin questionnaire error:', error);
        alert(error.message || 'Could not submit feedback.');
        return;
      }

      alert('Feedback submitted successfully.');

      setAnswersByQuestionnaire((prev) => ({
        ...prev,
        [questionnaire.id]: {},
      }));
    } catch (error) {
      console.error('Unexpected admin questionnaire submit error:', error);
      alert('Something went wrong while submitting feedback.');
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return <div style={styles.page}>Loading questionnaires...</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Questionnaires</h1>
        <p style={styles.subtitle}>
          Complete active pilot feedback forms assigned to admins.
        </p>
      </div>

      {questionnaires.length === 0 ? (
        <div style={styles.emptyCard}>
          <h3 style={styles.emptyTitle}>No active questionnaires</h3>
          <p style={styles.emptyText}>
            Any admin feedback forms for your university will appear here.
          </p>
        </div>
      ) : (
        <div style={styles.list}>
          {questionnaires.map((questionnaire) => (
            <div key={questionnaire.id} style={styles.card}>
              <h2 style={styles.cardTitle}>{questionnaire.title}</h2>
              {questionnaire.description ? (
                <p style={styles.cardDescription}>{questionnaire.description}</p>
              ) : null}

              {(questionnaire.questions || []).map((question, index) => {
                const answerValue =
                  answersByQuestionnaire[questionnaire.id]?.[index] ?? '';

                return (
                  <div key={index} style={styles.questionBlock}>
                    <label style={styles.label}>
                      {index + 1}. {question.question}
                    </label>

                    {question.type === 'yes_no' ? (
                      <div style={styles.choiceRow}>
                        <button
                          type="button"
                          style={{
                            ...styles.choiceBtn,
                            ...(answerValue === 'Yes' ? styles.choiceBtnActive : {}),
                          }}
                          onClick={() => updateAnswer(questionnaire.id, index, 'Yes')}
                        >
                          Yes
                        </button>

                        <button
                          type="button"
                          style={{
                            ...styles.choiceBtn,
                            ...(answerValue === 'No' ? styles.choiceBtnActive : {}),
                          }}
                          onClick={() => updateAnswer(questionnaire.id, index, 'No')}
                        >
                          No
                        </button>
                      </div>
                    ) : question.type === 'rating' ? (
                      <div style={styles.choiceRow}>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            type="button"
                            style={{
                              ...styles.ratingBtn,
                              ...(String(answerValue) === String(rating)
                                ? styles.choiceBtnActive
                                : {}),
                            }}
                            onClick={() =>
                              updateAnswer(questionnaire.id, index, String(rating))
                            }
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea
                        value={answerValue}
                        onChange={(e) =>
                          updateAnswer(questionnaire.id, index, e.target.value)
                        }
                        style={styles.textarea}
                        placeholder="Type your answer here"
                      />
                    )}
                  </div>
                );
              })}

              <button
                type="button"
                style={styles.submitBtn}
                disabled={submittingId === questionnaire.id}
                onClick={() => submitQuestionnaire(questionnaire)}
              >
                {submittingId === questionnaire.id
                  ? 'Submitting...'
                  : 'Submit Feedback'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: '24px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
  },
  emptyCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
  },
  emptyTitle: {
    marginTop: 0,
    color: '#111827',
  },
  emptyText: {
    color: '#6b7280',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#111827',
  },
  cardDescription: {
    color: '#6b7280',
    marginBottom: '18px',
  },
  questionBlock: {
    marginBottom: '18px',
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '700',
    color: '#111827',
  },
  textarea: {
    width: '100%',
    minHeight: '90px',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  choiceRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  choiceBtn: {
    padding: '10px 16px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
  },
  ratingBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    background: '#fff',
    cursor: 'pointer',
    fontWeight: '700',
  },
  choiceBtnActive: {
    background: '#1D3E6E',
    color: '#fff',
    borderColor: '#1D3E6E',
  },
  submitBtn: {
    padding: '14px 18px',
    borderRadius: '10px',
    border: 'none',
    background: '#E89338',
    color: '#fff',
    fontWeight: '800',
    cursor: 'pointer',
  },
};