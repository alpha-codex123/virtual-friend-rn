import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

export const ThinkingBubble = () => {
  const emoji = useSharedValue(0);
  const text = useSharedValue(0);
  const dots = useSharedValue(0);

  const fadeInOut = (sharedVal: Animated.SharedValue<number>, delay: number) => {
    setTimeout(() => {
      sharedVal.value = withRepeat(
        withTiming(1, {
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true
      );
    }, delay);
  };

  useEffect(() => {
    fadeInOut(emoji, 0);
    fadeInOut(text, 200);
    fadeInOut(dots, 400);
  }, []);

  const animatedStyle = (val: Animated.SharedValue<number>) =>
    useAnimatedStyle(() => ({
      opacity: interpolate(val.value, [0, 1], [0.3, 1]),
    }));

  return (
    <View style={styles.thinkingContainer}>
      <Animated.Text style={[styles.text, animatedStyle(emoji)]}>💭</Animated.Text>
      <Animated.Text style={[styles.text, animatedStyle(text)]}> Thinking</Animated.Text>
      <Animated.Text style={[styles.text, animatedStyle(dots)]}>...</Animated.Text>
    </View>
  );
};
const styles = StyleSheet.create({
    thinkingContainer: {
      flexDirection: "row",
      alignSelf: "flex-start",
      marginVertical: 8,
      padding: 10,
      backgroundColor: "#dce6f1",
      borderRadius: 12,
      maxWidth: "75%",
    },
    text: {
      fontSize: 16,
      fontWeight: "500",
      color: "#444",
    },
  });
  