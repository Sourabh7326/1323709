
const express = require('express');
const axios = require('axios');
const app = express();
const port = 9876;

const windowSize = 10;
let windowNumbers = [];

// Bearer token
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzE5ODEwODE1LCJpYXQiOjE3MTk4MTA1MTUsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjA4MWYzZjQwLWE1MmMtNGJjNS1hYTZkLWU3ODBjMWY3ZTkzMyIsInN1YiI6IlNvdXJhYmhzaGFybWE3MzI2QGdtYWlsLmNvbSJ9LCJjb21wYW55TmFtZSI6IkFmZm9yZG1lZCIsImNsaWVudElEIjoiMDgxZjNmNDAtYTUyYy00YmM1LWFhNmQtZTc4MGMxZjdlOTMzIiwiY2xpZW50U2VjcmV0IjoibGlNUXhaZmR1a0VqTWZKcSIsIm93bmVyTmFtZSI6IlNvdXJhYmgiLCJvd25lckVtYWlsIjoiU291cmFiaHNoYXJtYTczMjZAZ21haWwuY29tIiwicm9sbE5vIjoiMTMyMzcwOSJ9.5UmlbEJB7AcCHJZHyrRVKL0F1lwJDXKlZ_q0GxR8RPg';

// Map number IDs to their respective API endpoints
const apiEndpoints = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand'
};


const fetchNumbers = async (numberId) => {
    const endpoint = apiEndpoints[numberId];
    if (!endpoint) {
        throw new Error(`Invalid numberId: ${numberId}`);
    }

    try {
        const response = await axios.get(endpoint, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            },
            timeout: 5 // Timeout after 5 milliseconds
        });
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching numbers for ${numberId}:`, error.message);
        return [];
    }
};

const calculateAverage = (numbers) => {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
};

app.get('/numbers/:numberId', async (req, res) => {
    const numberId = req.params.numberId;
    try {
        const numbers = await fetchNumbers(numberId);

        // Ensure to remove duplicates
        const uniqueNumbers = numbers.filter((num, index, self) => {
            return index === self.indexOf(num) && !windowNumbers.includes(num);
        });

        uniqueNumbers.forEach((num) => {
            if (windowNumbers.length >= windowSize) {
                windowNumbers.shift();
            }
            windowNumbers.push(num);
        });

        const avg = calculateAverage(windowNumbers);

        res.json({
            numbers: uniqueNumbers,
            windowPrevState: [...windowNumbers.slice(0, -uniqueNumbers.length)],
            windowCurrState: windowNumbers,
            avg: avg.toFixed(2)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
