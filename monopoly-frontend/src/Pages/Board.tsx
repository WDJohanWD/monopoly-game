import { useParams } from 'react-router-dom';
import GameContainer from '../components/Game/GameContainer';

interface BoardProps {
  gameId?: string;
  onBack?: () => void;
}

export function Board({ gameId: propGameId }: BoardProps) {
  const { gameId: paramGameId } = useParams<{ gameId: string }>();
  const gameId = propGameId || paramGameId;

  return <GameContainer gameId={gameId} />;
}

