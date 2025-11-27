import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { fetchPokemonList, PokemonDetail } from '../api/pokeAPI';

// Get screen width to calculate card size dynamically
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3; // 48 = padding (16 left + 16 right + space between)

export default function PokedexScreen({ navigation }: any) {
  // 2. Add State for the real list
  const [pokemonList, setPokemonList] = useState<PokemonDetail[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchText, setSearchText] = useState('');
  const [sortOption, setSortOption] = useState<'number' | 'name'>('number');
  const [isSortModalVisible, setSortModalVisible] = useState(false);

  // 3. Fetch Data on Mount
  useEffect(() => {
    const loadData = async () => {
      const data = await fetchPokemonList();
      setPokemonList(data);
      setLoading(false);
    };
    loadData();
  }, []);

  // 4. FILTER Logic (Updated to use pokemonList state)
  const filteredData = pokemonList.filter((pokemon) => {
    const searchLower = searchText.toLowerCase();
    const matchesName = pokemon.name.toLowerCase().includes(searchLower);
    const matchesId = pokemon.id.toString().includes(searchLower);
    return matchesName || matchesId;
  });

  // 5. SORT Logic
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortOption === 'name') {
      return a.name.localeCompare(b.name);
    }
    return a.id - b.id;
  });

  // 6. RENDER ITEM
  const renderCard = ({ item }: { item: PokemonDetail }) => {
    const formattedId = `#${item.id.toString().padStart(3, '0')}`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PokemonDetailScreen', { pokemonId: item.id })}
      >
        <View style={styles.cardInner}>
            <Text style={styles.idText}>{formattedId}</Text>
            <Image source={{ uri: item.spriteUrl }} style={styles.sprite} />
        </View>
        <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  // Loading View
  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#DC0A2D" />
        <Text style={{color: 'white', marginTop: 10}}>Loading Pokedex...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
          <Text style={styles.headerTitle}>Pokédex</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Text style={{fontSize: 16, marginRight: 8}}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                placeholderTextColor="#666"
                value={searchText}
                onChangeText={setSearchText}
              />
              {searchText.length > 0 && (
                 <TouchableOpacity onPress={() => setSearchText('')}>
                   <Text style={{fontSize: 16, color: '#666'}}>✕</Text>
                 </TouchableOpacity>
              )}
            </View>
            
            {/* Sort Button */}
            <TouchableOpacity 
              style={styles.sortButton} 
              onPress={() => setSortModalVisible(true)}
            >
              <Text style={styles.sortButtonText}>#</Text>
            </TouchableOpacity>
          </View>
      </View>

      {/* GRID CONTENT */}
      <FlatList
        data={sortedData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCard}
        numColumns={3}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
      />

      {/* SORT MODAL */}
      <Modal
        visible={isSortModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setSortModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort by:</Text>
            
            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => { setSortOption('number'); setSortModalVisible(false); }}
            >
              <View style={[styles.radioOuter, sortOption === 'number' && styles.radioSelected]}>
                {sortOption === 'number' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Number</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.radioRow} 
              onPress={() => { setSortOption('name'); setSortModalVisible(false); }}
            >
               <View style={[styles.radioOuter, sortOption === 'name' && styles.radioSelected]}>
                {sortOption === 'name' && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>Name</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333', // Your dark mode background
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- HEADER STYLES ---
  header: {
    backgroundColor: '#DC0A2D', 
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 20, 
  },
  headerContent: {
    // Wrapper ensuring full width
    width: '100%',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#000',
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#DC0A2D',
  },
  
  // --- LIST STYLES ---
  listContent: {
    padding: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  
  // --- CARD STYLES ---
  card: {
    width: CARD_WIDTH,
    alignItems: 'center',
  },
  cardInner: {
    width: '100%',
    aspectRatio: 1, 
    backgroundColor: '#333333', // Dark card background
    borderRadius: 12,
    padding: 8,
    position: 'relative',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#eee',
  },
  idText: {
    position: 'absolute',
    top: 6,
    right: 8,
    fontSize: 10,
    color: '#fff',
  },
  sprite: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  nameText: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'capitalize',
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 200,
    backgroundColor: '#3d3d3dff', // Dark modal
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#DC0A2D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioSelected: {
    borderColor: '#DC0A2D',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC0A2D',
  },
  radioLabel: {
    fontSize: 14,
    color: '#fff',
  }
});