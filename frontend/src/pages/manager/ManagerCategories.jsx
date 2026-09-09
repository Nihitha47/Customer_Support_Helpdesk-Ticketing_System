import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AlertCircle, Pencil, Plus, ToggleLeft, ToggleRight } from 'lucide-react';

export const ManagerCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const res = await api.categories.getAll(true);
      if (res.success) setCategories(res.categories || []);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await api.categories.update(editingId, { name: name.trim(), description: description.trim() });
      } else {
        await api.categories.create({ name: name.trim(), description: description.trim() });
      }
      setName('');
      setDescription('');
      setEditingId(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await api.categories.toggleStatus(id);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Failed to update category status');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category._id);
    setName(category.name);
    setDescription(category.description || '');
  };

  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Category Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Add, edit, and deactivate categories used across new ticket creation.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 text-sm text-rose-800 bg-rose-50 border border-rose-200 rounded-md">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <form onSubmit={handleCreateOrUpdate} className="bg-white rounded-lg border border-slate-200 p-6 xl:col-span-1">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            {editingId ? <Pencil className="w-4 h-4 text-slate-600" /> : <Plus className="w-4 h-4 text-slate-600" />}
            <h2 className="text-base font-bold text-slate-900">{editingId ? 'Edit Category' : 'Create Category'}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#284428]" placeholder="Billing & Invoicing" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">Description</label>
              <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-md border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#284428]" placeholder="Optional category description..." />
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[#284428] hover:bg-[#1e311e] disabled:opacity-50">
                {saving ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setName(''); setDescription(''); }} className="px-4 py-2 rounded-md text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200">Cancel</button>
              )}
            </div>
          </div>
        </form>

        <div className="bg-white rounded-lg border border-slate-200 p-6 xl:col-span-2">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-200 mb-4">
            <ToggleLeft className="w-4 h-4 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Current Categories</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-12"><div className="w-8 h-8 border-3 border-[#284428] border-t-transparent rounded-full animate-spin" /></div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">No categories available.</div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div key={category._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{category.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${category.isActive ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {category.description ? <p className="text-xs text-slate-500 mt-1">{category.description}</p> : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => handleEdit(category)} className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-md border border-slate-200">Edit</button>
                    <button type="button" onClick={() => handleToggleStatus(category._id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#284428] hover:bg-[#1e311e] rounded-md">
                      {category.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      {category.isActive ? 'Deactivate' : 'Activate'}
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
};

export default ManagerCategories;
