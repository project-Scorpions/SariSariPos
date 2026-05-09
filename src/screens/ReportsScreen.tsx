import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ReceiptModal } from '../components/modals';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';

const peso = (v: number) => `₱${v.toFixed(2)}`;

export const ReportsScreen: React.FC = () => {
  const { monthlySales, sales } = useApp();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const monthEntries = Object.entries(monthlySales);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Monthly Sales (Cash Basis)</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthRow}>
        {monthEntries.length === 0 ? (
          <View style={styles.monthCard}>
            <Text>No monthly data</Text>
          </View>
        ) : (
          monthEntries.map(([month, total]) => (
            <View key={month} style={styles.monthCard}>
              <Text style={styles.monthTitle}>{month}</Text>
              <Text>{peso(total)}</Text>
            </View>
          ))
        )}
      </ScrollView>

      <Text style={[styles.header, { marginTop: 10 }]}>Transaction History</Text>
      <FlatList
        data={sales}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bold}>{item.transactionId}</Text>
              <Text>{new Date(item.timestamp).toLocaleString()}</Text>
              <Text>
                {item.customerName} · {peso(item.total)} {item.isUtang ? '(Utang)' : ''}
              </Text>
            </View>
            <Pressable style={styles.reprintBtn} onPress={() => setSelectedSale(item)}>
              <Text>🖨️</Text>
            </Pressable>
          </View>
        )}
      />

      <ReceiptModal visible={Boolean(selectedSale)} sale={selectedSale} onClose={() => setSelectedSale(null)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  header: { fontWeight: '700', fontSize: 18 },
  monthRow: { gap: 8, paddingVertical: 10 },
  monthCard: {
    width: 130,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 10,
  },
  monthTitle: { fontWeight: '700', marginBottom: 6 },
  row: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  bold: { fontWeight: '700' },
  reprintBtn: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    padding: 10,
  },
});
