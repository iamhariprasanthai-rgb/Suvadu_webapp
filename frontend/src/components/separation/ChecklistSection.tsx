import React, { useState } from 'react';
import { ChecklistItem } from '../../types';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

interface ChecklistSectionProps {
  items: ChecklistItem[];
  canEdit: boolean;
  onUpdate: (itemId: number, isCompleted: boolean, notes?: string) => Promise<void>;
  onSubmit: () => Promise<void>;
  canSubmit: boolean;
}

const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  items,
  canEdit,
  onUpdate,
  onSubmit,
  canSubmit,
}) => {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, ChecklistItem[]>);

  const handleToggle = async (item: ChecklistItem) => {
    if (!canEdit) return;
    await onUpdate(item.id, !item.is_completed, notes[item.id]);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = items.filter((i) => i.is_completed).length;
  const mandatoryIncomplete = items.filter((i) => i.is_mandatory && !i.is_completed).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Checklist Progress</h3>
              <p className="text-sm text-gray-500">
                {completedCount} of {items.length} items completed
              </p>
            </div>
            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={submitting || mandatoryIncomplete > 0}
                className="btn-primary"
                title={mandatoryIncomplete > 0 ? 'Complete all mandatory items first' : ''}
              >
                {submitting ? 'Submitting...' : 'Submit Checklist'}
              </button>
            )}
          </div>
          {mandatoryIncomplete > 0 && canSubmit && (
            <p className="text-sm text-yellow-600 mt-2">
              ⚠️ {mandatoryIncomplete} mandatory item(s) remaining
            </p>
          )}
        </div>
      </div>

      {/* Checklist by Category */}
      {Object.entries(groupedItems).map(([category, categoryItems]) => (
        <div key={category} className="card">
          <div className="card-header bg-gray-50">
            <h3 className="font-medium text-gray-900">{category}</h3>
            <p className="text-sm text-gray-500">
              {categoryItems.filter((i) => i.is_completed).length} / {categoryItems.length} completed
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {categoryItems.map((item) => (
              <div
                key={item.id}
                className={`p-4 ${expandedItem === item.id ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={!canEdit}
                    className={`mt-0.5 flex-shrink-0 ${canEdit ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {item.is_completed ? (
                      <CheckCircleSolidIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <div className={`w-6 h-6 rounded-full border-2 ${
                        item.is_mandatory ? 'border-red-300' : 'border-gray-300'
                      } ${canEdit ? 'hover:border-primary-500' : ''}`} />
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-medium ${
                          item.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {item.name}
                      </span>
                      {item.is_mandatory && (
                        <span className="text-xs text-red-500 font-medium">Required</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    )}
                    
                    {/* Notes toggle */}
                    {canEdit && (
                      <button
                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                        className="text-sm text-primary-600 hover:text-primary-700 mt-2"
                      >
                        {expandedItem === item.id ? 'Hide notes' : 'Add notes'}
                      </button>
                    )}

                    {/* Notes input */}
                    {expandedItem === item.id && canEdit && (
                      <div className="mt-3">
                        <textarea
                          className="input text-sm"
                          placeholder="Add notes for this item..."
                          value={notes[item.id] || item.notes || ''}
                          onChange={(e) => setNotes({ ...notes, [item.id]: e.target.value })}
                          rows={2}
                        />
                        <button
                          onClick={() => onUpdate(item.id, item.is_completed, notes[item.id])}
                          className="btn-secondary text-sm mt-2"
                        >
                          Save Notes
                        </button>
                      </div>
                    )}

                    {/* Existing notes (read only) */}
                    {item.notes && !canEdit && (
                      <p className="text-sm text-gray-500 mt-2 italic">Note: {item.notes}</p>
                    )}
                  </div>

                  {/* Completion info */}
                  {item.completed_at && (
                    <div className="text-right text-sm text-gray-500">
                      <p>Completed</p>
                      <p>{new Date(item.completed_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="card">
          <div className="card-body text-center py-12">
            <p className="text-gray-500">No checklist items</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChecklistSection;
