import { Link } from 'react-router-dom';
import { Poll } from '../types';
import { pollService } from '../services/apiService';

interface PollCardProps {
  poll: Poll;
  onDelete?: () => void;
}

export default function PollCard({ poll, onDelete }: PollCardProps) {
  const date = new Date(poll.created_at).toLocaleDateString();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm(`Are you sure you want to delete "${poll.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await pollService.deletePoll(poll.id);
      if (onDelete) {
        onDelete();
      }
    } catch (err: any) {
      alert(`Failed to delete poll: ${err.message}`);
      console.error('Error deleting poll:', err);
    }
  };

  return (
    <div className="relative bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 text-destructive hover:text-destructive/80 text-sm"
        title="Delete poll"
      >
        ×
      </button>
      <Link to={`/polls/${poll.id}`} className="block">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-semibold text-foreground pr-6">{poll.title}</h3>
          {poll.closed && (
            <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
              Closed
            </span>
          )}
        </div>
        {poll.description && (
          <p className="text-muted-foreground mb-4 line-clamp-2">{poll.description}</p>
        )}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created {date}</span>
          <span className="text-primary">View →</span>
        </div>
      </Link>
    </div>
  );
}

