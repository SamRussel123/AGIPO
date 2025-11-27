import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  SafeAreaView
} from 'react-native';
import { fetchPokemonDetail, PokemonDetail } from '../api/pokeAPI';

const { width } = Dimensions.get('window');

const getTypeColor = (type: string) => {
  const colors: { [key: string]: string } = {
    grass: '#74CB48',
    fire: '#F57D31',
    water: '#6493EB',
    bug: '#A7B723',
    normal: '#AAA67F',
    electric: '#F9CF30',
    ghost: '#70559B',
    psychic: '#FB5584',
    steel: '#B7B9D0',
    rock: '#B69E31',
    poison: '#A43E9E',
    ground: '#E2BF65',
    dragon: '#7037FF',
    fairy: '#D685AD',
    ice: '#9AD6DF',
    fighting: '#C12239'
  };
  return colors[type] || '#A8A878';
};

export default function PokemonDetailScreen({ route, navigation }: any) {
  const { pokemonId } = route.params;
  
  const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPokemonData = async () => {
      const data = await fetchPokemonDetail(pokemonId);
      setPokemon(data);
      setLoading(false);
    };
    loadPokemonData();
  }, [pokemonId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC0A2D" />
      </View>
    );
  }

  if (!pokemon) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{color: 'white'}}>Failed to load Pokémon data.</Text>
      </View>
    );
  }

  const mainType = pokemon.types[0];
  const backgroundColor = getTypeColor(mainType);

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            {/* Using a larger, bolder arrow to match design */}
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{pokemon.name}</Text>
          <Text style={styles.headerId}>#{String(pokemon.id).padStart(3, '0')}</Text>
        </View>
      </SafeAreaView>

      <View style={styles.imageContainer}>
        <Image source={{ uri: pokemon.spriteUrl }} style={styles.image as any} />
      </View>

      <View style={styles.whiteSheet}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Types */}
          <View style={styles.typeContainer}>
            {pokemon.types.map((type) => (
              <View key={type} style={[styles.typeChip, { backgroundColor: getTypeColor(type) }]}>
                <Text style={styles.typeText}>{type}</Text>
              </View>
            ))}
          </View>

          {/* About Section */}
          <Text style={[styles.sectionTitle, { color: backgroundColor }]}>About</Text>
          
          <View style={styles.statsRow}>
            {/* Weight */}
            <View style={styles.statItem}>
              <View style={styles.statValueContainer}>
                 {/* You could add a simple scale icon text here like ⚖️ if desired */}
                <Text style={styles.statValue}>{pokemon.weight / 10} kg</Text>
              </View>
              <Text style={styles.statLabel}>Weight</Text>
            </View>
            
            <View style={styles.statDivider} />
            
            {/* Height */}
            <View style={styles.statItem}>
               <View style={styles.statValueContainer}>
                <Text style={styles.statValue}>{pokemon.height / 10} m</Text>
              </View>
              <Text style={styles.statLabel}>Height</Text>
            </View>

            <View style={styles.statDivider} />

            {/* Moves / Abilities */}
            <View style={styles.statItem}>
               <View style={styles.statValueColumn}>
                {pokemon.abilities.slice(0, 2).map((ability) => (
                  <Text key={ability} style={styles.statValueSmall}>
                    {ability.replace('-', ' ')}
                  </Text>
                ))}
              </View>
              <Text style={styles.statLabel}>Moves</Text>
            </View>
          </View>

          {/* Flavor Text */}
          {pokemon.speciesData?.flavor_text_entries && (
            <Text style={styles.description}>
               {pokemon.speciesData.flavor_text_entries
                .find((entry: any) => entry.language.name === 'en')
                ?.flavor_text.replace(/\n/g, ' ') || ''}
            </Text>
          )}

          {/* Base Stats */}
          <Text style={[styles.sectionTitle, { color: backgroundColor }]}>Base Stats</Text>
          
          {pokemon.stats.map((stat: any) => (
            <View key={stat.stat.name} style={styles.statBarRow}>
              <Text style={[styles.statName, { color: backgroundColor }]}>
                {stat.stat.name === 'special-attack' ? 'SATK' : 
                 stat.stat.name === 'special-defense' ? 'SDEF' : 
                 stat.stat.name === 'hp' ? 'HP' : 
                 stat.stat.name === 'attack' ? 'ATK' : 
                 stat.stat.name === 'defense' ? 'DEF' : 
                 stat.stat.name === 'speed' ? 'SPD' : 
                 stat.stat.name.toUpperCase().slice(0, 3)}
              </Text>
              <Text style={styles.statNumber}>{String(stat.base_stat).padStart(3, '0')}</Text>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${(stat.base_stat / 255) * 100}%`,
                      backgroundColor 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
    zIndex: 10,
  },
  backText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
    position: 'absolute', // Absolute center
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  headerId: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  imageContainer: {
    alignItems: 'center',
    zIndex: 1,
    marginBottom: -40, // Overlap effect
  },
  image: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
  },
  whiteSheet: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8, // Slightly less rounded than before to match "card" look
    marginHorizontal: 4, // Slight margin on sides like a card
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  content: {
    paddingBottom: 40,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  typeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    height: 24,
  },
  statValueColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    color: '#1D1D1D',
  },
  statValueSmall: {
    fontSize: 12,
    color: '#1D1D1D',
    textTransform: 'capitalize',
    lineHeight: 16,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
  description: {
    textAlign: 'center',
    color: '#1D1D1D',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  statBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statName: {
    width: 40,
    fontSize: 12,
    fontWeight: 'bold',
    // color will be set inline
    borderRightWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 10,
  },
  statNumber: {
    width: 30,
    fontSize: 12,
    color: '#1D1D1D',
    marginRight: 10,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    height: 4, // Thinner bar
    backgroundColor: '#f0f0f0', // Very light grey background
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
});