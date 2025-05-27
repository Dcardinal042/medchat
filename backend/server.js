const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));