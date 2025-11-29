import AsyncStorage from '@react-native-async-storage/async-storage';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';
const POKEMON_LIST_CACHE_KEY = 'pokemon_list_cache_v2'; // Changed key to force refresh
const POKEMON_DETAIL_CACHE_PREFIX = 'pokemon_detail_';
const INITIAL_POKEMON_LIMIT = 21;

// Define a type for the detailed Pokémon data
export type PokemonDetail = {
  id: number;
  name: string;
  types: string[];
  abilities: string[];
  stats: any[];
  spriteUrl: string;
  speciesData: any;
  weight: number;
  height: number;
};

/**
 * 1. FETCH LIST (UPGRADED)
 * Fetches the first 151 Pokémon AND their details (Types, Sprites) in parallel.
 * This effectively replaces your MOCK_DATA with real API data.
 * Implements caching so this heavy load only happens once.
 */
export async function fetchPokemonList(): Promise<PokemonDetail[]> {
  // A. Check Cache First
  try {
    const cachedList = await AsyncStorage.getItem(POKEMON_LIST_CACHE_KEY);
    if (cachedList) {
      console.log('Returning full Pokedex from cache.');
      return JSON.parse(cachedList);
    }
  } catch (e) {
    console.warn('Could not read list cache:', e);
  }

  // B. If not cached, Fetch from API
  try {
    console.log('Fetching fresh Pokedex list...');
    // 1. Get the list of names/URLs
    const listResponse = await fetch(
      `${POKEAPI_BASE_URL}/pokemon?limit=${INITIAL_POKEMON_LIMIT}&offset=0`
    );
    if (!listResponse.ok) throw new Error('Network response was not ok');
    const listData = await listResponse.json();

    // 2. "Batch" fetch details for all of them
    const promises = listData.results.map(async (item: { name: string; url: string }) => {
      return await fetchPokemonDetail(item.name);
    });

    const results = await Promise.all(promises);

    // Filter out any nulls if a request failed
    const validResults = results.filter((p): p is PokemonDetail => p !== null);

    // C. Cache the big list
    await AsyncStorage.setItem(
      POKEMON_LIST_CACHE_KEY,
      JSON.stringify(validResults)
    );
    console.log('Fetched and cached new full list.');
    return validResults;

  } catch (error) {
    console.error('Error fetching Pokémon list:', error);
    return [];
  }
}

/**
 * 2. FETCH DETAIL
 * Fetches detailed information for a specific Pokémon by ID or name.
 */
export async function fetchPokemonDetail(
  idOrName: string | number
): Promise<PokemonDetail | null> {
  const cacheKey = `${POKEMON_DETAIL_CACHE_PREFIX}${idOrName}`;

  // Check cache
  try {
    const cachedDetail = await AsyncStorage.getItem(cacheKey);
    if (cachedDetail) {
      return JSON.parse(cachedDetail);
    }
  } catch (e) {
    // Ignore cache errors
  }

  try {
    // Fetch Basic Data
    const detailResponse = await fetch(`${POKEAPI_BASE_URL}/pokemon/${idOrName}`);
    if (!detailResponse.ok) throw new Error('Failed to fetch Pokémon details');
    const detailData = await detailResponse.json();

    // Fetch Species Data (for flavor text)
    let speciesData = {};
    try {
        const speciesResponse = await fetch(detailData.species.url);
        speciesData = await speciesResponse.json();
    } catch (err) {
        console.warn('Failed to fetch species data', err);
    }

    const pokemonDetail: PokemonDetail = {
      id: detailData.id,
      name: detailData.name,
      types: detailData.types.map((t: any) => t.type.name),
      abilities: detailData.abilities.map((a: any) => a.ability.name),
      stats: detailData.stats,
      spriteUrl: detailData.sprites.front_default, 
      speciesData: speciesData,
      weight: detailData.weight,
      height: detailData.height,
    };

    // Cache specific detail
    await AsyncStorage.setItem(cacheKey, JSON.stringify(pokemonDetail));
    return pokemonDetail;

  } catch (error) {
    console.error(`Error fetching Pokémon detail for ${idOrName}:`, error);
    return null;
  }
}

/**
 * 3. GET POKEMON BASIC (NEW - Lightweight for ARScreen)
 * Simple lightweight fetch for AR capture overlay - just sprite + basic info
 * No caching needed for this quick lookup
 */
export async function getPokemonBasic(idOrName: number | string) {
  try {
    const resp = await fetch(`https://pokeapi.co/api/v2/pokemon/${idOrName}`);
    if (!resp.ok) throw new Error("Not found");
    const json = await resp.json();
    // prefer official-artwork or front_default
    const sprite =
      json.sprites?.other?.["official-artwork"]?.front_default ||
      json.sprites?.front_default ||
      null;
    return {
      id: json.id,
      name: json.name,
      sprite,
      types: json.types?.map((t: any) => t.type?.name) || [],
    };
  } catch (err) {
    console.warn("poke api error", err);
    return null;
  }
}
