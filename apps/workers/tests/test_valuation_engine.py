# Created automatically by Cursor AI (2024-12-19)

import pytest
import math
from unittest.mock import patch, MagicMock
from apps.workers.valuation_engine import (
    calculate_scorecard_valuation,
    calculate_vc_method_valuation,
    calculate_comps_valuation,
    calculate_berkus_valuation,
    calculate_rfs_valuation
)

class TestValuationEngine:
    """Unit tests for valuation engine functions"""
    
    def test_scorecard_valuation_basic(self):
        """Test basic scorecard valuation calculation"""
        # Test data
        base_valuation = 1000000  # $1M base
        scores = {
            'team': 0.8,
            'market': 0.7,
            'product': 0.9,
            'traction': 0.6,
            'financials': 0.8
        }
        
        result = calculate_scorecard_valuation(base_valuation, scores)
        
        # Expected: base * average_score
        expected_score = sum(scores.values()) / len(scores)  # 0.76
        expected_valuation = base_valuation * expected_score
        
        assert result['valuation'] == pytest.approx(expected_valuation, rel=1e-6)
        assert result['method'] == 'scorecard'
        assert result['confidence'] == 'medium'
        assert 'scorecard' in result['notes'].lower()
    
    def test_scorecard_valuation_edge_cases(self):
        """Test scorecard valuation with edge cases"""
        base_valuation = 1000000
        
        # Perfect scores
        perfect_scores = {key: 1.0 for key in ['team', 'market', 'product', 'traction', 'financials']}
        result = calculate_scorecard_valuation(base_valuation, perfect_scores)
        assert result['valuation'] == base_valuation
        
        # Zero scores
        zero_scores = {key: 0.0 for key in ['team', 'market', 'product', 'traction', 'financials']}
        result = calculate_scorecard_valuation(base_valuation, zero_scores)
        assert result['valuation'] == 0
    
    def test_vc_method_valuation(self):
        """Test VC method valuation calculation"""
        # Test data
        exit_value = 50000000  # $50M exit
        target_irr = 0.25  # 25% IRR
        years_to_exit = 5
        investment_amount = 2000000  # $2M investment
        
        result = calculate_vc_method_valuation(exit_value, target_irr, years_to_exit, investment_amount)
        
        # Expected: exit_value / (1 + irr)^years
        expected_pv = exit_value / ((1 + target_irr) ** years_to_exit)
        expected_ownership = investment_amount / expected_pv
        
        assert result['valuation'] == pytest.approx(expected_pv, rel=1e-6)
        assert result['ownership_percentage'] == pytest.approx(expected_ownership * 100, rel=1e-6)
        assert result['method'] == 'vc_method'
        assert result['confidence'] == 'medium'
    
    def test_vc_method_valuation_edge_cases(self):
        """Test VC method with edge cases"""
        # Zero IRR
        result = calculate_vc_method_valuation(50000000, 0, 5, 2000000)
        assert result['valuation'] == 50000000
        
        # Zero years to exit
        result = calculate_vc_method_valuation(50000000, 0.25, 0, 2000000)
        assert result['valuation'] == 50000000
    
    def test_comps_valuation(self):
        """Test comparables valuation calculation"""
        # Test data
        revenue = 2000000  # $2M ARR
        comps_data = [
            {'ev_revenue': 8.0, 'company_size': 'similar'},
            {'ev_revenue': 12.0, 'company_size': 'similar'},
            {'ev_revenue': 6.0, 'company_size': 'similar'},
            {'ev_revenue': 15.0, 'company_size': 'larger'},
            {'ev_revenue': 4.0, 'company_size': 'smaller'}
        ]
        
        result = calculate_comps_valuation(revenue, comps_data)
        
        # Should use only 'similar' sized companies
        similar_comps = [comp for comp in comps_data if comp['company_size'] == 'similar']
        expected_multiple = sum(comp['ev_revenue'] for comp in similar_comps) / len(similar_comps)
        expected_valuation = revenue * expected_multiple
        
        assert result['valuation'] == pytest.approx(expected_valuation, rel=1e-6)
        assert result['method'] == 'comps'
        assert result['confidence'] == 'medium'
        assert len(result['comps_used']) == 3  # Only similar sized companies
    
    def test_comps_valuation_no_similar_comps(self):
        """Test comparables valuation when no similar companies exist"""
        revenue = 2000000
        comps_data = [
            {'ev_revenue': 15.0, 'company_size': 'larger'},
            {'ev_revenue': 4.0, 'company_size': 'smaller'}
        ]
        
        result = calculate_comps_valuation(revenue, comps_data)
        
        # Should use all comps when no similar ones exist
        expected_multiple = sum(comp['ev_revenue'] for comp in comps_data) / len(comps_data)
        expected_valuation = revenue * expected_multiple
        
        assert result['valuation'] == pytest.approx(expected_valuation, rel=1e-6)
        assert result['confidence'] == 'low'  # Lower confidence when no similar comps
    
    def test_berkus_valuation(self):
        """Test Berkus method valuation calculation"""
        # Test data
        berkus_criteria = {
            'prototype': True,
            'quality_team': True,
            'quality_board': False,
            'sales_traction': True,
            'strategic_relationships': False
        }
        
        result = calculate_berkus_valuation(berkus_criteria)
        
        # Each true criterion adds $500K
        expected_valuation = sum(500000 for value in berkus_criteria.values() if value)
        
        assert result['valuation'] == expected_valuation
        assert result['method'] == 'berkus'
        assert result['confidence'] == 'medium'
        assert result['criteria_met'] == 3  # 3 out of 5 criteria met
    
    def test_berkus_valuation_all_criteria(self):
        """Test Berkus method with all criteria met"""
        berkus_criteria = {key: True for key in ['prototype', 'quality_team', 'quality_board', 'sales_traction', 'strategic_relationships']}
        
        result = calculate_berkus_valuation(berkus_criteria)
        
        assert result['valuation'] == 2500000  # 5 * $500K
        assert result['criteria_met'] == 5
        assert result['confidence'] == 'high'
    
    def test_rfs_valuation(self):
        """Test Risk Factor Summation valuation"""
        # Test data
        base_valuation = 1000000  # $1M base
        risk_factors = {
            'management': -2,  # -$200K
            'stage_of_business': -1,  # -$100K
            'capital_raising_history': 0,  # No adjustment
            'manufacturing_risk': 1,  # +$100K
            'sales_and_marketing': -1,  # -$100K
            'funding_cash_burn': -2,  # -$200K
            'competition': 0,  # No adjustment
            'technology': 1,  # +$100K
            'litigation': 0,  # No adjustment
            'international': 0,  # No adjustment
            'reputational': 0,  # No adjustment
            'exit_likelihood': -1  # -$100K
        }
        
        result = calculate_rfs_valuation(base_valuation, risk_factors)
        
        # Expected: base + sum of risk adjustments
        total_adjustment = sum(risk_factors.values()) * 100000  # Each point = $100K
        expected_valuation = base_valuation + total_adjustment
        
        assert result['valuation'] == expected_valuation
        assert result['method'] == 'rfs'
        assert result['confidence'] == 'medium'
        assert result['total_adjustment'] == total_adjustment
        assert result['risk_score'] == sum(risk_factors.values())
    
    def test_rfs_valuation_extreme_risks(self):
        """Test RFS with extreme risk factors"""
        base_valuation = 1000000
        extreme_risks = {key: -5 for key in [
            'management', 'stage_of_business', 'capital_raising_history', 'manufacturing_risk',
            'sales_and_marketing', 'funding_cash_burn', 'competition', 'technology',
            'litigation', 'international', 'reputational', 'exit_likelihood'
        ]}
        
        result = calculate_rfs_valuation(base_valuation, extreme_risks)
        
        # Should not go below zero
        assert result['valuation'] >= 0
        assert result['confidence'] == 'low'
    
    def test_valuation_engine_integration(self):
        """Test integration of multiple valuation methods"""
        # This would test the main orchestration function
        # For now, we'll test that all methods return consistent structure
        methods = [
            calculate_scorecard_valuation(1000000, {'team': 0.8, 'market': 0.7, 'product': 0.9, 'traction': 0.6, 'financials': 0.8}),
            calculate_vc_method_valuation(50000000, 0.25, 5, 2000000),
            calculate_comps_valuation(2000000, [{'ev_revenue': 8.0, 'company_size': 'similar'}]),
            calculate_berkus_valuation({'prototype': True, 'quality_team': True, 'quality_board': False, 'sales_traction': True, 'strategic_relationships': False}),
            calculate_rfs_valuation(1000000, {'management': 0, 'stage_of_business': 0, 'capital_raising_history': 0, 'manufacturing_risk': 0, 'sales_and_marketing': 0, 'funding_cash_burn': 0, 'competition': 0, 'technology': 0, 'litigation': 0, 'international': 0, 'reputational': 0, 'exit_likelihood': 0})
        ]
        
        for result in methods:
            assert 'valuation' in result
            assert 'method' in result
            assert 'confidence' in result
            assert 'notes' in result
            assert isinstance(result['valuation'], (int, float))
            assert result['valuation'] >= 0
            assert result['confidence'] in ['low', 'medium', 'high']
    
    @patch('apps.workers.valuation_engine.logging')
    def test_valuation_engine_logging(self, mock_logging):
        """Test that valuation engine logs appropriately"""
        calculate_scorecard_valuation(1000000, {'team': 0.8, 'market': 0.7, 'product': 0.9, 'traction': 0.6, 'financials': 0.8})
        
        # Verify that logging was called
        mock_logging.info.assert_called()
    
    def test_valuation_engine_error_handling(self):
        """Test error handling in valuation engine"""
        # Test with invalid inputs
        with pytest.raises(ValueError):
            calculate_scorecard_valuation(-1000000, {'team': 0.8, 'market': 0.7, 'product': 0.9, 'traction': 0.6, 'financials': 0.8})
        
        with pytest.raises(ValueError):
            calculate_vc_method_valuation(50000000, -0.25, 5, 2000000)  # Negative IRR
        
        with pytest.raises(ValueError):
            calculate_comps_valuation(2000000, [])  # Empty comps list
