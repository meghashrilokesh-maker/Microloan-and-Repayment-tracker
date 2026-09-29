/**
 * Web Speech API Recognition Utility (Phase 3A)
 *
 * Provides a clean, cross-browser wrapper around window.SpeechRecognition and
 * window.webkitSpeechRecognition, configured specifically for Indian English ('en-IN').
 */

/**
 * Checks if the current browser environment supports the Web Speech API.
 */
export function isSpeechRecognitionSupported() {
  if (typeof window === 'undefined') return false;
  return Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
}

/**
 * Retrieves the native SpeechRecognition constructor if available.
 */
export function getSpeechRecognitionConstructor() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

/**
 * Starts a single-phrase speech recognition session.
 *
 * @param {Object} options
 * @param {string} [options.lang='en-IN'] - BCP 47 language tag (default Indian English).
 * @param {Function} [options.onStart] - Callback when audio listening begins.
 * @param {Function} [options.onResult] - Callback with final transcribed string (onResult(transcript)).
 * @param {Function} [options.onError] - Callback with error object ({ type, message }).
 * @param {Function} [options.onEnd] - Callback when listening ends.
 * @returns {SpeechRecognition|null} The recognition instance, or null if unsupported.
 */
export function startSpeechRecognition({
  lang = 'en-IN',
  onStart,
  onResult,
  onError,
  onEnd,
} = {}) {
  const SpeechRecognition = getSpeechRecognitionConstructor();

  if (!SpeechRecognition) {
    if (onError) {
      onError({
        type: 'unsupported',
        message: 'Speech recognition is not supported in this browser. Please try Chrome, Edge, or a browser with Web Speech API support, or type your message.',
      });
    }
    return null;
  }

  try {
    const recognition = new SpeechRecognition();

    // Enforce required configuration
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    let hasDeliveredResult = false;

    recognition.onstart = () => {
      if (onStart) onStart();
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result && result[0]) {
          finalTranscript += result[0].transcript;
        }
      }

      finalTranscript = finalTranscript.trim();

      if (finalTranscript) {
        hasDeliveredResult = true;
        if (onResult) {
          onResult(finalTranscript);
        }
      }
    };

    recognition.onerror = (event) => {
      let friendlyMessage = 'An error occurred during speech recognition. Please try again.';

      switch (event.error) {
        case 'not-allowed':
        case 'permission-denied':
          friendlyMessage = 'Microphone permission denied. Please allow microphone access in your browser settings to use voice input.';
          break;

        case 'audio-capture':
          friendlyMessage = 'Microphone is unavailable or not connected. Please check your audio input device.';
          break;

        case 'no-speech':
          friendlyMessage = 'No speech was detected. Please try speaking closer to your microphone.';
          break;

        case 'network':
          friendlyMessage = 'Network error during speech recognition. Please check your internet connection.';
          break;

        case 'aborted':
          // Recognition was stopped by user or system programmatically; not a critical error
          return;

        default:
          friendlyMessage = `Speech recognition error (${event.error}). Please try again or type your message.`;
          break;
      }

      if (onError) {
        onError({
          type: event.error || 'error',
          message: friendlyMessage,
        });
      }
    };

    recognition.onend = () => {
      if (onEnd) {
        onEnd({ hasResult: hasDeliveredResult });
      }
    };

    recognition.start();
    return recognition;
  } catch (err) {
    if (onError) {
      onError({
        type: 'start-error',
        message: 'Could not start microphone: ' + (err.message || 'unknown error'),
      });
    }
    return null;
  }
}

/**
 * Safely stops an active speech recognition session.
 */
export function stopSpeechRecognition(recognitionInstance) {
  if (!recognitionInstance) return;
  try {
    recognitionInstance.stop();
  } catch (_e) {
    // Session may have already stopped naturally
  }
}

/**
 * Aborts an active speech recognition session immediately without waiting for results.
 */
export function abortSpeechRecognition(recognitionInstance) {
  if (!recognitionInstance) return;
  try {
    recognitionInstance.abort();
  } catch (_e) {
    // Session may have already terminated
  }
}

export default {
  isSpeechRecognitionSupported,
  getSpeechRecognitionConstructor,
  startSpeechRecognition,
  stopSpeechRecognition,
  abortSpeechRecognition,
};
