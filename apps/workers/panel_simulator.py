# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List, Optional
import logging
import json
from datetime import datetime
import asyncio
from crewai import Agent, Task, Crew, Process
from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def simulate_panel(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate investment panel discussion with role-based agents
    """
    try:
        logger.info(f"Starting panel simulation for pitch_id: {pitch_id}")

        # Panel configuration
        panel_config = inputs.get('panel_config', {
            'debate_turns': 3,
            'max_tokens_per_turn': 500,
            'roles': ['angel', 'vc', 'risk', 'founder']
        })

        # Pitch data
        pitch_data = inputs.get('pitch_data', {})
        valuation_data = inputs.get('valuation_data', {})
        risk_data = inputs.get('risk_data', {})
        unit_economics = inputs.get('unit_economics', {})

        # Create role-based agents
        agents = create_panel_agents(pitch_data, valuation_data, risk_data, unit_economics)
        
        # Generate debate transcript
        transcript = simulate_debate(agents, panel_config, pitch_data)
        
        # Extract conditions and decisions
        conditions = extract_conditions(transcript)
        decision_summary = generate_decision_summary(transcript, conditions)

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "panel_config": panel_config,
            "transcript": transcript,
            "conditions": conditions,
            "decision_summary": decision_summary,
            "participants": [agent.name for agent in agents],
            "debate_turns": len(transcript),
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Panel simulation completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Panel simulation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def create_panel_agents(pitch_data: Dict[str, Any], valuation_data: Dict[str, Any], 
                       risk_data: Dict[str, Any], unit_economics: Dict[str, Any]) -> List[Agent]:
    """Create role-based agents for the investment panel"""
    
    # Initialize LLM
    llm = ChatOpenAI(
        model="gpt-4",
        temperature=0.7,
        max_tokens=500
    )

    # Angel Investor Agent
    angel_agent = Agent(
        role='Angel Investor',
        goal='Evaluate early-stage potential and founder vision',
        backstory="""You are an experienced angel investor with a track record of 
        backing successful startups. You focus on founder passion, market timing, 
        and early traction. You're willing to take calculated risks on promising teams.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[],
        context={
            'pitch_data': pitch_data,
            'valuation_data': valuation_data,
            'risk_data': risk_data,
            'unit_economics': unit_economics
        }
    )

    # VC Agent
    vc_agent = Agent(
        role='Venture Capitalist',
        goal='Assess scalability, market opportunity, and return potential',
        backstory="""You are a seasoned VC partner at a top-tier fund. You evaluate 
        deals based on market size, competitive moats, unit economics, and team 
        execution capability. You're data-driven and focus on scalable business models.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[],
        context={
            'pitch_data': pitch_data,
            'valuation_data': valuation_data,
            'risk_data': risk_data,
            'unit_economics': unit_economics
        }
    )

    # Risk Analyst Agent
    risk_agent = Agent(
        role='Risk Analyst',
        goal='Identify and assess key risks and mitigation strategies',
        backstory="""You are a risk management expert specializing in startup 
        investments. You systematically evaluate technical, market, team, and 
        execution risks. You focus on risk mitigation and contingency planning.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[],
        context={
            'pitch_data': pitch_data,
            'valuation_data': valuation_data,
            'risk_data': risk_data,
            'unit_economics': unit_economics
        }
    )

    # Founder Agent
    founder_agent = Agent(
        role='Founder Advocate',
        goal='Defend the pitch and address concerns constructively',
        backstory="""You represent the founder's perspective and defend the 
        business model, team, and vision. You address concerns raised by other 
        panelists and provide additional context when needed.""",
        verbose=True,
        allow_delegation=False,
        llm=llm,
        tools=[],
        context={
            'pitch_data': pitch_data,
            'valuation_data': valuation_data,
            'risk_data': risk_data,
            'unit_economics': unit_economics
        }
    )

    return [angel_agent, vc_agent, risk_agent, founder_agent]

