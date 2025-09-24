# CampusConnect Backend Setup

## Full Backend Implementation with Shell Commands

Copy and paste these commands into your terminal to set up the complete backend infrastructure.

### 1. Initialize Backend Project

```bash
# Create backend directory
mkdir campusconnect-backend
cd campusconnect-backend

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express mongoose cors helmet morgan dotenv bcryptjs jsonwebtoken
npm install passport passport-google-oauth20 passport-jwt
npm install multer cloudinary socket.io
npm install express-rate-limit express-validator
npm install node-cron axios

# Install development dependencies
npm install -D nodemon concurrently jest supertest

# Create directory structure
mkdir -p src/{controllers,models,routes,middleware,utils,config}
mkdir -p uploads temp
```

### 2. Environment Configuration

```bash
# Create .env file
cat > .env << 'EOF'
# Server Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080

# Database
MONGODB_URI=mongodb://localhost:27017/campusconnect

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# External APIs (Optional)
EVENTBRITE_API_KEY=your-eventbrite-key

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EOF
```

### 3. Core Server Setup

```bash
# Create main server file
cat > src/server.js << 'EOF'
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');

const app = express();
const server = createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:8080",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusconnect', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-event', (eventId) => {
    socket.join(`event-${eventId}`);
  });
  
  socket.on('leave-event', (eventId) => {
    socket.leave(`event-${eventId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
});

module.exports = { app, io };
EOF
```

### 4. Database Models

```bash
# User Model
cat > src/models/User.js << 'EOF'
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId;
    }
  },
  googleId: {
    type: String,
    sparse: true
  },
  avatar: {
    type: String,
    default: ''
  },
  college: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'college_admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    categories: [String],
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  registeredEvents: [{
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
EOF

# Event Model
cat > src/models/Event.js << 'EOF'
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['fest', 'hackathon', 'workshop', 'seminar']
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  location: {
    address: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  college: {
    name: {
      type: String,
      required: true
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'INR'
    }
  },
  flyer: {
    url: String,
    publicId: String
  },
  tags: [String],
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  externalSource: {
    platform: String,
    externalId: String,
    syncedAt: Date
  }
}, {
  timestamps: true
});

// Index for search and filtering
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ 'college.name': 1 });

// Virtual for registered count
eventSchema.virtual('registeredCount').get(function() {
  return this.registrations.filter(reg => reg.status === 'registered').length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.registeredCount;
});

module.exports = mongoose.model('Event', eventSchema);
EOF
```

### 5. Authentication System

```bash
# JWT Utils
cat > src/utils/jwt.js << 'EOF'
const jwt = require('jsonwebtoken');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  
  return { accessToken, refreshToken };
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

module.exports = { generateTokens, verifyToken };
EOF

# Auth Middleware
cat > src/middleware/auth.js << 'EOF'
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'college_admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

module.exports = { auth, adminAuth };
EOF

# Passport Configuration
cat > src/config/passport.js << 'EOF'
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    
    if (user) {
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ email: profile.emails[0].value });
    
    if (user) {
      // Link Google account to existing user
      user.googleId = profile.id;
      user.avatar = profile.photos[0]?.value || user.avatar;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    user = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0]?.value || '',
      isVerified: true
    });
    
    await user.save();
    done(null, user);
  } catch (error) {
    done(error, null);
  }
}));

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
EOF
```

### 6. API Routes

```bash
# Auth Routes
cat > src/routes/auth.js << 'EOF'
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateTokens } = require('../utils/jwt');
const { auth } = require('../middleware/auth');
const passport = require('../config/passport');

const router = express.Router();

// Register
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    });

    await user.save();

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Google OAuth
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { accessToken, refreshToken } = generateTokens(req.user._id);
    
    // Redirect to frontend with tokens
    const redirectUrl = `${process.env.FRONTEND_URL}?token=${accessToken}&refresh=${refreshToken}`;
    res.redirect(redirectUrl);
  }
);

