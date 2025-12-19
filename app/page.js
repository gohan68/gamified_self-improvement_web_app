'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { 
  Trophy, 
  Target, 
  Flame, 
  Star, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Zap,
  Award,
  Clock,
  Brain,
  Coffee,
  Briefcase
} from 'lucide-react'

export default function App() {
  const [dashboardData, setDashboardData] = useState(null)
  const [learningPlan, setLearningPlan] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Daily log form state
  const [logForm, setLogForm] = useState({
    timeSpent: '',
    difficulty: '3',
    mood: '',
    energy: '',
    freelanceLoad: '',
    notes: ''
  })
  
  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      const response = await fetch('/api/dashboard')
      const data = await response.json()
      
      if (data.error) {
        toast.error(data.error)
        return
      }
      
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }
  
  // Fetch learning plan
  const fetchLearningPlan = async () => {
    try {
      const response = await fetch('/api/learning-plan')
      const data = await response.json()
      setLearningPlan(data)
    } catch (error) {
      console.error('Error fetching learning plan:', error)
    }
  }
  
  useEffect(() => {
    fetchDashboard()
    fetchLearningPlan()
  }, [])
  
  // Handle log study session
  const handleLogStudy = async (e) => {
    e.preventDefault()
    
    if (!logForm.timeSpent || parseInt(logForm.timeSpent) <= 0) {
      toast.error('Please enter valid study time')
      return
    }
    
    try {
      const response = await fetch('/api/log-study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success(`🎉 +${data.xpEarned} XP earned! Now at Level ${data.newLevel}`, {
          description: data.newBadges?.length > 0 
            ? `🏆 New badges: ${data.newBadges.join(', ')}` 
            : undefined
        })
        
        // Reset form
        setLogForm({
          timeSpent: '',
          difficulty: '3',
          mood: '',
          energy: '',
          freelanceLoad: '',
          notes: ''
        })
        
        // Refresh dashboard
        fetchDashboard()
      } else {
        toast.error(data.error || 'Failed to log study session')
      }
    } catch (error) {
      console.error('Error logging study:', error)
      toast.error('Failed to log study session')
    }
  }
  
  // Handle task status update
  const handleUpdateTask = async (taskId, newStatus) => {
    try {
      const response = await fetch('/api/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status: newStatus })
      })
      
      const data = await response.json()
      
      if (data.success) {
        if (newStatus === 'Completed') {
          toast.success(`✅ Task completed! +${data.xpEarned} XP`, {
            description: `Level ${data.newLevel} | ${data.newXP} total XP`
          })
        }
        
        fetchLearningPlan()
        fetchDashboard()
      } else {
        toast.error(data.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your journey...</p>
        </div>
      </div>
    )
  }
  
  const user = dashboardData?.user || {}
  const streak = dashboardData?.streak || {}
  const badges = dashboardData?.badges || []
  const motivationalMessage = dashboardData?.motivationalMessage || ''
  
  // Calculate progress to next level
  const currentXP = user.currentXP || 0
  const currentLevel = user.currentLevel || 1
  const nextLevelXP = Math.pow(currentLevel, 2) * 100
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100
  const progressToNextLevel = ((currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Software Engineering Journey
          </h1>
          <p className="text-gray-600 text-lg">Level up your skills, one study session at a time</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Log Study
            </TabsTrigger>
            <TabsTrigger value="plan" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Learning Plan
            </TabsTrigger>
          </TabsList>
          
          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Level Card */}
              <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5" />
                    Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold mb-2">{currentLevel}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm opacity-90">
                      <span>{currentXP} XP</span>
                      <span>{nextLevelXP} XP</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-2 bg-white/20" />
                  </div>
                </CardContent>
              </Card>
              
              {/* XP Card */}
              <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5" />
                    Total XP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{currentXP}</div>
                  <p className="text-sm opacity-90 mt-2">Experience Points</p>
                </CardContent>
              </Card>
              
              {/* Streak Card */}
              <Card className="bg-gradient-to-br from-rose-500 to-pink-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Flame className="h-5 w-5" />
                    Current Streak
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{streak.currentStreak || 0}</div>
                  <p className="text-sm opacity-90 mt-2">Days in a row</p>
                </CardContent>
              </Card>
              
              {/* Badges Card */}
              <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5" />
                    Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{badges.length}</div>
                  <p className="text-sm opacity-90 mt-2">Achievements earned</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Motivational Message */}
            <Card className="border-2 border-violet-200 bg-white/80 backdrop-blur">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-lg font-medium text-gray-800">{motivationalMessage}</p>
                </div>
              </CardContent>
            </Card>
            
            {/* Badges Section */}
            {badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-violet-600" />
                    Your Achievements
                  </CardTitle>
                  <CardDescription>Badges you've earned on your journey</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((badge) => (
                      <Badge 
                        key={badge.id} 
                        variant="secondary" 
                        className="px-4 py-2 text-sm bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200"
                      >
                        🏆 {badge.badgeName}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-violet-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your last 7 days of study sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentLogs?.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {dashboardData.recentLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <span className="font-medium">{new Date(log.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {log.timeSpent} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Brain className="h-3 w-3" />
                                Difficulty: {log.difficulty}/5
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-sm text-gray-500 mt-1">{log.notes}</p>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-violet-50 text-violet-700 border-violet-200">
                            +{log.xpEarned} XP
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No study sessions yet. Start logging your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Log Study Tab */}
          <TabsContent value="log" className="space-y-6">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-6 w-6 text-violet-600" />
                  Log Your Study Session
                </CardTitle>
                <CardDescription>
                  Track your progress and earn XP for every study session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogStudy} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="timeSpent" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Time Spent (minutes) *
                    </Label>
                    <Input
                      id="timeSpent"
                      type="number"
                      min="1"
                      placeholder="e.g., 60"
                      value={logForm.timeSpent}
                      onChange={(e) => setLogForm({ ...logForm, timeSpent: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Difficulty Level (1-5) *
                    </Label>
                    <Select value={logForm.difficulty} onValueChange={(value) => setLogForm({ ...logForm, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Easy</SelectItem>
                        <SelectItem value="2">2 - Easy</SelectItem>
                        <SelectItem value="3">3 - Moderate</SelectItem>
                        <SelectItem value="4">4 - Hard</SelectItem>
                        <SelectItem value="5">5 - Very Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mood">Mood</Label>
                    <Input
                      id="mood"
                      placeholder="e.g., Focused, Tired, Energetic"
                      value={logForm.mood}
                      onChange={(e) => setLogForm({ ...logForm, mood: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="energy" className="flex items-center gap-2">
                      <Coffee className="h-4 w-4" />
                      Energy Level
                    </Label>
                    <Input
                      id="energy"
                      placeholder="e.g., High, Medium, Low"
                      value={logForm.energy}
                      onChange={(e) => setLogForm({ ...logForm, energy: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="freelanceLoad" className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Freelance Workload
                    </Label>
                    <Input
                      id="freelanceLoad"
                      placeholder="e.g., Light, Heavy, None"
                      value={logForm.freelanceLoad}
                      onChange={(e) => setLogForm({ ...logForm, freelanceLoad: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="What did you learn today? Any challenges?"
                      value={logForm.notes}
                      onChange={(e) => setLogForm({ ...logForm, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                    size="lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Log Session & Earn XP
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Learning Plan Tab */}
          <TabsContent value="plan" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-violet-600" />
                  4-Week Learning Plan
                </CardTitle>
                <CardDescription>
                  Java + DSA + CS Fundamentals structured learning path
                </CardDescription>
              </CardHeader>
              <CardContent>
                {Object.keys(learningPlan).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(learningPlan).map(([week, tasks]) => (
                      <div key={week} className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold text-sm">
                            Week {week}
                          </div>
                          <Separator className="flex-1" />
                        </div>
                        
                        <div className="grid gap-3">
                          {tasks.map((task) => (
                            <div 
                              key={task.id} 
                              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-gray-900">{task.topic}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {task.subjectType}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Zap className="h-3 w-3" />
                                  {task.xpReward} XP reward
                                </div>
                              </div>
                              
                              <Select 
                                value={task.status} 
                                onValueChange={(value) => handleUpdateTask(task.id, value)}
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Not Started">Not Started</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading learning plan...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
