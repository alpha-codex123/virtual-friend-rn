import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginUser } from "@/store/slices/authSlice";
import { router } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

type FormData = {
  email: string;
  password: string;
};

const Login = () => {
  const dispatch = useAppDispatch();
  // const { isLoading, error } = useAppSelector((state) => state.auth);
  const { messages } = useAppSelector((state) => state.chat);
  const [error,setError] = useState('');
  const [isLoading,setIsLoading] = useState(false);
  console.log("messages", messages);
  
  const {
  control,
  handleSubmit,
  formState: { errors },
  clearErrors,
  reset
} = useForm<FormData>({
  defaultValues: {
    email: "", // keep initial value
    password: "",
  },
  mode: "onSubmit",
  shouldUnregister: false, // ✅ preserve field values
});

  // Clear error when component mounts
  // useEffect(() => {
  //   dispatch(clearError());
  // }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    console.log("data-==--=", data);
    try {
      // Use Redux thunk for login
      const result = await dispatch(loginUser(data)).unwrap();
      console.log("Login successful:", result);
      reset();
      router.replace("/home");
    } catch (error: any) {
      setError(error)
      console.log("Login error:", error);
      // Error is handled by the Redux slice
    }finally{
    setIsLoading(false)
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <KeyboardAwareScrollView contentContainerStyle={styles.container}   enableOnAndroid={true}
    keyboardShouldPersistTaps="handled">
      {/* Top section */}
      <View style={styles.topSection}>
        <Image
          source={require('../assets/images/AI_Mitra.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Welcome Back!</Text>
      </View>

      {/* Email input */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            message: "Enter a valid email",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.email) clearErrors("email");
                // if (error) dispatch(clearError());
              }}
              onBlur={onBlur}
            />
            <Text style={styles.error}>{errors?.email?.message}</Text>
          </>
        )}
      />

      {/* Password input */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.password) clearErrors("password");
                // if (error) dispatch(clearError());
              }}
              onBlur={onBlur}
            />
            <Text style={styles.error}>{errors?.password?.message}</Text>
            {error && <Text style={styles.error}>{error}</Text>}
          </>
        )}
      />

      {/* Submit button */}
      <Button
        title="Login"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        variant="primary"
        size="medium"
      />

      {/* Registration link */}
      <TouchableOpacity
        onPress={() => router.navigate("/registration")}
        style={styles.registerLink}
      >
        <Text style={styles.registerText}>
          Don't have an account?{" "}
          <Text style={{ fontWeight: "bold" }}>Register</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  error: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  registerLink: {
    marginTop: 15,
    alignSelf: "center",
  },
  registerText: {
    color: "#555",
    fontSize: 14,
  },
});
