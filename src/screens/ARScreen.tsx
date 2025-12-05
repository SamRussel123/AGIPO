// src/screens/ARScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Camera, useCameraDevices } from "react-native-vision-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getPokemonBasic } from "../api/pokeAPI"; // keep your helper import as is

type CapturedMeta = {
  id: number;
  name: string;
  sprite: string | null;
  photoUri: string; // camera-captured file path
  timestamp: number;
};

const ARScreen = ({ navigation }: any) => {
  const devices = useCameraDevices();
  const device = devices.find(d => d.position === 'back');
  const camera = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // For demo: either pick a default pokemon or allow user choose from list.
  const [selectedPokemonId, setSelectedPokemonId] = useState<number>(25); // Pikachu default
  const [selectedPokemonSprite, setSelectedPokemonSprite] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    // fetch basic sprite url for display overlay
    (async () => {
      try {
        const data = await getPokemonBasic(selectedPokemonId);
        setSelectedPokemonSprite(data?.sprite || null);
      } catch (e) {
        console.warn("Failed to fetch pokemon sprite", e);
      }
    })();
  }, [selectedPokemonId]);

  async function takeCapture() {
    if (!camera.current) return;
    try {
      const photo = await camera.current.takePhoto({
        flash: "off",
      });

      // Handle different path/uri formats on Android and iOS
      const photoUri = Platform.OS === "android" ? "file://" + photo.path : photo.path;

      // Save metadata + photoUri to AsyncStorage as discovered capture
      const entry: CapturedMeta = {
        id: selectedPokemonId,
        name: `pokemon-${selectedPokemonId}`,
        sprite: selectedPokemonSprite,
        photoUri,
        timestamp: Date.now(),
      };

      const existingRaw = await AsyncStorage.getItem("captures");
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      existing.push(entry);
      await AsyncStorage.setItem("captures", JSON.stringify(existing));

      Alert.alert("Captured!", "Pokemon saved to your gallery.");
    } catch (err) {
      console.error("capture err", err);
      Alert.alert("Error", "Could not take picture. Check camera permission.");
    }
  }

  if (hasPermission === null || device == null) {
    return (
      <View style={styles.center}>
        <Text>Loading camera...</Text>
      </View>
    );
  }
  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>No camera permission. Grant permissions in settings.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        ref={camera}
      />

      {/* Overlay sprite in center of camera feed */}
      {selectedPokemonSprite ? (
        <Image
          source={{ uri: selectedPokemonSprite }}
          style={styles.sprite}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.spritePlaceholder}>
          <Text style={{ color: "#fff" }}>Loading sprite...</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureBtn}
          onPress={() => takeCapture()}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>CAPTURE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.openGallery}
          onPress={() => navigation.navigate("ProfileGallery" /* your gallery route name */)}
        >
          <Text style={{ color: "#fff" }}>GALLERY</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: "#000" },
  sprite: {
    width: 200,
    height: 200,
    position: "absolute",
    alignSelf: "center",
    top: "35%",
    zIndex: 10,
    opacity: 0.95,
  },
  spritePlaceholder: {
    width: 200,
    height: 200,
    position: "absolute",
    alignSelf: "center",
    top: "35%",
    zIndex: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 12,
  },
  controls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  captureBtn: {
    width: 140,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#ef5350",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  openGallery: {
    padding: 10,
    backgroundColor: "#1565c0",
    borderRadius: 12,
  },
});

export default ARScreen;
