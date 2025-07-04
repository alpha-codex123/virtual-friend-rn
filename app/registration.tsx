import Button from "@/components/ui/Button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearError, registerUser } from "@/store/slices/authSlice";
import { router } from "expo-router";
import React, { useEffect } from "react";
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
  firstName: string;
  lastName: string;
};

const Registration = () => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const {
    control,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<FormData>({
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(registerUser(data)).unwrap();
      dispatch(clearError());
      router.navigate("/login");
    } catch (err) {
      // error handled by redux
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <KeyboardAwareScrollView contentContainerStyle={styles.container}   enableOnAndroid={true}
    keyboardShouldPersistTaps="handled">
      {/* Top section */}
      <View style={styles.topSection}>
        <Image
          source={{ uri: "https://reactnative.dev/img/tiny_logo.png" }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>Register</Text>
      </View>
      {/* First name input */}
      <Controller
        control={control}
        name="firstName"
        rules={{
          required: "First name is required",
          pattern: {
            value: /^[a-zA-Z]+$/,
            message: "Enter a valid first name",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="First name"
              keyboardType="default"
              autoCapitalize="none"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.firstName) clearErrors("firstName");
                if (error) dispatch(clearError());
              }}
              onBlur={onBlur}
            />
            <Text style={styles.error}>{errors?.firstName?.message}</Text>
          </>
        )}
      />
      {/* Last name input */}
      <Controller
        control={control}
        name="lastName"
        rules={{
          required: "Last name is required",
          pattern: {
            value: /^[a-zA-Z]+$/,
            message: "Enter a valid last name",
          },
        }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              style={styles.input}
              placeholder="Last name"
              keyboardType="default"
              autoCapitalize="none"
              value={value}
              onChangeText={(text) => {
                onChange(text);
                if (errors.lastName) clearErrors("lastName");
                if (error) dispatch(clearError());
              }}
              onBlur={onBlur}
            />
            <Text style={styles.error}>{errors?.lastName?.message}</Text>
          </>
        )}
      />
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
                if (error) dispatch(clearError());
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
          // pattern: {
          //   value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
          //   message:
          //     "Password must contain uppercase, lowercase, number, and special character",
          // },
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
                if (error) dispatch(clearError());
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
        title="Register"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
        variant="primary"
        size="medium"
      />
      {/* Registration link */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={styles.registerLink}
      >
        <Text style={styles.registerText}>
          Already have an account?{" "}
          <Text style={{ fontWeight: "bold" }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
    </View>
  );
};

export default Registration;

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
    width: 80,
    height: 80,
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
