const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const { auth } = require('./src/middleware/auth');


// Register the auth route
const authRoutes = require('./src/routes/auth');
app.use('/api/auth', authRoutes);




// // User Routes
const usersRoutes = require('./src/routes/users');
app.use('/api/users', usersRoutes);
app.use('/data/profile_pics', auth(['admin', 'trainee']), express.static('profile_pics'));

// // Resource Routes
const resourcesRoutes = require('./src/routes/resources');
app.use('/api/resources', resourcesRoutes);
app.use('/data/resources', auth(['admin', 'trainee']), express.static('resources'));

// Preference Routes
const preferencesRoutes = require('./src/routes/preferences');
app.use('/api/preferences', preferencesRoutes);

// Exercise Routes
const exercisesRoutes = require('./src/routes/exercises');
app.use('/api/exercises', exercisesRoutes);

const submissionsRoutes = require('./src/routes/submissions');
app.use('/api/submissions', submissionsRoutes);

// Scenario Routes
const scenariosRoutes = require('./src/routes/scenarios');
app.use('/api/scenarios', scenariosRoutes);

// Audio Routes
app.use('/data/audio', auth(['admin']), express.static('voice_samples'));
const audioDescriptionRoutes = require('./src/routes/audio');
app.use('/api/tts', audioDescriptionRoutes);
app.use('/data/scenario_audios', auth(['admin', 'trainee']), express.static('src/scenario_audios'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
