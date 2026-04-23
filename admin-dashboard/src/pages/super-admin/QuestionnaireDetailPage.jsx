import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function QuestionnaireDetailPage() {
  const { id } = useParams();

  const [questionnaire, setQuestionnaire] = useState(null);
  const [responses, setResponses] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionnaireDetail();
  }, [id]);

  const fetchQuestionnaireDetail = async () => {
    setLoading(true);

    try {
      const { data: questionnaireData, error: questionnaireError } = await supabase
        .from('questionnaires')
        .select('*')
        .eq('id', id)
        .single();

      if (questionnaireError) {
        console.error('Fetch questionnaire detail error:', questionnaireError);
        setQuestionnaire(null);
        setResponses([]);
        return;
      }

      const { data: responseData, error: responsesError } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('questionnaire_id', id)
        .order('created_at', { ascending: false });

      if (responsesError) {
        console.error('Fetch questionnaire responses error:', responsesError);
        setResponses([]);
      } else {
        setResponses(responseData || []);
      }

      setQuestionnaire(questionnaireData);
    } catch (error) {
      console.error('Unexpected questionnaire detail error:', error);
      setQuestionnaire(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResponses = useMemo(() => {
    if (filterRole === 'all') return responses;
    return responses.filter((response) => response.responder_role === filterRole);
  }, [responses, filterRole]);

  const analytics = useMemo(() => {
    const studentResponses = responses.filter((r) => r.responder_role === 'student');
    const adminResponses = responses.filter((r) => r.responder_role === 'admin');

    const ratingBuckets = {};
    const yesNoBuckets = {};

    filteredResponses.forEach((response) => {
      (response.answers || []).forEach((answerItem) => {
        const questionKey = answerItem.question;

        if (answerItem.type === 'rating') {
          if (!ratingBuckets[questionKey]) {
            ratingBuckets[questionKey] = [];
          }

          const numeric = Number(answerItem.answer);
          if (!Number.isNaN(numeric)) {
            ratingBuckets[questionKey].push(numeric);
          }
        }

        if (answerItem.type === 'yes_no') {
          if (!yesNoBuckets[questionKey]) {
            yesNoBuckets[questionKey] = { Yes: 0, No: 0 };
          }

          if (answerItem.answer === 'Yes') {
            yesNoBuckets[questionKey].Yes += 1;
          } else if (answerItem.answer === 'No') {
            yesNoBuckets[questionKey].No += 1;
          }
        }
      });
    });

    const ratingAverages = Object.entries(ratingBuckets).map(([question, values]) => ({
      question,
      average:
        values.length > 0
          ? (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2)
          : '0.00',
      count: values.length,
    }));

    const yesNoSummaries = Object.entries(yesNoBuckets).map(([question, values]) => ({
      question,
      yes: values.Yes,
      no: values.No,
    }));

    return {
      total: responses.length,
      students: studentResponses.length,
      admins: adminResponses.length,
      ratingAverages,
      yesNoSummaries,
    };
  }, [responses, filteredResponses]);

  if (loading) {
    return <div style={styles.loading}>Loading questionnaire detail...</div>;
  }

  if (!questionnaire) {
    return <div style={styles.loading}>Questionnaire not found.</div>;
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>{questionnaire.title}</h1>
        <p style={styles.subtitle}>
          View responses and analytics by role.
        </p>
      </div>

      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <h3 style={styles.summaryLabel}>Total Responses</h3>
          <p style={styles.summaryValue}>{analytics.total}</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.summaryLabel}>Student Responses</h3>
          <p style={styles.summaryValue}>{analytics.students}</p>
        </div>

        <div style={styles.summaryCard}>
          <h3 style={styles.summaryLabel}>Admin Responses</h3>
          <p style={styles.summaryValue}>{analytics.admins}</p>
        </div>
      </div>

      <div style={styles.filterRow}>
        <label style={styles.filterLabel}>Filter responses</label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={styles.select}
        >
          <option value="all">All</option>
          <option value="student">Students</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div style={styles.analyticsGrid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Rating Analytics</h2>

          {analytics.ratingAverages.length === 0 ? (
            <p style={styles.emptyText}>No rating analytics for this filter yet.</p>
          ) : (
            analytics.ratingAverages.map((item, index) => (
              <div key={index} style={styles.analyticsItem}>
                <strong>{item.question}</strong>
                <p>Average: {item.average}</p>
                <p>Responses counted: {item.count}</p>
              </div>
            ))
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Yes / No Analytics</h2>

          {analytics.yesNoSummaries.length === 0 ? (
            <p style={styles.emptyText}>No yes/no analytics for this filter yet.</p>
          ) : (
            analytics.yesNoSummaries.map((item, index) => (
              <div key={index} style={styles.analyticsItem}>
                <strong>{item.question}</strong>
                <p>Yes: {item.yes}</p>
                <p>No: {item.no}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>Responses</h2>

        {filteredResponses.length === 0 ? (
          <p style={styles.emptyText}>No responses for this filter yet.</p>
        ) : (
          <div style={styles.responseList}>
            {filteredResponses.map((response) => (
              <div key={response.id} style={styles.responseCard}>
                <p style={styles.responseMeta}>
                  Role: <strong>{response.responder_role}</strong>
                </p>
                <p style={styles.responseMeta}>
                  Submitted: {new Date(response.created_at).toLocaleString()}
                </p>

                {(response.answers || []).map((answerItem, index) => (
                  <div key={index} style={styles.answerBlock}>
                    <strong>{answerItem.question}</strong>
                    <p style={styles.answerText}>{String(answerItem.answer)}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: '100%',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: '8px',
    color: '#6b7280',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '20px',
  },
  summaryCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  summaryLabel: {
    marginTop: 0,
    marginBottom: '8px',
    color: '#6b7280',
    fontSize: '14px',
  },
  summaryValue: {
    margin: 0,
    fontSize: '30px',
    fontWeight: '800',
    color: '#1D3E6E',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  filterLabel: {
    fontWeight: '700',
    color: '#111827',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 24px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '16px',
    color: '#111827',
  },
  analyticsItem: {
    borderBottom: '1px solid #eef2f7',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  responseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  responseCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
  },
  responseMeta: {
    margin: '4px 0',
    color: '#6b7280',
  },
  answerBlock: {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #f1f5f9',
  },
  answerText: {
    marginTop: '6px',
    color: '#374151',
  },
  emptyText: {
    color: '#6b7280',
  },
  loading: {
    padding: '24px',
  },
};