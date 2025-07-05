// import { API_BASE_URL } from "@/api/api";
// import { ThinkingBubble } from "@/components/ui/ChatMessage";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { logoutUser } from "@/store/slices/authSlice";
// import {
//     addMessage,
//     getAllMessages,
//     removeMessage,
//     setRecording,
//     uploadAudioMessage,
// } from "@/store/slices/chatSlice";
// import { FontAwesome } from "@expo/vector-icons";
// import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//     Alert,
//     FlatList,
//     SafeAreaView,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
// } from "react-native";
// import Animated, {
//     Easing,
//     useAnimatedStyle,
//     useSharedValue,
//     withRepeat,
//     withTiming,
// } from "react-native-reanimated";

// const HomeScreen = () => {
//   const dispatch = useAppDispatch();
//   const { messages, isRecording, isLoading } = useAppSelector(
//     (state) => state.chat
//   );
//   console.log("messages", messages.length);

//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const scale = useSharedValue(1);

//   // Enhanced audio playback state
//   const [playingAudioId, setPlayingAudioId] = useState<number | string | null>(
//     null
//   );
//   const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
//   const [isPaused, setIsPaused] = useState(false);
//   const updatedMesssages = useMemo(() => {
//     return messages
//   }, [messages])

//   useEffect(() => {
//     dispatch(getAllMessages());
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, []);

//   // Auto-load audio when messages change
//   useEffect(() => {
//     if (messages.length > 0) {
//       // Pre-load all audio files for better performance
//       messages.forEach((message) => {
//         if (message.audioUrl && !message.audioUrl.includes('files')) {
//           // Pre-load remote audio files
//           Audio.Sound.createAsync({
//             uri: `${API_BASE_URL}${message.audioUrl}`,
//           }).catch((error) => {
//             console.log('Audio pre-load failed:', error);
//           });
//         }
//       });
//     }
//   }, [messages]);

//   const micOpacity = useSharedValue(1);

//   useEffect(() => {
//     if (isRecording) {
//       micOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
//     } else {
//       micOpacity.value = withTiming(1, { duration: 200 });
//     }
//   }, [isRecording]);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       console.log("Logout successful");
//     } catch (error) {
//       console.log("Logout error:", error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       await audioRecorder.prepareToRecordAsync();
//       await audioRecorder.record();
//       dispatch(setRecording(true));
//       scaleBreathingAnimation();
//       setRecordingDuration(0);

//       // Start timer
//       intervalRef.current = setInterval(() => {
//         setRecordingDuration((prev: number) => {
//           if (prev >= 30) {
//             stopRecording();
//             return 30;
//           }
//           return prev + 1;
//         });
//       }, 1000);
//       setRecordingDuration(0);
//     } catch (err: any) {
//       console.log("Failed to start recording", err.message);
//       Alert.alert("Failed to start recording", err.message);
//     }
//   };

//   const stopBreathingAnimation = () => {
//     scale.value = withTiming(1, { duration: 200 });
//   };

//   const stopRecording = async () => {
//     try {
//       await audioRecorder.stop();
//       dispatch(setRecording(false));
//       stopBreathingAnimation();

//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }

//       const uri = audioRecorder.uri;
//       if (!uri) return;

//       const filename = `audio_${Date.now()}.m4a`;
//       const newPath = `${FileSystem.documentDirectory}${filename}`;

//       await FileSystem.moveAsync({
//         from: uri,
//         to: newPath,
//       });

//       // Add message to chat with new structure
//       const messageId = Date.now().toString();
//       dispatch(
//         addMessage({
//           id: messageId,
//           messageText: "",
//           audioUrl: newPath,
//           timestamp: new Date().toISOString(),
//           role: 0,
//         })
//       );
//       dispatch(
//         addMessage({
//           id: "thinking",
//           messageText: "",
//           audioUrl: "",
//           timestamp: new Date().toISOString(),
//           role: 1,
//           isLoading: true,
//         })
//       );

//       // Upload audio
//       try {
//         dispatch(removeMessage("thinking"));
//         const response = await dispatch(uploadAudioMessage(newPath)).unwrap();
//         const latestSystemResponse = response.find(
//           (item: any) => item.role === 1
//         );
//         console.log("Upload success", response, latestSystemResponse);
//         if (latestSystemResponse) {
//           // Auto-play AI response after 2 seconds
//           setTimeout(() => {
//             playSound(latestSystemResponse.audioUrl, latestSystemResponse.id, 1);
//           }, 2000);
//         }
//       } catch (error: any) {
//         console.error(
//           "Upload error:",
//           error,
//           error?.message,
//           error?.response?.message
//         );
//       }
//     } catch (error: any) {
//       Alert.alert("Error stopping recording", error.message);
//       dispatch(setRecording(false));
//       stopBreathingAnimation();
//     }
//   };

