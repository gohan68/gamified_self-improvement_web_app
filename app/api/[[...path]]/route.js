import { NextResponse } from 'next/server'
import { supabase, DEMO_USER_ID, initializeUser, initializeLearningPlan } from '../../../lib/supabase.js'
import { v4 as uuidv4 } from 'uuid'

// Helper function to calculate XP
function calculateXP(timeSpent, difficulty) {
  // Base formula: timeSpent (minutes) * difficulty * 10
  return Math.floor(timeSpent * difficulty * 10)
}

// Helper function to calculate level from XP
function calculateLevel(xp) {
  // Level = floor(sqrt(XP / 100)) + 1
  return Math.floor(Math.sqrt(xp / 100)) + 1
}

// Helper function to get motivational message
function getMotivationalMessage(level, streak) {
  const messages = [
    "You're doing amazing! Keep pushing forward! 🚀",
    "Every small step counts. You're building greatness! 💪",
    "Consistency is key. You're on the right path! 🌟",
    "Your future self will thank you for today's effort! ✨",
    "Learning is a journey, not a race. Enjoy the process! 🎯",
    "You're leveling up your skills every day! 🎮",
    "Small progress is still progress. Keep going! 🌱",
    "Your dedication is inspiring! Stay focused! 🔥",
  ]
  
  if (streak >= 7) {
    return `🔥 ${streak}-day streak! You're unstoppable! Keep the fire burning! 🔥`
  }
  
  if (level >= 10) {
    return `🏆 Level ${level} achiever! You're crushing it! 🏆`
  }
  
  return messages[Math.floor(Math.random() * messages.length)]
}

// Check and award badges
async function checkAndAwardBadges(userId, userData, streakData, logsCount) {
  if (!supabase) return []
  
  const badges = []
  const { data: existingBadges } = await supabase
    .from('badges')
    .select('badgeType')
    .eq('userId', userId)
  
  const earnedBadgeTypes = existingBadges?.map(b => b.badgeType) || []
  
  // First Step Badge
  if (logsCount === 1 && !earnedBadgeTypes.includes('first_step')) {
    badges.push({
      id: uuidv4(),
      userId,
      badgeType: 'first_step',
      badgeName: 'First Step',
      earnedAt: new Date().toISOString()
    })
  }
  
  // Week Warrior Badge (7-day streak)
  if (streakData?.currentStreak >= 7 && !earnedBadgeTypes.includes('week_warrior')) {
    badges.push({
      id: uuidv4(),
      userId,
      badgeType: 'week_warrior',
      badgeName: 'Week Warrior',
      earnedAt: new Date().toISOString()
    })
  }
  
  // Level Up Badge (reached level 5)
  if (userData?.currentLevel >= 5 && !earnedBadgeTypes.includes('level_5')) {
    badges.push({
      id: uuidv4(),
      userId,
      badgeType: 'level_5',
      badgeName: 'Level 5 Master',
      earnedAt: new Date().toISOString()
    })
  }
  
  // XP Collector Badge (1000+ XP)
  if (userData?.currentXP >= 1000 && !earnedBadgeTypes.includes('xp_1000')) {
    badges.push({
      id: uuidv4(),
      userId,
      badgeType: 'xp_1000',
      badgeName: 'XP Collector',
      earnedAt: new Date().toISOString()
    })
  }
  
  // Study Marathon Badge (4+ hours in one day)
  const { data: todayLog } = await supabase
    .from('daily_logs')
    .select('timeSpent')
    .eq('userId', userId)
    .eq('date', new Date().toISOString().split('T')[0])
  
  const totalTimeToday = todayLog?.reduce((sum, log) => sum + log.timeSpent, 0) || 0
  if (totalTimeToday >= 240 && !earnedBadgeTypes.includes('marathon')) {
    badges.push({
      id: uuidv4(),
      userId,
      badgeType: 'marathon',
      badgeName: 'Study Marathon',
      earnedAt: new Date().toISOString()
    })
  }
  
  if (badges.length > 0) {
    await supabase.from('badges').insert(badges)
  }
  
  return badges
}

