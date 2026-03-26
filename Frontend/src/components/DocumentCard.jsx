import { FileText, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const DocumentCard = ({ document, onDelete }) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace('/api', '')
    : 'http://localhost:5000';

  const token = localStorage.getItem('token');
  const fileUrl = document.fileUrl 
    ? `${baseUrl}${document.fileUrl}${token ? '?token=' + token : ''}` 
    : null;
  const canView = !!fileUrl;

  const handleCardClick = () => {
    if (canView) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(document._id);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`group bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[140px] ${canView ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-1 break-all" title={document.filename}>
              {document.filename}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(document.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 shrink-0"
          title="Delete PDF"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400 font-medium">
        <span>PDF Document</span>
        {canView ? (
          <span className="text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Open PDF
          </span>
        ) : (
          <span className="text-amber-500 flex items-center gap-1" title="Re-upload this PDF to enable viewing">
            <AlertCircle className="w-3 h-3" /> Re-upload to view
          </span>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
