import express from 'express';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const app = express();

app.use(express.json());
app.get('/get-charities', (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
        return res.status(400).send('Missing coordinates.');
    }
    res.send('hi');
});

app.listen(PORT, () => console.log('server running'));
