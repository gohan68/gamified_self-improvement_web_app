# 🎮 SE Learning Journey - Gamified Self-Improvement App

A beautiful, gamified web app for tracking your Software Engineering learning journey with XP, levels, streaks, badges, and a structured 4-week learning plan.

## ✨ Features

### Phase 1: Core Gamification ✅
- **Dashboard** - Real-time stats with XP, level, streak, and badges
- **Daily Logging** - Track time, difficulty, mood, energy, freelance workload, and notes
- **XP System** - Dynamic XP calculation: `timeSpent × difficulty × 10`
- **Level System** - Automatic leveling: `Level = floor(sqrt(XP/100)) + 1`
- **Streak Tracking** - Consecutive day tracking with visual feedback
- **Badge System** - Achievements for milestones (First Step, Week Warrior, Level 5 Master, etc.)
- **Motivational Messages** - Friendly, positive reinforcement messages

### Phase 2: 4-Week Learning Plan ✅
- Pre-structured plan: Java + DSA + CS Fundamentals
- Task status tracking (Not Started / In Progress / Completed)
- Fully editable via UI (add, edit, delete tasks)
- XP rewards for task completion
- Subject-wise categorization (Java, DSA, CS)

### Phase 3: Analytics Dashboard ✅
- **Completion Tracking** - Overall progress percentage across all tasks
- **Study Time Analytics** - Total hours and session count
- **Subject Breakdown** - Visual progress bars for each subject (Java, DSA, CS)
- **Weak Subject Detection** - Automatic identification of subjects needing attention
- **Activity Timeline** - Detailed view of recent study sessions with XP earned
- **Performance Insights** - Comprehensive analytics to track learning journey

### Phase 4: AI Smart Coach ✅
- **Personalized Coaching** - AI-powered analysis using GPT-5.1
- **Behavioral Pattern Detection** - Identifies study habits, consistency, and intensity
- **Daily Suggestions** - Context-aware recommendations for what to focus on
- **Burnout Risk Detection** - Warns when study intensity is too high
- **Skip Detection** - Alerts on irregular study schedules
- **Weak Subject Recommendations** - AI suggests areas needing more attention
- **Motivational Insights** - Encouraging feedback based on your progress

## 🚀 Quick Start

### 1. Supabase Setup

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to **Settings → API** in the Supabase dashboard
4. Copy your:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon Key** (public key)

#### Create Database Tables

Run this SQL in **Supabase SQL Editor** (Dashboard → SQL Editor → New Query):

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  \"currentXP\" INTEGER DEFAULT 0,
  \"currentLevel\" INTEGER DEFAULT 1,
  \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
  id TEXT PRIMARY KEY,
  \"userId\" TEXT NOT NULL,
  date DATE NOT NULL,
  \"timeSpent\" INTEGER NOT NULL,
  difficulty INTEGER NOT NULL,
  mood TEXT,
  energy TEXT,
  \"freelanceLoad\" TEXT,
  notes TEXT,
  \"xpEarned\" INTEGER NOT NULL,
  \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (\"userId\") REFERENCES users(id)
);

-- Learning plan table
CREATE TABLE learning_plan (
  id TEXT PRIMARY KEY,
  \"userId\" TEXT NOT NULL,
  week INTEGER NOT NULL,
  topic TEXT NOT NULL,
  \"subjectType\" TEXT NOT NULL,
  status TEXT DEFAULT 'Not Started',
  \"xpReward\" INTEGER DEFAULT 100,
  \"createdAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (\"userId\") REFERENCES users(id)
);

-- Badges table
CREATE TABLE badges (
  id TEXT PRIMARY KEY,
  \"userId\" TEXT NOT NULL,
  \"badgeType\" TEXT NOT NULL,
  \"badgeName\" TEXT NOT NULL,
  \"earnedAt\" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (\"userId\") REFERENCES users(id)
);

-- Streaks table
CREATE TABLE streaks (
  id TEXT PRIMARY KEY,
  \"userId\" TEXT NOT NULL,
  \"currentStreak\" INTEGER DEFAULT 0,
  \"longestStreak\" INTEGER DEFAULT 0,
  \"lastLogDate\" DATE,
  FOREIGN KEY (\"userId\") REFERENCES users(id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (demo mode)
CREATE POLICY \"Allow all operations\" ON users FOR ALL USING (true);
CREATE POLICY \"Allow all operations\" ON daily_logs FOR ALL USING (true);
CREATE POLICY \"Allow all operations\" ON learning_plan FOR ALL USING (true);
CREATE POLICY \"Allow all operations\" ON badges FOR ALL USING (true);
CREATE POLICY \"Allow all operations\" ON streaks FOR ALL USING (true);

-- Create indexes for performance
CREATE INDEX idx_daily_logs_user ON daily_logs(\"userId\");
CREATE INDEX idx_daily_logs_date ON daily_logs(date DESC);
CREATE INDEX idx_learning_plan_user ON learning_plan(\"userId\");
CREATE INDEX idx_learning_plan_week ON learning_plan(week);
CREATE INDEX idx_badges_user ON badges(\"userId\");
CREATE INDEX idx_streaks_user ON streaks(\"userId\");
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Restart the Server

```bash
sudo supervisorctl restart nextjs
```

### 4. Open the App

Visit: `http://localhost:3000`

## 🎯 How to Use

### Log Your Study Session
1. Go to the **Log Study** tab
2. Enter time spent (in minutes)
3. Select difficulty (1-5)
4. Optionally add mood, energy, freelance workload, and notes
5. Click **Log Session & Earn XP**
6. Watch your XP and level increase! 🚀

### Track Your Progress
1. View your **Dashboard** to see:
   - Current level and XP progress bar
   - Current streak (consecutive days)
   - Badges earned
   - Recent activity log
   - Motivational messages

### Follow the Learning Plan
1. Go to the **Learning Plan** tab
2. See the 4-week structured plan (Java + DSA + CS)
3. Update task status:
   - **Not Started** → **In Progress** → **Completed**
4. Earn XP rewards when you complete tasks!

## 🏆 Badge System

Earn these achievements:

- **🎯 First Step** - Log your first study session
- **🔥 Week Warrior** - Maintain a 7-day streak
- **⭐ Level 5 Master** - Reach level 5
- **💎 XP Collector** - Earn 1000+ total XP
- **🏃 Study Marathon** - Study for 4+ hours in one day

## 📊 XP & Level System

### XP Calculation
```
XP Earned = Time Spent (minutes) × Difficulty (1-5) × 10
```

**Examples:**
- 60 minutes at difficulty 3 = 1,800 XP
- 30 minutes at difficulty 5 = 1,500 XP
- 120 minutes at difficulty 2 = 2,400 XP

### Level Calculation
```
Level = floor(sqrt(Total XP / 100)) + 1
```

**Level Milestones:**
- Level 1: 0 XP
- Level 2: 100 XP
- Level 3: 400 XP
- Level 5: 1,600 XP
- Level 10: 8,100 XP

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **AI**: Emergent LLM key (for Phase 4)

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js   # Backend API endpoints
│   ├── page.js                     # Main frontend UI
│   ├── layout.js                   # Root layout
│   └── globals.css                 # Global styles
├── lib/
│   └── supabase.js                 # Supabase client & initialization
├── components/ui/                  # shadcn UI components
├── .env                            # Environment variables (create this!)
├── .env.example                    # Environment template
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🔧 API Endpoints

### GET `/api/dashboard`
Returns dashboard data including user stats, streak, badges, recent logs, and motivational message.

### GET `/api/learning-plan`
Returns the 4-week learning plan grouped by week.

### GET `/api/analytics`
Returns analytics data including completion percentage, subject breakdown, and weak subjects.

### POST `/api/log-study`
Logs a study session and awards XP.

**Request body:**
```json
{
  \"timeSpent\": 60,
  \"difficulty\": 3,
  \"mood\": \"Focused\",
  \"energy\": \"High\",
  \"freelanceLoad\": \"Light\",
  \"notes\": \"Learned about binary trees\"
}
```

### POST `/api/update-task`
Updates a learning plan task status.

**Request body:**
```json
{
  \"taskId\": \"plan_user_demo_001_0\",
  \"status\": \"Completed\"
}
```

## 🎨 Design Principles

- **Positive Reinforcement** - No punishment for failure, only rewards for progress
- **Gaming-Inspired** - Level up, earn XP, collect badges
- **Calm & Friendly** - Motivational without being aggressive
- **Mobile Responsive** - Works beautifully on all devices

## 🚀 Next Steps (Phases 2-4)

### Phase 2: Enhanced Learning Plan
- Already implemented! Just needs Supabase credentials
- Editable plan UI (can modify topics and XP rewards)
- Task completion tracking with XP rewards

### Phase 3: Analytics Dashboard
- XP growth visualization with charts
- Streak calendar heatmap
- Behavioral pattern detection
- Weak subject identification

### Phase 4: AI Smart Coach
- Adaptive suggestions using Emergent LLM
- Pattern detection (frequent skips, burnout risk, overload)
- Personalized recommendations based on behavior

## 💡 Tips

1. **Be Consistent** - Log every day to maintain your streak!
2. **Be Honest** - Accurate difficulty ratings help track your progress
3. **Add Notes** - Reflect on what you learned each day
4. **Track Freelance Load** - Helps identify when to adjust your schedule
5. **Celebrate Milestones** - Check your badges and achievements!

## 🐛 Troubleshooting

### App shows error about Supabase
- Make sure you've created the Supabase tables (run the SQL above)
- Check that your `.env` file has the correct credentials
- Restart the server: `sudo supervisorctl restart nextjs`

### XP not updating
- Check browser console for errors
- Verify Supabase tables are created correctly
- Make sure RLS policies are set up

### Tables not creating
- Make sure you ran the SQL in Supabase SQL Editor
- Check for syntax errors in the SQL console
- Verify you have the correct permissions

## 📝 License

MIT License - feel free to use this for your learning journey!

---

**Built with ❤️ for self-improvement and continuous learning**

Happy coding! 🎮✨
