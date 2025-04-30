import { motion } from 'framer-motion';

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale:0.8, opacity:0 }} 
        animate={{ scale:1, opacity:1 }} 
        className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full"
      >
        <p className="mb-6 text-center">{message}</p>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
