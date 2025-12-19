'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
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
  Briefcase,
  Edit,
  Trash2,
  Plus,
  CheckCircle2,
  BarChart3,
  LineChart,
  PieChart,
  AlertTriangle,
  Sparkles,
  Bot,
  Lightbulb,
  TrendingDown
} from 'lucide-react'

export default function App() {
  const [dashboardData, setDashboardData] = useState(null)
  const [learningPlan, setLearningPlan] = useState({})
  const [analyticsData, setAnalyticsData] = useState(null)
  const [aiCoachData, setAICoachData] = useState(null)
  const [dailySuggestion, setDailySuggestion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [coachLoading, setCoachLoading] = useState(false)
  
  // Dialog states for editing/adding tasks
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedWeek, setSelectedWeek] = useState(null)
  
  // Form states
  const [editForm, setEditForm] = useState({ topic: '', xpReward: '' })
  const [addForm, setAddForm] = useState({ 
    week: '1', 
    topic: '', 
    subjectType: 'Java', 
    xpReward: '100' 
  })
  
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
  
  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }
  
  // Fetch AI Coach analysis
  const fetchAICoach = async () => {
    setCoachLoading(true)
    try {
      const response = await fetch('/api/ai-coach')
      const data = await response.json()
      setAICoachData(data)
    } catch (error) {
      console.error('Error fetching AI coach:', error)
      toast.error('Failed to load AI coach insights')
    } finally {
      setCoachLoading(false)
    }
  }
  
  // Fetch daily suggestion
  const fetchDailySuggestion = async () => {
    try {
      const response = await fetch('/api/daily-suggestion')
      const data = await response.json()
      setDailySuggestion(data)
    } catch (error) {
      console.error('Error fetching daily suggestion:', error)
    }
  }
  
  useEffect(() => {
    fetchDashboard()
    fetchLearningPlan()
    fetchDailySuggestion()
  }, [])
  
  useEffect(() => {
    if (activeTab === 'analytics' && !analyticsData) {
      fetchAnalytics()
    }
    if (activeTab === 'coach' && !aiCoachData) {
      fetchAICoach()
    }
  }, [activeTab])
  
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
  
  // Handle edit task
  const handleEditTask = (task) => {
    setSelectedTask(task)
    setEditForm({ topic: task.topic, xpReward: task.xpReward.toString() })
    setEditDialogOpen(true)
  }
  
  const handleSaveEdit = async () => {
    if (!editForm.topic || !editForm.xpReward) {
      toast.error('Topic and XP reward are required')
      return
    }
    
    try {
      const response = await fetch('/api/learning-plan', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTask.id,
          topic: editForm.topic,
          xpReward: editForm.xpReward
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Task updated successfully!')
        setEditDialogOpen(false)
        fetchLearningPlan()
      } else {
        toast.error(data.error || 'Failed to update task')
      }
    } catch (error) {
      console.error('Error editing task:', error)
      toast.error('Failed to update task')
    }
  }
  
  // Handle add task
  const handleOpenAddDialog = (week) => {
    setSelectedWeek(week)
    setAddForm({ ...addForm, week: week.toString() })
    setAddDialogOpen(true)
  }
  
  const handleAddTask = async () => {
    if (!addForm.topic) {
      toast.error('Topic is required')
      return
    }
    
    try {
      const response = await fetch('/api/add-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Task added successfully!')
        setAddDialogOpen(false)
        setAddForm({ week: '1', topic: '', subjectType: 'Java', xpReward: '100' })
        fetchLearningPlan()
      } else {
        toast.error(data.error || 'Failed to add task')
      }
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error('Failed to add task')
    }
  }
  
  // Handle delete task
  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/learning-plan?id=${taskId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success('Task deleted successfully!')
        fetchLearningPlan()
        fetchDashboard()
      } else {
        toast.error(data.error || 'Failed to delete task')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
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
          <TabsList className="grid w-full grid-cols-5 lg:w-[900px] mx-auto">
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
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="coach" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Coach
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-6 w-6 text-violet-600" />
                      4-Week Learning Plan
                    </CardTitle>
                    <CardDescription>
                      Java + DSA + CS Fundamentals structured learning path
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {Object.keys(learningPlan).length > 0 ? (
                  <div className="space-y-6">
                    {Object.entries(learningPlan).map(([week, tasks]) => {
                      if (!Array.isArray(tasks)) return null
                      
                      const completedTasks = tasks.filter(t => t.status === 'Completed').length
                      const totalTasks = tasks.length
                      const weekProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
                      
                      return (
                        <div key={week} className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full font-semibold text-sm">
                              Week {week}
                            </div>
                            <div className="flex-1">
                              <Progress value={weekProgress} className="h-2" />
                            </div>
                            <span className="text-sm text-gray-600 font-medium">
                              {completedTasks}/{totalTasks} completed
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-2"
                              onClick={() => handleOpenAddDialog(week)}
                            >
                              <Plus className="h-4 w-4" />
                              Add Task
                            </Button>
                          </div>
                          
                          <div className="grid gap-3">
                            {tasks.map((task) => (
                              <div 
                                key={task.id} 
                                className={`flex items-center justify-between p-4 border-2 rounded-lg hover:shadow-md transition-all ${
                                  task.status === 'Completed' 
                                    ? 'bg-green-50 border-green-200' 
                                    : task.status === 'In Progress'
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'bg-white border-gray-200'
                                }`}
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {task.status === 'Completed' && (
                                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    )}
                                    <span className={`font-medium ${
                                      task.status === 'Completed' ? 'text-green-900' : 'text-gray-900'
                                    }`}>
                                      {task.topic}
                                    </span>
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs ${
                                        task.subjectType === 'Java' 
                                          ? 'bg-orange-100 text-orange-700 border-orange-200'
                                          : task.subjectType === 'DSA'
                                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                                          : 'bg-purple-100 text-purple-700 border-purple-200'
                                      }`}
                                    >
                                      {task.subjectType}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Zap className="h-3 w-3" />
                                    {task.xpReward} XP reward
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <Select 
                                    value={task.status} 
                                    onValueChange={(value) => handleUpdateTask(task.id, value)}
                                  >
                                    <SelectTrigger className="w-[150px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Not Started">Not Started</SelectItem>
                                      <SelectItem value="In Progress">In Progress</SelectItem>
                                      <SelectItem value="Completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditTask(task)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Task</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{task.topic}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Loading learning plan...</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Edit Task Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Task</DialogTitle>
                  <DialogDescription>
                    Update the task details below
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-topic">Task Topic *</Label>
                    <Input
                      id="edit-topic"
                      value={editForm.topic}
                      onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                      placeholder="e.g., Binary Search Trees"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-xp">XP Reward *</Label>
                    <Input
                      id="edit-xp"
                      type="number"
                      min="10"
                      value={editForm.xpReward}
                      onChange={(e) => setEditForm({ ...editForm, xpReward: e.target.value })}
                      placeholder="e.g., 150"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {/* Add Task Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Task</DialogTitle>
                  <DialogDescription>
                    Add a new learning task to your plan
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-week">Week *</Label>
                    <Select value={addForm.week} onValueChange={(value) => setAddForm({ ...addForm, week: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Week 1</SelectItem>
                        <SelectItem value="2">Week 2</SelectItem>
                        <SelectItem value="3">Week 3</SelectItem>
                        <SelectItem value="4">Week 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-topic">Task Topic *</Label>
                    <Input
                      id="add-topic"
                      value={addForm.topic}
                      onChange={(e) => setAddForm({ ...addForm, topic: e.target.value })}
                      placeholder="e.g., Advanced Recursion Patterns"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-subject">Subject Type *</Label>
                    <Select value={addForm.subjectType} onValueChange={(value) => setAddForm({ ...addForm, subjectType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Java">Java</SelectItem>
                        <SelectItem value="DSA">DSA</SelectItem>
                        <SelectItem value="CS">CS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-xp">XP Reward *</Label>
                    <Input
                      id="add-xp"
                      type="number"
                      min="10"
                      value={addForm.xpReward}
                      onChange={(e) => setAddForm({ ...addForm, xpReward: e.target.value })}
                      placeholder="e.g., 150"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Analytics Tab - Phase 3 */}
          <TabsContent value="analytics" className="space-y-6">
            {analyticsData ? (
              <>
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="h-5 w-5" />
                        Completion Rate
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-2">{analyticsData.completionPercentage}%</div>
                      <p className="text-sm opacity-90">{analyticsData.completedTasks} of {analyticsData.totalTasks} tasks</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5" />
                        Total Study Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-2">
                        {Math.floor((analyticsData.logs?.reduce((sum, log) => sum + log.timeSpent, 0) || 0) / 60)}h
                      </div>
                      <p className="text-sm opacity-90">{analyticsData.logs?.length || 0} sessions logged</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <TrendingUp className="h-5 w-5" />
                        Current Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold mb-2">{analyticsData.currentLevel}</div>
                      <p className="text-sm opacity-90">{analyticsData.currentXP} Total XP</p>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Subject Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5 text-violet-600" />
                      Subject-wise Progress
                    </CardTitle>
                    <CardDescription>Track your progress across different subjects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(analyticsData.subjectBreakdown || {}).map(([subject, stats]) => {
                        const percentage = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
                        return (
                          <div key={subject} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant="outline"
                                  className={`${
                                    subject === 'Java' 
                                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                                      : subject === 'DSA'
                                      ? 'bg-blue-100 text-blue-700 border-blue-200'
                                      : 'bg-purple-100 text-purple-700 border-purple-200'
                                  }`}
                                >
                                  {subject}
                                </Badge>
                                <span className="text-sm text-gray-600">
                                  {stats.completed} / {stats.total} completed
                                </span>
                              </div>
                              <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Weak Subjects Warning */}
                {analyticsData.weakSubjects && analyticsData.weakSubjects.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="h-5 w-5" />
                        Areas Needing Attention
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        These subjects have low completion rates
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analyticsData.weakSubjects.map((subject) => (
                          <Badge 
                            key={subject} 
                            variant="secondary"
                            className="bg-amber-200 text-amber-900 border-amber-300"
                          >
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Recent Activity Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-violet-600" />
                      Study Activity Timeline
                    </CardTitle>
                    <CardDescription>Your study sessions over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.logs && analyticsData.logs.length > 0 ? (
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {analyticsData.logs.slice(0, 15).map((log) => (
                            <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No study data available yet. Start logging sessions!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">Loading analytics...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* AI Coach Tab - Phase 4 */}
          <TabsContent value="coach" className="space-y-6">
            {/* Daily Suggestion Banner */}
            {dailySuggestion && dailySuggestion.success && (
              <Card className="border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full">
                      <Lightbulb className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 text-gray-900">Today's Focus</h3>
                      <p className="text-gray-700">{dailySuggestion.suggestion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {coachLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-violet-600 mx-auto mb-4"></div>
                  <p className="text-lg text-gray-600">AI Coach is analyzing your journey...</p>
                </div>
              </div>
            ) : aiCoachData ? (
              <>
                {/* AI Coaching Insights */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-6 w-6 text-purple-600" />
                      Personalized Coaching Insights
                    </CardTitle>
                    <CardDescription>
                      AI-powered analysis of your learning journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {aiCoachData.success ? (
                      <div className="prose prose-sm max-w-none">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                          <div className="flex items-start gap-3 mb-4">
                            <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                              {aiCoachData.coaching}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-600">
                        <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>AI Coach analysis unavailable. Keep studying and check back later!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Behavioral Patterns */}
                {aiCoachData.patterns && Object.keys(aiCoachData.patterns).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-violet-600" />
                        Your Study Patterns
                      </CardTitle>
                      <CardDescription>Insights from your study behavior</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Total Sessions</span>
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="text-2xl font-bold text-blue-700">
                            {aiCoachData.patterns.total_sessions || 0}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Avg Time/Session</span>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          </div>
                          <div className="text-2xl font-bold text-green-700">
                            {aiCoachData.patterns.avg_time_per_session || 0} min
                          </div>
                        </div>
                        
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Avg Difficulty</span>
                            <Brain className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="text-2xl font-bold text-purple-700">
                            {aiCoachData.patterns.avg_difficulty || 0}/5
                          </div>
                        </div>
                        
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Consistency</span>
                            <Star className="h-4 w-4 text-amber-600" />
                          </div>
                          <div className="text-2xl font-bold text-amber-700">
                            {aiCoachData.patterns.consistency_score || 0}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Warnings */}
                      {(aiCoachData.patterns.burnout_risk || aiCoachData.patterns.skip_detection) && (
                        <div className="mt-4 space-y-2">
                          {aiCoachData.patterns.burnout_risk && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                              <span className="text-sm text-red-800">
                                <strong>Burnout Risk Detected:</strong> You've had several high-intensity study sessions. Consider taking breaks!
                              </span>
                            </div>
                          )}
                          {aiCoachData.patterns.skip_detection && (
                            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                              <TrendingDown className="h-5 w-5 text-orange-600 flex-shrink-0" />
                              <span className="text-sm text-orange-800">
                                <strong>Irregular Schedule:</strong> There are gaps in your study schedule. Try to maintain consistency!
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Weak Subjects */}
                {aiCoachData.weak_subjects && aiCoachData.weak_subjects.length > 0 && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-amber-900">
                        <AlertTriangle className="h-5 w-5" />
                        Subjects to Focus On
                      </CardTitle>
                      <CardDescription className="text-amber-700">
                        AI recommends spending more time on these areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {aiCoachData.weak_subjects.map((ws, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-white border border-amber-200 rounded-lg">
                            <span className="font-medium text-amber-900">{ws.subject}</span>
                            <Badge variant="secondary" className="bg-amber-200 text-amber-900">
                              {ws.completion_rate}% complete
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Refresh Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => fetchAICoach()}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Refresh AI Analysis
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Bot className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">AI Coach is ready to help you!</p>
                <Button
                  onClick={() => fetchAICoach()}
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Get AI Coaching
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
