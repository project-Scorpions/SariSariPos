import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { RecordPaymentModal } from '../components/modals';
import { useApp } from '../context/AppContext';
import type { Sale } from '../types';

const peso = (v: number) => `₱${v.toFixed(2)}`;

export const UtangScreen: React.FC = () => {
  const { utangData, totalCollectibles, processPartialPayment } = useApp();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const selectedTransactions = useMemo<Sale[]>(
    () => utangData.find((u) => u.customerName === selectedCustomer)?.transactions ?? [],
    [utangData, selectedCustomer],
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Total Collectibles: {peso(totalCollectibles)}</Text>

      <FlatList
        data={utangData}
        keyExtractor={(item) => item.customerName}
        ListEmptyComponent={<Text style={styles.empty}>No unpaid utang.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => setSelectedCustomer(item.customerName)}>
            <Text style={styles.name}>{item.customerName}</Text>
            <Text>{peso(item.totalBalance)}</Text>
          </Pressable>
        )}
      />

      <RecordPaymentModal
        visible={Boolean(selectedCustomer)}
        customerName={selectedCustomer}
        transactions={selectedTransactions}
        onClose={() => setSelectedCustomer(null)}
        onSubmitPayment={(amount) => {
          if (selectedCustomer) {
            void processPartialPayment(selectedCustomer, amount);
          }
          setSelectedCustomer(null);
        }}
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
  name: { fontWeight: '700' },
});
