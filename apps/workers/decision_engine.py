# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import math

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def make_investment_decision(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Make investment decision with gating rules and calculations
    """
    try:
        logger.info(f"Starting investment decision for pitch_id: {pitch_id}")

        # Extract inputs
        recommendation = inputs.get('recommendation', 'no')  # yes/no/conditional
        check_size_usd = inputs.get('check_size_usd', 0)
        instrument = inputs.get('instrument', 'SAFE')  # SAFE/Equity
        pre_money_usd = inputs.get('pre_money_usd', 0)
        target_ownership = inputs.get('target_ownership', 0.1)  # 10%
        conditions = inputs.get('conditions', [])
        rationale = inputs.get('rationale', '')

        # Validation data
        valuations = inputs.get('valuations', [])
        risk_assessment = inputs.get('risk_assessment', {})
        cap_table_sim = inputs.get('cap_table_sim', {})

        # Check gating rules
        gate_check = check_gating_rules(valuations, risk_assessment, cap_table_sim)
        
        if not gate_check['passed']:
            result = {
                "pitch_id": pitch_id,
                "status": "blocked",
                "recommendation": "no",
                "blocking_reasons": gate_check['reasons'],
                "created_at": datetime.now().isoformat()
            }
            return result

        # Calculate investment parameters
        if recommendation in ['yes', 'conditional']:
            investment_params = calculate_investment_params(
                check_size_usd, pre_money_usd, target_ownership, instrument
            )
        else:
            investment_params = {
                'check_size_usd': 0,
                'pre_money_usd': 0,
                'post_money_usd': 0,
                'target_ownership': 0,
                'instrument': instrument
            }

        # Generate decision summary
        decision_summary = generate_decision_summary(
            recommendation, investment_params, conditions, rationale,
            valuations, risk_assessment
        )

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "recommendation": recommendation,
            "check_size_usd": investment_params['check_size_usd'],
            "instrument": investment_params['instrument'],
            "pre_money_usd": investment_params['pre_money_usd'],
            "post_money_usd": investment_params['post_money_usd'],
            "target_ownership": investment_params['target_ownership'],
            "conditions": conditions,
            "rationale": rationale,
            "decision_summary": decision_summary,
            "gate_check": gate_check,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Investment decision completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Investment decision failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def check_gating_rules(valuations: List[Dict[str, Any]], 
                      risk_assessment: Dict[str, Any], 
                      cap_table_sim: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check gating rules for investment decision
    """
    reasons = []
    passed = True

    # Rule 1: Must have at least one valuation
    if not valuations or len(valuations) == 0:
        reasons.append("No valuations available")
        passed = False
    else:
        # Check if valuations are reasonable
        avg_valuation = sum(v.get('result_base', 0) for v in valuations) / len(valuations)
        if avg_valuation <= 0:
            reasons.append("Valuations are invalid or zero")
            passed = False

    # Rule 2: Risk assessment must be completed
    if not risk_assessment or not risk_assessment.get('overall_risk_score'):
        reasons.append("Risk assessment not completed")
        passed = False
    else:
        # Check for critical risks
        critical_risks = risk_assessment.get('risk_breakdown', {}).get('critical', 0)
        if critical_risks > 0:
            reasons.append(f"Found {critical_risks} critical risks that must be addressed")
            passed = False

    # Rule 3: Cap table simulation must be available for equity investments
    if cap_table_sim and not cap_table_sim.get('table'):
        reasons.append("Cap table simulation required for equity investments")
        passed = False

    # Rule 4: Check risk score threshold
    overall_risk_score = risk_assessment.get('overall_risk_score', 10)
    if overall_risk_score > 2.5:  # High risk threshold
        reasons.append(f"Overall risk score too high: {overall_risk_score}")
        passed = False

    return {
        'passed': passed,
        'reasons': reasons,
        'overall_risk_score': overall_risk_score,
        'valuation_count': len(valuations),
        'critical_risks': risk_assessment.get('risk_breakdown', {}).get('critical', 0)
    }

def calculate_investment_params(check_size_usd: float, pre_money_usd: float, 
                              target_ownership: float, instrument: str) -> Dict[str, Any]:
    """
    Calculate investment parameters
    """
    if instrument == 'SAFE':
        # For SAFE, check_size determines ownership
        if pre_money_usd > 0:
            actual_ownership = check_size_usd / (pre_money_usd + check_size_usd)
        else:
            actual_ownership = target_ownership
        
        post_money_usd = pre_money_usd + check_size_usd
        
    else:  # Equity
        # For equity, target ownership determines check size
        if target_ownership > 0:
            check_size_usd = (pre_money_usd * target_ownership) / (1 - target_ownership)
        
        post_money_usd = pre_money_usd + check_size_usd
        actual_ownership = check_size_usd / post_money_usd

    return {
        'check_size_usd': check_size_usd,
        'pre_money_usd': pre_money_usd,
        'post_money_usd': post_money_usd,
        'target_ownership': actual_ownership,
        'instrument': instrument
    }

def generate_decision_summary(recommendation: str, investment_params: Dict[str, Any],
                            conditions: List[str], rationale: str,
                            valuations: List[Dict[str, Any]], 
                            risk_assessment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate comprehensive decision summary
    """
    
    # Calculate valuation ranges
    if valuations:
        min_valuation = min(v.get('result_low', 0) for v in valuations)
        max_valuation = max(v.get('result_high', 0) for v in valuations)
        avg_valuation = sum(v.get('result_base', 0) for v in valuations) / len(valuations)
    else:
        min_valuation = max_valuation = avg_valuation = 0

    # Risk summary
    risk_summary = {
        'overall_score': risk_assessment.get('overall_risk_score', 0),
        'severity': risk_assessment.get('overall_severity', 'unknown'),
        'high_risks': risk_assessment.get('risk_breakdown', {}).get('high', 0),
        'critical_risks': risk_assessment.get('risk_breakdown', {}).get('critical', 0)
    }

    # Decision confidence
    confidence_factors = []
    if len(valuations) >= 2:
        confidence_factors.append("Multiple valuation methods")
    if risk_summary['overall_score'] < 1.5:
        confidence_factors.append("Low risk profile")
    if investment_params['check_size_usd'] > 0:
        confidence_factors.append("Clear investment terms")

    confidence = len(confidence_factors) / 3 * 100  # Percentage

    summary = {
        'recommendation': recommendation,
        'confidence': confidence,
        'confidence_factors': confidence_factors,
        'valuation_summary': {
            'min': min_valuation,
            'max': max_valuation,
            'average': avg_valuation,
            'methods_used': len(valuations)
        },
        'risk_summary': risk_summary,
        'investment_terms': {
            'check_size': investment_params['check_size_usd'],
            'ownership': investment_params['target_ownership'],
            'instrument': investment_params['instrument'],
            'pre_money': investment_params['pre_money_usd'],
            'post_money': investment_params['post_money_usd']
        },
        'conditions_count': len(conditions),
        'key_conditions': conditions[:3] if conditions else [],  # Top 3 conditions
        'rationale_summary': rationale[:200] + "..." if len(rationale) > 200 else rationale
    }

    return summary

@celery_app.task(bind=True)
def generate_investment_memo(self, pitch_id: str, decision_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate investment memo based on decision and analysis
    """
    try:
        logger.info(f"Generating investment memo for pitch_id: {pitch_id}")

        # Extract decision data
        recommendation = decision_data.get('recommendation', 'no')
        investment_params = decision_data.get('investment_params', {})
        valuations = decision_data.get('valuations', [])
        risk_assessment = decision_data.get('risk_assessment', {})
        unit_economics = decision_data.get('unit_economics', {})
        market_sizing = decision_data.get('market_sizing', {})
        panel_transcript = decision_data.get('panel_transcript', [])

        # Generate memo sections
        memo_sections = {
            'executive_summary': generate_executive_summary(recommendation, investment_params),
            'investment_thesis': generate_investment_thesis(decision_data),
            'market_analysis': generate_market_analysis(market_sizing),
            'financial_analysis': generate_financial_analysis(valuations, unit_economics),
            'risk_assessment': generate_risk_section(risk_assessment),
            'due_diligence': generate_due_diligence_section(panel_transcript),
            'terms_and_conditions': generate_terms_section(investment_params, decision_data.get('conditions', [])),
            'recommendation': generate_recommendation_section(recommendation, decision_data)
        }

        # Combine into full memo
        full_memo = combine_memo_sections(memo_sections)

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "memo_sections": memo_sections,
            "full_memo": full_memo,
            "word_count": len(full_memo.split()),
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Investment memo generated for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Investment memo generation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def generate_executive_summary(recommendation: str, investment_params: Dict[str, Any]) -> str:
    """Generate executive summary section"""
    
    check_size = investment_params.get('check_size_usd', 0)
    ownership = investment_params.get('target_ownership', 0)
    instrument = investment_params.get('instrument', 'SAFE')
    
    summary = f"""
# Executive Summary

**Recommendation: {recommendation.upper()}**

## Investment Terms
- **Check Size**: ${check_size:,.0f}
- **Target Ownership**: {ownership:.1%}
- **Instrument**: {instrument}
- **Pre-Money Valuation**: ${investment_params.get('pre_money_usd', 0):,.0f}
- **Post-Money Valuation**: ${investment_params.get('post_money_usd', 0):,.0f}

## Key Highlights
- [To be populated with pitch-specific highlights]
- [Market opportunity and competitive advantages]
- [Team strength and execution capability]
- [Financial performance and growth metrics]
"""
    return summary.strip()

def generate_investment_thesis(decision_data: Dict[str, Any]) -> str:
    """Generate investment thesis section"""
    
    thesis = """
# Investment Thesis

## Why We Should Invest

### Market Opportunity
[Describe the market size, growth potential, and timing]

### Competitive Advantages
[Outline unique value propositions and moats]

### Team Strength
[Highlight founder experience and execution capability]

### Business Model
[Explain revenue model and unit economics]

### Growth Trajectory
[Detail current traction and growth plans]

## Investment Rationale
[Connect the above factors to investment decision]
"""
    return thesis.strip()

def generate_market_analysis(market_sizing: Dict[str, Any]) -> str:
    """Generate market analysis section"""
    
    tam = market_sizing.get('tam', 0)
    sam = market_sizing.get('sam', 0)
    som = market_sizing.get('som', 0)
    
    analysis = f"""
# Market Analysis

## Market Size
- **TAM (Total Addressable Market)**: ${tam:,.0f}
- **SAM (Serviceable Addressable Market)**: ${sam:,.0f}
- **SOM (Serviceable Obtainable Market)**: ${som:,.0f}

## Market Dynamics
[Describe market trends, drivers, and competitive landscape]

## Competitive Analysis
[Analyze key competitors and positioning]

## Market Timing
[Explain why now is the right time for this investment]
"""
    return analysis.strip()

def generate_financial_analysis(valuations: List[Dict[str, Any]], 
                              unit_economics: Dict[str, Any]) -> str:
    """Generate financial analysis section"""
    
    # Valuation summary
    if valuations:
        avg_valuation = sum(v.get('result_base', 0) for v in valuations) / len(valuations)
        valuation_range = f"${min(v.get('result_low', 0) for v in valuations):,.0f} - ${max(v.get('result_high', 0) for v in valuations):,.0f}"
    else:
        avg_valuation = 0
        valuation_range = "N/A"
    
    # Unit economics
    ltv_cac = unit_economics.get('ltv_cac_ratio', 0)
    payback = unit_economics.get('payback_months', 0)
    
    analysis = f"""
# Financial Analysis

## Valuation
- **Average Valuation**: ${avg_valuation:,.0f}
- **Valuation Range**: {valuation_range}
- **Valuation Methods Used**: {len(valuations)}

## Unit Economics
- **LTV/CAC Ratio**: {ltv_cac:.1f}x
- **Payback Period**: {payback:.1f} months
- **Burn Multiple**: {unit_economics.get('burn_multiple', 0):.1f}
- **Magic Number**: {unit_economics.get('magic_number', 0):.1f}

## Financial Projections
[Include revenue projections, growth assumptions, and key metrics]

## Capital Efficiency
[Analyze capital requirements and efficiency metrics]
"""
    return analysis.strip()

def generate_risk_section(risk_assessment: Dict[str, Any]) -> str:
    """Generate risk assessment section"""
    
    overall_score = risk_assessment.get('overall_risk_score', 0)
    severity = risk_assessment.get('overall_severity', 'unknown')
    high_risks = risk_assessment.get('risk_breakdown', {}).get('high', 0)
    critical_risks = risk_assessment.get('risk_breakdown', {}).get('critical', 0)
    
    risk_section = f"""
# Risk Assessment

## Overall Risk Profile
- **Risk Score**: {overall_score:.1f}/3.0
- **Severity Level**: {severity.upper()}
- **High Risks**: {high_risks}
- **Critical Risks**: {critical_risks}

## Key Risk Categories

### Market Risks
[Detail market-related risks and mitigation strategies]

### Team Risks
[Address team-related risks and contingency plans]

### Technical Risks
[Outline technical challenges and solutions]

### Execution Risks
[Identify execution risks and mitigation approaches]

## Risk Mitigation
[Describe specific actions to address identified risks]
"""
    return risk_section.strip()

def generate_due_diligence_section(panel_transcript: List[Dict[str, Any]]) -> str:
    """Generate due diligence section"""
    
    dd_section = """
# Due Diligence

## Panel Discussion Summary
[Summarize key points from investment panel discussion]

## Key Concerns Addressed
[List and address main concerns raised during due diligence]

## Outstanding Items
[Note any remaining due diligence items]

## External References
[Include customer references, industry expert opinions, etc.]

## Legal and Compliance
[Summarize legal review and compliance status]
"""
    return dd_section.strip()

def generate_terms_section(investment_params: Dict[str, Any], 
                          conditions: List[str]) -> str:
    """Generate terms and conditions section"""
    
    terms_section = f"""
# Terms and Conditions

## Investment Structure
- **Instrument**: {investment_params.get('instrument', 'SAFE')}
- **Check Size**: ${investment_params.get('check_size_usd', 0):,.0f}
- **Ownership**: {investment_params.get('target_ownership', 0):.1%}

## Key Terms
[Detail specific investment terms and conditions]

## Conditions Precedent
"""
    
    if conditions:
        for i, condition in enumerate(conditions, 1):
            terms_section += f"{i}. {condition}\n"
    else:
        terms_section += "No specific conditions identified.\n"
    
    terms_section += """
## Use of Proceeds
[Detail how investment funds will be used]

## Milestones and KPIs
[Define key milestones and performance indicators]
"""
    
    return terms_section.strip()

def generate_recommendation_section(recommendation: str, 
                                  decision_data: Dict[str, Any]) -> str:
    """Generate final recommendation section"""
    
    rec_section = f"""
# Recommendation

## Investment Decision
**{recommendation.upper()}**

## Rationale
{decision_data.get('rationale', '[Investment rationale to be provided]')}

## Next Steps
[Outline immediate next steps and timeline]

## Monitoring and Reporting
[Define ongoing monitoring requirements and reporting structure]

## Exit Strategy
[Discuss potential exit scenarios and timeline]
"""
    return rec_section.strip()

def combine_memo_sections(sections: Dict[str, str]) -> str:
    """Combine all memo sections into a single document"""
    
    full_memo = ""
    section_order = [
        'executive_summary',
        'investment_thesis', 
        'market_analysis',
        'financial_analysis',
        'risk_assessment',
        'due_diligence',
        'terms_and_conditions',
        'recommendation'
    ]
    
    for section in section_order:
        if section in sections:
            full_memo += sections[section] + "\n\n"
    
    return full_memo.strip()