//   const toggleRecording = () => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   const scaleBreathingAnimation = () => {
//     scale.value = withRepeat(
//       withTiming(1.3, {
//         duration: 1000,
//         easing: Easing.inOut(Easing.ease),
//       }),
//       -1,
//       true
//     );
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));

//   const playSound = async (
//     audioUrl: string,
//     messageId: string,
//     role: number
//   ) => {
//     try {
//       // If the same audio is already playing, pause it
//       setPlayingAudioId(messageId);
//       if (playingAudioId === messageId && audioSound) {
//         const status = await audioSound.getStatusAsync();
//         if (status.isLoaded && status.isPlaying) {
//           await audioSound.pauseAsync();
//           setIsPaused(true);
//           return;
//         } else if (status.isLoaded && !status.isPlaying && isPaused) {
//           await audioSound.playAsync();
//           setIsPaused(false);
//           return;
//         }
//       }

//       // Stop any currently playing audio before playing new one
//       if (audioSound) {
//         await audioSound.stopAsync();
//         await audioSound.unloadAsync();
//         setAudioSound(null);
//         setIsPaused(false);
//       }

//       // Create and play new audio
//       let sound;
//       if (audioUrl.includes("files")) {
//         console.log("local audioUrl", audioUrl);
//         sound = await Audio.Sound.createAsync({ uri: audioUrl });
//       } else {
//         console.log("https audioUrl", audioUrl);
//         sound = await Audio.Sound.createAsync({
//           uri: `${API_BASE_URL}${audioUrl}`,
//         });
//       }

//       setAudioSound(sound.sound);
//       setIsPaused(false);
//       sound.sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           setPlayingAudioId(null);
//           sound.sound.unloadAsync();
//         }
//       });
//       await sound.sound.playAsync();
//     } catch (error: any) {
//       console.error("Playback error:", error);
//       Alert.alert("Playback failed", error.message);
//       setPlayingAudioId(null);
//       setIsPaused(false);
//       setAudioSound(null);
//     }
//   };

//   const stopSound = async () => {
//     if (audioSound) {
//       try {
//         await audioSound.stopAsync();
//         await audioSound.unloadAsync();
//         setAudioSound(null);
//         setPlayingAudioId(null);
//         setIsPaused(false);
//       } catch (error) {
//         console.error("Error stopping audio:", error);
//       }
//     }
//   };

//   const toggleAudioPlayback = async (
//     audioUrl: string,
//     messageId: string,
//     role: number
//   ) => {
//     if (playingAudioId === messageId) {
//       // If same audio is playing, toggle pause/play
//       if (audioSound) {
//         const status = await audioSound.getStatusAsync();
//         if (status.isLoaded && status.isPlaying) {
//           await audioSound.pauseAsync();
//           setIsPaused(true);
//         } else if (status.isLoaded && !status.isPlaying && isPaused) {
//           await audioSound.playAsync();
//           setIsPaused(false);
//         }
//       }
//     } else {
//       // Play different audio (will automatically stop current audio)
//       await playSound(audioUrl, messageId, role);
//     }
//   };

//   // Cleanup audio when component unmounts
//   useEffect(() => {
//     return () => {
//       if (audioSound) {
//         audioSound.unloadAsync();
//       }
//     };
//   }, [audioSound]);

//   useEffect(() => {
//     (async () => {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) {
//         Alert.alert("Permission to access microphone was denied");
//       }
//     })();
//   }, []);

//   const formatTime = (seconds: number) => {
//     const min = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const sec = (seconds % 60).toString().padStart(2, "0");
//     return `${min}:${sec}`;
//   };

//   const renderItem = ({ item, index }: { item: any; index: number }) => {
//     console.log("audioUrl-0--0-0", item.audioUrl)
//     const isUser = item.role == 0;
//     const isPlaying = playingAudioId === item.id;
//     const isCurrentAudioPaused = isPlaying && isPaused;
//     if (item.isLoading) return <ThinkingBubble />;
//     if (item.error)
//       return (
//         <View
//           style={[
//             styles.message,
//             isUser ? styles.sent : styles.received,
//             styles.errorMessage,
//           ]}
//         >
//           <Text style={styles.messageText}>{item.error}</Text>
//         </View>
//       );

//     return (
//       <View style={[styles.message, isUser ? styles.sent : styles.received]}>
//         {!isUser && item.messageText && (
//           <Text style={styles.messageText}>{item.messageText}</Text>
//         )}

//         {/* Show audio controls for messages with audioUrl */}
//         {item.audioUrl && (
//           <TouchableOpacity
//             style={styles.audioButton}
//             onPress={() => {
//               if (isPlaying) {
//                 toggleAudioPlayback(item.audioUrl, item.id, item.role);
//               } else {
//                 playSound(item.audioUrl, item.id, item.role);
//               }
//             }}
//           >
//             <FontAwesome
//               name={
//                 isPlaying ? (isCurrentAudioPaused ? "play" : "pause") : "play"
//               }
//               size={16}
//               color="white"
//             />
//             <Text style={styles.audioButtonText}>
//               {isPlaying ? (isCurrentAudioPaused ? "Resume" : "Pause") : "Play"}
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };

