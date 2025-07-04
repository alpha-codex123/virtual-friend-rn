// import api from '@/api/api';
// import Button from '@/components/ui/Button';
// import { useAppDispatch } from '@/store/hooks';
// import { logoutUser } from '@/store/slices/authSlice';
// import { FontAwesome } from '@expo/vector-icons'; // For mic icon
// import {
//   AudioModule,
//   RecordingPresets,
//   useAudioRecorder,
// } from 'expo-audio';
// import { Audio } from 'expo-av';
// import * as FileSystem from 'expo-file-system';
// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Alert,
//   FlatList,
//   Button as RNButton,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

// const Home = ()=> {
//   const dispatch = useAppDispatch();
//   const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
//   const [isRecording, setIsRecording] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const scale = useSharedValue(1);

//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, []);
//   const [messages, setMessages] = useState<
//     Array<{ uri: string; type: 'sent' | 'received'; id: string }>
//   >([]);

//   const handleLogout = async () => {
//     try {
//       await dispatch(logoutUser()).unwrap();
//       console.log('Logout successful');
//     } catch (error) {
//       console.log('Logout error:', error);
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
//   const startRecording = async () => {
//     try {
//       await audioRecorder.prepareToRecordAsync();
//       await audioRecorder.record();
//       setIsRecording(true);
//       // setRecording(newRecording);
//       setRecordingDuration(0);
//       scaleBreathingAnimation();

//       // Start timer
//       intervalRef.current = setInterval(() => {
//         setRecordingDuration((prev) => {
//           if (prev >= 30) {
//             stopRecording();
//             return 30;
//           }
//           return prev + 1;
//         });
//       }, 1000);
//     } catch (err:any) {
//       Alert.alert('Failed to start recording', err.message);
//     }
//   };

//   const stopRecording = async () => {
//     try {
//       await audioRecorder.stop();
//       setIsRecording(false);

//       const uri = audioRecorder.uri;
//       if (!uri) return;

//       const filename = `audio_${Date.now()}.m4a`;
//       const newPath = `${FileSystem.documentDirectory}${filename}`;

//       await FileSystem.moveAsync({
//         from: uri,
//         to: newPath,
//       });
//       uploadAudio(uri)
//       setMessages((prev) => [
//         ...prev,
//         { uri: newPath, type: 'sent', id: Date.now().toString() },
//       ]);
//     } catch (error:any) {
//       Alert.alert('Error stopping recording', error.message);
//     }
//   };

//   const playSound = async (uri: string) => {
//     try {
//       const { sound } = await Audio.Sound.createAsync({ uri });
//       await sound.playAsync();
//     } catch (error:any) {
//       Alert.alert('Playback failed', error.message);
//     }
//   };

//   const simulateReceived = () => {
//     const sent = messages.find((m) => m.type === 'sent');
//     if (sent) {
//       setMessages((prev) => [
//         ...prev,
//         { ...sent, type: 'received', id: Date.now().toString() },
//       ]);
//     }
//   };

//   useEffect(() => {
//     (async () => {
//       const status = await AudioModule.requestRecordingPermissionsAsync();
//       if (!status.granted) {
//         Alert.alert('Permission to access microphone was denied');
//       }
//     })();
//   }, []);

//   const uploadAudio = async (uri: string) => {
//   try {
//     const fileInfo = await FileSystem.getInfoAsync(uri);
//     if (!fileInfo.exists) {
//       Alert.alert('File does not exist at URI:', uri);
//       return;
//     }

//     const fileUriParts = uri.split('/');
//     const filename = fileUriParts[fileUriParts.length - 1];
//     const type = 'audio/mp3'; // Change if you're using .mp3 or other

//     const formData = new FormData();
//     formData.append('file', {
//       uri,
//       name: filename,
//       type,
//     } as any);
    

//     const response = await api.post<any>('/Chat/audio', formData)

//     const result = await response.data;
//     console.log('Upload success:', result);
//   } catch (err) {
//     console.error('Upload error:', err);
//     Alert.alert('Upload failed');
//   }
// };


//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={messages}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={[
//               styles.message,
//               item.type === 'sent' ? styles.sent : styles.received,
//             ]}
//             onPress={() => playSound(item.uri)}
//           >
//             <Text style={{ color: 'white' }}>
//               {item.type === 'sent' ? 'You' : 'Other'} - Tap to play
//             </Text>
//           </TouchableOpacity>
//         )}
//         contentContainerStyle={{ paddingBottom: 20 }}
//       />

//       <View style={styles.buttons}>
//         {/* <RNButton
//           title={isRecording ? 'Stop Recording' : 'Start Recording'}
//           onPress={isRecording ? stopRecording : startRecording}
//         /> */}
//         <View style={styles.recorderContainer}>
//   <Animated.View style={[styles.micButton, animatedStyle]}>
//     <TouchableOpacity onPress={toggleRecording}>
//       <FontAwesome
//         name="microphone"
//         size={40}
//         color={isRecording ? '#e74c3c' : '#2c3e50'}
//       />
//     </TouchableOpacity>
//   </Animated.View>
//   <Text style={styles.timerText}>
//     {recordingDuration.toString().padStart(2, '0')} / 30 sec
//   </Text>
// </View>
//         <RNButton title="Simulate Incoming" onPress={simulateReceived} />
//         <Button 
//           title="Logout" 
//           onPress={handleLogout} 
//           variant="danger"
//           size="small"
//         />
//       </View>
//     </View>
//   );
// }
// export default Home
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#eef1f4',
//     paddingTop: 60,
//     paddingHorizontal: 20,
//   },
//   buttons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: 20,
//     bottom: 56
//   },
//   message: {
//     padding: 12,
//     borderRadius: 10,
//     marginVertical: 6,
//     maxWidth: '75%',
//   },
//   sent: {
//     backgroundColor: '#4CAF50',
//     alignSelf: 'flex-end',
//   },
//   received: {
//     backgroundColor: '#2196F3',
//     alignSelf: 'flex-start',
//   },
//   recorderContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 10,
//   },
  
//   micButton: {
//     backgroundColor: '#fff',
//     borderRadius: 50,
//     padding: 20,
//     elevation: 4,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.3,
//     shadowRadius: 3,
//   },
  
//   timerText: {
//     marginTop: 8,
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//   },
  
// });

import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const home = () => {
  return (
    <View>
      <Text>home</Text>
    </View>
  )
}

export default home

const styles = StyleSheet.create({})