import { Pencil, Trash2 } from 'lucide-react';

const NoteCard = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{note.title}</h3>
        <p className="text-gray-600 mb-4 whitespace-pre-wrap line-clamp-4">{note.content}</p>
      </div>
      
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <span className="text-xs text-gray-400 font-medium">
          {formatDate(note.createdAt)}
        </span>
        
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(note)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors cursor-pointer"
            title="Edit Note"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(note._id)}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
