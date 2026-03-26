import { useState, useEffect } from 'react';
import { useNotes } from '../hooks/useNotes';
import { useAI } from '../hooks/useAI';
import NoteCard from '../components/NoteCard';
import NoteForm from '../components/NoteForm';
import DocumentCard from '../components/DocumentCard';
import AIAssistant from '../components/AIAssistant';
import { Plus, StickyNote, Search } from 'lucide-react';

const Home = () => {
  const { notes, loading, fetchNotes, addNote, editNote, removeNote } = useNotes();
  const { documents, docsLoading, fetchDocuments, removeDocument } = useAI();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  useEffect(() => {
    fetchDocuments();
    const handleUpload = () => fetchDocuments();
    window.addEventListener('documentUploaded', handleUpload);
    return () => window.removeEventListener('documentUploaded', handleUpload);
  }, [fetchDocuments]);

  const handleOpenForm = (note = null) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setEditingNote(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (noteData) => {
    let success = false;
    if (editingNote) {
      success = await editNote(editingNote._id, noteData);
    } else {
      success = await addNote(noteData);
    }
    
    if (success) {
      handleCloseForm();
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-500 mt-1">Manage your ideas and tasks</p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-grow md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow text-sm"
            />
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap cursor-pointer shadow-sm"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Note</span>
          </button>
        </div>
      </div>

      {loading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 text-primary-500 mb-4">
            <StickyNote className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No notes found</h3>
          <p className="text-gray-500 mt-2 max-w-sm mx-auto">
            {searchQuery ? "We couldn't find any notes matching your search." : "You haven't created any notes yet. Click the Add Note button to get started!"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => handleOpenForm()}
              className="mt-6 text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              + Create your first note
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              onEdit={handleOpenForm}
              onDelete={removeNote}
            />
          ))}
        </div>
      )}

      {isFormOpen && (
        <NoteForm
          initialData={editingNote}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
        />
      )}

      <div className="mt-12 flex flex-col justify-between items-start mb-6 gap-2 border-t border-gray-100 pt-10">
        <h2 className="text-2xl font-bold text-gray-900">My PDFs</h2>
        <p className="text-gray-500">Files available for AI chat context</p>
      </div>

      {docsLoading && documents.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
          <p className="text-gray-500 max-w-sm mx-auto">
            You haven't uploaded any PDFs yet. Open the AI Assistant to add documents!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {documents.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onDelete={removeDocument}
            />
          ))}
        </div>
      )}
      
      <AIAssistant />
    </div>
  );
};

export default Home;
