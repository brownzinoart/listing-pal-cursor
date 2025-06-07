import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './cloudinary.env' });

const app = express();

app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Test server running on http://localhost:${PORT}`);
}); 