export async function GET(request) {
  const { searchParams, pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')
  
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Supabase not configured. Please add credentials to .env file' 
    }, { status: 500 })
  }
  
  try {
    // Initialize user and plan if needed
    await initializeUser()
    await initializeLearningPlan()
    
    // Get dashboard data
    if (path === 'dashboard' || path === '') {
      const userId = DEMO_USER_ID
      
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Get streak data
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('userId', userId)
        .single()
      
      // Get all badges
      const { data: badges } = await supabase
        .from('badges')
        .select('*')
        .eq('userId', userId)
        .order('earnedAt', { ascending: false })
      
      // Get recent logs (last 7 days)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const { data: recentLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('userId', userId)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })
      
      // Get today's tasks from learning plan
      const { data: todayTasks } = await supabase
        .from('learning_plan')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'In Progress')
        .limit(3)
      
      const motivationalMessage = getMotivationalMessage(
        userData?.currentLevel || 1,
        streakData?.currentStreak || 0
      )
      
      return NextResponse.json({
        user: userData,
        streak: streakData,
        badges: badges || [],
        recentLogs: recentLogs || [],
        todayTasks: todayTasks || [],
        motivationalMessage
      })
    }
    
    // Get learning plan
    if (path === 'learning-plan') {
      const { data, error } = await supabase
        .from('learning_plan')
        .select('*')
        .eq('userId', DEMO_USER_ID)
        .order('week', { ascending: true })
      
      if (error) throw error
      
      // Group by week
      const groupedPlan = {}
      data?.forEach(item => {
        if (!groupedPlan[item.week]) {
          groupedPlan[item.week] = []
        }
        groupedPlan[item.week].push(item)
      })
      
      return NextResponse.json(groupedPlan)
    }
    
    // Get analytics data
    if (path === 'analytics') {
      const userId = DEMO_USER_ID
      
      // Get all logs
      const { data: allLogs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: true })
      
      // Get learning plan progress
      const { data: planData } = await supabase
        .from('learning_plan')
        .select('*')
        .eq('userId', userId)
      
      const totalTasks = planData?.length || 0
      const completedTasks = planData?.filter(t => t.status === 'Completed').length || 0
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      
      // Calculate subject breakdown
      const subjectBreakdown = {}
      planData?.forEach(task => {
        if (!subjectBreakdown[task.subjectType]) {
          subjectBreakdown[task.subjectType] = { total: 0, completed: 0 }
        }
        subjectBreakdown[task.subjectType].total++
        if (task.status === 'Completed') {
          subjectBreakdown[task.subjectType].completed++
        }
      })
      
      // Find weak subjects (less than 30% completion)
      const weakSubjects = Object.entries(subjectBreakdown)
        .filter(([_, stats]) => (stats.completed / stats.total) < 0.3)
        .map(([subject, _]) => subject)
      
      // Get user data for XP growth
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('userId', userId)
        .single()
      
      return NextResponse.json({
        logs: allLogs || [],
        completionPercentage,
        totalTasks,
        completedTasks,
        subjectBreakdown,
        weakSubjects,
        currentXP: userData?.currentXP || 0,
        currentLevel: userData?.currentLevel || 1
      })
    }
    
    // Get AI Coach analysis
    if (path === 'ai-coach') {
      const userId = DEMO_USER_ID
      
      // Get user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      // Get all logs
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false })
      
      // Get learning plan
      const { data: planData } = await supabase
        .from('learning_plan')
        .select('*')
        .eq('userId', userId)
      
      // Group plan by week
      const learningPlan = {}
      planData?.forEach(item => {
        if (!learningPlan[item.week]) {
          learningPlan[item.week] = []
        }
        learningPlan[item.week].push(item)
      })
      
      // Call Python AI service
      try {
        const { spawn } = require('child_process')
        const data = JSON.stringify({
          user_data: userData,
          logs: logs || [],
          learning_plan: learningPlan
        })
        
        const result = await new Promise((resolve, reject) => {
          const pythonProcess = spawn('python3', ['/app/ai_service/coach.py', 'analyze', data])
          let output = ''
          let errorOutput = ''
          
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
          })
          
          pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString()
          })
          
          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error(`Python process failed: ${errorOutput}`))
            } else {
              try {
                resolve(JSON.parse(output))
              } catch (e) {
                reject(new Error(`Failed to parse Python output: ${output}`))
              }
            }
          })
          
          // Timeout after 30 seconds
          setTimeout(() => {
            pythonProcess.kill()
            reject(new Error('AI Coach timeout'))
          }, 30000)
        })
        
        return NextResponse.json(result)
      } catch (error) {
        console.error('AI Coach Error:', error)
        return NextResponse.json({ 
          success: false,
          error: error.message,
          coaching: "Keep up the great work! Focus on consistency and you'll reach your goals.",
          patterns: {},
          weak_subjects: []
        })
      }
    }
    
    // Get daily suggestion from AI
    if (path === 'daily-suggestion') {
      const userId = DEMO_USER_ID
      
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const { data: logs } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('userId', userId)
        .order('date', { ascending: false })
        .limit(10)
      
      const { data: planData } = await supabase
        .from('learning_plan')
        .select('*')
        .eq('userId', userId)
      
      const learningPlan = {}
      planData?.forEach(item => {
        if (!learningPlan[item.week]) {
          learningPlan[item.week] = []
        }
        learningPlan[item.week].push(item)
      })
      
      try {
        const { spawn } = require('child_process')
        const data = JSON.stringify({
          user_data: userData,
          logs: logs || [],
          learning_plan: learningPlan
        })
        
        const result = await new Promise((resolve, reject) => {
          const pythonProcess = spawn('python3', ['/app/ai_service/coach.py', 'daily_suggestion', data])
          let output = ''
          
          pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
          })
          
          pythonProcess.on('close', (code) => {
            if (code !== 0) {
              reject(new Error('Python process failed'))
            } else {
              try {
                resolve(JSON.parse(output))
              } catch (e) {
                resolve({ success: true, suggestion: 'Focus on your weakest subject today!' })
              }
            }
          })
          
          setTimeout(() => {
            pythonProcess.kill()
            reject(new Error('Timeout'))
          }, 20000)
        })
        
        return NextResponse.json(result)
      } catch (error) {
        return NextResponse.json({ 
          success: true,
          suggestion: 'Start with your most challenging topic today. Consistency is key!'
        })
      }
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')
  
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Supabase not configured. Please add credentials to .env file' 
    }, { status: 500 })
  }
  
  try {
    const body = await request.json()
    
    // Log daily study session
    if (path === 'log-study') {
      const { timeSpent, difficulty, mood, energy, freelanceLoad, notes } = body
      const userId = DEMO_USER_ID
      const today = new Date().toISOString().split('T')[0]
      
      // Calculate XP
      const xpEarned = calculateXP(timeSpent, difficulty)
      
      // Create log entry
      const newLog = {
        id: uuidv4(),
        userId,
        date: today,
        timeSpent: parseInt(timeSpent),
        difficulty: parseInt(difficulty),
        mood: mood || '',
        energy: energy || '',
        freelanceLoad: freelanceLoad || '',
        notes: notes || '',
        xpEarned,
        createdAt: new Date().toISOString()
      }
      
      const { data: logData, error: logError } = await supabase
        .from('daily_logs')
        .insert([newLog])
        .select()
        .single()
      
      if (logError) throw logError
      
      // Update user XP and level
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      
      const newXP = (userData?.currentXP || 0) + xpEarned
      const newLevel = calculateLevel(newXP)
      
      await supabase
        .from('users')
        .update({ 
          currentXP: newXP, 
          currentLevel: newLevel 
        })
        .eq('id', userId)
      
      // Update streak
      const { data: streakData } = await supabase
        .from('streaks')
        .select('*')
        .eq('userId', userId)
        .single()
      
      let newStreak = 1
      let longestStreak = streakData?.longestStreak || 0
      
      if (streakData?.lastLogDate) {
        const lastDate = new Date(streakData.lastLogDate)
        const todayDate = new Date(today)
        const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24))
        
        if (diffDays === 1) {
          // Consecutive day
          newStreak = (streakData.currentStreak || 0) + 1
        } else if (diffDays === 0) {
          // Same day - keep current streak
          newStreak = streakData.currentStreak || 1
        } else {
          // Streak broken
          newStreak = 1
        }
      }
      
      longestStreak = Math.max(longestStreak, newStreak)
      
      await supabase
        .from('streaks')
        .update({
          currentStreak: newStreak,
          longestStreak,
          lastLogDate: today
        })
        .eq('userId', userId)
      
      // Check and award badges
      const { data: allLogs } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('userId', userId)
      
      const newBadges = await checkAndAwardBadges(
        userId,
        { currentXP: newXP, currentLevel: newLevel },
        { currentStreak: newStreak },
        allLogs?.length || 0
      )
      
      return NextResponse.json({
        success: true,
        log: logData,
        xpEarned,
        newXP,
        newLevel,
        newStreak,
        newBadges: newBadges.map(b => b.badgeName)
      })
    }
    
    // Update task status in learning plan
    if (path === 'update-task') {
      const { taskId, status } = body
      
      const { data, error } = await supabase
        .from('learning_plan')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single()
      
      if (error) throw error
      
      // If task completed, award XP
      if (status === 'Completed') {
        const userId = DEMO_USER_ID
        const xpReward = data.xpReward || 100
        
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single()
        
        const newXP = (userData?.currentXP || 0) + xpReward
        const newLevel = calculateLevel(newXP)
        
        await supabase
          .from('users')
          .update({ 
            currentXP: newXP, 
            currentLevel: newLevel 
          })
          .eq('id', userId)
        
        return NextResponse.json({ 
          success: true, 
          data,
          xpEarned: xpReward,
          newXP,
          newLevel
        })
      }
      
      return NextResponse.json({ success: true, data })
    }
    
    // Add new task to learning plan
    if (path === 'add-task') {
      const { week, topic, subjectType, xpReward } = body
      
      if (!week || !topic || !subjectType) {
        return NextResponse.json({ 
          error: 'Week, topic, and subject type are required' 
        }, { status: 400 })
      }
      
      const newTask = {
        id: uuidv4(),
        userId: DEMO_USER_ID,
        week: parseInt(week),
        topic,
        subjectType,
        status: 'Not Started',
        xpReward: parseInt(xpReward) || 100,
        createdAt: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('learning_plan')
        .insert([newTask])
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, data })
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  const { pathname } = new URL(request.url)
  const path = pathname.replace('/api/', '')
  
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Supabase not configured' 
    }, { status: 500 })
  }
  
  try {
    const body = await request.json()
    
    // Update learning plan task
    if (path === 'learning-plan') {
      const { id, topic, xpReward } = body
      
      const { data, error } = await supabase
        .from('learning_plan')
        .update({ topic, xpReward: parseInt(xpReward) })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, data })
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request) {
  const { pathname, searchParams } = new URL(request.url)
  const path = pathname.replace('/api/', '')
  
  if (!supabase) {
    return NextResponse.json({ 
      error: 'Supabase not configured' 
    }, { status: 500 })
  }
  
  try {
    // Delete learning plan task
    if (path === 'learning-plan') {
      const taskId = searchParams.get('id')
      
      if (!taskId) {
        return NextResponse.json({ error: 'Task ID required' }, { status: 400 })
      }
      
      const { error } = await supabase
        .from('learning_plan')
        .delete()
        .eq('id', taskId)
      
      if (error) throw error
      
      return NextResponse.json({ success: true })
    }
    
    return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 })
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 })
  }
}
