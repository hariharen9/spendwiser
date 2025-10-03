import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, User, X, Check } from 'lucide-react';
import { Participant } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ConfirmationDialog from './ConfirmationDialog';
import EditInput from './EditInput';

interface ParticipantManagerProps {
  participants: Participant[];
  setParticipants: React.Dispatch<React.SetStateAction<Participant[]>>;
  user: FirebaseUser | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ParticipantManager: React.FC<ParticipantManagerProps> = ({ participants, setParticipants, user, showToast }) => {
  const [newParticipantName, setNewParticipantName] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState<string | null>(null);

  const addParticipant = async () => {
    if (!newParticipantName.trim() || !user) {
      showToast('Participant name cannot be empty.', 'error');
      return;
    }

    try {
      const participantRef = await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingParticipants'),
        {
          name: newParticipantName.trim(),
          createdAt: Timestamp.now()
        }
      );

      const newParticipant: Participant = {
        id: participantRef.id,
        name: newParticipantName.trim(),
        amountOwed: 0,
        amountPaid: 0,
      };
      
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setShowAddParticipant(false);
      showToast('Participant added!', 'success');
    } catch (error) {
      console.error('Error adding participant:', error);
      showToast('Error adding participant.', 'error');
    }
  };

  const confirmDeleteParticipant = (id: string) => {
    setParticipantToDelete(id);
    setShowDeleteConfirm(true);
  };

  const removeParticipant = async () => {
    if (!participantToDelete || !user) return;

    try {
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingParticipants', participantToDelete)
      );

      setParticipants(participants.filter(p => p.id !== participantToDelete));
      showToast('Participant removed.', 'success');
    } catch (error) {
      console.error('Error removing participant:', error);
      showToast('Error removing participant.', 'error');
    } finally {
      setParticipantToDelete(null);
    }
  };

  const updateParticipantName = async (id: string, newName: string) => {
    if (!newName.trim() || !user) {
      showToast('Participant name cannot be empty.', 'error');
      return;
    }

    try {
      await updateDoc(
        doc(db, 'spenders', user.uid, 'billSplittingParticipants', id),
        { name: newName.trim() }
      );

      setParticipants(participants.map(p => 
        p.id === id ? { ...p, name: newName.trim() } : p
      ));
      showToast('Participant name updated!', 'success');
    } catch (error) {
      console.error('Error updating participant name:', error);
      showToast('Error updating participant name.', 'error');
    }
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5]">Participants</h3>
          <motion.button
            onClick={() => setShowAddParticipant(true)}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </motion.button>
        </div>
        
        {showAddParticipant && (
          <motion.div 
            className="flex mb-3 space-x-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={newParticipantName}
              onChange={(e) => setNewParticipantName(e.target.value)}
              placeholder="Participant name"
              className="flex-grow px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
            />
            <motion.button
              onClick={addParticipant}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowAddParticipant(false)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              className="flex items-center justify-between bg-white dark:bg-[#242424] rounded-lg p-3 border border-gray-200 dark:border-gray-700"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center space-x-2">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                  <User className="h-4 w-4 text-gray-600 dark:text-[#888888]" />
                </div>
                {participant.id === '1' ? (
                  <span className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate max-w-[150px]" title={participant.name}>
                    {participant.name.length >= 8 ? participant.name.substring(0, 6) + '..' : participant.name}
                  </span>
                ) : (
                  <EditInput
                    value={participant.name}
                    onSave={(newName) => updateParticipantName(participant.id, newName)}
                    placeholder="Participant name"
                    className="flex-grow"
                  />
                )}
              </div>
              {participant.id !== '1' && (
                <motion.button
                  onClick={() => confirmDeleteParticipant(participant.id)}
                  className="text-red-500 hover:text-red-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setParticipantToDelete(null);
        }}
        onConfirm={removeParticipant}
        title="Delete Participant"
        message="Are you sure you want to delete this participant? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default ParticipantManager;