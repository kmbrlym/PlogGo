import { Text, View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native";
import axios from "axios";
import { useEffect, useState } from "react";
import { API_URL, API_ROUTES } from '../config/env';
import { useAuth } from "../context/AuthContext";
import { Image } from 'expo-image';
import { useFonts } from "expo-font";
import { SplashScreen } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { onLogout } = useAuth();

  // uncomment when backend is ready
  interface UserProfile {
    pfp: string | null;
    name: string;
    description: string | null;
    badges: { icon: string; title: string }[];
    streak: number;
  }

  const [data, setData] = useState<UserProfile>({
    pfp: "",
    name: "",
    description: "",
    badges: [],
    streak: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ name: "", description: "", pfp: "" });

  useEffect(() => {
    fetchData();
  }
    ,[]);

  const fetchData = async () => {
    try {
      // name, pfp, description, streak
      const response = await axios.get(`${API_URL}${API_ROUTES.PROFILE}`);
      console.log("fetch pfp", response.data.name);
      setData(response.data);
      setEditedData({ name: response.data.name, description: response.data.description, pfp: response.data.pfp });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setData({
        pfp: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
        name: "John Doe",
        description: "I love to recycle!",
        badges: [
          { icon: "♻️", title: "Recycler" },
          { icon: "🌱", title: "Eco-Warrior" },
          { icon: "🌍", title: "Earth Lover" },
        ],
        streak: 5,
      });
      setEditedData({ name: "John Doe", description: "I love to recycle!", pfp: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png" });
    };
  };

  const handleSave = async () => {
    try {
      // Only include base64 pfp if it was updated
      const isBase64 = editedData.pfp?.startsWith("data:image");
  
      const payload = {
        name: editedData.name,
        description: editedData.description,
        ...(isBase64 && { pfp: editedData.pfp })
      };
  
      await axios.put(`${API_URL}${API_ROUTES.USER}`, payload);
      setData({ ...data, ...editedData });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets.length > 0) {
      const image = result.assets[0];
      const base64Image = `data:image/jpeg;base64,${image.base64}`;
      setEditedData({ ...editedData, pfp: base64Image });
    }
  };

  // load fonts
  const [loaded, error] = useFonts({
        'Poppins-Black': require('../../assets/fonts/Poppins-Black.ttf'),
        'Poppins-Light': require('../../assets/fonts/Poppins-Light.ttf'),
        'OpenSans-Regular': require('../../assets/fonts/OpenSans-Regular.ttf'),
        'Poppins-Bold': require('../../assets/fonts/Poppins-Bold.ttf'),
        'Poppins-Medium': require('../../assets/fonts/Poppins-Medium.ttf'),
      });
    
      useEffect(() => {
        if (loaded || error) {
          SplashScreen.hideAsync();
        }
      }, [loaded, error]);
    
      if (!loaded && !error) {
        return null;
      }


      return (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profile}>
              <TouchableOpacity onPress={isEditing ? handlePickImage : () => setIsEditing(true)}>
                <Image style={styles.pfp} source={{ uri: editedData.pfp }} contentFit="cover" />
              </TouchableOpacity>
              {isEditing ? (
                <TextInput style={styles.input} value={editedData.name} onChangeText={(text) => setEditedData({ ...editedData, name: text })} />
              ) : (
                <Text style={styles.name}>{data.name}</Text>
              )}
              {isEditing ? (
                <TextInput style={styles.input} value={editedData.description} onChangeText={(text) => setEditedData({ ...editedData, description: text })} />
              ) : (
                <Text style={styles.description}>{data.description}</Text>
              )}
              {isEditing ? (
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.editProfile} onPress={() => setIsEditing(true)}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              )}
            </View>
    
             {/* Badges Section */}
             <View style={styles.badges}>
              <Text style={styles.badgesTitle}>Badges</Text>
              <View style={styles.badgeContainer}>
                {data.badges ? data.badges.map((badge, index) => (
                  <View key={index} style={styles.badgeItem}>
                    <View style={styles.badgeCircle}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    </View>
                    <Text style={styles.badgeText}>{badge.title}</Text>
                  </View>
                )) : null}
              </View>
            </View>
    
            {/* Streak Section */}
            <View style={styles.streak}>
              <View style={styles.streakTextContainer}>
                <Text style={styles.streakCount}>{data.streak}</Text>
                <Text style={styles.streakDays}>  Streak days</Text>
              </View>
              <Text style={styles.streakEmoji}>🔥</Text>
            </View>
            
            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }
    
    const styles = StyleSheet.create({
      scrollContainer: {
        flex: 1,
        backgroundColor: '#ffffff',
      },
      scrollContent: {
        flexGrow: 1,
        paddingVertical: 15,
        paddingBottom: 30,
      },
      container: {
        flex: 1,
        alignItems: "center",
        backgroundColor: '#ffffff',
        gap: 15, // Add consistent spacing between all sections
      },
      profile: {
        alignItems: "center",
        marginTop: 20,
        marginBottom: 5, // Reduced space after profile section
      },
      pfp: {
        width: 100,
        height: 100,
        borderRadius: 50,
      },
      name: {
        fontFamily: 'Poppins-Bold',
        fontSize: 24,
      },
      description: {
        fontSize: 16,
        color: "gray",
      },
      editProfile: {
        fontFamily: 'Poppins-Bold',
        borderRadius: 20,
        padding: 5,
        paddingHorizontal: 35,
        marginTop: 12,
        backgroundColor: '#1dff06',
        color: 'white',
        width: '80%',
        textAlign: 'center',
        fontSize: 12,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
      },
      badges: {
        width: "80%",
        height: "30%",
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        position: "relative",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginVertical: 5, // Reduced vertical margin
      },
      badgesTitle: {
        fontSize: 18,
        fontFamily: 'Poppins-Bold',
        alignSelf: "flex-start",
      },
      badgeContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        paddingVertical: 10, // Added padding instead of flex:1 to maintain proper height
      },
      badgeItem: {
        alignItems: "center",
        marginHorizontal: 10,
      },
      badgeCircle: {
        width: 70,
        height: 70,
        borderRadius: 25,
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      badgeIcon: {
        fontSize: 24,
      },
      badgeText: {
        fontFamily: 'Poppins-Light',
        marginTop: 10,
        fontSize: 12,
        color: '#1dff06',
      },
      streak: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        backgroundColor: "#ffffff",
        borderRadius: 10,
        width: "80%",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        marginBottom: 5, // Reduced space after streak section
      },
      streakTextContainer: {
        flexDirection: "row",
        alignItems: "center",
      },
      streakCount: {
        fontSize: 32,
      },
      streakDays: {
        fontFamily: 'Poppins-Light',
        fontSize: 16,
        color: "#555",
        marginTop: 8,
      },
      streakEmoji: {
        fontSize: 30,
      },
      editText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Poppins-Bold",
      },
      input: {
        borderBottomWidth: 1,
        borderColor: "gray",
        padding: 5,
        marginVertical: 5,
        width: 200,
        textAlign: "center",
      },
      saveButton: {
        marginTop: 12,
        backgroundColor: "#007AFF",
        borderRadius: 20,
        padding: 10,
        paddingHorizontal: 20,
      },
      saveButtonText: {
        color: "white",
        fontSize: 14,
        fontFamily: "Poppins-Bold",
      },
      logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FF3B30',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        width: '80%',
        marginTop: 5, // Reduced margin top to be closer to streak view
        shadowColor: '#FF3B30',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
      },
      logoutText: {
        color: '#FFFFFF',
        fontFamily: 'Poppins-Bold',
        fontSize: 16,
        marginLeft: 10,
      },
    });