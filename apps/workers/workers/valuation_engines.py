# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List
import logging
import math

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def run_scorecard_valuation(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Scorecard method valuation with configurable weights
    """
    try:
        logger.info(f"Starting scorecard valuation for pitch_id: {pitch_id}")
        
        # Default weights if not provided
        weights = inputs.get('weights', {
            'team': 25,
            'market': 25,
            'product': 15,
            'traction': 15,
            'competition': 10,
            'defensibility': 5,
            'gtm': 5
        })
        
        # Get scores (0-10 scale)
        scores = inputs.get('scores', {})
        
        # Calculate weighted score
        total_score = 0
        total_weight = 0
        
        for category, weight in weights.items():
            score = scores.get(category, 5)  # Default to 5 if not provided
            total_score += score * weight
            total_weight += weight
        
        base_score = total_score / total_weight if total_weight > 0 else 0
        
        # Convert to valuation multiple (typical range: 0.5x to 10x ARR)
        base_multiple = 0.5 + (base_score / 10) * 9.5
        
        # Get ARR for valuation
        arr = inputs.get('arr', 0)
        base_valuation = arr * base_multiple
        
        # Calculate ranges
        low_multiple = base_multiple * 0.7
        high_multiple = base_multiple * 1.3
        
        result = {
            "pitch_id": pitch_id,
            "method": "scorecard",
            "status": "completed",
            "result_low": arr * low_multiple,
            "result_base": base_valuation,
            "result_high": arr * high_multiple,
            "inputs": inputs,
            "weights": weights,
            "scores": scores,
            "base_score": base_score,
            "base_multiple": base_multiple,
            "notes": f"Scorecard valuation based on {base_score:.1f}/10 score with {base_multiple:.1f}x ARR multiple"
        }
        
        logger.info(f"Scorecard valuation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Scorecard valuation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def run_vc_method_valuation(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    VC Method valuation using present value calculation
    """
    try:
        logger.info(f"Starting VC method valuation for pitch_id: {pitch_id}")
        
        exit_value = inputs.get('exit_value', 0)
        target_ownership = inputs.get('target_ownership', 0.1)  # 10%
        irr = inputs.get('irr', 0.25)  # 25% IRR
        probability = inputs.get('probability', 0.1)  # 10% success probability
        years = inputs.get('years', 7)  # 7 years to exit
        
        # PV formula: PV = (ExitValue × Ownership × Probability) / (1+IRR)^Years
        present_value = (exit_value * target_ownership * probability) / ((1 + irr) ** years)
        
        # Calculate ranges based on probability and IRR variations
        low_prob = probability * 0.5
        high_prob = probability * 1.5
        low_irr = irr * 0.8
        high_irr = irr * 1.2
        
        low_pv = (exit_value * target_ownership * low_prob) / ((1 + high_irr) ** years)
        high_pv = (exit_value * target_ownership * high_prob) / ((1 + low_irr) ** years)
        
        result = {
            "pitch_id": pitch_id,
            "method": "vc_method",
            "status": "completed",
            "result_low": low_pv,
            "result_base": present_value,
            "result_high": high_pv,
            "inputs": inputs,
            "present_value": present_value,
            "formula": f"PV = (${exit_value:,.0f} × {target_ownership*100:.0f}% × {probability*100:.0f}%) / (1+{irr*100:.0f}%)^{years}",
            "notes": f"VC method based on ${exit_value:,.0f} exit value, {target_ownership*100:.0f}% ownership, {irr*100:.0f}% IRR, {probability*100:.0f}% probability over {years} years"
        }
        
        logger.info(f"VC method valuation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"VC method valuation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def run_comps_valuation(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Comparables valuation using industry benchmarks
    """
    try:
        logger.info(f"Starting comps valuation for pitch_id: {pitch_id}")
        
        sector = inputs.get('sector', 'SaaS')
        stage = inputs.get('stage', 'seed')
        geo = inputs.get('geo', 'US')
        metric = inputs.get('metric', 'EV/ARR')
        arr = inputs.get('arr', 0)
        
        # Get comps data (in real implementation, this would come from database)
        comps_data = get_comps_data(sector, stage, geo, metric)
        
        if not comps_data:
            # Fallback to default ranges
            comps_data = {
                'p10': 5, 'p50': 15, 'p90': 30,
                'sample': 50, 'notes': 'Default SaaS comps'
            }
        
        # Apply comps multiples to ARR
        low_valuation = arr * comps_data['p10']
        base_valuation = arr * comps_data['p50']
        high_valuation = arr * comps_data['p90']
        
        result = {
            "pitch_id": pitch_id,
            "method": "comps",
            "status": "completed",
            "result_low": low_valuation,
            "result_base": base_valuation,
            "result_high": high_valuation,
            "inputs": inputs,
            "comps_data": comps_data,
            "applied_multiple": comps_data['p50'],
            "notes": f"Comps valuation using {metric} for {sector} {stage} companies in {geo}. Sample size: {comps_data['sample']} companies"
        }
        
        logger.info(f"Comps valuation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Comps valuation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def run_berkus_valuation(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Berkus method for pre-revenue companies
    """
    try:
        logger.info(f"Starting Berkus valuation for pitch_id: {pitch_id}")
        
        # Berkus criteria (each worth $500K-$2M)
        working_prototype = inputs.get('working_prototype', False)
        quality_team = inputs.get('quality_team', False)
        quality_board = inputs.get('quality_board', False)
        strategic_relationships = inputs.get('strategic_relationships', False)
        sales = inputs.get('sales', False)
        
        # Calculate valuation
        valuation = 0
        if working_prototype:
            valuation += 500000
        if quality_team:
            valuation += 500000
        if quality_board:
            valuation += 500000
        if strategic_relationships:
            valuation += 500000
        if sales:
            valuation += 500000
        
        # Add base value
        base_value = 500000
        total_valuation = base_value + valuation
        
        # Calculate ranges
        low_valuation = total_valuation * 0.7
        high_valuation = total_valuation * 1.5
        
        result = {
            "pitch_id": pitch_id,
            "method": "berkus",
            "status": "completed",
            "result_low": low_valuation,
            "result_base": total_valuation,
            "result_high": high_valuation,
            "inputs": inputs,
            "base_value": base_value,
            "criteria_value": valuation,
            "criteria_met": {
                'working_prototype': working_prototype,
                'quality_team': quality_team,
                'quality_board': quality_board,
                'strategic_relationships': strategic_relationships,
                'sales': sales
            },
            "notes": f"Berkus method: ${base_value:,.0f} base + ${valuation:,.0f} for criteria met"
        }
        
        logger.info(f"Berkus valuation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Berkus valuation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def run_rfs_valuation(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Risk Factor Summation method
    """
    try:
        logger.info(f"Starting RFS valuation for pitch_id: {pitch_id}")
        
        base_value = inputs.get('base_value', 1000000)  # $1M base
        
        # Risk factors (positive and negative adjustments)
        risk_factors = inputs.get('risk_factors', {})
        
        # Standard risk factor values
        risk_values = {
            'management': 300000,
            'stage_of_business': 250000,
            'legislation_political_risk': 200000,
            'manufacturing_risk': 200000,
            'sales_marketing_risk': 200000,
            'funding_capital_raising_risk': 250000,
            'competition_risk': 200000,
            'technology_risk': 300000,
            'litigation_risk': 100000,
            'international_risk': 150000,
            'reputation_risk': 100000,
            'exit_value_risk': 100000
        }
        
        # Calculate total adjustment
        total_adjustment = 0
        applied_factors = {}
        
        for factor, value in risk_factors.items():
            if factor in risk_values:
                adjustment = risk_values[factor] * value  # value should be -2 to +2
                total_adjustment += adjustment
                applied_factors[factor] = {
                    'score': value,
                    'adjustment': adjustment,
                    'max_adjustment': risk_values[factor]
                }
        
        # Calculate final valuation
        final_valuation = base_value + total_adjustment
        
        # Ensure minimum valuation
        final_valuation = max(final_valuation, 100000)
        
        # Calculate ranges
        low_valuation = final_valuation * 0.8
        high_valuation = final_valuation * 1.3
        
        result = {
            "pitch_id": pitch_id,
            "method": "rfs",
            "status": "completed",
            "result_low": low_valuation,
            "result_base": final_valuation,
            "result_high": high_valuation,
            "inputs": inputs,
            "base_value": base_value,
            "total_adjustment": total_adjustment,
            "applied_factors": applied_factors,
            "notes": f"RFS method: ${base_value:,.0f} base + ${total_adjustment:,.0f} adjustments"
        }
        
        logger.info(f"RFS valuation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"RFS valuation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def get_comps_data(sector: str, stage: str, geo: str, metric: str) -> Dict[str, Any]:
    """
    Get comparable company data from database
    In real implementation, this would query the comps table
    """
    # Mock data - in real implementation, query the database
    comps_library = {
        ('SaaS', 'seed', 'US', 'EV/ARR'): {
            'p10': 5, 'p50': 15, 'p90': 30,
            'sample': 50, 'notes': 'SaaS seed stage comps'
        },
        ('Fintech', 'seed', 'US', 'EV/ARR'): {
            'p10': 8, 'p50': 20, 'p90': 40,
            'sample': 30, 'notes': 'Fintech seed stage comps'
        },
        ('Healthtech', 'seed', 'US', 'EV/ARR'): {
            'p10': 6, 'p50': 18, 'p90': 35,
            'sample': 25, 'notes': 'Healthtech seed stage comps'
        }
    }
    
    return comps_library.get((sector, stage, geo, metric), None)
