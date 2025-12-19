"""
AI Smart Coach Service for Learning Journey App
Uses GPT-5.1 via Emergent LLM Key for personalized recommendations
"""

import os
import sys
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/.env')

# Add parent directory to path to import emergentintegrations
sys.path.insert(0, '/usr/local/lib/python3.11/site-packages')

from emergentintegrations.llm.chat import LlmChat, UserMessage


class AICoach:
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment variables")
        
    async def analyze_behavior(self, user_data, logs, learning_plan):
        """
        Analyze user behavior and provide insights
        """
        # Calculate patterns
        patterns = self._detect_patterns(logs)
        weak_subjects = self._find_weak_subjects(learning_plan)
        
        # Create system message for AI coach
        system_message = """You are an empathetic and insightful learning coach for a software engineering student. 
Your role is to:
1. Analyze study patterns and provide constructive feedback
2. Detect potential issues like burnout, irregular study habits, or overload
3. Suggest actionable improvements in a friendly, motivational tone
4. Provide personalized recommendations based on their learning journey

Keep responses concise (2-3 paragraphs), encouraging, and actionable."""
        
        # Create context for the AI
        context = self._create_context(user_data, logs, patterns, weak_subjects, learning_plan)
        
        # Initialize chat
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"coach_{user_data.get('id', 'demo')}_{datetime.now().strftime('%Y%m%d')}",
            system_message=system_message
        ).with_model("openai", "gpt-5.1")
        
        # Send analysis request
        user_message = UserMessage(
            text=f"""Analyze this student's learning journey and provide personalized coaching:

{context}

Please provide:
1. Overall assessment of their progress
2. Any concerning patterns (burnout risk, irregular habits, etc.)
3. 2-3 specific actionable recommendations
4. Encouraging message to keep them motivated

Keep it friendly, concise, and actionable."""
        )
        
        try:
            response = await chat.send_message(user_message)
            return {
                'success': True,
                'coaching': response,
                'patterns': patterns,
                'weak_subjects': weak_subjects
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'patterns': patterns,
                'weak_subjects': weak_subjects
            }
    
    async def get_daily_suggestion(self, user_data, logs, learning_plan, today_context=None):
        """
        Get daily study suggestion based on current context
        """
        system_message = """You are a supportive daily study coach. Provide brief, actionable daily study suggestions 
based on the student's current progress and context. Keep responses to 2-3 sentences maximum."""
        
        context = self._create_context(user_data, logs, {}, [], learning_plan)
        
        if today_context:
            context += f"\n\nToday's context: {today_context}"
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=f"daily_{user_data.get('id', 'demo')}_{datetime.now().strftime('%Y%m%d')}",
            system_message=system_message
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(
            text=f"""Based on this learning journey, what should the student focus on today?

{context}

Provide a brief, specific suggestion (2-3 sentences)."""
        )
        
        try:
            response = await chat.send_message(user_message)
            return {
                'success': True,
                'suggestion': response
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'suggestion': "Focus on your weakest subject today and try to study for at least 60 minutes."
            }
    
    def _detect_patterns(self, logs):
        """Detect study patterns from logs"""
        if not logs or len(logs) == 0:
            return {
                'total_sessions': 0,
                'avg_time_per_session': 0,
                'avg_difficulty': 0,
                'consistency_score': 0,
                'skip_detection': False,
                'burnout_risk': False
            }
        
        total_sessions = len(logs)
        avg_time = sum(log.get('timeSpent', 0) for log in logs) / total_sessions if total_sessions > 0 else 0
        avg_difficulty = sum(log.get('difficulty', 0) for log in logs) / total_sessions if total_sessions > 0 else 0
        
        # Check for skips (gaps in dates)
        if len(logs) > 1:
            dates = sorted([datetime.fromisoformat(log.get('date', '').split('T')[0]) for log in logs if log.get('date')])
            gaps = []
            for i in range(1, len(dates)):
                gap = (dates[i] - dates[i-1]).days
                if gap > 1:
                    gaps.append(gap)
            skip_detection = len(gaps) > 0 and max(gaps) > 3
        else:
            skip_detection = False
        
        # Burnout risk: high difficulty + long hours consistently
        recent_logs = logs[-7:] if len(logs) >= 7 else logs
        high_intensity_days = sum(1 for log in recent_logs if log.get('difficulty', 0) >= 4 and log.get('timeSpent', 0) >= 180)
        burnout_risk = high_intensity_days >= 3
        
        # Consistency score
        if len(logs) >= 7:
            consistency_score = min(100, (len(logs) / 30) * 100)
        else:
            consistency_score = (len(logs) / 7) * 100
        
        return {
            'total_sessions': total_sessions,
            'avg_time_per_session': round(avg_time, 1),
            'avg_difficulty': round(avg_difficulty, 1),
            'consistency_score': round(consistency_score, 1),
            'skip_detection': skip_detection,
            'burnout_risk': burnout_risk,
            'total_study_time': sum(log.get('timeSpent', 0) for log in logs)
        }
    
    def _find_weak_subjects(self, learning_plan):
        """Find subjects with low completion rates"""
        if not learning_plan:
            return []
        
        subjects = {}
        for week_tasks in learning_plan.values():
            if not isinstance(week_tasks, list):
                continue
            for task in week_tasks:
                subject = task.get('subjectType', 'Unknown')
                if subject not in subjects:
                    subjects[subject] = {'total': 0, 'completed': 0}
                subjects[subject]['total'] += 1
                if task.get('status') == 'Completed':
                    subjects[subject]['completed'] += 1
        
        weak_subjects = []
        for subject, stats in subjects.items():
            if stats['total'] > 0:
                completion_rate = stats['completed'] / stats['total']
                if completion_rate < 0.3:  # Less than 30% completion
                    weak_subjects.append({
                        'subject': subject,
                        'completion_rate': round(completion_rate * 100, 1)
                    })
        
        return weak_subjects
    
    def _create_context(self, user_data, logs, patterns, weak_subjects, learning_plan):
        """Create context string for AI"""
        total_tasks = 0
        completed_tasks = 0
        
        for week_tasks in learning_plan.values():
            if isinstance(week_tasks, list):
                total_tasks += len(week_tasks)
                completed_tasks += sum(1 for t in week_tasks if t.get('status') == 'Completed')
        
        context = f"""Student Profile:
- Current Level: {user_data.get('currentLevel', 1)}
- Total XP: {user_data.get('currentXP', 0)}
- Learning Plan Progress: {completed_tasks}/{total_tasks} tasks completed

Recent Activity (last {len(logs)} sessions):
"""
        
        if patterns:
            context += f"""- Average study time: {patterns.get('avg_time_per_session', 0)} minutes per session
- Average difficulty: {patterns.get('avg_difficulty', 0)}/5
- Consistency score: {patterns.get('consistency_score', 0)}%
- Total study time: {patterns.get('total_study_time', 0)} minutes
"""
            if patterns.get('skip_detection'):
                context += "- ⚠️ Pattern detected: Irregular study schedule with gaps\n"
            if patterns.get('burnout_risk'):
                context += "- ⚠️ Warning: Potential burnout risk (high intensity sessions)\n"
        
        if weak_subjects:
            context += "\nAreas needing attention:\n"
            for ws in weak_subjects:
                context += f"- {ws['subject']}: {ws['completion_rate']}% completed\n"
        
        return context


# CLI interface for testing
async def main():
    import json
    
    if len(sys.argv) < 2:
        print("Usage: python coach.py <command> <data_json>")
        print("Commands: analyze, daily_suggestion")
        sys.exit(1)
    
    command = sys.argv[1]
    data = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    
    coach = AICoach()
    
    if command == 'analyze':
        result = await coach.analyze_behavior(
            data.get('user_data', {}),
            data.get('logs', []),
            data.get('learning_plan', {})
        )
        print(json.dumps(result))
    elif command == 'daily_suggestion':
        result = await coach.get_daily_suggestion(
            data.get('user_data', {}),
            data.get('logs', []),
            data.get('learning_plan', {}),
            data.get('today_context')
        )
        print(json.dumps(result))
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == '__main__':
    asyncio.run(main())
