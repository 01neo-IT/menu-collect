const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
const JwtService = require('./jwtService.js');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const PORT = 5000;
const jwtService = new JwtService();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
}

app.get('', async (req, res) => {
    try {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.goto('https://web.whatsapp.com/');
        console.log('Please scan the QR code and wait...');
        await delay(30000);
        console.log('QR code scanned. Extracting phone numbers...');
        const phoneNumbers = await page.evaluate(() => {
            const phoneNumberPattern = /\+\d{1,3}[-\s]?\d{1,4}[-\s]?\d{1,4}[-\s]?\d{1,9}/g;
            const spans = Array.from(document.querySelectorAll('span[title]'));
            const numbers = new Set();

            spans.forEach(span => {
                const title = span.getAttribute('title');
                if (title && phoneNumberPattern.test(title)) {
                    numbers.add(title);
                }
            });
            return Array.from(numbers);
        });
        await browser.close();
        for (const phoneNumber of phoneNumbers) {
            const repeated = await prisma.client.findFirst({
                where: { phone: phoneNumber },
            });

            if (!repeated) {
                await prisma.client.create({
                    data: { phone: phoneNumber },
                });
            }
        }
        res.status(200).json({ message: 'Phone numbers extracted and stored.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during extraction', error });
    }
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { username, email, password: hashedPassword },
        });
        const token = jwtService.sign({ id: user.id });
        res.status(201).json({ token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Username or email already exists' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({
        where: { username },
    });

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ifPasswordMatch = await bcrypt.compare(password, user.password);
    if (!ifPasswordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwtService.sign({ id: user.id });
    res.cookie('authtoken', token, { httpOnly: true });
    res.status(200).json({ message: 'User logged in' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
