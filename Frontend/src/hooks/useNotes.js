import { useState, useCallback } from "react";
import { getNotes, createNote, updateNote, deleteNote } from "../services/api";
import toast from "react-hot-toast";

export const useNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getNotes();
      setNotes(data.data || []);
      setError(null);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  const addNote = async (noteData) => {
    try {
      const { data } = await createNote(noteData);
      setNotes([data.data, ...notes]);
      toast.success("Note created successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create note");
      return false;
    }
  };

  const editNote = async (id, noteData) => {
    try {
      const { data } = await updateNote(id, noteData);
      setNotes(notes.map((note) => (note._id === id ? data.data : note)));
      toast.success("Note updated successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update note");
      return false;
    }
  };

  const removeNote = async (id) => {
    try {
      await deleteNote(id);
      setNotes(notes.filter((note) => note._id !== id));
      toast.success("Note deleted successfully");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete note");
    }
  };

  return { notes, loading, error, fetchNotes, addNote, editNote, removeNote };
};
