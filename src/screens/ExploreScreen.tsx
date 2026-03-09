import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ALL_ITEMS = [
  { id: '1', name: 'Alpha Feature', category: 'Popular' },
  { id: '2', name: 'Beta Module', category: 'New' },
  { id: '3', name: 'Command Router', category: 'Popular' },
  { id: '4', name: 'Delta Service', category: 'New' },
  { id: '5', name: 'Echo Layer', category: 'Popular' },
  { id: '6', name: 'Foxtrot API', category: 'New' },
];

const FILTERS = ['All', 'Popular', 'New'];

type Props = {
  externalFilter?: { filter: string; sort?: string } | null;
};

export default function ExploreScreen({ externalFilter }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [filter, setFilter] = useState('All');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    if (externalFilter) {
      setFilter(externalFilter.filter);
      if (externalFilter.sort) {
        setSortAsc(externalFilter.sort === 'A-Z');
      }
    }
  }, [externalFilter]);

  const filtered = ALL_ITEMS
    .filter(item => filter === 'All' || item.category === filter)
    .sort((a, b) => sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  return (
    <View style={[styles.container, { backgroundColor: dark ? '#111' : '#fff' }]}>
      <View style={styles.controls}>
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterBtn, { backgroundColor: filter === f ? (dark ? '#fff' : '#000') : (dark ? '#333' : '#eee') }]}
              onPress={() => setFilter(f)}>
              <Text style={[styles.filterText, { color: filter === f ? (dark ? '#000' : '#fff') : (dark ? '#ccc' : '#333') }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.sortBtn, { backgroundColor: dark ? '#333' : '#eee' }]} onPress={() => setSortAsc(v => !v)}>
          <Text style={[styles.sortText, { color: dark ? '#ccc' : '#333' }]}>Sort: {sortAsc ? 'A-Z' : 'Z-A'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: dark ? '#222' : '#f9f9f9' }]}>
            <Text style={[styles.itemName, { color: dark ? '#fff' : '#000' }]}>{item.name}</Text>
            <Text style={[styles.itemCategory, { color: dark ? '#aaa' : '#888' }]}>{item.category}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 13,
  },
  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sortText: {
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  item: {
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
  },
  itemCategory: {
    fontSize: 12,
  },
});