def simulate_debate(agents: List[Agent], panel_config: Dict[str, Any], 
                   pitch_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Simulate debate between panel agents"""
    
    transcript = []
    debate_turns = panel_config.get('debate_turns', 3)
    
    # Initial pitch presentation
    initial_analysis = {
        'turn': 0,
        'speaker': 'Moderator',
        'content': f"Panel discussion for {pitch_data.get('title', 'Startup Pitch')}",
        'timestamp': datetime.now().isoformat()
    }
    transcript.append(initial_analysis)
    
    # Debate rounds
    for turn in range(1, debate_turns + 1):
        for agent in agents:
            # Generate agent's response
            response = generate_agent_response(agent, transcript, turn, pitch_data)
            
            turn_entry = {
                'turn': turn,
                'speaker': agent.role,
                'content': response,
                'timestamp': datetime.now().isoformat(),
                'agent_type': get_agent_type(agent.role)
            }
            transcript.append(turn_entry)
    
    return transcript

def generate_agent_response(agent: Agent, transcript: List[Dict[str, Any]], 
                           turn: int, pitch_data: Dict[str, Any]) -> str:
    """Generate response for a specific agent based on context"""
    
    # Build context from previous turns
    context = build_debate_context(transcript, turn)
    
    # Generate role-specific prompt
    prompt = create_role_prompt(agent.role, context, pitch_data, turn)
    
    try:
        # Use agent's LLM to generate response
        response = agent.llm.invoke(prompt)
        return response.content
    except Exception as e:
        logger.warning(f"Failed to generate response for {agent.role}: {str(e)}")
        return f"[{agent.role}]: Unable to generate response at this time."

def build_debate_context(transcript: List[Dict[str, Any]], current_turn: int) -> str:
    """Build context from previous debate turns"""
    
    if current_turn <= 1:
        return "Initial discussion starting."
    
    # Get recent turns for context
    recent_turns = [t for t in transcript if t['turn'] < current_turn][-6:]  # Last 6 turns
    
    context = "Recent discussion:\n"
    for turn in recent_turns:
        context += f"{turn['speaker']}: {turn['content'][:200]}...\n"
    
    return context

def create_role_prompt(role: str, context: str, pitch_data: Dict[str, Any], turn: int) -> str:
    """Create role-specific prompt for agent response"""
    
    base_prompt = f"""
    You are participating in an investment panel discussion for a startup pitch.
    
    Pitch Summary:
    - Title: {pitch_data.get('title', 'N/A')}
    - Stage: {pitch_data.get('stage', 'N/A')}
    - Sector: {pitch_data.get('sector', 'N/A')}
    - Ask Amount: ${pitch_data.get('ask_usd', 0):,.0f}
    - Summary: {pitch_data.get('summary', 'N/A')}
    
    Recent Discussion Context:
    {context}
    
    Current Turn: {turn}
    
    As a {role}, provide your perspective on the pitch. Consider:
    """
    
    if role == 'Angel Investor':
        base_prompt += """
        - Founder passion and vision
        - Market timing and opportunity
        - Early traction and validation
        - Team potential and execution
        - Risk tolerance for early-stage investment
        """
    elif role == 'Venture Capitalist':
        base_prompt += """
        - Market size and scalability
        - Competitive landscape and moats
        - Unit economics and growth potential
        - Team execution capability
        - Return potential and exit strategy
        """
    elif role == 'Risk Analyst':
        base_prompt += """
        - Key risks across all categories
        - Risk mitigation strategies
        - Risk-reward balance
        - Contingency planning
        - Risk monitoring recommendations
        """
    elif role == 'Founder Advocate':
        base_prompt += """
        - Defend the business model and vision
        - Address concerns raised by other panelists
        - Provide additional context and clarification
        - Highlight competitive advantages
        - Discuss execution strategy and milestones
        """
    
    base_prompt += f"""
    
    Provide a concise, focused response (max 300 words) that contributes to the discussion.
    Be specific and reference the pitch details when relevant.
    """
    
    return base_prompt

def get_agent_type(role: str) -> str:
    """Get agent type for categorization"""
    if role == 'Angel Investor':
        return 'investor'
    elif role == 'Venture Capitalist':
        return 'investor'
    elif role == 'Risk Analyst':
        return 'analyst'
    elif role == 'Founder Advocate':
        return 'founder'
    else:
        return 'other'

def extract_conditions(transcript: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Extract investment conditions from transcript"""
    
    conditions = []
    
    # Look for condition-related keywords in transcript
    condition_keywords = [
        'condition', 'contingent', 'subject to', 'provided that', 'if', 'when',
        'upon', 'assuming', 'dependent on', 'based on', 'requirement'
    ]
    
    for turn in transcript:
        content = turn['content'].lower()
        for keyword in condition_keywords:
            if keyword in content:
                # Extract potential condition
                condition = {
                    'source': turn['speaker'],
                    'turn': turn['turn'],
                    'content': turn['content'],
                    'type': 'investment_condition',
                    'extracted_at': datetime.now().isoformat()
                }
                conditions.append(condition)
                break
    
    return conditions

def generate_decision_summary(transcript: List[Dict[str, Any]], 
                            conditions: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate decision summary from transcript"""
    
    # Analyze sentiment and positions
    investor_sentiment = analyze_investor_sentiment(transcript)
    key_concerns = extract_key_concerns(transcript)
    recommendations = generate_recommendations(transcript, conditions)
    
    summary = {
        'overall_sentiment': investor_sentiment['overall'],
        'investor_positions': investor_sentiment['positions'],
        'key_concerns': key_concerns,
        'recommendations': recommendations,
        'conditions_count': len(conditions),
        'debate_quality': assess_debate_quality(transcript)
    }
    
    return summary

def analyze_investor_sentiment(transcript: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze sentiment of investor agents"""
    
    investor_turns = [t for t in transcript if t['agent_type'] == 'investor']
    
    positive_keywords = ['positive', 'promising', 'strong', 'good', 'excellent', 'support']
    negative_keywords = ['concern', 'risk', 'weak', 'poor', 'issue', 'problem']
    
    positions = {}
    overall_sentiment = 'neutral'
    
    for turn in investor_turns:
        content = turn['content'].lower()
        positive_count = sum(1 for word in positive_keywords if word in content)
        negative_count = sum(1 for word in negative_keywords if word in content)
        
        if positive_count > negative_count:
            positions[turn['speaker']] = 'positive'
        elif negative_count > positive_count:
            positions[turn['speaker']] = 'negative'
        else:
            positions[turn['speaker']] = 'neutral'
    
    # Calculate overall sentiment
    positive_count = sum(1 for pos in positions.values() if pos == 'positive')
    negative_count = sum(1 for pos in positions.values() if pos == 'negative')
    
    if positive_count > negative_count:
        overall_sentiment = 'positive'
    elif negative_count > positive_count:
        overall_sentiment = 'negative'
    
    return {
        'overall': overall_sentiment,
        'positions': positions
    }

def extract_key_concerns(transcript: List[Dict[str, Any]]) -> List[str]:
    """Extract key concerns from transcript"""
    
    concerns = []
    concern_keywords = ['concern', 'risk', 'issue', 'problem', 'challenge', 'weakness']
    
    for turn in transcript:
        content = turn['content'].lower()
        for keyword in concern_keywords:
            if keyword in content:
                # Extract the sentence containing the concern
                sentences = turn['content'].split('.')
                for sentence in sentences:
                    if keyword in sentence.lower():
                        concerns.append(sentence.strip())
                        break
                break
    
    return list(set(concerns))[:5]  # Return top 5 unique concerns

def generate_recommendations(transcript: List[Dict[str, Any]], 
                           conditions: List[Dict[str, Any]]) -> List[str]:
    """Generate recommendations based on transcript and conditions"""
    
    recommendations = []
    
    # Add recommendations based on conditions
    if conditions:
        recommendations.append(f"Address {len(conditions)} identified investment conditions")
    
    # Add general recommendations
    recommendations.extend([
        "Conduct additional due diligence on key risk areas",
        "Schedule follow-up meeting with founders",
        "Prepare term sheet with identified conditions",
        "Engage legal counsel for deal structuring"
    ])
    
    return recommendations

def assess_debate_quality(transcript: List[Dict[str, Any]]) -> str:
    """Assess the quality of the panel debate"""
    
    if len(transcript) < 5:
        return 'limited'
    elif len(transcript) < 10:
        return 'moderate'
    else:
        return 'comprehensive'