//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         <View style={{ flex: 1, justifyContent: "flex-end" }}>
//           {updatedMesssages.length ? (
//             <FlatList
//               data={updatedMesssages}
//               keyExtractor={(item) => item.timestamp}
//               renderItem={renderItem}
//               style={styles.flatListContent}
//             />
//           ) : (
//             <Text style={styles.welcomeText}>Let's start conversation, I am all ears!</Text>
//           )}
//         </View>

//         <View style={styles.buttons}>
//           <View style={styles.recorderContainer}>
//             <TouchableOpacity onPress={toggleRecording} disabled={!!playingAudioId}>
//               <Animated.View style={[styles.micButton, animatedStyle]}>
//                 <FontAwesome
//                   name="microphone"
//                   size={20}
//                   color={isRecording ? "#e74c3c" : "#2c3e50"}
//                 />
//               </Animated.View>
//             </TouchableOpacity>
//             <View style={styles.timerBar}>
//               <Text style={styles.timerText}>
//                 {formatTime(recordingDuration)}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={() => handleLogout()}>
//               <FontAwesome name="sign-out" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#eef1f4",
//     paddingTop: 20,
//     paddingHorizontal: 20,
//   },
//   buttons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 20,
//     bottom: 30,
//   },
//   message: {
//     padding: 12,
//     borderRadius: 10,
//     marginVertical: 6,
//     maxWidth: "75%",
//   },
//   errorMessage: {
//     backgroundColor: "#e74c3c",
//   },
//   sent: {
//     backgroundColor: "#4CAF50",
//     alignSelf: "flex-end",
//   },
//   received: {
//     backgroundColor: "#2196F3",
//     alignSelf: "flex-start",
//   },
//   recorderContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//   },
//   micButton: {
//     backgroundColor: "#fff",
//     borderRadius: 50,
//     padding: 20,
//     paddingHorizontal: 25,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   timerBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 30,
//     marginTop: 10,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },
//   timerText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   messageText: {
//     color: "white",
//     fontSize: 16,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   audioButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//     minWidth: 80,
//     justifyContent: "center",
//   },
//   audioButtonText: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   flatListContent: {
//     flex: 1,
//     paddingBottom: 10,
//   },
//   welcomeText: {
//     fontSize: 18,
//     textAlign: 'center',
//     color: '#666',
//     fontStyle: 'italic',
//   },
// });
// import { API_BASE_URL } from "@/api/api";
// import { ThinkingBubble } from "@/components/ui/ChatMessage";
// import { useAppDispatch, useAppSelector } from "@/store/hooks";
// import { logoutUser } from "@/store/slices/authSlice";
// import {
//   addMessage,
//   getAllMessages,
//   removeMessage,
//   setRecording,
//   uploadAudioMessage
// } from "@/store/slices/chatSlice";
// import { FontAwesome } from "@expo/vector-icons"; // For mic icon and play/pause icons
// import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
// import { Audio } from "expo-av";
// import * as FileSystem from "expo-file-system";
// import { router } from "expo-router";
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   Alert,
//   FlatList,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import Animated, {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withRepeat,
//   withTiming,
// } from "react-native-reanimated";

// const HomeScreen = () => {
//   const dispatch = useAppDispatch();
//   const { messages, isRecording, isLoading } = useAppSelector((state) => state.chat);
//   const { username } = useAppSelector((state) => state.auth);
//   console.log("messages", messages);

//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const scale = useSharedValue(1);

//   // Enhanced audio playback state
//   const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
//   const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
//   const [isPaused, setIsPaused] = useState(false);

//   useEffect(() => {
//     dispatch(getAllMessages());
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, []);

//   const micOpacity = useSharedValue(1);

//   useEffect(() => {
//     if (isRecording) {
//       micOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
//     } else {
//       micOpacity.value = withTiming(1, { duration: 200 });
//     }
//   }, [isRecording]);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       console.log("Logout successful");
//       router.replace("/login");
//     } catch (error) {
//       console.log("Logout error:", error);
//     }
//   };

//   const startRecording = async () => {
//     try {
//       await audioRecorder.prepareToRecordAsync();
//       await audioRecorder.record();
//       dispatch(setRecording(true));
//       // dispatch(setRecordingDuration(0));
//       scaleBreathingAnimation();
//       setRecordingDuration(0);

//       // Start timer
//       intervalRef.current = setInterval(() => {
//         setRecordingDuration((prev: number) => {
//           if (prev >= 30) {
//             stopRecording();
//             return 30;
//           }
//           return prev + 1;
//         });
//       }, 1000);
//       setRecordingDuration(0);
//     } catch (err: any) {
//       console.log("Failed to start recording", err.message);
//       Alert.alert("Failed to start recording", err.message);
//     }
//   };

