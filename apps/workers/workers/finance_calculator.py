# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List
import logging
import math

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def calculate_unit_economics(self, pitch_id: str, metrics: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate unit economics: LTV/CAC, payback, burn multiple, magic number, rule of 40
    """
    try:
        logger.info(f"Starting unit economics calculation for pitch_id: {pitch_id}")
        
        # Extract metrics
        mrr = metrics.get('mrr', 0)
        arr = metrics.get('arr', 0)
        cac = metrics.get('cac', 0)
        churn_rate = metrics.get('churn_rate', 0)
        gross_margin = metrics.get('gross_margin', 0)
        burn_rate = metrics.get('burn_rate', 0)
        growth_rate = metrics.get('growth_rate', 0)
        
        # Calculate LTV (Lifetime Value)
        ltv = calculate_ltv(mrr, churn_rate, gross_margin)
        
        # Calculate LTV/CAC ratio
        ltv_cac_ratio = ltv / cac if cac > 0 else 0
        
        # Calculate payback period (months)
        payback_months = calculate_payback_period(cac, mrr, gross_margin)
        
        # Calculate burn multiple
        burn_multiple = calculate_burn_multiple(burn_rate, growth_rate, arr)
        
        # Calculate magic number (sales efficiency)
        magic_number = calculate_magic_number(arr, growth_rate, burn_rate)
        
        # Calculate Rule of 40
        rule_of_40 = calculate_rule_of_40(growth_rate, gross_margin)
        
        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "unit_economics": {
                "ltv": ltv,
                "cac": cac,
                "ltv_cac_ratio": ltv_cac_ratio,
                "payback_months": payback_months,
                "burn_multiple": burn_multiple,
                "magic_number": magic_number,
                "rule_of_40": rule_of_40,
                "gross_margin": gross_margin,
                "churn_rate": churn_rate,
                "growth_rate": growth_rate
            },
            "assumptions": {
                "ltv_method": "cohort_decay",
                "payback_method": "gross_margin_adjusted"
            }
        }
        
        logger.info(f"Unit economics calculation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Unit economics calculation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def calculate_ltv(mrr: float, churn_rate: float, gross_margin: float) -> float:
    """
    Calculate LTV using cohort decay method
    LTV = MRR * Gross Margin * (1 / Churn Rate)
    """
    if churn_rate <= 0:
        return 0
    
    # Convert annual churn to monthly
    monthly_churn = churn_rate / 12 if churn_rate > 1 else churn_rate
    
    # LTV calculation
    ltv = mrr * (gross_margin / 100) * (1 / monthly_churn)
    
    return ltv

def calculate_payback_period(cac: float, mrr: float, gross_margin: float) -> float:
    """
    Calculate payback period in months
    Payback = CAC / (MRR * Gross Margin)
    """
    if mrr <= 0 or gross_margin <= 0:
        return float('inf')
    
    monthly_revenue = mrr * (gross_margin / 100)
    payback = cac / monthly_revenue
    
    return payback

def calculate_burn_multiple(burn_rate: float, growth_rate: float, arr: float) -> float:
    """
    Calculate burn multiple
    Burn Multiple = Net Burn / Net New ARR
    """
    if arr <= 0 or growth_rate <= 0:
        return float('inf')
    
    net_new_arr = arr * (growth_rate / 100)
    burn_multiple = burn_rate / net_new_arr
    
    return burn_multiple

def calculate_magic_number(arr: float, growth_rate: float, burn_rate: float) -> float:
    """
    Calculate magic number (sales efficiency)
    Magic Number = (Current Quarter ARR - Previous Quarter ARR) / Previous Quarter Sales & Marketing Spend
    Simplified: Growth Rate / Burn Rate
    """
    if burn_rate <= 0:
        return 0
    
    magic_number = (growth_rate / 100) / burn_rate
    
    return magic_number

def calculate_rule_of_40(growth_rate: float, gross_margin: float) -> float:
    """
    Calculate Rule of 40
    Rule of 40 = Growth Rate + Profit Margin
    """
    rule_of_40 = growth_rate + gross_margin
    
    return rule_of_40
