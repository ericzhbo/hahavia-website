const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method === 'GET') {
        try {
            const records = await base('Contacts').select({
                sort: [{ field: 'Created At', direction: 'desc' }]
            }).all();

            const contacts = records.map(record => ({
                id: record.id,
                name: record.get('Name'),
                email: record.get('Email'),
                phone: record.get('Phone'),
                message: record.get('Message'),
                status: record.get('Status'),
                created_at: record.get('Created At')
            }));

            return res.status(200).json(contacts);
        } catch (error) {
            console.error('Error fetching contacts:', error);
            return res.status(500).json({ error: 'Failed to fetch contacts' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, email, phone, message } = req.body;

            if (!name || !email || !message) {
                return res.status(400).json({ error: 'Name, email, and message are required' });
            }

            const record = await base('Contacts').create({
                'Name': name,
                'Email': email,
                'Phone': phone || '',
                'Message': message,
                'Status': 'Pending'
            });

            return res.status(201).json({
                id: record.id,
                name,
                email,
                phone,
                message,
                status: 'Pending'
            });
        } catch (error) {
            console.error('Error creating contact:', error);
            return res.status(500).json({ error: 'Failed to create contact' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id } = req.query;
            const { status } = req.body;

            if (!id || !status) {
                return res.status(400).json({ error: 'ID and status are required' });
            }

            await base('Contacts').update(id, {
                'Status': status
            });

            return res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error updating contact:', error);
            return res.status(500).json({ error: 'Failed to update contact' });
        }
    }

    return res.status(405).json({ error: 'Method not allowed' });
};
