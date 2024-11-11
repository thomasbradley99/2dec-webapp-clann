const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const sessionsRoutes = require('./routes/sessions');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
