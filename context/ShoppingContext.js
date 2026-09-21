import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CATEGORIES, DEFAULT_CATEGORY } from '../data/categories';
import { categorizeProduct } from '../data/categorize';
import { INITIAL_ITEMS } from '../data/const';
import { INITIAL_FREQUENT } from '../data/frequent';

const ShoppingContext = createContext();
const FREQUENT_STORAGE_KEY = '@indkobsliste/frequent';

function normalizeName(name) {
  return name.trim().toLowerCase();
}

function parseQuantity(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

function sortItemsInCategory(a, b) {
  if (a.bought !== b.bought) return a.bought ? 1 : -1;
  return a.name.localeCompare(b.name, 'da');
}

function bumpFrequent(list, entries) {
  let next = [...list];

  entries.forEach((entry) => {
    const name = entry.name?.trim();
    if (!name) return;

    const category =
      entry.category && CATEGORIES.includes(entry.category)
        ? entry.category
        : categorizeProduct(name);
    const amount = entry.amount || 1;
    const index = next.findIndex(
      (item) => normalizeName(item.name) === normalizeName(name)
    );

    if (index === -1) {
      // Nye varer lægges nederst, så brugerens egen rækkefølge for
      // eksisterende varer ikke ændres, når en ny vare bliver købt.
      next.push({ name, category, count: amount });
    } else {
      next[index] = {
        ...next[index],
        category,
        count: next[index].count + amount,
      };
    }
  });

  return next;
}

export function ShoppingProvider({ children }) {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [frequentItems, setFrequentItems] = useState(INITIAL_FREQUENT);
  const [frequentReady, setFrequentReady] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FREQUENT_STORAGE_KEY);
        if (!active) return;

        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFrequentItems(parsed);
          }
        }
      } catch {
        // behold seed-data hvis lagring fejler
      } finally {
        if (active) setFrequentReady(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!frequentReady) return;

    AsyncStorage.setItem(
      FREQUENT_STORAGE_KEY,
      JSON.stringify(frequentItems)
    ).catch(() => {});
  }, [frequentItems, frequentReady]);

  const recordPurchases = useCallback((entries) => {
    if (!entries?.length) return;
    setFrequentItems((prev) => bumpFrequent(prev, entries));
  }, []);

  const addItem = (name, quantity = 1, category) => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const amount = parseQuantity(quantity);
    const resolvedCategory =
      category && CATEGORIES.includes(category)
        ? category
        : categorizeProduct(trimmed);

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => normalizeName(item.name) === normalizeName(trimmed)
      );

      if (existingIndex !== -1) {
        return prev.map((item, index) =>
          index === existingIndex
            ? {
                ...item,
                quantity: item.quantity + amount,
                category: resolvedCategory,
                bought: false,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          id: Date.now().toString(),
          name: trimmed,
          quantity: amount,
          category: resolvedCategory || DEFAULT_CATEGORY,
          bought: false,
        },
      ];
    });

    return true;
  };

  const toggleItem = (id) => {
    let purchased = null;

    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target && !target.bought) {
        purchased = {
          name: target.name,
          category: target.category,
          amount: 1,
        };
      }

      return prev.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item
      );
    });

    if (purchased) {
      recordPurchases([purchased]);
    }
  };

  const changeQuantity = (id, delta) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id !== id) return item;
          return { ...item, quantity: item.quantity + delta };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const updateItem = (id, { name, category }) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return false;

    const resolvedCategory =
      category && CATEGORIES.includes(category)
        ? category
        : categorizeProduct(trimmed);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, name: trimmed, category: resolvedCategory }
          : item
      )
    );
    return true;
  };

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearBought = () => {
    setItems((prev) => prev.filter((item) => !item.bought));
  };

  const addFromFrequent = (frequentItem) => {
    return addItem(frequentItem.name, 1, frequentItem.category);
  };

  const addManualFrequent = (name, category) => {
    const trimmed = (name || '').trim();
    if (!trimmed) return false;

    const alreadyExists = frequentItems.some(
      (item) => normalizeName(item.name) === normalizeName(trimmed)
    );
    if (alreadyExists) return false;

    const resolvedCategory =
      category && CATEGORIES.includes(category)
        ? category
        : categorizeProduct(trimmed);

    setFrequentItems((prev) => [
      ...prev,
      { name: trimmed, category: resolvedCategory, count: 0 },
    ]);
    return true;
  };

  const removeFrequent = (name) => {
    setFrequentItems((prev) =>
      prev.filter((item) => normalizeName(item.name) !== normalizeName(name))
    );
  };

  const reorderFrequent = (fromIndex, toIndex) => {
    setFrequentItems((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const sections = useMemo(() => {
    const byCategory = {};

    items.forEach((item) => {
      const key = item.category || DEFAULT_CATEGORY;
      if (!byCategory[key]) byCategory[key] = [];
      byCategory[key].push(item);
    });

    return CATEGORIES.filter((category) => byCategory[category]?.length).map(
      (category) => ({
        title: category,
        data: [...byCategory[category]].sort(sortItemsInCategory),
      })
    );
  }, [items]);

  return (
    <ShoppingContext.Provider
      value={{
        items,
        sections,
        frequentItems,
        addItem,
        addFromFrequent,
        addManualFrequent,
        removeFrequent,
        reorderFrequent,
        toggleItem,
        changeQuantity,
        updateItem,
        deleteItem,
        clearBought,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  return useContext(ShoppingContext);
}
