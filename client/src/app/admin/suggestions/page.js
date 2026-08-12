'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { suggestionsAPI } from '../../../lib/api';
import { CATEGORIES, LANGUAGES } from '../../../lib/constants';
import { Save, Plus, Trash2 } from 'lucide-react';

export default function SuggestionsPage() {
  const [allSuggestions, setAllSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // { category, language, suggestions: [] }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await suggestionsAPI.getAll();
      setAllSuggestions(res.data.suggestions);
    } catch {
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditing({
      category: item.category,
      language: item.language,
      suggestions: [...item.suggestions],
    });
  };

  const handleNewPool = () => {
    setEditing({
      category: 'general',
      language: 'en',
      suggestions: ['', '', '', '', ''],
    });
  };

  const updateSuggestion = (index, value) => {
    setEditing((prev) => {
      const updated = [...prev.suggestions];
      updated[index] = value;
      return { ...prev, suggestions: updated };
    });
  };

  const addSuggestion = () => {
    setEditing((prev) => ({
      ...prev,
      suggestions: [...prev.suggestions, ''],
    }));
  };

  const removeSuggestion = (index) => {
    if (editing.suggestions.length <= 5) {
      toast.error('Minimum 5 suggestions required');
      return;
    }
    setEditing((prev) => ({
      ...prev,
      suggestions: prev.suggestions.filter((_, i) => i !== index),
    }));
  };

  const handleSave = async () => {
    const filtered = editing.suggestions.filter((s) => s.trim());
    if (filtered.length < 5) {
      toast.error('At least 5 non-empty suggestions required');
      return;
    }
    setSaving(true);
    try {
      await suggestionsAPI.upsert({
        category: editing.category,
        language: editing.language,
        suggestions: filtered,
      });
      toast.success('Suggestions saved!');
      setEditing(null);
      fetchSuggestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryLabel = (val) => CATEGORIES.find((c) => c.value === val)?.label || val;
  const getLangLabel = (val) => LANGUAGES.find((l) => l.code === val)?.label || val;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage review suggestion pools by category and language
        </p>
        <button className="btn btn-primary btn-sm" onClick={handleNewPool}>
          <Plus size={16} /> New Pool
        </button>
      </div>

      {/* Existing Pools Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {allSuggestions.map((item) => (
          <div key={item._id} className="card" style={{ cursor: 'pointer' }} onClick={() => handleEdit(item)}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <span className="badge badge-primary">{getCategoryLabel(item.category)}</span>
              <span className="badge badge-neutral">{getLangLabel(item.language)}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
              {item.suggestions.length} suggestions
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
              &ldquo;{item.suggestions[0]?.substring(0, 60)}...&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 620, maxHeight: '85vh' }}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Suggestion Pool</h3>
              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setEditing(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Category</label>
                <select className="form-input form-select" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })}>
                  {[...CATEGORIES, { value: 'general', label: 'General' }].map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Language</label>
                <select className="form-input form-select" value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '40vh', overflowY: 'auto', paddingRight: 4 }}>
              {editing.suggestions.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: 14, minWidth: 20 }}>{i + 1}.</span>
                  <textarea
                    className="form-input"
                    style={{ minHeight: 60, fontSize: '0.85rem' }}
                    value={s}
                    onChange={(e) => updateSuggestion(i, e.target.value)}
                    placeholder={`Suggestion ${i + 1}...`}
                  />
                  <button className="btn btn-ghost btn-icon btn-sm" onClick={() => removeSuggestion(i)} style={{ color: 'var(--rose-500)', marginTop: 8 }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <button className="btn btn-ghost btn-sm" onClick={addSuggestion} style={{ marginTop: 8 }}>
              <Plus size={14} /> Add Suggestion
            </button>

            <div style={{ display: 'flex', gap: 10, marginTop: 20, borderTop: '1px solid var(--border-light)', paddingTop: 20 }}>
              <button className="btn btn-primary btn-full" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner spinner-sm" style={{ borderTopColor: 'white' }}></span> : <><Save size={16} /> Save Pool</>}
              </button>
              <button className="btn btn-outline" onClick={() => setEditing(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
