import { useLocalSearchParams } from 'expo-router';
import NotebookDetailScreen from '@/src/screens/NotebookDetailScreen';

export default function NotebookDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <NotebookDetailScreen id={id ?? ''} />;
}
