import { useCallback } from "react";

export const useTypewriterGenerate = (formData, setFormData, setIsGenerating) => {

  const handleGenerate = useCallback(async (fieldName, generatedText) => {
    const clearText = (text) =>
      new Promise((resolve) => {
        let i = text.length;
        const interval = setInterval(() => {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: text.slice(0, i),
          }));
          i--;
          if (i < 0) {
            clearInterval(interval);
            resolve();
          }
        }, 15);
      });

    await clearText(formData[fieldName]);
    await new Promise((r) => setTimeout(r, 500));

    const appearText = (text) =>
      new Promise((resolve) => {
        let i = 0;
        const interval = setInterval(() => {
          setFormData((prev) => ({
            ...prev,
            [fieldName]: text.slice(0, i),
          }));
          i++;
          if (i > text.length) {
            clearInterval(interval);
            resolve();
          }
        }, 20);
      });

    await appearText(generatedText);
    setIsGenerating((prev) => ({ ...prev, [fieldName]: false }));
  }, [formData, setFormData, setIsGenerating]);

  return handleGenerate;
};
