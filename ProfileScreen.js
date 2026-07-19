// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions
import { db } from '../config/firebaseConfig'; // Import your db instance

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({ followers: '0', following: '0', streams: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user?.uid) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setProfileData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const displayName = user?.displayName || 'Memet Streamer';
  const displaySub = user?.email || user?.phoneNumber || 'Verified User';

  const stats = [
    { label: 'Followers', value: profileData.followers || '0' },
    { label: 'Following', value: profileData.following || '0' },
    { label: 'Streams', value: profileData.streams || '0' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: 'https://i.pravatar.cc/150?img=68' }} style={styles.avatar} />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.subtext}>{displaySub}</Text>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>⭐ Level 7 Streamer</Text>
        </View>

        <View style={styles.statsRow}>
          {loading ? <ActivityIndicator color={COLORS.gold} /> : stats.map((s) => (
            <View key={s.label} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Rest of your UI components remain the same */}
      <View style={styles.menuCard}>
        <MenuRow icon="📊" label="Streaming Statistics" />
        <MenuRow icon="⚙️" label="Account Settings" />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Keep your existing MenuRow and styles here...
                                   
