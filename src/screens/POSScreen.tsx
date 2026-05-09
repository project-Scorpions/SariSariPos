import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { VariantPickerModal } from '../components/modals';
import type { Product } from '../types';

const categories = ['All', 'Cigarettes', 'Softdrink', 'Load', 'Tindahan'];

export const POSScreen: React.FC<{ onViewCart: () => void }> = ({ onViewCart }) => {
  const { inventory, cart, addToCartWithVariant } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [variantProduct, setVariantProduct] = useState<Product | null>(null);

  const filtered = useMemo(
    () =>
      inventory.filter((p) => {
        const matchesName = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesName && matchesCategory;
      }),
    [inventory, query, selectedCategory],
  );

  const handleAddToCart = (product: Product) => {
    if (product.variants.length > 1) {
      setVariantProduct(product);
      return;
    }
    const [defaultVariant] = product.variants;
    if (defaultVariant) {
      addToCartWithVariant(product, defaultVariant);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Search products"
      />
      <FlatList
        horizontal
        data={categories}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.pill, selectedCategory === item && styles.pillActive]}
            onPress={() => setSelectedCategory(item)}
          >
            <Text style={selectedCategory === item ? styles.pillTextActive : undefined}>{item}</Text>
          </Pressable>
        )}
        style={{ marginBottom: 8 }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 80 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleAddToCart(item)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>{item.category}</Text>
            <Text>
              {item.variants.length > 1
                ? `${item.variants.length} Options`
                : `₱${(item.variants[0]?.price ?? 0).toFixed(2)}`}
            </Text>
          </Pressable>
        )}
      />

      {cart.length > 0 ? (
        <Pressable style={styles.floating} onPress={onViewCart}>
          <Text style={styles.floatingText}>View Cart ({cart.length})</Text>
        </Pressable>
      ) : null}

      <VariantPickerModal
        visible={Boolean(variantProduct)}
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onPick={(variant) => {
          if (variantProduct) {
            addToCartWithVariant(variantProduct, variant);
          }
          setVariantProduct(null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 12 },
  search: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  pillActive: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  pillTextActive: { color: '#fff', fontWeight: '700' },
  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 12,
    minHeight: 90,
    justifyContent: 'space-between',
  },
  cardTitle: { fontWeight: '700' },
  floating: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#1d4ed8',
    borderRadius: 999,
    padding: 14,
    alignItems: 'center',
  },
  floatingText: { color: '#fff', fontWeight: '700' },
});