//   const stopBreathingAnimation = () => {
//     scale.value = withTiming(1, { duration: 200 });
//   };

//   const stopRecording = async () => {
//     try {
//       await audioRecorder.stop();
//       dispatch(setRecording(false));
//       stopBreathingAnimation();

//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }

//       const uri = audioRecorder.uri;
//       console.log("audioRecorder uri", uri);
//       if (!uri) return;

//       const filename = `audio_${Date.now()}.m4a`;
//       const newPath = `${FileSystem.documentDirectory}${filename}`;
//       console.log("newPath", newPath);

//       await FileSystem.moveAsync({
//         from: uri,
//         to: newPath,
//       });

//       // Add message to chat with new structure
//       const messageId = Date.now().toString();
//       console.log("newPath", newPath);
//       console.log("uri", uri,messageId);
//       dispatch(addMessage({
//         id: messageId,
//         messageText: '', // User messages don't need text
//         audioUrl: newPath,
//         timestamp: new Date().toISOString(),
//         role: 0, // User role
//       }));
//       dispatch(addMessage({
//         id: 'thinking',
//         messageText: '', // User messages don't need text
//         audioUrl: '',
//         timestamp: new Date().toISOString(),
//         role: 1, // User role
//         isLoading:true
//       }));

//       // Upload audio
//       try {
//         await dispatch(uploadAudioMessage(newPath)).unwrap();
//         console.log("Upload success");
//         setTimeout(() => {
//           dispatch(removeMessage('thinking'))
//         }, 3000);
//       } catch (error:any) {
//         // dispatch(removeMessage('thinking'))
//         // dispatch(addMessage({
//         //   id: 'somethingWentWrong',
//         //   messageText: '', // User messages don't need text
//         //   audioUrl: '',
//         //   timestamp: new Date().toISOString(),
//         //   role: 1,
//         //   error:'Something went wrong',
//         //   // isLoading:true
//         // }));
//         console.error("Upload error:", error, error?.message,error?.response?.message);
//         // Alert.alert("Upload failed");
//       }
//     } catch (error: any) {
//       Alert.alert("Error stopping recording", error.message);
//       dispatch(setRecording(false));
//       stopBreathingAnimation();
//     }
//   };
//   const disabled = useMemo(() => {
//     const isAnyOnGoingProcess = messages.find((item) => ({
//       ...item,
//       isError: !!item.error || item.audioUrl === '',
//     }));
//     console.log("isAnyOnGoingProcess", isAnyOnGoingProcess);
//     return !!isAnyOnGoingProcess
//   }, [isRecording, isLoading, messages]);
//   const toggleRecording = () => {
//     if (isRecording) {
//       stopRecording();
//     } else {
//       startRecording();
//     }
//   };

//   const scaleBreathingAnimation = () => {
//     scale.value = withRepeat(
//       withTiming(1.3, {
//         duration: 1000,
//         easing: Easing.inOut(Easing.ease),
//       }),
//       -1,
//       true
//     );
//   };

//   const animatedStyle = useAnimatedStyle(() => ({
//     transform: [{ scale: scale.value }],
//   }));
//   // const playSound = async (audioUrl: string, messageId: string, role: number) => {
//   //   console.log("playSound", audioUrl, messageId);
//   //   try {
//   //     if(role == 1){
//   //       console.log("https audioUrl", audioUrl);
//   //     const {sound} = await Audio.Sound.createAsync({ uri: `${API_BASE_URL}${audioUrl}` });
//   //     console.log("sound", sound);
//   //     setAudioSound(sound);
//   //     setPlayingAudioId(messageId);

//   //      // Listen for playback status
//   //      sound.setOnPlaybackStatusUpdate((status) => {
//   //        if (status.isLoaded && status.didJustFinish) {
//   //          setPlayingAudioId(null);
//   //        }
//   //      });

//   //     await sound.playAsync();

//   //   }else{
//   //     console.log("local audioUrl", audioUrl);

//   //     const {sound} = await Audio.Sound.createAsync({ uri: audioUrl });
//   //     await sound.playAsync();
//   //   }
//   //   } catch (error: any) {
//   //     Alert.alert("Playback failed", error.message);
//   //     setPlayingAudioId(null);
//   //   }
//   // };

//   // const stopSound = async () => {
//   //   if (audioSound) {
//   //     await audioSound.stopAsync();
//   //     await audioSound.unloadAsync();
//   //     setAudioSound(null);
//   //     setPlayingAudioId(null);
//   //   }
//   // };
//   const playSound = async (audioUrl: string, messageId: string, role: number) => {
//     try {
//       // If the same audio is already playing, pause it
//       if (playingAudioId === messageId && audioSound) {
//         const status = await audioSound.getStatusAsync();
//         if (status.isLoaded && status.isPlaying) {
//           await audioSound.pauseAsync();
//           setIsPaused(true);
//           return;
//         } else if (status.isLoaded && !status.isPlaying && isPaused) {
//           await audioSound.playAsync();
//           setIsPaused(false);
//           return;
//         }
//       }

