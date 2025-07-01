require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_API_KEY = process.env.NASA_API_KEY;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rota para buscar imagens da NASA APOD
app.get('/api/apod', async (req, res) => {
    try {
        const { searchTerm } = req.query;
        
        if (!searchTerm) {
            return res.status(400).json({ error: 'O termo de busca é obrigatório' });
        }

        const response = await axios.get(`https://api.nasa.gov/planetary/apod`, {
            params: {
                api_key: NASA_API_KEY,
                count: 50,
                thumbs: true
            }
        });

        const filteredImages = response.data.filter(item => {
            const hasSearchTerm = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                (item.explanation && item.explanation.toLowerCase().includes(searchTerm.toLowerCase()));
            const noCopyright = !item.copyright || 
                              (item.copyright.toLowerCase() !== 'copyright' && 
                               !item.copyright.toLowerCase().includes('copyright'));
            const isImage = item.media_type === 'image';

            return hasSearchTerm && noCopyright && isImage;
        });

        res.json(filteredImages);
    } catch (error) {
        console.error('Erro ao buscar imagens da NASA:', error);
        res.status(500).json({ error: 'Erro ao buscar imagens da NASA' });
    }
});

// Rota principal - servir o frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});