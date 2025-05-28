const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: ['http://localhost:5174', 'https://medchat-1-8aun.onrender.com'] }));
app.use(express.json());
// Mock clinic data (replace with real API call later)
const mockClinics = {
    "lagos": [
        { name: "Lagos General Hospital", address: "1 Broad Street, Lagos Island", phone: "+234 1 123 4567" },
        { name: "St. Nicholas Hospital", address: "57 Campbell Street, Lagos Island", phone: "+234 1 266 9999" }
    ],
    "abuja": [
        { name: "National Hospital Abuja", address: "Plot 132 Central District, Garki, Abuja", phone: "+234 9 234 5678" },
        { name: "Cedarcrest Hospitals", address: "2 Sam Mbakwe Street, Garki, Abuja", phone: "+234 9 345 6789" }
    ],
    "kano": [
        { name: "Aminu Kano Teaching Hospital", address: "No 1 Hospital Road, Kano", phone: "+234 64 123 4567" },
        { name: "Murtala Muhammad Specialist Hospital", address: "No 2 Murtala Way, Kano", phone: "+234 64 234 5678" }
    ]
};
const knowledgeBase = {
  en: {
    'why do i feel tired': 'Fatigue can be caused by dehydration, poor diet, lack of sleep, or conditions like anemia. Drink water, eat balanced meals, and consult a doctor for tests.',
    'how to prevent malaria': 'Use insecticide-treated bed nets, apply mosquito repellent, and clear stagnant water around your home. Visit a clinic for prophylactic medication.',
    'what are symptoms of malaria': 'Symptoms include fever, chills, headache, and fatigue. Consult a doctor for a test if you experience these.',
  },
  yo: {
    'kini idi ti mo n rilara': 'Rirẹ le jẹ nitori omi kekere ninu ara, ounjẹ ti ko dara, tabi ainidun. Mu omi, jẹun to dara, ki o kan si dokita fun idanwo.',
    'bawo ni mo se le dena iba': 'Lo awọn ibusun ti a fi oogun insecticide ṣe, lo oogun anti-mosquito, ki o si pa omi ti o duro mọ ni ayika ile rẹ. Ṣabẹwo si ile-iwosan fun oogun idena.',
  },
  ha: {
    'me yasa nake jin gajiya': 'Gajiya na iya zama saboda rashin ruwa a jiki, rashin abinci mai kyau, ko rashin barci. Sha ruwa, ci abinci mai kyau, kuma tuntuɓi likita don gwaji.',
  },
  ig: {
    'gini kpatara m ji ike ọgwụgwụ': 'Ike ọgwụgwụ nwere ike ịbụ n’ihi mmiri dị n’ime ahụ, nri adịghị mma, ma ọ bụ enweghị ụra. Drinkụọ mmiri, rie nri kwesịrị ekwesị, ma gaa hụ dọkịta maka nyocha.',
  },
  pi: {
    'why i dey feel tired': 'Tired fit come from no enough water, bad food, or no sleep. Drink water, chop good food, and see doctor for test.',
    'how i fit stop malaria': 'Use net wey dem treat with insecticide, rub mosquito cream, and clear any water wey dey stand near your house. Go clinic for malaria medicine.',
  },
};

app.get('/', (req, res) => {
  res.send('MedChat Backend Running');
});

app.post('/api/health-query', (req, res) => {
  const { query, language } = req.body;
  const normalizedQuery = query.toLowerCase().replace(/[^a-z\s]/g, '');

  const answer = knowledgeBase[language]?.[normalizedQuery] || 
    `Sorry, I don't have an answer for that in ${language}. Try rephrasing or consult a healthcare professional.`;
  
  res.json({ answer });
});

app.post('/api/symptom-checker', (req, res) => {
  const { symptoms } = req.body;
  let answer = 'Based on your symptoms: ';
  
  if (symptoms.includes('fever') && symptoms.includes('chills')) {
    answer += 'You may have malaria. Please visit a clinic for a test.';
  } else if (symptoms.includes('fever') && symptoms.includes('headache')) {
    answer += 'You might have a viral infection or malaria. Rest, stay hydrated, and see a doctor for a test.';
  } else if (symptoms.includes('fatigue') && symptoms.includes('headache')) {
    answer += 'This could be due to stress, dehydration, or an underlying condition. Drink water, rest, and consult a doctor if it persists.';
  } else if (symptoms.includes('fever')) {
    answer += 'Fever could indicate an infection. Rest, stay hydrated, and see a doctor.';
  } else if (symptoms.includes('fatigue')) {
    answer += 'Fatigue might be due to lack of sleep, poor diet, or anemia. Ensure you rest and eat well, and see a doctor if it continues.';
  } else {
    answer += 'Your symptoms are unclear. Please provide more details or consult a doctor.';
  }
  
  res.json({ answer });
});
// New clinic finder endpoint
app.post('/api/clinic-finder', (req, res) => {
    const { city } = req.body;
    const cityLower = city.toLowerCase();
    const clinics = mockClinics[cityLower] || [];
    if (clinics.length > 0) {
        res.json({ clinics });
    } else {
        res.json({ clinics: [], message: "No clinics found for this city. Try 'lagos', 'abuja', or 'kano'." });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));