//       // Stop any currently playing audio before playing new one
//       if (audioSound) {
//         await audioSound.stopAsync();
//         await audioSound.unloadAsync();
//         setAudioSound(null);
//         setPlayingAudioId(null);
//         setIsPaused(false);
//       }

//       // Create and play new audio
//       let sound;
//       if (role == 1) {
//         sound = await Audio.Sound.createAsync({ uri: `${API_BASE_URL}${audioUrl}` });
//       } else {
//         sound = await Audio.Sound.createAsync({ uri: audioUrl });
//       }

//       setAudioSound(sound.sound);
//       setPlayingAudioId(messageId);
//       setIsPaused(false);

//       await sound.sound.playAsync();

//       // Listen for playback status
//       sound.sound.setOnPlaybackStatusUpdate((status) => {
//         if (status.isLoaded && status.didJustFinish) {
//           setPlayingAudioId(null);
//           setIsPaused(false);
//           setAudioSound(null);
//         }
//       });
//     } catch (error: any) {
//       console.error("Playback error:", error);
//       Alert.alert("Playback failed", error.message);
//       setPlayingAudioId(null);
//       setIsPaused(false);
//       setAudioSound(null);
//     }
//   };

//   const stopSound = async () => {
//     if (audioSound) {
//       try {
//         await audioSound.stopAsync();
//         await audioSound.unloadAsync();
//         setAudioSound(null);
//         setPlayingAudioId(null);
//         setIsPaused(false);
//       } catch (error) {
//         console.error("Error stopping audio:", error);
//       }
//     }
//   };

//   const toggleAudioPlayback = async (audioUrl: string, messageId: string, role: number) => {
//     if (playingAudioId === messageId) {
//       // If same audio is playing, toggle pause/play
//       if (audioSound) {
//         const status = await audioSound.getStatusAsync();
//         if (status.isLoaded && status.isPlaying) {
//           await audioSound.pauseAsync();
//           setIsPaused(true);
//         } else if (status.isLoaded && !status.isPlaying && isPaused) {
//           await audioSound.playAsync();
//           setIsPaused(false);
//         }
//       }
//     } else {
//       // Play different audio (will automatically stop current audio)
//       await playSound(audioUrl, messageId, role);
//     }
//   };

//   // Cleanup audio when component unmounts
//   useEffect(() => {
//     return () => {
//       if (audioSound) {
//         audioSound.unloadAsync();
//       }
//     };
//   }, [audioSound]);

//   useEffect(() => {
//     (async () => {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) {
//         Alert.alert("Permission to access microphone was denied");
//       }
//     })();
//   }, []);

//   const formatTime = (seconds: number) => {
//     const min = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const sec = (seconds % 60).toString().padStart(2, "0");
//     return `${min}:${sec}`;
//   };

//   const renderItem = ({ item }: { item: any }) => {
//     const isUser = item.role == 0;
//     const isPlaying = playingAudioId === item.id;
//     const isCurrentAudioPaused = isPlaying && isPaused;
//     if (item.isLoading) return <ThinkingBubble />;
//     if (item.error) return <View style={[
//       styles.message,  isUser ? styles.sent : styles.received, styles.errorMessage
//     ]}>
//     <Text style={styles.messageText}>{item.error}</Text>
//     </View>

//     return (
//       <View style={[
//         styles.message,
//         isUser ? styles.sent : styles.received,
//       ]}>
//         {!isUser && item.messageText && (
//           <Text style={styles.messageText}>
//             {item.messageText}
//           </Text>
//         )}

//         {/* Show audio controls for messages with audioUrl */}
//         {item.audioUrl && (
//           <TouchableOpacity
//             style={styles.audioButton}
//             onPress={() => toggleAudioPlayback(item.audioUrl, item.id, item.role)}
//           >
//             <FontAwesome
//               name={
//                 isPlaying
//                   ? (isCurrentAudioPaused ? "play" : "pause")
//                   : "play"
//               }
//               size={16}
//               color="white"
//             />
//             <Text style={styles.audioButtonText}>
//               {isPlaying
//                 ? (isCurrentAudioPaused ? "Resume" : "Pause")
//                 : "Play"
//               }
//             </Text>
//           </TouchableOpacity>
//         )}
//       </View>
//     );
//   };
//   if(isLoading) return <View style={{flex:1, justifyContent:'center', alignItems:'center'}}><ActivityIndicator size="large" color="#87CEEB" /></View>
//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <View style={styles.container}>
//         {messages.length > 0 ? <FlatList
//           data={messages}
//           keyExtractor={(item) => item.timestamp}
//           renderItem={renderItem}
//           contentContainerStyle={styles.flatListContent}
//         />:
//         <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
//           <Text style={{fontSize:16}}>Hello, {username ?? 'there'}!, I'm here to help you!</Text>
//         </View>}

