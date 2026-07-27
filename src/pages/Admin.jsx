import React, { useState } from 'react';
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlusCircle } from 'react-icons/fa';
import { toast, Toaster } from 'sonner';
import { dummyChallenges } from '../data/dummyData';

const defaultChallengeForm = {
  name: '',
  description: '',
  target: '',
  current: '',
  participants: '',
  daysRemaining: '',
  badge: '🏅',
  color: '#FF6B00',
};

const Admin = () => {
  const [challenges, setChallenges] = useState(dummyChallenges);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);
  const [formData, setFormData] = useState(defaultChallengeForm);
  const [editFormData, setEditFormData] = useState(defaultChallengeForm);

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    const setter = isEdit ? setEditFormData : setFormData;
    setter((prev) => ({ ...prev, [name]: value }));
  };

  const resetAddForm = () => {
    setFormData(defaultChallengeForm);
    setShowAddForm(false);
  };

  const resetEditForm = () => {
    setEditFormData(defaultChallengeForm);
    setEditingChallenge(null);
    setShowEditForm(false);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();

    const newChallenge = {
      id: Date.now(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      target: Number(formData.target) || 0,
      current: Number(formData.current) || 0,
      participants: Number(formData.participants) || 0,
      daysRemaining: Number(formData.daysRemaining) || 0,
      badge: formData.badge.trim() || '🏅',
      color: formData.color || '#FF6B00',
    };

    setChallenges((prev) => [newChallenge, ...prev]);
    toast.success(`Challenge "${newChallenge.name}" created`);
    resetAddForm();
  };

  const handleEdit = (challenge) => {
    setEditingChallenge(challenge);
    setEditFormData({
      ...defaultChallengeForm,
      name: challenge.name,
      description: challenge.description,
      target: challenge.target.toString(),
      current: challenge.current.toString(),
      participants: challenge.participants.toString(),
      daysRemaining: challenge.daysRemaining.toString(),
      badge: challenge.badge,
      color: challenge.color,
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingChallenge) return;

    const updatedChallenge = {
      ...editingChallenge,
      name: editFormData.name.trim(),
      description: editFormData.description.trim(),
      target: Number(editFormData.target) || 0,
      current: Number(editFormData.current) || 0,
      participants: Number(editFormData.participants) || 0,
      daysRemaining: Number(editFormData.daysRemaining) || 0,
      badge: editFormData.badge.trim() || '🏅',
      color: editFormData.color || '#FF6B00',
    };

    setChallenges((prev) => prev.map((challenge) => (challenge.id === editingChallenge.id ? updatedChallenge : challenge)));
    toast.success(`Challenge "${updatedChallenge.name}" updated`);
    resetEditForm();
  };

  const handleDelete = (id) => {
    setChallenges((prev) => prev.filter((challenge) => challenge.id !== id));
    toast.success('Challenge removed');
  };

  const getProgress = (challenge) => {
    if (!challenge.target) return 0;
    return Math.min(100, Math.round((challenge.current / challenge.target) * 100));
  };

  return (
    <div className="min-h-screen bg-secondary-50 pt-20">
      <Toaster position="top-right" />
      <div className="border-b border-secondary-100">
        <div className="mx-auto px-6 lg:px-10 py-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-primary-600 text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
                Dashboard
              </span>
              <h1 className="heading-editorial text-3xl text-secondary-950">
                Challenge Management
              </h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-gold flex items-center space-x-2 cursor-pointer"
              id="add-challenge-btn"
            >
              <FaPlusCircle size={14} />
              <span>Create Challenge</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-6 lg:px-10 py-10">
        {showAddForm && (
          <div className="modal-overlay" onClick={resetAddForm}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary-600 text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
                      Create New
                    </span>
                    <h2 className="heading-editorial text-2xl text-secondary-950">
                      Add Challenge
                    </h2>
                  </div>
                  <button
                    onClick={resetAddForm}
                    className="w-10 h-10 border border-secondary-200 cursor-pointer flex items-center justify-center text-secondary-400 hover:text-secondary-950 hover:border-secondary-400 transition-all duration-300"
                    aria-label="Close"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-8 space-y-7">
                <div>
                  <label className="label-luxury">Challenge Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange(e)}
                    required
                    className="input-luxury"
                    placeholder="Enter challenge name"
                  />
                </div>

                <div>
                  <label className="label-luxury">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange(e)}
                    required
                    rows={3}
                    className="textarea-luxury"
                    placeholder="Describe the challenge"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Target *</label>
                    <input
                      type="number"
                      name="target"
                      value={formData.target}
                      onChange={(e) => handleInputChange(e)}
                      required
                      min="0"
                      step="0.1"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Current Progress *</label>
                    <input
                      type="number"
                      name="current"
                      value={formData.current}
                      onChange={(e) => handleInputChange(e)}
                      required
                      min="0"
                      step="0.1"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Participants *</label>
                    <input
                      type="number"
                      name="participants"
                      value={formData.participants}
                      onChange={(e) => handleInputChange(e)}
                      required
                      min="0"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Days Remaining *</label>
                    <input
                      type="number"
                      name="daysRemaining"
                      value={formData.daysRemaining}
                      onChange={(e) => handleInputChange(e)}
                      required
                      min="0"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Badge Emoji</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge}
                      onChange={(e) => handleInputChange(e)}
                      className="input-luxury"
                      placeholder="🏅"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Accent Color</label>
                    <input
                      type="color"
                      name="color"
                      value={formData.color}
                      onChange={(e) => handleInputChange(e)}
                      className="h-12 w-full cursor-pointer rounded-lg border border-secondary-200 bg-transparent p-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button type="submit" className="btn-gold flex items-center space-x-2">
                    <FaSave size={14} />
                    <span>Save Challenge</span>
                  </button>
                  <button type="button" onClick={resetAddForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditForm && (
          <div className="modal-overlay" onClick={resetEditForm}>
            <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="p-8 border-b border-secondary-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary-600 text-[0.65rem] font-semibold tracking-[0.3em] uppercase block mb-2">
                      Edit
                    </span>
                    <h2 className="heading-editorial text-2xl text-secondary-950">
                      Edit Challenge
                    </h2>
                  </div>
                  <button
                    onClick={resetEditForm}
                    className="w-10 h-10 border border-secondary-200 cursor-pointer flex items-center justify-center text-secondary-400 hover:text-secondary-950 hover:border-secondary-400 transition-all duration-300"
                    aria-label="Close"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleEditSubmit} className="p-8 space-y-7">
                <div>
                  <label className="label-luxury">Challenge Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                    className="input-luxury"
                    placeholder="Enter challenge name"
                  />
                </div>

                <div>
                  <label className="label-luxury">Description *</label>
                  <textarea
                    name="description"
                    value={editFormData.description}
                    onChange={(e) => handleInputChange(e, true)}
                    required
                    rows={3}
                    className="textarea-luxury"
                    placeholder="Describe the challenge"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Target *</label>
                    <input
                      type="number"
                      name="target"
                      value={editFormData.target}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                      min="0"
                      step="0.1"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Current Progress *</label>
                    <input
                      type="number"
                      name="current"
                      value={editFormData.current}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                      min="0"
                      step="0.1"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Participants *</label>
                    <input
                      type="number"
                      name="participants"
                      value={editFormData.participants}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                      min="0"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Days Remaining *</label>
                    <input
                      type="number"
                      name="daysRemaining"
                      value={editFormData.daysRemaining}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                      min="0"
                      className="input-luxury"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="label-luxury">Badge Emoji</label>
                    <input
                      type="text"
                      name="badge"
                      value={editFormData.badge}
                      onChange={(e) => handleInputChange(e, true)}
                      className="input-luxury"
                      placeholder="🏅"
                    />
                  </div>
                  <div>
                    <label className="label-luxury">Accent Color</label>
                    <input
                      type="color"
                      name="color"
                      value={editFormData.color}
                      onChange={(e) => handleInputChange(e, true)}
                      className="h-12 w-full cursor-pointer rounded-lg border border-secondary-200 bg-transparent p-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button type="submit" className="btn-gold flex items-center space-x-2">
                    <FaSave size={14} />
                    <span>Update Challenge</span>
                  </button>
                  <button type="button" onClick={resetEditForm} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="border border-secondary-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-secondary-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold text-secondary-950">
                All Challenges
              </h2>
              <p className="text-secondary-400 text-xs mt-1">
                {challenges.length} {challenges.length === 1 ? 'challenge' : 'challenges'} ready for the app
              </p>
            </div>
          </div>

          {challenges.length === 0 ? (
            <div className="p-16 text-center">
              <p className="text-secondary-500 text-sm">No challenges yet. Create your first one.</p>
            </div>
          ) : (
            <div className="grid gap-6 p-8 lg:grid-cols-2">
              {challenges.map((challenge) => {
                const progress = getProgress(challenge);
                return (
                  <div
                    key={challenge.id}
                    className="rounded-2xl border border-secondary-100 bg-secondary-50/70 p-6 shadow-sm"
                    style={{ borderColor: `${challenge.color}22` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                          style={{ backgroundColor: `${challenge.color}16` }}
                        >
                          {challenge.badge}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-secondary-950">{challenge.name}</h3>
                          <p className="text-sm text-secondary-500">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: challenge.color }} />
                    </div>

                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-secondary-950">
                          {challenge.current} / {challenge.target}
                        </span>
                        <span className="text-secondary-500">{progress}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-secondary-200">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%`, backgroundColor: challenge.color }}
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-secondary-500">
                      <div>
                        <span className="font-semibold text-secondary-700">
                          {challenge.participants.toLocaleString()}
                        </span>{' '}
                        participants · {challenge.daysRemaining} days left
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(challenge)}
                          className="rounded-full p-2 text-secondary-400 transition-all duration-300 hover:bg-primary-50 hover:text-primary-600"
                          title="Edit"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(challenge.id)}
                          className="rounded-full p-2 text-secondary-400 transition-all duration-300 hover:bg-red-50 hover:text-red-500"
                          title="Delete"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;