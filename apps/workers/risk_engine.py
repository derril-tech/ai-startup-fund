# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List, Optional
import logging
import csv
import io
from datetime import datetime

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def assess_risks(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Comprehensive risk assessment across multiple categories
    """
    try:
        logger.info(f"Starting risk assessment for pitch_id: {pitch_id}")

        # Risk categories with their sub-risks and scoring criteria
        risk_categories = {
            'market': {
                'market_size_risk': {'weight': 0.3, 'description': 'Market too small or declining'},
                'competition_risk': {'weight': 0.3, 'description': 'Intense competition or market saturation'},
                'timing_risk': {'weight': 0.2, 'description': 'Market timing issues'},
                'regulatory_risk': {'weight': 0.2, 'description': 'Regulatory changes or compliance issues'}
            },
            'team': {
                'founder_experience_risk': {'weight': 0.4, 'description': 'Lack of relevant founder experience'},
                'team_gaps_risk': {'weight': 0.3, 'description': 'Missing key team members or skills'},
                'execution_risk': {'weight': 0.3, 'description': 'Poor execution track record'}
            },
            'technical': {
                'technology_risk': {'weight': 0.4, 'description': 'Technology not scalable or outdated'},
                'development_risk': {'weight': 0.3, 'description': 'Development delays or technical debt'},
                'security_risk': {'weight': 0.3, 'description': 'Security vulnerabilities or data breaches'}
            },
            'regulatory': {
                'compliance_risk': {'weight': 0.4, 'description': 'Regulatory compliance issues'},
                'legal_risk': {'weight': 0.3, 'description': 'Legal disputes or IP issues'},
                'policy_risk': {'weight': 0.3, 'description': 'Policy changes affecting business model'}
            },
            'concentration': {
                'customer_concentration_risk': {'weight': 0.4, 'description': 'Over-reliance on few customers'},
                'revenue_concentration_risk': {'weight': 0.3, 'description': 'Single revenue stream dependency'},
                'geographic_concentration_risk': {'weight': 0.3, 'description': 'Limited geographic diversification'}
            },
            'execution': {
                'cash_flow_risk': {'weight': 0.3, 'description': 'Cash flow management issues'},
                'scaling_risk': {'weight': 0.3, 'description': 'Scaling challenges or operational issues'},
                'partnership_risk': {'weight': 0.2, 'description': 'Key partnership dependencies'},
                'talent_risk': {'weight': 0.2, 'description': 'Hiring and retention challenges'}
            }
        }

        # Get risk scores from inputs or use defaults
        risk_scores = inputs.get('risk_scores', {})
        
        # Assess each category
        category_results = {}
        total_risk_score = 0
        total_weight = 0
        all_risks = []

        for category, sub_risks in risk_categories.items():
            category_score = 0
            category_weight = 0
            category_risks = []

            for risk_key, risk_config in sub_risks.items():
                # Get score from inputs or default to medium risk
                score = risk_scores.get(risk_key, 2)  # 0=low, 1=medium, 2=high, 3=critical
                weight = risk_config['weight']
                
                risk_entry = {
                    'category': category,
                    'risk_key': risk_key,
                    'description': risk_config['description'],
                    'severity': get_severity_level(score),
                    'likelihood': get_likelihood_level(score),
                    'score': score,
                    'weight': weight,
                    'weighted_score': score * weight,
                    'mitigation': inputs.get('mitigations', {}).get(risk_key, ''),
                    'owner_role': inputs.get('owners', {}).get(risk_key, 'analyst')
                }
                
                category_risks.append(risk_entry)
                category_score += score * weight
                category_weight += weight

            # Calculate category average
            category_avg_score = category_score / category_weight if category_weight > 0 else 0
            
            category_results[category] = {
                'average_score': category_avg_score,
                'severity': get_severity_level(category_avg_score),
                'risks': category_risks
            }
            
            total_risk_score += category_avg_score
            total_weight += 1
            all_risks.extend(category_risks)

        # Calculate overall risk score
        overall_risk_score = total_risk_score / total_weight if total_weight > 0 else 0
        
        # Identify high-severity risks for gating
        high_severity_risks = [risk for risk in all_risks if risk['severity'] in ['high', 'critical']]
        
        # Generate risk summary
        risk_summary = generate_risk_summary(category_results, high_severity_risks)

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "overall_risk_score": overall_risk_score,
            "overall_severity": get_severity_level(overall_risk_score),
            "category_results": category_results,
            "high_severity_risks": high_severity_risks,
            "risk_summary": risk_summary,
            "total_risks": len(all_risks),
            "risk_breakdown": {
                'low': len([r for r in all_risks if r['severity'] == 'low']),
                'medium': len([r for r in all_risks if r['severity'] == 'medium']),
                'high': len([r for r in all_risks if r['severity'] == 'high']),
                'critical': len([r for r in all_risks if r['severity'] == 'critical'])
            },
            "recommendations": generate_risk_recommendations(category_results, high_severity_risks)
        }

        logger.info(f"Risk assessment completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Risk assessment failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def export_risks_csv(self, pitch_id: str, risk_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Export risk assessment to CSV format
    """
    try:
        logger.info(f"Exporting risks CSV for pitch_id: {pitch_id}")

        # Create CSV content
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Category', 'Risk', 'Description', 'Severity', 'Likelihood', 
            'Score', 'Weight', 'Weighted Score', 'Mitigation', 'Owner'
        ])
        
        # Write risk data
        for category, category_data in risk_data.get('category_results', {}).items():
            for risk in category_data.get('risks', []):
                writer.writerow([
                    risk['category'],
                    risk['risk_key'],
                    risk['description'],
                    risk['severity'],
                    risk['likelihood'],
                    risk['score'],
                    f"{risk['weight']:.2f}",
                    f"{risk['weighted_score']:.2f}",
                    risk['mitigation'],
                    risk['owner_role']
                ])
        
        csv_content = output.getvalue()
        output.close()

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "csv_content": csv_content,
            "filename": f"risk_assessment_{pitch_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            "total_risks": risk_data.get('total_risks', 0)
        }

        logger.info(f"Risks CSV export completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Risks CSV export failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def get_severity_level(score: float) -> str:
    """Convert numeric score to severity level"""
    if score >= 2.5:
        return 'critical'
    elif score >= 1.5:
        return 'high'
    elif score >= 0.5:
        return 'medium'
    else:
        return 'low'

def get_likelihood_level(score: float) -> str:
    """Convert numeric score to likelihood level"""
    if score >= 2.5:
        return 'high'
    elif score >= 1.5:
        return 'medium'
    else:
        return 'low'

def generate_risk_summary(category_results: Dict[str, Any], high_severity_risks: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Generate risk summary and insights"""
    summary = {
        'highest_risk_category': None,
        'highest_score': 0,
        'critical_risks_count': len([r for r in high_severity_risks if r['severity'] == 'critical']),
        'high_risks_count': len([r for r in high_severity_risks if r['severity'] == 'high']),
        'category_insights': {},
        'top_risks': sorted(high_severity_risks, key=lambda x: x['weighted_score'], reverse=True)[:5]
    }
    
    for category, data in category_results.items():
        score = data['average_score']
        if score > summary['highest_score']:
            summary['highest_score'] = score
            summary['highest_risk_category'] = category
        
        summary['category_insights'][category] = {
            'severity': data['severity'],
            'risk_count': len(data['risks']),
            'high_risk_count': len([r for r in data['risks'] if r['severity'] in ['high', 'critical']])
        }
    
    return summary

def generate_risk_recommendations(category_results: Dict[str, Any], high_severity_risks: List[Dict[str, Any]]) -> List[str]:
    """Generate actionable risk recommendations"""
    recommendations = []
    
    # Category-specific recommendations
    for category, data in category_results.items():
        if data['severity'] in ['high', 'critical']:
            if category == 'market':
                recommendations.append("Conduct detailed market analysis and competitive landscape assessment")
            elif category == 'team':
                recommendations.append("Strengthen team composition and consider key hires")
            elif category == 'technical':
                recommendations.append("Review technical architecture and development roadmap")
            elif category == 'regulatory':
                recommendations.append("Engage legal counsel for compliance review")
            elif category == 'concentration':
                recommendations.append("Develop customer diversification strategy")
            elif category == 'execution':
                recommendations.append("Create detailed execution plan with milestones")
    
    # General recommendations based on risk count
    if len(high_severity_risks) > 5:
        recommendations.append("Consider delaying investment until key risks are mitigated")
    
    if not recommendations:
        recommendations.append("Risk profile appears manageable, proceed with standard due diligence")
    
    return recommendations
