import { Button, StyleSheet, Text, View } from "react-native";
import { useVoskSpeechRecognition } from "../hooks/useVoskSpeechRecognition";

export const VoskTestComponent = () => {
   const {
      isListening,
      recognizedText,
      error,
      isAvailable,
      isModelLoaded,
      startListening,
      stopListening,
      resetRecognition,
      getPlatformInfo,
   } = useVoskSpeechRecognition();

   const platformInfo = getPlatformInfo();

   const handleStartListening = () => {
      startListening("en-US");
   };

   const handleStopListening = () => {
      stopListening();
   };

   const handleReset = () => {
      resetRecognition();
   };

   return (
      <View style={styles.container}>
         <Text style={styles.title}>🎤 Vosk Speech Recognition Test</Text>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Platform:</Text>
            <Text style={styles.statusValue}>{platformInfo.platform}</Text>
         </View>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Engine:</Text>
            <Text style={styles.statusValue}>{platformInfo.engine}</Text>
         </View>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Offline:</Text>
            <Text style={styles.statusValue}>
               {platformInfo.offline ? "Yes" : "No"}
            </Text>
         </View>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Available:</Text>
            <Text
               style={[
                  styles.statusValue,
                  { color: isAvailable ? "green" : "red" },
               ]}
            >
               {isAvailable ? "Yes" : "No"}
            </Text>
         </View>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Model Loaded:</Text>
            <Text
               style={[
                  styles.statusValue,
                  { color: isModelLoaded ? "green" : "red" },
               ]}
            >
               {isModelLoaded ? "Yes" : "No"}
            </Text>
         </View>

         <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Listening:</Text>
            <Text
               style={[
                  styles.statusValue,
                  { color: isListening ? "orange" : "gray" },
               ]}
            >
               {isListening ? "Yes" : "No"}
            </Text>
         </View>

         {error && (
            <View style={styles.errorContainer}>
               <Text style={styles.errorText}>❌ Error: {error}</Text>
            </View>
         )}

         {recognizedText && (
            <View style={styles.resultContainer}>
               <Text style={styles.resultLabel}>Recognized Text:</Text>
               <Text style={styles.resultText}>"{recognizedText}"</Text>
            </View>
         )}

         <View style={styles.buttonContainer}>
            <Button
               title={isListening ? "Stop Listening" : "Start Listening"}
               onPress={
                  isListening ? handleStopListening : handleStartListening
               }
               disabled={!isAvailable}
            />
         </View>

         <View style={styles.buttonContainer}>
            <Button title="Reset" onPress={handleReset} />
         </View>

         <Text style={styles.instructions}>
            💡 Instructions:{"\n"}• Tap "Start Listening" to begin{"\n"}• Speak
            clearly into the microphone{"\n"}• Tap "Stop Listening" when done
            {"\n"}• Use "Reset" to clear results
         </Text>
      </View>
   );
};

const styles = StyleSheet.create({
   container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#f5f5f5",
   },
   title: {
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
      color: "#333",
   },
   statusContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginVertical: 5,
      paddingHorizontal: 10,
   },
   statusLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#555",
   },
   statusValue: {
      fontSize: 16,
      color: "#333",
   },
   errorContainer: {
      backgroundColor: "#ffebee",
      padding: 10,
      borderRadius: 8,
      marginVertical: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#f44336",
   },
   errorText: {
      color: "#c62828",
      fontSize: 14,
   },
   resultContainer: {
      backgroundColor: "#e8f5e8",
      padding: 15,
      borderRadius: 8,
      marginVertical: 10,
      borderLeftWidth: 4,
      borderLeftColor: "#4caf50",
   },
   resultLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: "#2e7d32",
      marginBottom: 5,
   },
   resultText: {
      fontSize: 18,
      color: "#1b5e20",
      fontStyle: "italic",
   },
   buttonContainer: {
      marginVertical: 10,
   },
   instructions: {
      fontSize: 14,
      color: "#666",
      textAlign: "center",
      marginTop: 20,
      lineHeight: 20,
   },
});