//         <View style={styles.buttons}>
//           <View style={styles.recorderContainer}>
//             <TouchableOpacity onPress={toggleRecording} disabled={disabled}>
//               <Animated.View style={[styles.micButton, animatedStyle]}>
//                 <FontAwesome
//                   name="microphone"
//                   size={20}
//                   color={isRecording ? "#e74c3c" : "#2c3e50"}
//                 />
//               </Animated.View>
//             </TouchableOpacity>
//             <View style={styles.timerBar}>
//               <Text style={styles.timerText}>
//                 {formatTime(recordingDuration)}
//               </Text>
//             </View>
//             <TouchableOpacity onPress={()=>handleLogout()}>
//               <FontAwesome name="sign-out" size={24} color="#000" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

// export default HomeScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#eef1f4",
//     paddingTop: 20,
//     paddingHorizontal: 20,
//   },
//   buttons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     paddingVertical: 20,
//     bottom: 30,
//   },
//   message: {
//     padding: 12,
//     borderRadius: 10,
//     marginVertical: 6,
//     maxWidth: "75%",
//   },
//   errorMessage:{
//     backgroundColor: "#e74c3c",
//   },
//   sent: {
//     backgroundColor: "#4CAF50",
//     alignSelf: "flex-end",
//   },
//   received: {
//     backgroundColor: "#2196F3",
//     alignSelf: "flex-start",
//   },
//   recorderContainer: {
//     alignItems: "center",
//     justifyContent: "center",
//     marginBottom: 10,
//   },

//   micButton: {
//     backgroundColor: "#fff",
//     borderRadius: 50,
//     padding: 20,
//     paddingHorizontal: 25,
//     elevation: 4,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
//   timerBar: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#fff",
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 30,
//     marginTop: 10,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 3,
//   },

