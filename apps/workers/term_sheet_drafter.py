# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, date
import json

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def draft_term_sheet(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Draft term sheet with SAFE or Equity templates and field validation
    """
    try:
        logger.info(f"Starting term sheet drafting for pitch_id: {pitch_id}")

        # Extract inputs
        instrument_type = inputs.get('instrument_type', 'SAFE')  # SAFE or Equity
        investment_amount = inputs.get('investment_amount', 0)
        pre_money_valuation = inputs.get('pre_money_valuation', 0)
        post_money_valuation = inputs.get('post_money_valuation', 0)
        company_name = inputs.get('company_name', 'Company Name')
        investor_name = inputs.get('investor_name', 'Investor Name')
        closing_date = inputs.get('closing_date', date.today().isoformat())
        
        # Additional terms
        liquidation_preference = inputs.get('liquidation_preference', 1.0)
        anti_dilution = inputs.get('anti_dilution', False)
        board_seats = inputs.get('board_seats', 0)
        protective_provisions = inputs.get('protective_provisions', [])
        use_of_proceeds = inputs.get('use_of_proceeds', '')
        conditions_precedent = inputs.get('conditions_precedent', [])

        # Validate inputs
        validation_result = validate_term_sheet_inputs(inputs)
        if not validation_result['valid']:
            return {
                "pitch_id": pitch_id,
                "status": "validation_failed",
                "errors": validation_result['errors'],
                "created_at": datetime.now().isoformat()
            }

        # Generate term sheet based on instrument type
        if instrument_type == 'SAFE':
            term_sheet = generate_safe_term_sheet(
                company_name, investor_name, investment_amount,
                pre_money_valuation, closing_date, use_of_proceeds,
                conditions_precedent
            )
        else:  # Equity
            term_sheet = generate_equity_term_sheet(
                company_name, investor_name, investment_amount,
                pre_money_valuation, post_money_valuation, liquidation_preference,
                anti_dilution, board_seats, protective_provisions,
                use_of_proceeds, conditions_precedent, closing_date
            )

        # Calculate key metrics
        metrics = calculate_term_sheet_metrics(inputs)

        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "instrument_type": instrument_type,
            "term_sheet": term_sheet,
            "metrics": metrics,
            "validation": validation_result,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"Term sheet drafting completed for pitch_id: {pitch_id}")
        return result

    except Exception as e:
        logger.error(f"Term sheet drafting failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def validate_term_sheet_inputs(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Validate term sheet inputs
    """
    errors = []
    
    # Required fields
    required_fields = ['investment_amount', 'company_name', 'investor_name']
    for field in required_fields:
        if not inputs.get(field):
            errors.append(f"Missing required field: {field}")
    
    # Investment amount validation
    investment_amount = inputs.get('investment_amount', 0)
    if investment_amount <= 0:
        errors.append("Investment amount must be greater than zero")
    
    # Valuation validation
    pre_money_valuation = inputs.get('pre_money_valuation', 0)
    post_money_valuation = inputs.get('post_money_valuation', 0)
    
    if pre_money_valuation < 0:
        errors.append("Pre-money valuation cannot be negative")
    
    if post_money_valuation < pre_money_valuation:
        errors.append("Post-money valuation must be greater than or equal to pre-money valuation")
    
    # Liquidation preference validation
    liquidation_preference = inputs.get('liquidation_preference', 1.0)
    if liquidation_preference < 0:
        errors.append("Liquidation preference cannot be negative")
    
    # Board seats validation
    board_seats = inputs.get('board_seats', 0)
    if board_seats < 0:
        errors.append("Board seats cannot be negative")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors
    }

