const STORAGE_KEY = 'reports-presets';

export const listPresets = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const savePreset = (preset) => {
  const all = listPresets();
  const withId = preset.id ? preset : { ...preset, id: Date.now() };
  const updated = [withId, ...all.filter(p => p.id !== withId.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return withId;
};

export const deletePreset = (id) => {
  const all = listPresets();
  const updated = all.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};

export const getPreset = (id) => {
  return listPresets().find(p => p.id === id) || null;
};




