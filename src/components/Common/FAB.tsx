import React from 'react';
import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-[#00C9A7] text-white p-4 rounded-full shadow-xl hover:bg-[#00B8A0] transition-all duration-200 hover:scale-105 z-50"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
};

export default FAB;