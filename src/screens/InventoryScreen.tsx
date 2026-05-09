import React, { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ConfirmationModal, ProductFormModal } from '../components/modals';
import { useApp } from '../context/AppContext';
import type { Product } from '../types';

export const InventoryScreen: React.FC = () => {
  const { inventory, quickAdjustStock, saveProduct, deleteProduct } = useApp();
  const [editing, setEditing] = useState<Product | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() => {
          setEditing(null);
          setOpenForm(true);
        }}
      >
        <Text style={styles.addButtonText}>Add Product</Text>
      </Pressable>

      <FlatList
        data={inventory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{item.name}</Text>
              <Text>{item.category}</Text>
            </View>
            {item.variants.map((variant) => (
              <View key={variant.id} style={styles.variantRow}>
                <Text>{variant.name}</Text>
                <View style={styles.stockControls}>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => void quickAdjustStock(item.id, variant.id, -1)}
                  >
                    <Text>-</Text>
                  </Pressable>
                  <Text>{variant.stock === null ? '∞' : variant.stock}</Text>
                  <Pressable
                    style={styles.qtyButton}
                    onPress={() => void quickAdjustStock(item.id, variant.id, 1)}
                  >
                    <Text>+</Text>
                  </Pressable>
                </View>
              </View>
            ))}
            <View style={styles.actionRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setEditing(item);
                  setOpenForm(true);
                }}
              >
                <Text>Edit</Text>
              </Pressable>
              <Pressable style={styles.deleteButton} onPress={() => setDeleteId(item.id)}>
                <Text style={{ color: '#fff' }}>Delete</Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      <ProductFormModal
        visible={openForm}
        initial={editing}
        onClose={() => setOpenForm(false)}
        onSave={async (payload) => {
          try {
            if (!payload.name.trim()) {
              Alert.alert('Product name is required');
              return;
            }
            await saveProduct(
              {
                name: payload.name,
                category: payload.category,
                image: payload.image,
                variants: payload.variants,
              },
              editing?.id,
            );
            setOpenForm(false);
          } catch (error) {
            Alert.alert('Save failed', String(error));
          }
        }}
      />

      <ConfirmationModal
        visible={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        title="Delete Product"
        message="This permanently deletes the product from inventory."
        confirmText="Delete"
        onConfirm={() => {
          if (deleteId) {
            void deleteProduct(deleteId);
          }
          setDeleteId(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  addButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: { color: '#fff', fontWeight: '700' },
  card: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  cardHeader: { marginBottom: 8 },
  name: { fontWeight: '700', fontSize: 16 },
  variantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockControls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyButton: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 6,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: { flexDirection: 'row', gap: 8 },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    alignItems: 'center',
    padding: 10,
  },
});
