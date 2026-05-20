import AudioPlayerDemo from '@/src/screens/dev/AudioPlayerDemo';
import { ScrollView, StyleSheet } from 'react-native';

export default function AudioDemoScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AudioPlayerDemo />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60, // Add padding for status bar area since it's now a full screen
    backgroundColor: '#F8FAFC',
  },
});