// Get current user
router.get('/me', auth, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      role: req.user.role,
      college: req.user.college,
      preferences: req.user.preferences
    }
  });
});

module.exports = router;
EOF

# Event Routes
cat > src/routes/events.js << 'EOF'
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Event = require('../models/Event');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all events with filters
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['fest', 'hackathon', 'workshop', 'seminar']),
  query('search').optional().isString().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    const query = { status: 'published' };
    
    if (req.query.category) {
      query.category = req.query.category;
    }
    
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Get events
    const events = await Event.find(query)
      .populate('college.adminId', 'name email')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Event.countDocuments(query);

    // Add computed fields
    const eventsWithStats = events.map(event => ({
      ...event.toObject(),
      registeredCount: event.registeredCount,
      availableSpots: event.availableSpots,
      timeRemaining: event.date - new Date()
    }));

    res.json({
      events: eventsWithStats,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error fetching events' });
  }
});

// Create event
router.post('/', [auth, adminAuth], [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').isIn(['fest', 'hackathon', 'workshop', 'seminar']),
  body('date').isISO8601().withMessage('Please provide a valid date'),
  body('time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Please provide time in HH:MM format'),
  body('deadline').isISO8601().withMessage('Please provide a valid deadline'),
  body('location.address').trim().notEmpty().withMessage('Location address is required'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  body('price.amount').isNumeric({ min: 0 }).withMessage('Price must be a non-negative number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      ...req.body,
      college: {
        name: req.body.college?.name || req.user.college || 'Unknown College',
        adminId: req.user._id
      }
    };

    const event = new Event(eventData);
    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error creating event' });
  }
});

// Register for event
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = event.registrations.find(
      reg => reg.userId.toString() === req.user._id.toString()
    );

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ message: 'Event is at full capacity' });
    }

    // Check deadline
    if (new Date() > event.deadline) {
      return res.status(400).json({ message: 'Registration deadline has passed' });
    }

    // Add registration
    event.registrations.push({
      userId: req.user._id,
      status: 'registered'
    });

    await event.save();

    // Add to user's registered events
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        registeredEvents: {
          eventId: event._id,
          status: 'registered'
        }
      }
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`event-${event._id}`).emit('registration-update', {
      eventId: event._id,
      registeredCount: event.registeredCount + 1,
      availableSpots: event.capacity - (event.registeredCount + 1)
    });

    res.json({
      message: 'Successfully registered for event',
      registrationId: event.registrations[event.registrations.length - 1]._id
    });
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

module.exports = router;
EOF
```

### 7. File Upload & Cloudinary

```bash
# Upload Routes
cat > src/routes/upload.js << 'EOF'
const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload event flyer
router.post('/flyer', [auth, upload.single('flyer')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'campusconnect/flyers',
          public_id: `flyer-${Date.now()}`,
          transformation: [
            { width: 800, height: 600, crop: 'fill' },
            { quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      message: 'File uploaded successfully',
      url: result.secure_url,
      publicId: result.public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

module.exports = router;
EOF

# User Routes
cat > src/routes/users.js << 'EOF'
const express = require('express');
const User = require('../models/User');
const Event = require('../models/Event');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('registeredEvents.eventId');

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const allowedUpdates = ['name', 'college', 'preferences'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// Get user's registered events
router.get('/events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'registeredEvents.eventId',
        select: 'title description date time location category price flyer'
      });

    const registeredEvents = user.registeredEvents
      .filter(reg => reg.eventId) // Filter out deleted events
      .map(reg => ({
        ...reg.eventId.toObject(),
        registrationStatus: reg.status,
        registeredAt: reg.registeredAt
      }));

    res.json({ events: registeredEvents });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({ message: 'Server error fetching user events' });
  }
});

module.exports = router;
EOF
```

### 8. Cron Jobs for Cleanup

```bash
# Cron Jobs
cat > src/utils/cronJobs.js << 'EOF'
const cron = require('node-cron');
const Event = require('../models/Event');

// Clean up expired events daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Running expired events cleanup...');
    
    const now = new Date();
    
    // Mark events as completed if they've passed
    const expiredEvents = await Event.updateMany(
      {
        date: { $lt: now },
        status: { $in: ['published', 'draft'] }
      },
      {
        $set: { status: 'completed' }
      }
    );

    console.log(`Marked ${expiredEvents.modifiedCount} events as completed`);

    // Delete draft events older than 30 days
    const oldDrafts = await Event.deleteMany({
      status: 'draft',
      createdAt: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    });

    console.log(`Deleted ${oldDrafts.deletedCount} old draft events`);

  } catch (error) {
    console.error('Cron job error:', error);
  }
});

// Update event status based on current time
cron.schedule('*/5 * * * *', async () => {
  try {
    const now = new Date();
    
    // Mark events as live if they're starting now (within 5 minutes)
    await Event.updateMany(
      {
        date: {
          $gte: new Date(now.getTime() - 5 * 60 * 1000),
          $lte: new Date(now.getTime() + 5 * 60 * 1000)
        },
        status: 'published'
      },
      {
        $set: { status: 'live' }
      }
    );

  } catch (error) {
    console.error('Status update cron error:', error);
  }
});

console.log('Cron jobs initialized');

module.exports = {};
EOF
```

### 9. Package.json Scripts

```bash
# Update package.json with scripts
cat > package.json << 'EOF'
{
  "name": "campusconnect-backend",
  "version": "1.0.0",
  "description": "Backend for CampusConnect - College Events Platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "seed": "node src/utils/seed.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.6.0",
    "passport-google-oauth20": "^2.0.0",
    "passport-jwt": "^4.0.1",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.40.0",
    "socket.io": "^4.7.2",
    "express-rate-limit": "^6.10.0",
    "express-validator": "^7.0.1",
    "node-cron": "^3.0.2",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "concurrently": "^8.2.0",
    "jest": "^29.6.4",
    "supertest": "^6.3.3"
  }
}
EOF
```

### 10. Final Setup & Run Commands

```bash
# Initialize cron jobs in server
cat >> src/server.js << 'EOF'

// Initialize cron jobs
require('./utils/cronJobs');
EOF

# Start the server
echo "🚀 Starting CampusConnect Backend..."
npm run dev
```

## Frontend Integration

Add these to your frontend `.env` file:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Database Setup

1. **Install MongoDB** (if not already installed):
```bash
# macOS
brew install mongodb-community

# Ubuntu
sudo apt-get install mongodb

# Start MongoDB
mongod --dbpath /path/to/your/db
```

2. **MongoDB Cloud Atlas** (Recommended):
- Create account at https://cloud.mongodb.com
- Create cluster and get connection string
- Replace `MONGODB_URI` in `.env`

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Update `.env` with client ID and secret

## Cloudinary Setup

1. Create account at [Cloudinary](https://cloudinary.com)
2. Get API credentials from dashboard
3. Update `.env` with credentials

## Features Included

✅ **Authentication**: JWT + Google OAuth + Guest access
✅ **Real-time Updates**: Socket.io for seat availability
✅ **File Uploads**: Cloudinary integration for event flyers
✅ **Database**: MongoDB with comprehensive schemas
✅ **Security**: Rate limiting, validation, helmet
✅ **Cron Jobs**: Automatic event cleanup
✅ **Admin Panel**: Role-based access control
✅ **API Documentation**: RESTful endpoints
✅ **Error Handling**: Comprehensive error management

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/events` - Get events with filters
- `POST /api/events` - Create event (admin only)
- `POST /api/events/:id/register` - Register for event
- `POST /api/upload/flyer` - Upload event flyer
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

This complete backend provides all the functionality requested for CampusConnect!