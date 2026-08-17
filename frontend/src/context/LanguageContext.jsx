import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axiosClient";
import { useAuth } from "./AuthContext";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  // Default to Tamil (ta) or user's preference if logged in
  const [lang, setLang] = useState("ta");
  const [translations, setTranslations] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.language) {
      setLang(user.language);
    }
  }, [user]);

  useEffect(() => {
    fetchTranslations(lang);
  }, [lang]);

  const fetchTranslations = async (language) => {
    try {
      setLoading(true);
      // We don't use api() here if it requires auth and we want translations on login page too.
      // But /api/translations/:lang is unprotected in backend.
      const res = await api.get(`/translations/${language}`);
      if (res.data.success) {
        setTranslations(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load translations:", err);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    // Optionally update user's language in the backend here
  };

  const t = (key) => {
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t, translationsLoading: loading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
