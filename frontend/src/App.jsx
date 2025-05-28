import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const MedChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [symptoms, setSymptoms] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [city, setCity] = useState('');
  const [clinics, setClinics] = useState([]);

  // Initialize Speech Recognition
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  useEffect(() => {
    if (recognition) {
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'en' ? 'en-US' : language === 'yo' ? 'yo-NG' : language === 'ha' ? 'ha-NG' : language === 'ig' ? 'ig-NG' : 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setMessages([...messages, { text: 'Sorry, I couldn’t understand the voice input. Please try again.', sender: 'bot' }]);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    }
  }, [language, recognition]);

  const handleVoiceInput = () => {
    if (!recognition) {
      setMessages([...messages, { text: 'Speech recognition is not supported in this browser.', sender: 'bot' }]);
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.start();
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { text: input, sender: 'user' };
    setMessages([...messages, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/health-query', {
        query: input,
        language,
      });
      setMessages([...messages, userMessage, { text: response.data.answer, sender: 'bot' }]);
    } catch (error) {
      setMessages([
        ...messages,
        userMessage,
        { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' },
      ]);
    }
    setInput('');
    setIsLoading(false);
  };

  const handleSymptomChecker = () => {
    setMessages([
      ...messages,
      { text: 'Starting Symptom Checker... Please select your symptoms below.', sender: 'bot' },
    ]);
  };

  const handleSymptomSelect = (symptom) => {
    setSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const submitSymptoms = async () => {
    if (symptoms.length === 0) {
      setMessages([
        ...messages,
        { text: 'Please select at least one symptom to proceed.', sender: 'bot' },
      ]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/symptom-checker', { symptoms });
      setMessages([...messages, { text: response.data.answer, sender: 'bot' }]);
      setSymptoms([]);
    } catch (error) {
      setMessages([...messages, { text: 'Error in symptom checker. Try again.', sender: 'bot' }]);
    }
    setIsLoading(false);
  };

  const handleClinicFinder = async () => {
    if (!city.trim()) {
      setMessages([...messages, { text: 'Please enter a city name.', sender: 'bot' }]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/clinic-finder', { city });
      setClinics(response.data.clinics);
      setMessages([...messages, { text: response.data.message || `Clinics in ${city}:`, sender: 'bot' }]);
    } catch (error) {
      setMessages([...messages, { text: 'Error finding clinics. Try again.', sender: 'bot' }]);
    }
    setIsLoading(false);
    setCity('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">MedChat</h1>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4">
        <div className="mb-4">
          <label className="mr-2">Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border rounded p-1"
          >
            <option value="en">English</option>
            <option value="yo">Yoruba</option>
            <option value="ha">Hausa</option>
            <option value="ig">Igbo</option>
            <option value="pi">Pidgin</option>
          </select>
        </div>
        <div className="h-96 overflow-y-auto mb-4 p-2 border rounded">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 p-2 rounded ${
                msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-200 text-left'
              }`}
            >
              {msg.text}
            </div>
          ))}
          {clinics.length > 0 && (
            <div className="mt-2 p-2 bg-gray-200 rounded">
              <h3 className="font-bold">Clinic Results:</h3>
              <ul className="list-disc pl-5">
                {clinics.map((clinic, idx) => (
                  <li key={idx}>
                    {clinic.name} - {clinic.address} (Phone: {clinic.phone})
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isLoading && <div className="text-gray-500">Typing...</div>}
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a health question..."
            className="flex-1 border rounded p-2 mr-2"
          />
          <button
            onClick={handleVoiceInput}
            className={`p-2 rounded mr-2 ${
              isListening ? 'bg-red-600' : 'bg-purple-600'
            } text-white`}
            title={isListening ? 'Stop Listening' : 'Start Voice Input'}
          >
            {isListening ? 'Stop' : '🎙️'}
          </button>
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white rounded p-2"
            disabled={isLoading}
          >
            Send
          </button>
        </div>
        <button
          onClick={handleSymptomChecker}
          className="mt-2 bg-green-600 text-white rounded p-2 w-full"
        >
          Start Symptom Checker
        </button>
        <div className="mt-4">
          <p>Select Symptoms:</p>
          <div className="flex flex-wrap gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={symptoms.includes('fever')}
                onChange={() => handleSymptomSelect('fever')}
                className="mr-1"
              />
              Fever
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={symptoms.includes('chills')}
                onChange={() => handleSymptomSelect('chills')}
                className="mr-1"
              />
              Chills
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={symptoms.includes('headache')}
                onChange={() => handleSymptomSelect('headache')}
                className="mr-1"
              />
              Headache
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={symptoms.includes('fatigue')}
                onChange={() => handleSymptomSelect('fatigue')}
                className="mr-1"
              />
              Fatigue
            </label>
          </div>
          <button
            onClick={submitSymptoms}
            className="mt-2 bg-green-600 text-white rounded p-2 w-full"
          >
            Submit Symptoms
          </button>
        </div>
        <div className="mt-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g., lagos, abuja, kano)"
            className="w-full border rounded p-2 mb-2"
          />
          <button
            onClick={handleClinicFinder}
            className="bg-yellow-600 text-white rounded p-2 w-full"
          >
            Find Clinics
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-600 mt-4">
        Note: MedChat provides general advice. Consult a doctor for medical emergencies.
      </p>
    </div>
  );
};

export default MedChat;