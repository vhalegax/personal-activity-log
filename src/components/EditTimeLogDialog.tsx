'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

type TimeLog = {
  id: string;
  start_at: string;
  end_at: string | null;
};

interface EditTimeLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  timeLog: TimeLog | null;
  onSave: (timeLogId: string, startAt: string, endAt: string | null) => Promise<void>;
}

// Convert ISO string to datetime-local input format
function toDateTimeLocal(isoString: string): string {
  const date = new Date(isoString);
  // Get local time in YYYY-MM-DDTHH:mm format
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert datetime-local input to ISO string
function toISOString(dateTimeLocal: string): string {
  return new Date(dateTimeLocal).toISOString();
}

export function EditTimeLogDialog({ open, onOpenChange, timeLog, onSave }: EditTimeLogDialogProps) {
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLog) {
      setStartAt(toDateTimeLocal(timeLog.start_at));
      setEndAt(timeLog.end_at ? toDateTimeLocal(timeLog.end_at) : '');
      setIsActive(!timeLog.end_at);
      setError('');
    }
  }, [timeLog]);

  const handleSave = async () => {
    if (!timeLog) return;

    setError('');

    // Validate
    if (!startAt) {
      setError('Start time is required');
      return;
    }

    if (!isActive && !endAt) {
      setError('End time is required for completed logs');
      return;
    }

    if (!isActive && endAt) {
      const start = new Date(startAt);
      const end = new Date(endAt);
      if (end <= start) {
        setError('End time must be after start time');
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(timeLog.id, toISOString(startAt), isActive ? null : toISOString(endAt));
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update time log');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateDuration = () => {
    if (!startAt) return '';
    const start = new Date(startAt);
    const end = isActive ? new Date() : endAt ? new Date(endAt) : null;

    if (!end) return '';

    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return 'Invalid';

    const seconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Time Log</DialogTitle>
          <DialogDescription>
            Update the start and end times for this time log entry.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Start Time */}
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              disabled={isSaving}
            />
          </div>

          {/* Active Checkbox */}
          {/* <div className="flex items-center space-x-2">
            <input
              id="is-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={true || isSaving}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is-active" className="font-normal">
              Timer still running (active)
            </Label>
          </div> */}

          {/* End Time */}
          {!isActive && (
            <div className="space-y-2">
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                disabled={isSaving}
              />
            </div>
          )}

          {/* Duration Preview */}
          {startAt && (
            <div className="bg-muted rounded-md p-3">
              <p className="text-sm font-medium">Duration Preview</p>
              <p className="font-mono text-lg font-bold">{calculateDuration()}</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-destructive/10 text-destructive rounded-md p-3 text-sm">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
