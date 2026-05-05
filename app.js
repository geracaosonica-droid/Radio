import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, StyleSheet, ActivityIndicator,
  FlatList, TouchableOpacity, Linking
} from 'react-native';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
const RENDER_URL = 'https://geracao-sonica.onrender.com';
const Tab = createBottomTabNavigator();
const RENDER_URL = 'https://SUA_URL_AQUI.onrender.com';

function RadioScreen() {
  const [status, setStatus] = useState('Carregando...');
  const [playing, setPlaying] = useState(false);
  const sound = useRef(null);
  const tracks = useRef([]);
  const index = useRef(0);

  const playNext = async () => {
    if (tracks.current.length === 0) {
      setStatus('Nenhuma faixa disponível');
      return;
    }
    if (sound.current) await sound.current.unloadAsync();
    const url = tracks.current[index.current];
    setStatus(`Tocando ${index.current + 1}/${tracks.current.length}`);
    const { sound: s } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
    sound.current = s;
    setPlaying(true);
    s.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        index.current = (index.current + 1) % tracks.current.length;
        playNext();
      }
    });
  };

  useEffect(() => {
    fetch(`${RENDER_URL}/radio/playlist.m3u`)
      .then(r => r.text())
      .then(text => {
        const urls = text.split('\n').filter(l => l.startsWith('http'));
        tracks.current = urls;
        index.current = 0;
        playNext();
      })
      .catch(() => setStatus('Erro ao carregar rádio'));
    return () => { if (sound.current) sound.current.unloadAsync(); };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎵 Rádio Geração Sônica</Text>
      <Text style={styles.status}>{status}</Text>
      {!playing && <ActivityIndicator size="large" color="#FF6B00" />}
      <Text style={styles.hint}>As músicas do Instagram tocam aqui</Text>
    </View>
  );
}

function PlaylistScreen() {
  const [musics, setMusics] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const sound = useRef(null);

  useEffect(() => {
    fetch(`${RENDER_URL}/api/musics`)
      .then(r => r.json())
      .then(data => setMusics(data))
      .catch(() => {});
    return () => { if (sound.current) sound.current.unloadAsync(); };
  }, []);

  const playMusic = async (item) => {
    if (sound.current) await sound.current.unloadAsync();
    const { sound: s } = await Audio.Sound.createAsync({ uri: item.url }, { shouldPlay: true });
    sound.current = s;
    setCurrentId(item.id);
  };

  return (
    <View style={styles.playlistContainer}>
      <Text style={styles.title}>📋 Playlist</Text>
      {musics.length === 0 ? (
        <Text style={styles.empty}>Nenhuma música publicada ainda.</Text>
      ) : (
        <FlatList
          data={musics}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.item, currentId === item.id && styles.activeItem]}
              onPress={() => playMusic(item)}
            >
              <Text style={styles.itemText}>{item.title}</Text>
              <Text style={styles.artist}>André Luiz Vansan</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

function LiveScreen() {
  const [liveData, setLiveData] = useState({ isLive: false, permalink: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLive = () => {
      fetch(`${RENDER_URL}/api/live`)
        .then(r => r.json())
        .then(data => { setLiveData(data); setLoading(false); })
        .catch(() => setLoading(false));
    };
    checkLive();
    const interval = setInterval(checkLive, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.liveContainer}>
      <Text style={styles.liveTitle}>🔴 Live</Text>
      {liveData.isLive ? (
        <WebView
          style={{ flex: 1, width: '100%' }}
          source={{ uri: liveData.permalink }}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          startInLoadingState
          renderLoading={() => <ActivityIndicator size="large" color="#FF6B00" />}
        />
      ) : (
        <Text style={styles.offline}>Nenhuma transmissão no momento.</Text>
      )}
    </View>
  );
}

function ContactScreen() {
  const instagram = 'sigam_compartilhem_e_curtam';
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📬 Contato</Text>
      <Text style={styles.infoText}>André Luiz Vansan</Text>
      <TouchableOpacity onPress={() => Linking.openURL(`https://instagram.com/${instagram}`)}>
        <Text style={styles.link}>@{instagram}</Text>
      </TouchableOpacity>
      <Text style={styles.infoText}>Geração Sônica - Rádio independente</Text>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Rádio') iconName = 'radio';
            else if (route.name === 'Playlist') iconName = 'list';
            else if (route.name === 'Live') iconName = 'tv';
            else if (route.name === 'Contato') iconName = 'call';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#FF6B00',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
        })}
      >
        <Tab.Screen name="Rádio" component={RadioScreen} />
        <Tab.Screen name="Playlist" component={PlaylistScreen} />
        <Tab.Screen name="Live" component={LiveScreen} />
        <Tab.Screen name="Contato" component={ContactScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  playlistContainer: { flex: 1, backgroundColor: '#111', paddingTop: 50, paddingHorizontal: 20 },
  liveContainer: { flex: 1, backgroundColor: '#111', paddingTop: 40 },
  title: { fontSize: 26, color: '#FF6B00', fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  liveTitle: { fontSize: 28, color: '#FF4444', textAlign: 'center', marginBottom: 20 },
  status: { fontSize: 16, color: '#FFF', marginBottom: 20 },
  hint: { fontSize: 12, color: '#888', marginTop: 40, textAlign: 'center', paddingHorizontal: 20 },
  empty: { color: '#AAA', textAlign: 'center', marginTop: 40, fontSize: 16 },
  item: { backgroundColor: '#222', padding: 15, borderRadius: 10, marginBottom: 10 },
  activeItem: { borderColor: '#FF6B00', borderWidth: 1, backgroundColor: '#FF6B0044' },
  itemText: { color: '#FFF', fontSize: 16 },
  artist: { color: '#888', fontSize: 12 },
  offline: { color: '#AAA', textAlign: 'center', marginTop: 50, fontSize: 18 },
  infoText: { color: '#FFF', fontSize: 16, marginVertical: 5 },
  link: { color: '#FF6B00', fontSize: 20, marginTop: 10, textDecorationLine: 'underline' },
}); 
