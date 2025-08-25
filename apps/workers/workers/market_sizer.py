# Created automatically by Cursor AI (2024-12-19)

from celery_app import celery_app
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

@celery_app.task(bind=True)
def calculate_market_size(self, pitch_id: str, inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculate market size using top-down and bottom-up approaches
    """
    try:
        logger.info(f"Starting market size calculation for pitch_id: {pitch_id}")
        
        method = inputs.get('method', 'topdown')
        
        if method == 'topdown':
            result = calculate_top_down(inputs)
        elif method == 'bottomup':
            result = calculate_bottom_up(inputs)
        else:
            result = calculate_hybrid(inputs)
        
        result.update({
            "pitch_id": pitch_id,
            "status": "completed",
            "method": method,
            "assumptions": inputs.get('assumptions', {})
        })
        
        logger.info(f"Market size calculation completed for pitch_id: {pitch_id}")
        return result
        
    except Exception as e:
        logger.error(f"Market size calculation failed for pitch_id: {pitch_id}, error: {str(e)}")
        raise

def calculate_top_down(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Top-down market sizing approach
    TAM = Total Addressable Market
    SAM = Serviceable Addressable Market  
    SOM = Serviceable Obtainable Market
    """
    total_market_size = inputs.get('total_market_size', 0)
    target_segment_percentage = inputs.get('target_segment_percentage', 0)
    obtainable_percentage = inputs.get('obtainable_percentage', 0)
    
    # Calculate SAM (Serviceable Addressable Market)
    sam = total_market_size * (target_segment_percentage / 100)
    
    # Calculate SOM (Serviceable Obtainable Market)
    som = sam * (obtainable_percentage / 100)
    
    return {
        "tam": total_market_size,
        "sam": sam,
        "som": som,
        "approach": "top_down",
        "confidence": "medium"
    }

def calculate_bottom_up(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bottom-up market sizing approach
    Based on customer segments, pricing, and adoption rates
    """
    customer_segments = inputs.get('customer_segments', [])
    avg_revenue_per_customer = inputs.get('avg_revenue_per_customer', 0)
    adoption_rate = inputs.get('adoption_rate', 0)
    
    total_potential_customers = sum(segment.get('count', 0) for segment in customer_segments)
    
    # Calculate SOM based on adoption rate
    som = total_potential_customers * avg_revenue_per_customer * (adoption_rate / 100)
    
    # Estimate SAM and TAM based on typical ratios
    sam = som * 3  # Assume 3x SOM
    tam = sam * 5  # Assume 5x SAM
    
    return {
        "tam": tam,
        "sam": sam,
        "som": som,
        "approach": "bottom_up",
        "confidence": "high",
        "customer_segments": customer_segments
    }

def calculate_hybrid(inputs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Hybrid approach combining top-down and bottom-up
    """
    top_down_result = calculate_top_down(inputs)
    bottom_up_result = calculate_bottom_up(inputs)
    
    # Average the results
    tam = (top_down_result['tam'] + bottom_up_result['tam']) / 2
    sam = (top_down_result['sam'] + bottom_up_result['sam']) / 2
    som = (top_down_result['som'] + bottom_up_result['som']) / 2
    
    return {
        "tam": tam,
        "sam": sam,
        "som": som,
        "approach": "hybrid",
        "confidence": "high",
        "top_down": top_down_result,
        "bottom_up": bottom_up_result
    }
