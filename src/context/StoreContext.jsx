import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProduct } from '../data/products';

const StoreContext = createContext(null);

const SELECTION_KEY = 'pj-selection';

const readStorage = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode) – state still works in memory */
  }
};

// The selection replaced the old wishlist; carry saved pieces across once and
// drop the retired cart.
const readSelection = () => {
  const raw = readStorage(SELECTION_KEY, null) ?? readStorage('pj-wishlist', []);
  // Saved under an old tag number: keep the piece under its current code.
  const saved = Array.isArray(raw) ? [...new Set(raw.filter((id) => typeof id === 'string').map((id) => getProduct(id)?.id).filter(Boolean))] : [];
  writeStorage(SELECTION_KEY, saved);
  try {
    window.localStorage.removeItem('pj-wishlist');
    window.localStorage.removeItem('pj-cart');
  } catch {
    /* ignore */
  }
  return saved;
};

export function StoreProvider({ children }) {
  const [selection, setSelection] = useState(readSelection);
  // Which overlay is open: 'selection' | 'search' | 'menu' | null
  const [panel, setPanel] = useState(null);
  // Generic modal for service flows: { type, payload }
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();
  const selectionRef = useRef(selection);
  selectionRef.current = selection;

  useEffect(() => writeStorage(SELECTION_KEY, selection), [selection]);

  // Keep tabs in sync when the selection changes in another window.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== SELECTION_KEY) return;
      const next = readStorage(SELECTION_KEY, []);
      setSelection(Array.isArray(next) ? next.filter((id) => getProduct(id)) : []);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const notify = useCallback((message) => {
    window.clearTimeout(toastTimer.current);
    setToast({ message, id: Date.now() });
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const addToSelection = useCallback(
    (id) => {
      if (selectionRef.current.includes(id)) return;
      setSelection((list) => (list.includes(id) ? list : [...list, id]));
      notify('Added to your selection');
    },
    [notify],
  );

  const removeFromSelection = useCallback(
    (id) => {
      if (!selectionRef.current.includes(id)) return;
      setSelection((list) => list.filter((x) => x !== id));
      notify('Removed from your selection');
    },
    [notify],
  );

  const toggleSelection = useCallback(
    (id) => (selectionRef.current.includes(id) ? removeFromSelection(id) : addToSelection(id)),
    [addToSelection, removeFromSelection],
  );

  const clearSelection = useCallback(() => {
    setSelection([]);
    notify('Your selection is clear');
  }, [notify]);

  const value = useMemo(
    () => ({
      selection,
      selectedProducts: selection.map(getProduct).filter(Boolean),
      isSelected: (id) => selection.includes(id),
      addToSelection,
      removeFromSelection,
      toggleSelection,
      clearSelection,
      panel,
      openPanel: setPanel,
      closePanel: () => setPanel(null),
      modal,
      openModal: (type, payload) => setModal({ type, payload }),
      closeModal: () => setModal(null),
      toast,
      notify,
    }),
    [selection, panel, modal, toast, addToSelection, removeFromSelection, toggleSelection, clearSelection, notify],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>');
  return ctx;
};

/** The jewellery selection: saved pieces that become one WhatsApp enquiry. */
export function useJewellerySelection() {
  const { selection, selectedProducts, isSelected, addToSelection, removeFromSelection, toggleSelection, clearSelection, openPanel } = useStore();
  return {
    ids: selection,
    count: selection.length,
    products: selectedProducts,
    isSelected,
    addToSelection,
    removeFromSelection,
    toggleSelection,
    clearSelection,
    openSelection: () => openPanel('selection'),
  };
}
