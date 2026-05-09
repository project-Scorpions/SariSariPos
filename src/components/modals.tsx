import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { Product, Sale, Variant } from '../types';

const peso = (value: number) => `₱${value.toFixed(2)}`;
const parseVariantInputValue = (field: keyof Variant, value: string) => {
  if (field === 'name') {
    return value;
  }

  if (field === 'stock') {
    return value === '' ? null : Number(value);
  }

  return Number(value);
};

type BasicModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const VariantPickerModal: React.FC<
  BasicModalProps & {
    product: Product | null;
    onPick: (variant: Variant) => void;
  }
> = ({ visible, onClose, product, onPick }) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{product?.name ?? 'Select Variant'}</Text>
        <FlatList
          data={product?.variants ?? []}
          keyExtractor={(v) => v.id}
          renderItem={({ item }) => (
            <Pressable style={styles.listRow} onPress={() => onPick(item)}>
              <Text>{item.name}</Text>
              <Text>
                {peso(item.price)} · {item.stock === null ? '∞' : item.stock}
              </Text>
            </Pressable>
          )}
        />
        <Pressable style={styles.secondaryButton} onPress={onClose}>
          <Text>Close</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

export const AddCustomItemModal: React.FC<
  BasicModalProps & {
    onSubmit: (payload: { name: string; category: string; price: number }) => void;
  }
> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Load');
  const [price, setPrice] = useState('0');

  const reset = () => {
    setName('');
    setCategory('Load');
    setPrice('0');
  };

  const handleSubmit = () => {
    onSubmit({ name: name.trim(), category: category.trim(), price: Number(price) || 0 });
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Add Custom Item</Text>
          <TextInput placeholder="Name" style={styles.input} value={name} onChangeText={setName} />
          <TextInput
            placeholder="Category"
            style={styles.input}
            value={category}
            onChangeText={setCategory}
          />
          <TextInput
            placeholder="Price"
            style={styles.input}
            value={price}
            keyboardType="decimal-pad"
            onChangeText={setPrice}
          />
          <Pressable style={styles.primaryButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Add</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export const ProductFormModal: React.FC<
  BasicModalProps & {
    initial?: Product | null;
    onSave: (payload: Product) => void;
  }
> = ({ visible, onClose, initial, onSave }) => {
  const initialProduct = useMemo<Product>(
    () =>
      initial ?? {
        id: `tmp-${Date.now()}`,
        name: '',
        category: 'Tindahan',
        image: '',
        variants: [{ id: `v-${Date.now()}`, name: 'Default', price: 0, costPrice: 0, stock: 0 }],
      },
    [initial],
  );
  const [product, setProduct] = useState<Product>(initialProduct);

  React.useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct, visible]);

  const updateVariant = (id: string, field: keyof Variant, value: string) => {
    setProduct((prev) => ({
      ...prev,
      variants: prev.variants.map((v) =>
        v.id === id
          ? {
              ...v,
              [field]: parseVariantInputValue(field, value),
            }
          : v,
      ),
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={[styles.sheet, { maxHeight: '90%' }]}>
          <Text style={styles.title}>{initial ? 'Edit Product' : 'Add Product'}</Text>
          <TextInput
            placeholder="Product Name"
            style={styles.input}
            value={product.name}
            onChangeText={(name) => setProduct((prev) => ({ ...prev, name }))}
          />
          <TextInput
            placeholder="Category"
            style={styles.input}
            value={product.category}
            onChangeText={(category) => setProduct((prev) => ({ ...prev, category }))}
          />
          {product.variants.map((variant) => (
            <View key={variant.id} style={styles.variantBlock}>
              <TextInput
                style={styles.input}
                value={variant.name}
                onChangeText={(v) => updateVariant(variant.id, 'name', v)}
                placeholder="Variant name"
              />
              <TextInput
                style={styles.input}
                value={`${variant.price}`}
                onChangeText={(v) => updateVariant(variant.id, 'price', v)}
                keyboardType="decimal-pad"
                placeholder="Price"
              />
              <TextInput
                style={styles.input}
                value={`${variant.costPrice}`}
                onChangeText={(v) => updateVariant(variant.id, 'costPrice', v)}
                keyboardType="decimal-pad"
                placeholder="Cost"
              />
              <TextInput
                style={styles.input}
                value={variant.stock === null ? '' : `${variant.stock}`}
                onChangeText={(v) => updateVariant(variant.id, 'stock', v)}
                keyboardType="number-pad"
                placeholder="Stock (blank = infinite)"
              />
            </View>
          ))}
          <Pressable
            style={styles.secondaryButton}
            onPress={() =>
              setProduct((prev) => ({
                ...prev,
                variants: [
                  ...prev.variants,
                  { id: `v-${Date.now()}`, name: 'Variant', price: 0, costPrice: 0, stock: 0 },
                ],
              }))
            }
          >
            <Text>Add Variant</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={() => onSave(product)}>
            <Text style={styles.buttonText}>Save Product</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text>Cancel</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const UtangCustomerPromptModal: React.FC<
  BasicModalProps & {
    onSubmit: (customerName: string) => void;
  }
> = ({ visible, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Record Utang</Text>
          <TextInput style={styles.input} placeholder="Customer Name" value={name} onChangeText={setName} />
          <Pressable style={styles.primaryButton} onPress={() => onSubmit(name || 'Unnamed Customer')}>
            <Text style={styles.buttonText}>Confirm</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

export const RecordPaymentModal: React.FC<
  BasicModalProps & {
    customerName: string | null;
    transactions: Sale[];
    onSubmitPayment: (amount: number) => void;
  }
> = ({ visible, onClose, customerName, transactions, onSubmitPayment }) => {
  const [amount, setAmount] = useState('0');
  const total = transactions.reduce((sum, tx) => sum + tx.balance, 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <ScrollView style={[styles.sheet, { maxHeight: '90%' }]}>
          <Text style={styles.title}>Record Payment: {customerName}</Text>
          <Text style={styles.subtitle}>Outstanding: {peso(total)}</Text>
          {transactions.map((tx) => (
            <View key={tx.id} style={styles.listRow}>
              <Text>{new Date(tx.timestamp).toLocaleDateString()}</Text>
              <Text>{peso(tx.balance)}</Text>
            </View>
          ))}
          <TextInput
            value={amount}
            onChangeText={setAmount}
            style={styles.input}
            keyboardType="decimal-pad"
            placeholder="Payment amount"
          />
          <Pressable style={styles.primaryButton} onPress={() => onSubmitPayment(Number(amount) || 0)}>
            <Text style={styles.buttonText}>Apply FIFO Payment</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onClose}>
            <Text>Close</Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
};

export const ReceiptModal: React.FC<
  BasicModalProps & {
    sale: Sale | null;
  }
> = ({ visible, onClose, sale }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>Sari-Sari POS Receipt</Text>
        <Text>{sale?.transactionId}</Text>
        <Text>{new Date(sale?.timestamp ?? Date.now()).toLocaleString()}</Text>
        {(sale?.items ?? []).map((item) => (
          <View key={item.id} style={styles.listRow}>
            <Text>{item.name} x{item.quantity}</Text>
            <Text>{peso(item.price * item.quantity)}</Text>
          </View>
        ))}
        <Text style={styles.subtitle}>Total: {peso(sale?.total ?? 0)}</Text>
        <Text>Cash: {peso(sale?.cashReceived ?? 0)}</Text>
        <Text>Balance: {peso(sale?.balance ?? 0)}</Text>
        <Text>Change: {peso(sale?.change ?? 0)}</Text>
        <Pressable style={styles.primaryButton} onPress={onClose}>
          <Text style={styles.buttonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

export const ConfirmationModal: React.FC<
  BasicModalProps & {
    title: string;
    message: string;
    confirmText: string;
    onConfirm: () => void;
  }
> = ({ visible, onClose, title, message, confirmText, onConfirm }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{message}</Text>
        <Pressable style={styles.primaryButton} onPress={onConfirm}>
          <Text style={styles.buttonText}>{confirmText}</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={onClose}>
          <Text>Cancel</Text>
        </Pressable>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 16,
  },
  sheet: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 10,
  },
  listRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d3d3d3',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  variantBlock: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#efefef',
    borderRadius: 8,
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#f4f4f5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
