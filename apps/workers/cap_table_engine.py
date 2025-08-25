# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
import math

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def simulate_cap_table(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate cap table with pre/post investment calculations and waterfall analysis
    """
    try:
        logger.info(f"Starting cap table simulation for pitch_id: {pitch_id}")

        # Extract inputs
        current_cap_table = inputs.get('current_cap_table', [])
        investment_amount = inputs.get('investment_amount', 0)
        pre_money_valuation = inputs.get('pre_money_valuation', 0)
        new_investor_ownership = inputs.get('new_investor_ownership', 0)
        option_pool_size = inputs.get('option_pool_size', 0.1)  # 10% default
        anti_dilution = inputs.get('anti_dilution', False)
        liquidation_preference = inputs.get('liquidation_preference', 1.0)  # 1x default

        # Validate inputs
        if not current_cap_table:
            current_cap_table = create_default_cap_table()

        # Calculate cap table changes
        cap_table_result = calculate_cap_table_changes(
            current_cap_table, investment_amount, pre_money_valuation,
            new_investor_ownership, option_pool_size, anti_dilution
        )

        # Generate waterfall analysis
        waterfall_result = generate_waterfall_analysis(
            cap_table_result['post_investment_table'],
            liquidation_preference
        )

        # Calculate key metrics
        metrics = calculate_cap_table_metrics(cap_table_result)

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "pre_investment_table": cap_table_result['pre_investment_table'],
            "post_investment_table": cap_table_result['post_investment_table'],
            "investment_summary": cap_table_result['investment_summary'],
            "waterfall_analysis": waterfall_result,
            "metrics": metrics,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Cap table simulation completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Cap table simulation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def create_default_cap_table() -> List[Dict[str, Any]]:
    """Create a default cap table for early-stage companies"""
    
    return [
        {
            'holder': 'Founders',
            'shares': 8000000,  # 8M shares
            'ownership': 0.80,  # 80%
            'type': 'Common',
            'price_per_share': 0.001,
            'total_value': 8000
        },
        {
            'holder': 'Option Pool',
            'shares': 2000000,  # 2M shares
            'ownership': 0.20,  # 20%
            'type': 'Options',
            'price_per_share': 0.001,
            'total_value': 2000
        }
    ]

def calculate_cap_table_changes(current_table: List[Dict[str, Any]], 
                              investment_amount: float,
                              pre_money_valuation: float,
                              new_investor_ownership: float,
                              option_pool_size: float,
                              anti_dilution: bool) -> Dict[str, Any]:
    """
    Calculate cap table changes from investment
    """
    
    # Calculate total shares and value
    total_shares = sum(entry['shares'] for entry in current_table)
    total_value = sum(entry['total_value'] for entry in current_table)
    
    # Calculate new shares needed for investment
    post_money_valuation = pre_money_valuation + investment_amount
    new_shares_needed = (investment_amount / post_money_valuation) * (total_shares / (1 - new_investor_ownership))
    
    # Calculate option pool expansion if needed
    option_pool_expansion = 0
    if option_pool_size > 0:
        current_option_pool = sum(entry['shares'] for entry in current_table if entry['type'] == 'Options')
        target_option_pool = total_shares * option_pool_size
        option_pool_expansion = max(0, target_option_pool - current_option_pool)
    
    # Create post-investment table
    post_table = []
    total_new_shares = total_shares + new_shares_needed + option_pool_expansion
    
    # Update existing holders
    for entry in current_table:
        if entry['type'] == 'Options':
            # Expand option pool if needed
            new_shares = entry['shares'] + option_pool_expansion
        else:
            new_shares = entry['shares']
        
        new_ownership = new_shares / total_new_shares
        new_value = new_ownership * post_money_valuation
        
        post_table.append({
            'holder': entry['holder'],
            'shares': new_shares,
            'ownership': new_ownership,
            'type': entry['type'],
            'price_per_share': new_value / new_shares if new_shares > 0 else 0,
            'total_value': new_value,
            'dilution': entry['ownership'] - new_ownership
        })
    
    # Add new investor
    if investment_amount > 0:
        post_table.append({
            'holder': 'New Investor',
            'shares': new_shares_needed,
            'ownership': new_shares_needed / total_new_shares,
            'type': 'Preferred',
            'price_per_share': investment_amount / new_shares_needed,
            'total_value': investment_amount,
            'dilution': 0
        })
    
    # Investment summary
    investment_summary = {
        'pre_money_valuation': pre_money_valuation,
        'investment_amount': investment_amount,
        'post_money_valuation': post_money_valuation,
        'new_shares_issued': new_shares_needed,
        'option_pool_expansion': option_pool_expansion,
        'total_shares_before': total_shares,
        'total_shares_after': total_new_shares,
        'price_per_share': investment_amount / new_shares_needed if new_shares_needed > 0 else 0
    }
    
    return {
        'pre_investment_table': current_table,
        'post_investment_table': post_table,
        'investment_summary': investment_summary
    }

def generate_waterfall_analysis(cap_table: List[Dict[str, Any]], 
                              liquidation_preference: float) -> Dict[str, Any]:
    """
    Generate waterfall analysis for different exit scenarios
    """
    
    # Calculate total shares and value
    total_shares = sum(entry['shares'] for entry in cap_table)
    total_value = sum(entry['total_value'] for entry in cap_table)
    
    # Define exit scenarios
    exit_scenarios = [
        {'name': 'Low Exit', 'multiple': 0.5, 'value': total_value * 0.5},
        {'name': 'Base Case', 'multiple': 1.0, 'value': total_value},
        {'name': 'High Exit', 'multiple': 2.0, 'value': total_value * 2.0},
        {'name': 'Home Run', 'multiple': 5.0, 'value': total_value * 5.0}
    ]
    
    waterfall_results = []
    
    for scenario in exit_scenarios:
        exit_value = scenario['value']
        waterfall = calculate_waterfall_for_exit(cap_table, exit_value, liquidation_preference)
        
        waterfall_results.append({
            'scenario': scenario['name'],
            'exit_value': exit_value,
            'multiple': scenario['multiple'],
            'waterfall': waterfall
        })
    
    return {
        'scenarios': waterfall_results,
        'liquidation_preference': liquidation_preference
    }

def calculate_waterfall_for_exit(cap_table: List[Dict[str, Any]], 
                               exit_value: float,
                               liquidation_preference: float) -> List[Dict[str, Any]]:
    """
    Calculate waterfall for a specific exit value
    """
    
    waterfall = []
    remaining_value = exit_value
    
    # Sort by liquidation preference (Preferred first, then Common)
    sorted_table = sorted(cap_table, key=lambda x: get_liquidation_priority(x['type']), reverse=True)
    
    for entry in sorted_table:
        if entry['type'] == 'Preferred':
            # Preferred shares get liquidation preference
            preferred_value = entry['shares'] * entry['price_per_share'] * liquidation_preference
            actual_value = min(preferred_value, remaining_value)
            
            waterfall.append({
                'holder': entry['holder'],
                'type': entry['type'],
                'shares': entry['shares'],
                'liquidation_preference': preferred_value,
                'actual_payout': actual_value,
                'ownership_percentage': entry['ownership']
            })
            
            remaining_value -= actual_value
            
        else:
            # Common shares split remaining value proportionally
            if remaining_value > 0:
                total_common_shares = sum(e['shares'] for e in sorted_table if e['type'] != 'Preferred')
                if total_common_shares > 0:
                    payout_per_share = remaining_value / total_common_shares
                    actual_value = entry['shares'] * payout_per_share
                else:
                    actual_value = 0
            else:
                actual_value = 0
            
            waterfall.append({
                'holder': entry['holder'],
                'type': entry['type'],
                'shares': entry['shares'],
                'liquidation_preference': 0,
                'actual_payout': actual_value,
                'ownership_percentage': entry['ownership']
            })
    
    return waterfall

def get_liquidation_priority(share_type: str) -> int:
    """Get liquidation priority for share types"""
    priorities = {
        'Preferred': 2,
        'Common': 1,
        'Options': 0
    }
    return priorities.get(share_type, 0)

def calculate_cap_table_metrics(cap_table_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate key cap table metrics
    """
    
    pre_table = cap_table_result['pre_investment_table']
    post_table = cap_table_result['post_investment_table']
    investment_summary = cap_table_result['investment_summary']
    
    # Ownership concentration
    founder_ownership = sum(entry['ownership'] for entry in post_table if 'Founder' in entry['holder'])
    investor_ownership = sum(entry['ownership'] for entry in post_table if entry['type'] == 'Preferred')
    option_pool_ownership = sum(entry['ownership'] for entry in post_table if entry['type'] == 'Options')
    
    # Dilution analysis
    total_dilution = sum(entry.get('dilution', 0) for entry in post_table)
    founder_dilution = sum(entry.get('dilution', 0) for entry in post_table if 'Founder' in entry['holder'])
    
    # Valuation metrics
    pre_money_per_share = investment_summary['pre_money_valuation'] / sum(entry['shares'] for entry in pre_table)
    post_money_per_share = investment_summary['post_money_valuation'] / sum(entry['shares'] for entry in post_table)
    
    metrics = {
        'ownership_distribution': {
            'founders': founder_ownership,
            'investors': investor_ownership,
            'option_pool': option_pool_ownership,
            'other': 1 - founder_ownership - investor_ownership - option_pool_ownership
        },
        'dilution_analysis': {
            'total_dilution': total_dilution,
            'founder_dilution': founder_dilution,
            'average_dilution': total_dilution / len([e for e in post_table if e.get('dilution', 0) > 0]) if any(e.get('dilution', 0) > 0 for e in post_table) else 0
        },
        'valuation_metrics': {
            'pre_money_per_share': pre_money_per_share,
            'post_money_per_share': post_money_per_share,
            'price_increase': (post_money_per_share - pre_money_per_share) / pre_money_per_share if pre_money_per_share > 0 else 0
        },
        'share_metrics': {
            'total_shares_before': investment_summary['total_shares_before'],
            'total_shares_after': investment_summary['total_shares_after'],
            'new_shares_issued': investment_summary['new_shares_issued'],
            'option_pool_expansion': investment_summary['option_pool_expansion']
        }
    }
    
    return metrics

@celery_app.task(bind=True)
def calculate_ownership_impact(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate ownership impact of different investment scenarios
    """
    try:
        logger.info(f"Calculating ownership impact for pitch_id: {pitch_id}")
        
        current_cap_table = inputs.get('current_cap_table', [])
        scenarios = inputs.get('scenarios', [])
        
        if not current_cap_table:
            current_cap_table = create_default_cap_table()
        
        impact_results = []
        
        for scenario in scenarios:
            investment_amount = scenario.get('investment_amount', 0)
            pre_money_valuation = scenario.get('pre_money_valuation', 0)
            new_investor_ownership = scenario.get('new_investor_ownership', 0)
            
            cap_table_result = calculate_cap_table_changes(
                current_cap_table, investment_amount, pre_money_valuation,
                new_investor_ownership, 0.1, False
            )
            
            metrics = calculate_cap_table_metrics(cap_table_result)
            
            impact_results.append({
                'scenario_name': scenario.get('name', f'${investment_amount:,.0f} investment'),
                'investment_amount': investment_amount,
                'pre_money_valuation': pre_money_valuation,
                'founder_ownership_after': metrics['ownership_distribution']['founders'],
                'founder_dilution': metrics['dilution_analysis']['founder_dilution'],
                'total_dilution': metrics['dilution_analysis']['total_dilution'],
                'post_money_valuation': cap_table_result['investment_summary']['post_money_valuation']
            })
        
        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "impact_analysis": impact_results,
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Ownership impact calculation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Ownership impact calculation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise
