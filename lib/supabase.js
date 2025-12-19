import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env file')
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Default user ID for demo purposes
export const DEMO_USER_ID = 'user_demo_001'

// Initialize default user if needed
export const initializeUser = async () => {
  if (!supabase) return null
  
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', DEMO_USER_ID)
      .single()
    
    if (existingUser) {
      return existingUser
    }
    
    // Create new user
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        id: DEMO_USER_ID,
        username: 'Demo User',
        currentXP: 0,
        currentLevel: 1
      }])
      .select()
      .single()
    
    if (error) throw error
    
    // Initialize streak record
    await supabase
      .from('streaks')
      .insert([{
        id: `streak_${DEMO_USER_ID}`,
        userId: DEMO_USER_ID,
        currentStreak: 0,
        longestStreak: 0,
        lastLogDate: null
      }])
    
    return newUser
  } catch (error) {
    console.error('Error initializing user:', error)
    return null
  }
}

// Initialize default 4-week learning plan
export const initializeLearningPlan = async () => {
  if (!supabase) return
  
  try {
    // Check if plan already exists
    const { data: existingPlan } = await supabase
      .from('learning_plan')
      .select('id')
      .eq('userId', DEMO_USER_ID)
      .limit(1)
    
    if (existingPlan && existingPlan.length > 0) {
      return // Plan already exists
    }
    
    // Default 4-week learning plan
    const defaultPlan = [
      // Week 1: Java Basics
      { week: 1, topic: 'Java Syntax & Variables', subjectType: 'Java', xpReward: 100 },
      { week: 1, topic: 'Control Flow & Loops', subjectType: 'Java', xpReward: 100 },
      { week: 1, topic: 'Functions & Methods', subjectType: 'Java', xpReward: 100 },
      { week: 1, topic: 'OOP Concepts (Classes & Objects)', subjectType: 'Java', xpReward: 150 },
      { week: 1, topic: 'Inheritance & Polymorphism', subjectType: 'Java', xpReward: 150 },
      
      // Week 2: DSA Basics
      { week: 2, topic: 'Arrays & ArrayList', subjectType: 'DSA', xpReward: 100 },
      { week: 2, topic: 'Strings & String Manipulation', subjectType: 'DSA', xpReward: 100 },
      { week: 2, topic: 'LinkedList Implementation', subjectType: 'DSA', xpReward: 150 },
      { week: 2, topic: 'Stack & Queue', subjectType: 'DSA', xpReward: 150 },
      { week: 2, topic: 'Sorting Algorithms', subjectType: 'DSA', xpReward: 200 },
      
      // Week 3: Advanced DSA
      { week: 3, topic: 'Trees & Binary Trees', subjectType: 'DSA', xpReward: 200 },
      { week: 3, topic: 'Binary Search Trees', subjectType: 'DSA', xpReward: 200 },
      { week: 3, topic: 'Graphs & Traversals', subjectType: 'DSA', xpReward: 250 },
      { week: 3, topic: 'Hashing & HashMap', subjectType: 'DSA', xpReward: 150 },
      { week: 3, topic: 'Recursion & Backtracking', subjectType: 'DSA', xpReward: 250 },
      
      // Week 4: CS Fundamentals
      { week: 4, topic: 'Time & Space Complexity', subjectType: 'CS', xpReward: 150 },
      { week: 4, topic: 'Operating Systems Basics', subjectType: 'CS', xpReward: 150 },
      { week: 4, topic: 'DBMS & SQL Fundamentals', subjectType: 'CS', xpReward: 150 },
      { week: 4, topic: 'Networking Basics', subjectType: 'CS', xpReward: 150 },
      { week: 4, topic: 'System Design Introduction', subjectType: 'CS', xpReward: 200 },
    ]
    
    const planWithIds = defaultPlan.map((item, index) => ({
      id: `plan_${DEMO_USER_ID}_${index}`,
      userId: DEMO_USER_ID,
      ...item,
      status: 'Not Started'
    }))
    
    await supabase
      .from('learning_plan')
      .insert(planWithIds)
    
    console.log('✅ Default learning plan initialized')
  } catch (error) {
    console.error('Error initializing learning plan:', error)
  }
}
