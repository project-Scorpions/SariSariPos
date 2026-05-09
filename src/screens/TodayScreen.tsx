import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useApp } from '../context/AppContext';

const peso = (v: number) => `₱${v.toFixed(2)}`;

export const TodayScreen: React.FC = () => {
  const { categorySalesToday } = useApp();
  const entries = Object.entries(categorySalesToday);
  const total = entries.reduce((sum, [, amount]) => sum + amount, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Cash Sales Today: {peso(total)}</Text>
      <FlatList
        data={entries}
        keyExtractor={([category]) => category}
        ListEmptyComponent={<Text style={styles.empty}>No cash-basis sales yet today.</Text>}
        renderItem={({ item: [category, amount] }) => (
          <View style={styles.row}>
            <Text>{category}</Text>
            <Text>{peso(amount)}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  header: { fontWeight: '700', fontSize: 18, marginBottom: 10 },
  empty: { textAlign: 'center', marginTop: 24, color: '#71717a' },
  row: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