def generate_safe_term_sheet(company_name: str, investor_name: str, 
                           investment_amount: float, pre_money_valuation: float,
                           closing_date: str, use_of_proceeds: str,
                           conditions_precedent: List[str]) -> Dict[str, Any]:
    """
    Generate SAFE (Simple Agreement for Future Equity) term sheet
    """
    
    # Calculate conversion terms
    conversion_price = pre_money_valuation / 10000000  # Assuming 10M shares outstanding
    conversion_shares = investment_amount / conversion_price if conversion_price > 0 else 0
    
    term_sheet = {
        'title': f'SAFE Term Sheet - {company_name}',
        'parties': {
            'company': company_name,
            'investor': investor_name
        },
        'investment_terms': {
            'instrument': 'SAFE (Simple Agreement for Future Equity)',
            'investment_amount': investment_amount,
            'pre_money_valuation': pre_money_valuation,
            'conversion_price': conversion_price,
            'conversion_shares': conversion_shares
        },
        'key_terms': {
            'conversion_trigger': 'Next Qualified Financing',
            'conversion_discount': '20% discount to next round price',
            'valuation_cap': f'${pre_money_valuation:,.0f}',
            'liquidation_preference': 'None (converts to common)',
            'anti_dilution': 'None',
            'board_rights': 'None',
            'protective_provisions': 'None'
        },
        'closing_terms': {
            'closing_date': closing_date,
            'use_of_proceeds': use_of_proceeds or 'General corporate purposes',
            'conditions_precedent': conditions_precedent or ['Due diligence completion', 'Legal documentation']
        },
        'template_sections': [
            {
                'section': 'Investment Amount',
                'content': f'The Investor will purchase a SAFE for ${investment_amount:,.0f}.'
            },
            {
                'section': 'Valuation Cap',
                'content': f'The SAFE will convert at a valuation cap of ${pre_money_valuation:,.0f}.'
            },
            {
                'section': 'Discount Rate',
                'content': 'The SAFE will convert at a 20% discount to the price per share in the next qualified financing.'
            },
            {
                'section': 'Conversion',
                'content': 'The SAFE will automatically convert to equity upon the next qualified financing of at least $1M.'
            },
            {
                'section': 'Liquidation',
                'content': 'In the event of a liquidation, the SAFE will convert to common shares and participate pro rata.'
            }
        ]
    }
    
    return term_sheet

def generate_equity_term_sheet(company_name: str, investor_name: str,
                             investment_amount: float, pre_money_valuation: float,
                             post_money_valuation: float, liquidation_preference: float,
                             anti_dilution: bool, board_seats: int,
                             protective_provisions: List[str], use_of_proceeds: str,
                             conditions_precedent: List[str], closing_date: str) -> Dict[str, Any]:
    """
    Generate Equity term sheet
    """
    
    # Calculate ownership and shares
    ownership_percentage = (investment_amount / post_money_valuation) * 100
    total_shares = 10000000  # Assuming 10M shares outstanding
    new_shares = (investment_amount / post_money_valuation) * total_shares
    price_per_share = investment_amount / new_shares if new_shares > 0 else 0
    
    term_sheet = {
        'title': f'Series A Term Sheet - {company_name}',
        'parties': {
            'company': company_name,
            'investor': investor_name
        },
        'investment_terms': {
            'instrument': 'Series A Preferred Stock',
            'investment_amount': investment_amount,
            'pre_money_valuation': pre_money_valuation,
            'post_money_valuation': post_money_valuation,
            'ownership_percentage': ownership_percentage,
            'shares_issued': new_shares,
            'price_per_share': price_per_share
        },
        'key_terms': {
            'liquidation_preference': f'{liquidation_preference}x non-participating',
            'anti_dilution': 'Full ratchet' if anti_dilution else 'None',
            'board_seats': board_seats,
            'protective_provisions': protective_provisions or [
                'Sale of company',
                'Issuance of new shares',
                'Amendment of certificate of incorporation',
                'Declaration of dividends',
                'Incurrence of debt over $100K'
            ],
            'drag_along': 'Yes',
            'tag_along': 'Yes',
            'right_of_first_refusal': 'Yes',
            'co_sale_rights': 'Yes'
        },
        'closing_terms': {
            'closing_date': closing_date,
            'use_of_proceeds': use_of_proceeds or 'Working capital and general corporate purposes',
            'conditions_precedent': conditions_precedent or [
                'Due diligence completion',
                'Legal documentation',
                'Board approval',
                'Shareholder approval if required'
            ]
        },
        'template_sections': [
            {
                'section': 'Investment',
                'content': f'The Investor will invest ${investment_amount:,.0f} in exchange for {ownership_percentage:.1f}% ownership.'
            },
            {
                'section': 'Valuation',
                'content': f'Pre-money valuation: ${pre_money_valuation:,.0f}, Post-money valuation: ${post_money_valuation:,.0f}.'
            },
            {
                'section': 'Liquidation Preference',
                'content': f'{liquidation_preference}x non-participating liquidation preference.'
            },
            {
                'section': 'Anti-dilution',
                'content': 'Full ratchet anti-dilution protection.' if anti_dilution else 'No anti-dilution protection.'
            },
            {
                'section': 'Board Rights',
                'content': f'{board_seats} board seat(s) for the Investor.' if board_seats > 0 else 'No board seats for the Investor.'
            },
            {
                'section': 'Protective Provisions',
                'content': f'The Investor will have protective provisions including: {", ".join(protective_provisions or ["standard provisions"])}.'
            }
        ]
    }
    
    return term_sheet

