import { useState, useCallback } from "react";
import { uploadPDF, chatWithAI, getDocuments, deleteDocument } from "../services/api";
import toast from "react-hot-toast";

export const useAI = () => {
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState([]); // empty = "All Sources"

  const askQuestion = async (question) => {
    if (!question.trim()) return;

    const newUserMsg = { role: "user", content: question };
    setMessages((prev) => [...prev, newUserMsg]);
    setChatLoading(true);

    try {
      const payload = { question };
      if (selectedDocs.length > 0) {
        payload.documentIds = selectedDocs;
      }
      const { data } = await chatWithAI(payload);
      const aiResponse = { role: "ai", content: data.answer };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to get AI response");
    } finally {
      setChatLoading(false);
    }
  };

  const uploadDocument = async (file) => {
    if (!file) return false;
    
    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await uploadPDF(formData);
      toast.success("PDF processed and added to Knowledge Base!");
      window.dispatchEvent(new Event("documentUploaded"));
      // Auto-select the newly uploaded document
      if (data?.data?.id) {
        setSelectedDocs((prev) => [...prev, data.data.id]);
      }
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to upload PDF");
      return false;
    } finally {
      setUploadLoading(false);
    }
  };

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  const fetchDocuments = useCallback(async () => {
    setDocsLoading(true);
    try {
      const { data } = await getDocuments();
      setDocuments(data.data || []);
    } catch (err) {
      toast.error("Failed to fetch documents");
    } finally {
      setDocsLoading(false);
    }
  }, []);

  const removeDocument = async (id) => {
    try {
      await deleteDocument(id);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      setSelectedDocs((prev) => prev.filter((docId) => docId !== id));
      toast.success("Document deleted");
      return true;
    } catch (err) {
      toast.error("Failed to delete document");
      return false;
    }
  };

  const toggleDocSelection = useCallback((docId) => {
    setSelectedDocs((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId]
    );
  }, []);

  const selectAllDocs = useCallback(() => {
    setSelectedDocs([]);
  }, []);

  return {
    messages,
    chatLoading,
    uploadLoading,
    documents,
    docsLoading,
    selectedDocs,
    askQuestion,
    uploadDocument,
    clearChat,
    fetchDocuments,
    removeDocument,
    toggleDocSelection,
    selectAllDocs,
  };
};
