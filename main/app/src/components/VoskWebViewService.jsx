import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

const VOSK_HTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Vosk Speech Recognition</title>
    <script src="https://cdn.jsdelivr.net/npm/vosk-browser@0.0.8/dist/vosk.js"></script>
</head>
<body>
    <div id="status">Initializing...</div>
    
    <script>
        let model = null;
        let recognizer = null;
        let mediaRecorder = null;
        let audioContext = null;
        let isListening = false;
        
        // Load Vosk model
        async function initializeVosk() {
            try {
                document.getElementById('status').textContent = 'Loading model...';
                
                // Load a small English model
                const modelUrl = 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip';
                model = await Vosk.createModel(modelUrl);
                
                recognizer = new model.KaldiRecognizer(16000);
                
                document.getElementById('status').textContent = 'Ready';
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'VOSK_READY',
                    payload: { ready: true }
                }));
                
            } catch (error) {
                console.error('Failed to initialize Vosk:', error);
                document.getElementById('status').textContent = 'Error: ' + error.message;
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'VOSK_ERROR',
                    payload: { error: error.message }
                }));
            }
        }
        
        // Start speech recognition
        async function startRecognition() {
            try {
                if (!recognizer) {
                    throw new Error('Vosk not initialized');
                }
                
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        sampleRate: 16000,
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true
                    } 
                });
                
                audioContext = new AudioContext({ sampleRate: 16000 });
                const source = audioContext.createMediaStreamSource(stream);
                
                const processor = audioContext.createScriptProcessor(4096, 1, 1);
                
                processor.onaudioprocess = function(e) {
                    const inputBuffer = e.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    // Convert float32 to int16
                    const buffer = new Int16Array(inputData.length);
                    for (let i = 0; i < inputData.length; i++) {
                        buffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
                    }
                    
                    if (recognizer.acceptWaveform(buffer)) {
                        const result = recognizer.result();
                        if (result.text && result.text.trim()) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'SPEECH_RESULT',
                                payload: { text: result.text.trim() }
                            }));
                        }
                    } else {
                        const partial = recognizer.partialResult();
                        if (partial.partial) {
                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                type: 'SPEECH_PARTIAL',
                                payload: { text: partial.partial }
                            }));
                        }
                    }
                };
                
                source.connect(processor);
                processor.connect(audioContext.destination);
                
                isListening = true;
                document.getElementById('status').textContent = 'Listening...';
                
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'SPEECH_START',
                    payload: { listening: true }
                }));
                
            } catch (error) {
                console.error('Failed to start recognition:', error);
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'VOSK_ERROR',
                    payload: { error: error.message }
                }));
            }
        }
        
        // Stop speech recognition
        function stopRecognition() {
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            
            isListening = false;
            document.getElementById('status').textContent = 'Ready';
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SPEECH_STOP',
                payload: { listening: false }
            }));
        }
        
        // Handle messages from React Native
        document.addEventListener('message', function(event) {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'START_RECOGNITION':
                    startRecognition();
                    break;
                case 'STOP_RECOGNITION':
                    stopRecognition();
                    break;
                case 'INITIALIZE':
                    initializeVosk();
                    break;
            }
        });
        
        // Auto-initialize when page loads
        window.addEventListener('load', initializeVosk);
    </script>
</body>
</html>
`;

export const VoskWebViewService = ({ onMessage, style }) => {
    const webViewRef = useRef(null);
    const [isReady, setIsReady] = useState(false);

    const handleMessage = useCallback((event) => {
        try {
            const message = JSON.parse(event.nativeEvent.data);
            
            switch (message.type) {
                case 'VOSK_READY':
                    setIsReady(true);
                    break;
                case 'VOSK_ERROR':
                case 'SPEECH_RESULT':
                case 'SPEECH_PARTIAL':
                case 'SPEECH_START':
                case 'SPEECH_STOP':
                    if (onMessage) {
                        onMessage(message);
                    }
                    break;
            }
        } catch (error) {
            console.error('Failed to parse WebView message:', error);
        }
    }, [onMessage]);

    const sendMessage = useCallback((message) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify(message));
        }
    }, []);

    const startRecognition = useCallback(() => {
        sendMessage({ type: 'START_RECOGNITION' });
    }, [sendMessage]);

    const stopRecognition = useCallback(() => {
        sendMessage({ type: 'STOP_RECOGNITION' });
    }, [sendMessage]);

    const initialize = useCallback(() => {
        sendMessage({ type: 'INITIALIZE' });
    }, [sendMessage]);

    return (
        <View style={style}>
            <WebView
                ref={webViewRef}
                source={{ html: VOSK_HTML }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                mediaPlaybackRequiresUserAction={false}
                allowsInlineMediaPlayback={true}
                mixedContentMode="compatibility"
                style={{ height: 1, width: 1, opacity: 0 }} // Hidden WebView
                onLoadEnd={() => {
                    // WebView loaded, Vosk will auto-initialize
                }}
            />
        </View>
    );
};

// Export the service methods for external use
VoskWebViewService.prototype = {
    startRecognition,
    stopRecognition,
    initialize,
    isReady
};