def calculate_term_sheet_metrics(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate key metrics for the term sheet
    """
    
    investment_amount = inputs.get('investment_amount', 0)
    pre_money_valuation = inputs.get('pre_money_valuation', 0)
    post_money_valuation = inputs.get('post_money_valuation', 0)
    liquidation_preference = inputs.get('liquidation_preference', 1.0)
    
    # Ownership calculations
    ownership_percentage = (investment_amount / post_money_valuation) * 100 if post_money_valuation > 0 else 0
    
    # Effective ownership considering liquidation preference
    effective_ownership = ownership_percentage * liquidation_preference
    
    # Investment efficiency
    investment_efficiency = investment_amount / pre_money_valuation if pre_money_valuation > 0 else 0
    
    metrics = {
        'ownership_metrics': {
            'ownership_percentage': ownership_percentage,
            'effective_ownership': effective_ownership,
            'founder_retention': 100 - ownership_percentage
        },
        'valuation_metrics': {
            'pre_money_valuation': pre_money_valuation,
            'post_money_valuation': post_money_valuation,
            'investment_efficiency': investment_efficiency,
            'valuation_increase': ((post_money_valuation - pre_money_valuation) / pre_money_valuation) * 100 if pre_money_valuation > 0 else 0
        },
        'investment_metrics': {
            'investment_amount': investment_amount,
            'liquidation_preference': liquidation_preference,
            'effective_investment': investment_amount * liquidation_preference
        }
    }
    
    return metrics

@celery_app.task(bind=True)
def generate_term_sheet_pdf(self, pitch_id: str, term_sheet_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate PDF version of term sheet
    """
    try:
        logger.info(f"Generating term sheet PDF for pitch_id: {pitch_id}")
        
        # This would integrate with a PDF generation library like ReportLab
        # For now, return the structured data that can be formatted as PDF
        
        pdf_data = {
            'term_sheet': term_sheet_data,
            'generated_at': datetime.now().isoformat(),
            'format': 'PDF',
            'filename': f"term_sheet_{pitch_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
        
        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "pdf_data": pdf_data,
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Term sheet PDF generation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Term sheet PDF generation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

@celery_app.task(bind=True)
def compare_term_sheets(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compare multiple term sheet scenarios
    """
    try:
        logger.info(f"Comparing term sheets for pitch_id: {pitch_id}")
        
        scenarios = inputs.get('scenarios', [])
        comparison_results = []
        
        for scenario in scenarios:
            # Generate term sheet for each scenario
            term_sheet = draft_term_sheet(pitch_id, scenario)
            
            if term_sheet['status'] == 'completed':
                comparison_results.append({
                    'scenario_name': scenario.get('name', f'Scenario {len(comparison_results) + 1}'),
                    'term_sheet': term_sheet['term_sheet'],
                    'metrics': term_sheet['metrics']
                })
        
        result = {
            "pitch_id": pitch_id,
            "status": "completed",
            "comparison_results": comparison_results,
            "created_at": datetime.now().isoformat()
        }
        
        logger.info(f"Term sheet comparison completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Term sheet comparison failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise
