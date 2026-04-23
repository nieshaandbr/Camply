import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';

export default function QuestionnairesPage() {
  const navigate = useNavigate();

  const [universities, setUniversities] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [responseCounts, setResponseCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [targetRole, setTargetRole] = useState('both');
  const [selectedUniversityIds, setSelectedUniversityIds] = useState([]);
  const [questions, setQuestions] = useState([
    { question: '', type: 'text' },
  ]);

  useEffect(() => {
    fetchUniversities();
    fetchQuestionnaires();
  }, []);

  const universityMap = useMemo(() => {
    const map = {};
    universities.forEach((uni) => {
      map[uni.id] = uni.name;
    });
    return map;
  }, [universities]);

  const fetchUniversities = async () => {
    try {
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Fetch universities error:', error);
        alert('Could not load universities');
        return;
      }

      setUniversities(data || []);
    } catch (error) {
      console.error('Unexpected fetch universities error:', error);
      alert('Something went wrong while loading universities');
    }
  };

  const fetchQuestionnaires = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('questionnaires')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch questionnaires error:', error);
        setQuestionnaires([]);
        return;
      }

      const questionnairesData = data || [];
      setQuestionnaires(questionnairesData);

      // Load total response counts for each questionnaire.
      const counts = {};

      for (const questionnaire of questionnairesData) {
        const { count } = await supabase
          .from('questionnaire_responses')
          .select('*', { count: 'exact', head: true })
          .eq('questionnaire_id', questionnaire.id);

        counts[questionnaire.id] = count || 0;
      }

      setResponseCounts(counts);
    } catch (error) {
      console.error('Unexpected fetch questionnaires error:', error);
      setQuestionnaires([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityToggle = (universityId) => {
    setSelectedUniversityIds((prev) =>
      prev.includes(universityId)
        ? prev.filter((id) => id !== universityId)
        : [...prev, universityId]
    );
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { question: '', type: 'text' }]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.length ? updated : [{ question: '', type: 'text' }]);
  };

  const handleCreateQuestionnaire = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Questionnaire title is required.');
      return;
    }

    if (!selectedUniversityIds.length) {
      alert('Please choose at least one university.');
      return;
    }

    const cleanedQuestions = questions
      .map((q) => ({
        question: q.question.trim(),
        type: q.type,
      }))
      .filter((q) => q.question);

    if (!cleanedQuestions.length) {
      alert('Add at least one valid question.');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        target_university_ids: selectedUniversityIds,
        target_role: targetRole,
        questions: cleanedQuestions,
        is_active: true,
        created_at: new Date().toISOString(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      };

      const { error } = await supabase.from('questionnaires').insert([payload]);

      if (error) {
        console.error('Create questionnaire error:', error);
        alert(error.message || 'Could not create questionnaire.');
        return;
      }

      alert('Questionnaire created successfully.');

      setTitle('');
      setDescription('');
      setExpiresAt('');
      setTargetRole('both');
      setSelectedUniversityIds([]);
      setQuestions([{ question: '', type: 'text' }]);

      fetchQuestionnaires();
    } catch (error) {
      console.error('Unexpected create questionnaire error:', error);
      alert('Something went wrong while creating the questionnaire.');
    } finally {
      setSaving(false);
    }
  };

  const toggleQuestionnaireStatus = async (questionnaire) => {
    try {
      const { error } = await supabase
        .from('questionnaires')
        .update({ is_active: !questionnaire.is_active })
        .eq('id', questionnaire.id);

      if (error) {
        console.error('Toggle questionnaire error:', error);
        alert('Could not update questionnaire status.');
        return;
      }

      fetchQuestionnaires();
    } catch (error) {
      console.error('Unexpected toggle questionnaire error:', error);
      alert('Something went wrong while updating questionnaire status.');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Questionnaires</h1>
        <p style={styles.subtitle}>
          Create pilot feedback forms for students, admins, or both.
        </p>
      </div>

      <div style={styles.layout}>
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Create Questionnaire</h2>

          <form onSubmit={handleCreateQuestionnaire} style={styles.form}>
            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                placeholder="Pilot Feedback Form"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                placeholder="Tell users why this feedback matters"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                style={styles.input}
              >
                <option value="student">Students</option>
                <option value="admin">Admins</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Expiry Date</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Target Universities</label>
              <div style={styles.checkboxWrap}>
                {universities.map((uni) => (
                  <label key={uni.id} style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={selectedUniversityIds.includes(uni.id)}
                      onChange={() => handleUniversityToggle(uni.id)}
                    />
                    <span>{uni.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Questions</label>

              {questions.map((q, index) => (
                <div key={index} style={styles.questionCard}>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestion(index, 'question', e.target.value)}
                    style={styles.input}
                    placeholder={`Question ${index + 1}`}
                  />

                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, 'type', e.target.value)}
                    style={styles.input}
                  >
                    <option value="text">Text</option>
                    <option value="yes_no">Yes / No</option>
                    <option value="rating">Rating (1-5)</option>
                  </select>

                  <button
                    type="button"
                    style={styles.removeBtn}
                    onClick={() => removeQuestion(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <button type="button" style={styles.secondaryBtn} onClick={addQuestion}>
                Add Question
              </button>
            </div>

            <button type="submit" style={styles.primaryBtn} disabled={saving}>
              {saving ? 'Publishing...' : 'Publish Questionnaire'}
            </button>
          </form>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Questionnaire History</h2>

          {loading ? (
            <p>Loading questionnaires...</p>
          ) : questionnaires.length === 0 ? (
            <p style={styles.emptyText}>No questionnaires created yet.</p>
          ) : (
            <div style={styles.list}>
              {questionnaires.map((questionnaire) => (
                <div key={questionnaire.id} style={styles.historyCard}>
                  <h3 style={styles.historyTitle}>{questionnaire.title}</h3>

                  <p style={styles.historyMeta}>
                    Audience: <strong>{questionnaire.target_role || 'both'}</strong>
                  </p>

                  <p style={styles.historyMeta}>
                    Universities:{' '}
                    {(questionnaire.target_university_ids || [])
                      .map((id) => universityMap[id] || id)
                      .join(', ')}
                  </p>

                  <p style={styles.historyMeta}>
                    Responses: {responseCounts[questionnaire.id] || 0}
                  </p>

                  <p style={styles.historyMeta}>
                    Status: {questionnaire.is_active ? 'Active' : 'Inactive'}
                  </p>

                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      style={styles.viewBtn}
                      onClick={() =>
                        navigate(`/super-admin/questionnaires/${questionnaire.id}`)
                      }
                    >
                      View Responses
                    </button>

                    <button
                      type="button"
                      style={
                        questionnaire.is_active
                          ? styles.deactivateBtn
                          : styles.activateBtn
                      }
                      onClick={() => toggleQuestionnaireStatus(questionnaire)}
                    >
                      {questionnaire.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
  layout: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: '18px',
    padding: '24px',
    border: '1px solid #e5e7eb',
    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: '20px',
    color: '#111827',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontWeight: '700',
    color: '#111827',
  },
  input: {
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
  },
  textarea: {
    minHeight: '120px',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    resize: 'vertical',
  },
  checkboxWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  checkboxLabel: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  questionCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  primaryBtn: {
    padding: '14px',
    background: '#1D3E6E',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  secondaryBtn: {
    padding: '10px 14px',
    background: '#E89338',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    width: 'fit-content',
  },
  removeBtn: {
    padding: '10px 12px',
    background: '#fff',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    width: 'fit-content',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  historyCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '14px',
    padding: '16px',
  },
  historyTitle: {
    marginTop: 0,
    marginBottom: '10px',
    color: '#111827',
  },
  historyMeta: {
    margin: '6px 0',
    color: '#6b7280',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginTop: '12px',
  },
  viewBtn: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#1D3E6E',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  deactivateBtn: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  activateBtn: {
    padding: '10px 14px',
    borderRadius: '10px',
    border: 'none',
    background: '#16a34a',
    color: '#fff',
    fontWeight: '700',
    cursor: 'pointer',
  },
  emptyText: {
    color: '#6b7280',
  },
};