//   timerText: {
//     fontSize: 18,
//     fontWeight: "600",
//     color: "#333",
//   },
//   messageText: {
//     color: "white",
//     fontSize: 16,
//     marginBottom: 8,
//     lineHeight: 20,
//   },
//   audioButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 255, 255, 0.2)",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderRadius: 20,
//     alignSelf: "flex-start",
//     minWidth: 80,
//     justifyContent: "center",
//   },
//   audioButtonText: {
//     color: "white",
//     fontSize: 14,
//     fontWeight: "600",
//     marginLeft: 6,
//   },
//   flatListContent: {
//     flex:1, paddingBottom:10,alignContent:'flex-end', justifyContent:'flex-end'
//   }
// });
import { API_BASE_URL } from "@/api/api";
import { ThinkingBubble } from "@/components/ui/ChatMessage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logoutUser } from "@/store/slices/authSlice";
import {
  addMessage,
  getAllMessages,
  removeMessage,
  setRecording,
  uploadAudioMessage,
} from "@/store/slices/chatSlice";
import { FontAwesome } from "@expo/vector-icons"; // For mic icon and play/pause icons
import { AudioModule, RecordingPresets, useAudioRecorder } from "expo-audio";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const HomeScreen = () => {
  const dispatch = useAppDispatch();
  const { messages, isRecording, isLoading } = useAppSelector(
    (state) => state.chat
  );
  console.log("messages", messages);
  const flatListRef = useRef<FlatList<any>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const scale = useSharedValue(1);
  const [isStartRecording, setStartRecording] = useState(false)

  // Enhanced audio playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [audioSound, setAudioSound] = useState<Audio.Sound | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    dispatch(getAllMessages());
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  useEffect(() => {
    if (isAtBottom && flatListRef.current) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const micOpacity = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      micOpacity.value = withRepeat(withTiming(0, { duration: 500 }), -1, true);
    } else {
      micOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 50; // adjust for sensitivity
    const atBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    setIsAtBottom(atBottom);
  };
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      console.log("Logout successful");
      router.replace('/login')
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const startRecording = async () => {
    setStartRecording(true);
    try {
      await audioRecorder.prepareToRecordAsync();
      await audioRecorder.record();
      dispatch(setRecording(true));
      // dispatch(setRecordingDuration(0));
      scaleBreathingAnimation();
      setRecordingDuration(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingDuration((prev: number) => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);
      setRecordingDuration(0);
    } catch (err: any) {
      setStartRecording(false);
      console.log("Failed to start recording", err.message);
      Alert.alert("Failed to start recording", err.message);
    }
  };

  const stopBreathingAnimation = () => {
    scale.value = withTiming(1, { duration: 200 });
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop();
      dispatch(setRecording(false));
      stopBreathingAnimation();

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setStartRecording(false);

      const uri = audioRecorder.uri;
      console.log("audioRecorder uri", uri);
      if (!uri) return;

      const filename = `audio_${Date.now()}.m4a`;
      const newPath = `${FileSystem.documentDirectory}${filename}`;
      console.log("newPath", newPath);

      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });

      // Add message to chat with new structure
      const messageId = Date.now().toString();
      console.log("newPath", newPath);
      console.log("uri", uri, messageId);
      dispatch(
        addMessage({
          id: messageId,
          messageText: "", // User messages don't need text
          audioUrl: newPath,
          timestamp: new Date().toISOString(),
          role: 0, // User role
        })
      );
      dispatch(
        addMessage({
          id: "thinking",
          messageText: "", // User messages don't need text
          audioUrl: "",
          timestamp: new Date().toISOString(),
          role: 1, // User role
          isLoading: true,
        })
      );

      // Upload audio
      try {
        const response = await dispatch(uploadAudioMessage(newPath)).unwrap();
        const systemResponse = response.find((item: any) => item.role == 1);
        if (response.length) {
          playSound(
            systemResponse.audioUrl,
            systemResponse.id,
            systemResponse.role
          );
        }
        console.log("Upload success", response);

        setTimeout(() => {
          dispatch(removeMessage("thinking"));
        }, 3000);
      } catch (error: any) {
      setStartRecording(false);

        // dispatch(removeMessage('thinking'))
        // dispatch(addMessage({
        //   id: 'somethingWentWrong',
        //   messageText: '', // User messages don't need text
        //   audioUrl: '',
        //   timestamp: new Date().toISOString(),
        //   role: 1,
        //   error:'Something went wrong',
        //   // isLoading:true
        // }));
        console.error(
          "Upload error:",
          error,
          error?.message,
          error?.response?.message
        );
        // Alert.alert("Upload failed");
      }
    } catch (error: any) {
      setStartRecording(false);

      Alert.alert("Error stopping recording", error.message);
      dispatch(setRecording(false));
      stopBreathingAnimation();
    }
  };
  const disabled = useMemo(() => {
    const isAnyOnGoingProcess = messages.find((item) => ({
      ...item,
      isError: !!item.error || item.audioUrl === "",
    }));
    console.log("isAnyOnGoingProcess", isAnyOnGoingProcess);
    return !!isAnyOnGoingProcess;
  }, [isRecording, isLoading, messages]);
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const scaleBreathingAnimation = () => {
    scale.value = withRepeat(
      withTiming(1.3, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  // const playSound = async (audioUrl: string, messageId: string, role: number) => {
  //   console.log("playSound", audioUrl, messageId);
  //   try {
  //     if(role == 1){
  //       console.log("https audioUrl", audioUrl);
  //     const {sound} = await Audio.Sound.createAsync({ uri: `${API_BASE_URL}${audioUrl}` });
  //     console.log("sound", sound);
  //     setAudioSound(sound);
  //     setPlayingAudioId(messageId);

  //      // Listen for playback status
  //      sound.setOnPlaybackStatusUpdate((status) => {
  //        if (status.isLoaded && status.didJustFinish) {
  //          setPlayingAudioId(null);
  //        }
  //      });

  //     await sound.playAsync();

  //   }else{
  //     console.log("local audioUrl", audioUrl);

  //     const {sound} = await Audio.Sound.createAsync({ uri: audioUrl });
  //     await sound.playAsync();
  //   }
  //   } catch (error: any) {
  //     Alert.alert("Playback failed", error.message);
  //     setPlayingAudioId(null);
  //   }
  // };

  // const stopSound = async () => {
  //   if (audioSound) {
  //     await audioSound.stopAsync();
  //     await audioSound.unloadAsync();
  //     setAudioSound(null);
  //     setPlayingAudioId(null);
  //   }
  // };
  const playSound = async (
    audioUrl: string,
    messageId: string,
    role: number
  ) => {
    try {
      // If the same audio is already playing, pause it
      if (playingAudioId === messageId && audioSound) {
        const status = await audioSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await audioSound.pauseAsync();
          setIsPaused(true);
          return;
        } else if (status.isLoaded && !status.isPlaying && isPaused) {
          await audioSound.playAsync();
          setIsPaused(false);
          return;
        }
      }

      // Stop any currently playing audio before playing new one
      if (audioSound) {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
        setPlayingAudioId(null);
        setIsPaused(false);
      }

      // Create and play new audio
      let sound;
      if (audioUrl.includes("files")) {
        sound = await Audio.Sound.createAsync({ uri: audioUrl });
      } else {
        sound = await Audio.Sound.createAsync({
          uri: `${API_BASE_URL}${audioUrl}`,
        });
      }

      setAudioSound(sound.sound);
      setPlayingAudioId(messageId);
      setIsPaused(false);

      await sound.sound.playAsync();

      // Listen for playback status
      sound.sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingAudioId(null);
          setIsPaused(false);
          setAudioSound(null);
        }
      });
    } catch (error: any) {
      console.error("Playback error:", error);
      Alert.alert("Playback failed", error.message);
      setPlayingAudioId(null);
      setIsPaused(false);
      setAudioSound(null);
    }
  };

  const stopSound = async () => {
    if (audioSound) {
      try {
        await audioSound.stopAsync();
        await audioSound.unloadAsync();
        setAudioSound(null);
        setPlayingAudioId(null);
        setIsPaused(false);
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
  };

  const toggleAudioPlayback = async (
    audioUrl: string,
    messageId: string,
    role: number
  ) => {
    if (playingAudioId === messageId) {
      // If same audio is playing, toggle pause/play
      if (audioSound) {
        const status = await audioSound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await audioSound.pauseAsync();
          setIsPaused(true);
        } else if (status.isLoaded && !status.isPlaying && isPaused) {
          await audioSound.playAsync();
          setIsPaused(false);
        }
      }
    } else {
      // Play different audio (will automatically stop current audio)
      await playSound(audioUrl, messageId, role);
    }
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioSound) {
        audioSound.unloadAsync();
      }
    };
  }, [audioSound]);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert("Permission to access microphone was denied");
      }
    })();
  }, []);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const isUser = item.role == 0;
    const isPlaying = playingAudioId === item.id;
    const isCurrentAudioPaused = isPlaying && isPaused;
    if (item.isLoading) return <ThinkingBubble />;
    if (item.error)
      return (
        <View
          style={[
            styles.message,
            isUser ? styles.sent : styles.received,
            styles.errorMessage,
          ]}
        >
          <Text style={styles.messageText}>{item.error}</Text>
        </View>
      );

    return (
      <View style={[styles.message, isUser ? styles.sent : styles.received]}>
        {!isUser && item.messageText && (
          <Text style={styles.messageText}>{item.messageText}</Text>
        )}

        {/* Show audio controls for messages with audioUrl */}
        {item.audioUrl && (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() =>
              toggleAudioPlayback(item.audioUrl, item.id, item.role)
            }
          >
            <FontAwesome
              name={
                isPlaying ? (isCurrentAudioPaused ? "play" : "pause") : "play"
              }
              size={16}
              color="white"
            />
            <Text style={styles.audioButtonText}>
              {isPlaying ? (isCurrentAudioPaused ? "Resume" : "Pause") : "Play"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  if (isLoading && !messages.length)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#87CEEB" />
      </View>
    );
  return (
    <SafeAreaView style={{ flex: 1, marginTop: 22 }}>
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          {/* <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.timestamp}
            renderItem={renderItem}
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            // contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={false}
          /> */}
          {messages.length ? <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.timestamp}
            renderItem={renderItem}
            onScroll={handleScroll}
            scrollEventThrottle={100}
            onContentSizeChange={() => {
              if (isAtBottom && flatListRef.current) {
                flatListRef.current.scrollToEnd({ animated: true });
              }
            }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 65 }}
          />:
          <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
            <Image
                        source={require("../assets/images/AI_Mitra.png")}
                        style={styles.logo}
                        resizeMode="contain"
                      />
            <Text style={{textAlign:'center', fontSize:18}}>
              Your AI Mitra is here to listen, understand, and help; whenever you’re ready.
            </Text>
            </View>}
        </View>

        <View style={styles.buttons}>
          <View style={styles.recorderContainer}>
            <TouchableOpacity
              onPress={toggleRecording}
              disabled={!!playingAudioId}
            >
              <Animated.View style={[styles.micButton, animatedStyle]}>
                <FontAwesome
                  name="microphone"
                  size={20}
                  color={isRecording ? "#e74c3c" : "#2c3e50"}
                />
              </Animated.View>
            </TouchableOpacity>
            <View style={styles.timerBar}>
              <Text style={styles.timerText}>
                {formatTime(recordingDuration)}
              </Text>
            </View>
            <TouchableOpacity onPress={() => handleLogout()}>
              <FontAwesome name="sign-out" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef1f4",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    bottom: 30,
  },
  message: {
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    maxWidth: "75%",
  },
  errorMessage: {
    backgroundColor: "#e74c3c",
  },
  sent: {
    backgroundColor: "#4CAF50",
    alignSelf: "flex-end",
  },
  received: {
    backgroundColor: "#2196F3",
    alignSelf: "flex-start",
  },
  recorderContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  micButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 20,
    paddingHorizontal: 25,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  timerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginTop: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },

  timerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  messageText: {
    color: "white",
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 20,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    minWidth: 80,
    justifyContent: "center",
  },
  audioButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  flatListContent: {
    flex: 1,
    paddingBottom: 10,
  },
  logo:{
     width: 120,
    height: 120,
    marginBottom: 10,
  }
});
