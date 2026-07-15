import { useCallback, useEffect, useRef, useState } from "react";

export function useEditableRecord<T>(initialData: T, initiallyEditing = false, recordKey?: string | number | null) {
  const [savedData, setSavedData] = useState(initialData);
  const [draftData, setDraftData] = useState(initialData);
  const [isEditing, setIsEditing] = useState(initiallyEditing);
  const [isSaving, setIsSaving] = useState(false);
  const editingRef = useRef(initiallyEditing);
  const recordKeyRef = useRef(recordKey);

  useEffect(() => {
    const changedRecord = recordKeyRef.current !== recordKey;
    if (changedRecord) {
      recordKeyRef.current = recordKey;
      editingRef.current = initiallyEditing;
      setSavedData(initialData);
      setDraftData(initialData);
      setIsEditing(initiallyEditing);
      setIsSaving(false);
      return;
    }
    setSavedData(initialData);
    if (!editingRef.current) setDraftData(initialData);
  }, [initialData, initiallyEditing, recordKey]);

  const edit = useCallback(() => {
    setDraftData(savedData);
    editingRef.current = true;
    setIsEditing(true);
  }, [savedData]);

  const cancel = useCallback(() => {
    setDraftData(savedData);
    editingRef.current = false;
    setIsEditing(false);
  }, [savedData]);

  const confirm = useCallback((confirmedData: T) => {
    setSavedData(confirmedData);
    setDraftData(confirmedData);
    editingRef.current = false;
    setIsEditing(false);
  }, []);

  return {
    savedData,
    draftData,
    setDraftData,
    isEditing,
    isSaving,
    setIsSaving,
    edit,
    cancel,
    confirm,
  };
}
