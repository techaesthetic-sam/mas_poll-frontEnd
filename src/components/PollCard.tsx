import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Poll } from '../types';
import { pollService } from '../services/apiService';
import Modal from './Modal';

interface PollCardProps {
  poll: Poll;
  onDelete?: () => void;
}

export default function PollCard({ poll, onDelete }: PollCardProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const date = new Date(poll.created_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      await pollService.deletePoll(poll.id);
      setIsDeleteModalOpen(false);
      if (onDelete) {
        onDelete();
      }
    } catch (err: any) {
      // In a real app, we might want to show a toast here
      console.error('Error deleting poll:', err);
      alert('Failed to delete poll'); // Fallback for now, or could use another modal state
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="group relative bg-card border border-border/50 rounded-xl p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
        <button
          onClick={handleDeleteClick}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
          title="Delete poll"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
        
        <Link to={`/polls/${poll.id}`} className="block flex flex-col h-full">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-semibold text-foreground pr-10 group-hover:text-primary transition-colors">
              {poll.title}
            </h3>
          </div>
          
          {poll.closed && (
            <div className="mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                Closed
              </span>
            </div>
          )}

          {poll.description && (
            <p className="text-muted-foreground mb-6 line-clamp-2 text-sm leading-relaxed">
              {poll.description}
            </p>
          )}
          
          <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
            <span className="text-xs text-muted-foreground font-medium">
              {date}
            </span>
            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Poll 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </span>
          </div>
        </Link>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Poll"
        type="danger"
        footer={
          <>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </>
        }
      >
        <p>
          Are you sure you want to delete <span className="font-semibold text-foreground">"{poll.title}"</span>? 
          This action cannot be undone.
        </p>
      </Modal>
    </>
  );
}

