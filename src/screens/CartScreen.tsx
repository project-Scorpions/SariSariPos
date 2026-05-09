import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  AddCustomItemModal,
  ConfirmationModal,
  ReceiptModal,
  UtangCustomerPromptModal,
} from '../components/modals';
import { useApp } from '../context/AppContext';

const quickCash = [50, 100, 200, 500, 1000];

export const CartScreen: React.FC = () => {
  const {
    cart,
    cashInput,
    setCashInput,
    updateCartQty,
    removeCartItem,
    addCustomItemToCart,
    processCheckout,
    receiptSale,
    setReceiptSale,
  } = useApp();
  const [customOpen, setCustomOpen] = useState(false);
  const [utangPromptOpen, setUtangPromptOpen] = useState(false);
  const [familyConfirmOpen, setFamilyConfirmOpen] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  );
  const cash = Number(cashInput) || 0;
  const isUtang = cash < total;

  const checkoutLabel = isUtang ? 'Record Utang' : 'Charge';

  const submitCheckout = async (customerName: string, cashValue: number) => {
    if (cart.length === 0) {
      Alert.alert('Cart is empty');
      return;
    }
    try {
      await processCheckout(customerName, cashValue);
    } catch (error) {
      Alert.alert('Checkout failed', String(error));
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No items in cart.</Text>}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View>
              <Text style={styles.bold}>{item.name}</Text>
              <Text>
                {item.variantName ? `${item.variantName} · ` : ''}₱{item.price.toFixed(2)}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable onPress={() => updateCartQty(item.id, -1)} style={styles.qtyButton}>
                <Text>-</Text>
              </Pressable>
              <Text>{item.quantity}</Text>
              <Pressable onPress={() => updateCartQty(item.id, 1)} style={styles.qtyButton}>
                <Text>+</Text>
              </Pressable>
              <Pressable onPress={() => removeCartItem(item.id)} style={styles.deleteButton}>
                <Text style={{ color: '#fff' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <Pressable style={styles.secondaryBtn} onPress={() => setCustomOpen(true)}>
        <Text>Add Custom Item</Text>
      </Pressable>

      <Text style={styles.total}>Total: ₱{total.toFixed(2)}</Text>
      <TextInput
        style={styles.input}
        keyboardType="decimal-pad"
        value={cashInput}
        onChangeText={setCashInput}
        placeholder="Cash received"
      />

      <View style={styles.quickRow}>
        <Pressable style={styles.quickBtn} onPress={() => setCashInput(total.toFixed(2))}>
          <Text>Exact Amount</Text>
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={() => setFamilyConfirmOpen(true)}>
          <Text>Consumo</Text>
        </Pressable>
      </View>

      <View style={styles.quickRowWrap}>
        {quickCash.map((amt) => (
          <Pressable key={amt} style={styles.quickCashBtn} onPress={() => setCashInput(String(amt))}>
            <Text>₱{amt}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.primaryBtn}
        onPress={() => {
          if (isUtang) {
            setUtangPromptOpen(true);
          } else {
            void submitCheckout('Walk-in', cash);
          }
        }}
      >
        <Text style={styles.primaryTxt}>{checkoutLabel}</Text>
      </Pressable>

      <AddCustomItemModal
        visible={customOpen}
        onClose={() => setCustomOpen(false)}
        onSubmit={(payload) => addCustomItemToCart(payload)}
      />

      <UtangCustomerPromptModal
        visible={utangPromptOpen}
        onClose={() => setUtangPromptOpen(false)}
        onSubmit={(name) => {
          setUtangPromptOpen(false);
          void submitCheckout(name, cash);
        }}
      />

      <ConfirmationModal
        visible={familyConfirmOpen}
        onClose={() => setFamilyConfirmOpen(false)}
        title="Family Consumo"
        message="Record this cart as Family Consumo with ₱0 cash?"
        confirmText="Record Family Consumo"
        onConfirm={() => {
          setFamilyConfirmOpen(false);
          void submitCheckout('Family Consumo', 0);
        }}
      />

      <ReceiptModal
        visible={Boolean(receiptSale)}
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  empty: { textAlign: 'center', marginTop: 24, color: '#71717a' },
  row: {
    borderBottomWidth: 1,
    borderBottomColor: '#e4e4e7',
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bold: { fontWeight: '700' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyButton: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: { backgroundColor: '#dc2626', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6 },
  secondaryBtn: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  total: { marginTop: 12, fontSize: 18, fontWeight: '700' },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    padding: 10,
  },
  quickRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  quickBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
  },
  quickRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  quickCashBtn: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    alignItems: 'center',
    padding: 14,
  },
  primaryTxt: { color: '#fff', fontWeight: '700' },
});
