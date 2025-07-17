import { southAfricanLanguages } from "@/constants";
import { useEffect, useState } from "react";

export default function LanguageSelector() {
  const [selectedLang, setSelectedLang] = useState("");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang) {
      setSelectedLang(savedLang);
    }
  }, []);

  const handleChange = (e) => {
    const lang = e.target.value;
    setSelectedLang(lang);
    localStorage.setItem("ElohDocApp_preferredLanguage", lang);
  };

  return (
    <div className="max-w-sm mx-auto my-6">
      <label
        htmlFor="language"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        Choose your preferred language
      </label>
      <select
        id="language"
        value={selectedLang}
        onChange={handleChange}
        className="w-full p-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          -- Select Language --
        </option>
        {southAfricanLanguages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.value}
          </option>
        ))}
      </select>
      {selectedLang && (
        <p className="mt-3 text-sm text-green-600">
          You have selected:{" "}
          <strong>
            {southAfricanLanguages.find((l) => l.id === selectedLang)?.value}
          </strong>
        </p>
      )}
    </div>
  );
}
