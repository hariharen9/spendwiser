import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X, Check } from 'lucide-react';
import { Group, Participant } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ConfirmationDialog from './ConfirmationDialog';
import EditInput from './EditInput';

interface GroupManagerProps {
  groups: Group[];
  participants: Participant[];
  groupParticipants: Record<string, string[]>;
  setGroupParticipants: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  user: FirebaseUser | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const GroupManager: React.FC<GroupManagerProps> = ({ 
  groups, 
  participants, 
  groupParticipants, 
  setGroupParticipants, 
  user, 
  showToast 
}) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);

  const addGroup = async () => {
    if (!newGroupName.trim() || !user) {
      showToast('Group name cannot be empty.', 'error');
      return;
    }
    
    try {
      await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingGroups'),
        {
          name: newGroupName.trim(),
          participantIds: [],
          createdAt: Timestamp.now(),
          currency: '₹' // Default currency
        }
      );

      setNewGroupName('');
      setShowAddGroup(false);
      showToast('Group added successfully!', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showToast('Error adding group.', 'error');
    }
  };

  const confirmDeleteGroup = (id: string) => {
    setGroupToDelete(id);
    setShowDeleteConfirm(true);
  };

  const removeGroup = async () => {
    if (!groupToDelete || !user) return;
    
    try {
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', groupToDelete)
      );
      showToast('Group removed.', 'success');
    } catch (error) {
      console.error('Error removing group:', error);
      showToast('Error removing group.', 'error');
    } finally {
      setGroupToDelete(null);
    }
  };

  const updateGroupName = async (id: string, newName: string) => {
    if (!newName.trim() || !user) {
      showToast('Group name cannot be empty.', 'error');
      return;
    }

    try {
      await updateDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', id),
        { name: newName.trim() }
      );

      // Update the groups in the UI
      // Note: The groups are managed by the parent component through the useBillSplittingData hook
      showToast('Group name updated!', 'success');
    } catch (error) {
      console.error('Error updating group name:', error);
      showToast('Error updating group name.', 'error');
    }
  };

  const addParticipantToGroup = async (groupId: string, participantId: string) => {
    if (!user) return;
    
    try {
      const currentParticipants = groupParticipants[groupId] || [];
      if (!currentParticipants.includes(participantId)) {
        await updateDoc(
          doc(db, 'spenders', user.uid, 'billSplittingGroups', groupId),
          {
            participantIds: [...currentParticipants, participantId]
          }
        );
        
        setGroupParticipants({
          ...groupParticipants,
          [groupId]: [...currentParticipants, participantId]
        });
        showToast('Participant added to group.', 'success');
      }
    } catch (error) {
      console.error('Error adding participant to group:', error);
      showToast('Error adding participant to group.', 'error');
    }
  };

  const removeParticipantFromGroup = async (groupId: string, participantId: string) => {
    if (!user) return;
    
    try {
      const currentParticipants = groupParticipants[groupId] || [];
      const updatedParticipants = currentParticipants.filter(id => id !== participantId);
      
      await updateDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', groupId),
        {
          participantIds: updatedParticipants
        }
      );
      
      setGroupParticipants({
        ...groupParticipants,
        [groupId]: updatedParticipants
      });
      showToast('Participant removed from group.', 'success');
    } catch (error) {
      console.error('Error removing participant from group:', error);
      showToast('Error removing participant from group.', 'error');
    }
  };

  const getGroupParticipants = (groupId: string) => {
    const participantIds = groupParticipants[groupId] || [];
    return participants.filter(participant => participantIds.includes(participant.id));
  };

  const getAvailableParticipantsForGroup = (groupId: string) => {
    const participantIds = groupParticipants[groupId] || [];
    return participants.filter(participant => !participantIds.includes(participant.id));
  };

  return (
    <>
      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5]">Groups</h3>
          <motion.button
            onClick={() => setShowAddGroup(true)}
            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Group
          </motion.button>
        </div>
        
        {showAddGroup && (
          <motion.div 
            className="flex mb-3 space-x-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="flex-grow px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              onKeyPress={(e) => e.key === 'Enter' && addGroup()}
            />
            <motion.button
              onClick={addGroup}
              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => setShowAddGroup(false)}
              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </motion.div>
        )}
        
        {groups.length > 0 ? (
          <div className="space-y-3">
            {groups.map((group) => (
              <div key={group.id} className="bg-white dark:bg-[#242424] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <EditInput
                    value={group.name}
                    onSave={(newName) => updateGroupName(group.id, newName)}
                    placeholder="Group name"
                    className="flex-grow"
                  />
                  <motion.button
                    onClick={() => confirmDeleteGroup(group.id)}
                    className="text-red-500 hover:text-red-700 ml-2"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
                
                <div className="mb-2">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants in group:</h5>
                  {getGroupParticipants(group.id).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {getGroupParticipants(group.id).map((participant) => (
                        <span 
                          key={participant.id} 
                          className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                        >
                          {participant.name}
                          <button 
                            onClick={() => removeParticipantFromGroup(group.id, participant.id)}
                            className="ml-1 text-blue-800 dark:text-blue-200 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-[#888888]">No participants in this group</p>
                  )}
                </div>
                
                {getAvailableParticipantsForGroup(group.id).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add participants:</h5>
                    <div className="flex flex-wrap gap-2">
                      {getAvailableParticipantsForGroup(group.id).map((participant) => (
                        <motion.button
                          key={participant.id}
                          onClick={() => addParticipantToGroup(group.id, participant.id)}
                          className="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          {participant.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-[#888888] text-sm">No groups created yet. Add a group to organize participants.</p>
        )}
      </div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setGroupToDelete(null);
        }}
        onConfirm={removeGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone and will remove the group and all its associations."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default GroupManager;