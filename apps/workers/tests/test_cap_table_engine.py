# Created automatically by Cursor AI (2024-12-19)

import pytest
import math
from unittest.mock import patch, MagicMock
from apps.workers.cap_table_engine import (
    create_default_cap_table,
    calculate_cap_table_changes,
    generate_waterfall_analysis,
    calculate_waterfall_for_exit,
    get_liquidation_priority,
    calculate_cap_table_metrics
)

class TestCapTableEngine:
    """Unit tests for cap table engine functions"""
    
    def test_create_default_cap_table(self):
        """Test creation of default cap table"""
        cap_table = create_default_cap_table()
        
        assert isinstance(cap_table, list)
        assert len(cap_table) > 0
        
        # Check structure of each entry
        for entry in cap_table:
            assert 'holder' in entry
            assert 'shares' in entry
            assert 'ownership_percentage' in entry
            assert 'share_type' in entry
            assert 'liquidation_preference' in entry
            assert entry['shares'] > 0
            assert 0 <= entry['ownership_percentage'] <= 100
        
        # Check total ownership equals 100%
        total_ownership = sum(entry['ownership_percentage'] for entry in cap_table)
        assert total_ownership == pytest.approx(100.0, rel=1e-6)
    
    def test_calculate_cap_table_changes_basic(self):
        """Test basic cap table changes calculation"""
        # Pre-investment cap table
        pre_investment = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Employee Pool', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'common', 'liquidation_preference': 1.0}
        ]
        
        # Investment parameters
        investment_amount = 2000000  # $2M
        pre_money_valuation = 8000000  # $8M
        new_investor_ownership = 20.0  # 20%
        option_pool_expansion = 10.0  # 10%
        
        result = calculate_cap_table_changes(
            pre_investment, investment_amount, pre_money_valuation, 
            new_investor_ownership, option_pool_expansion
        )
        
        assert 'post_investment' in result
        assert 'changes' in result
        assert 'metrics' in result
        
        post_investment = result['post_investment']
        
        # Check that total ownership still equals 100%
        total_ownership = sum(entry['ownership_percentage'] for entry in post_investment)
        assert total_ownership == pytest.approx(100.0, rel=1e-6)
        
        # Check that new investor has correct ownership
        new_investor = next(entry for entry in post_investment if entry['holder'] == 'New Investor')
        assert new_investor['ownership_percentage'] == pytest.approx(new_investor_ownership, rel=1e-6)
        
        # Check that option pool was expanded
        option_pool = next(entry for entry in post_investment if entry['holder'] == 'Employee Pool')
        assert option_pool['ownership_percentage'] > 20.0  # Should be higher due to expansion
    
    def test_calculate_cap_table_changes_no_expansion(self):
        """Test cap table changes without option pool expansion"""
        pre_investment = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Employee Pool', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'common', 'liquidation_preference': 1.0}
        ]
        
        result = calculate_cap_table_changes(
            pre_investment, 2000000, 8000000, 20.0, 0.0
        )
        
        post_investment = result['post_investment']
        
        # Option pool should remain the same size
        option_pool = next(entry for entry in post_investment if entry['holder'] == 'Employee Pool')
        assert option_pool['ownership_percentage'] == pytest.approx(16.0, rel=1e-6)  # 20% * 0.8 (diluted)
    
    def test_calculate_cap_table_changes_preferred_shares(self):
        """Test cap table changes with preferred shares"""
        pre_investment = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Employee Pool', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'common', 'liquidation_preference': 1.0}
        ]
        
        result = calculate_cap_table_changes(
            pre_investment, 2000000, 8000000, 20.0, 0.0, 
            share_type='preferred', liquidation_preference=1.5
        )
        
        post_investment = result['post_investment']
        new_investor = next(entry for entry in post_investment if entry['holder'] == 'New Investor')
        
        assert new_investor['share_type'] == 'preferred'
        assert new_investor['liquidation_preference'] == 1.5
    
    def test_generate_waterfall_analysis(self):
        """Test waterfall analysis generation"""
        cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Investor', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'preferred', 'liquidation_preference': 1.5}
        ]
        
        result = generate_waterfall_analysis(cap_table)
        
        assert 'waterfall' in result
        assert 'exit_scenarios' in result
        
        waterfall = result['waterfall']
        assert isinstance(waterfall, dict)
        
        # Check that we have multiple exit scenarios
        assert len(waterfall) > 1
        
        # Check structure of each exit scenario
        for exit_value, payouts in waterfall.items():
            assert isinstance(exit_value, (int, float))
            assert isinstance(payouts, dict)
            
            # Check that all holders are accounted for
            for holder in cap_table:
                assert holder['holder'] in payouts
                assert payouts[holder['holder']] >= 0
    
    def test_calculate_waterfall_for_exit(self):
        """Test single exit scenario calculation"""
        cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Investor', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'preferred', 'liquidation_preference': 1.5}
        ]
        
        exit_value = 10000000  # $10M exit
        
        payouts = calculate_waterfall_for_exit(cap_table, exit_value)
        
        assert isinstance(payouts, dict)
        assert 'Founder' in payouts
        assert 'Investor' in payouts
        
        # Check that total payouts equal exit value
        total_payouts = sum(payouts.values())
        assert total_payouts == pytest.approx(exit_value, rel=1e-6)
        
        # Check that preferred shares get liquidation preference
        investor_payout = payouts['Investor']
        investor_shares = next(entry['shares'] for entry in cap_table if entry['holder'] == 'Investor')
        total_shares = sum(entry['shares'] for entry in cap_table)
        
        # Preferred shares should get at least their liquidation preference
        expected_min_payout = (investor_shares / total_shares) * exit_value * 1.5
        assert investor_payout >= expected_min_payout
    
    def test_get_liquidation_priority(self):
        """Test liquidation priority ordering"""
        cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Series A', 'shares': 1500000, 'ownership_percentage': 15.0, 'share_type': 'preferred', 'liquidation_preference': 1.5},
            {'holder': 'Series B', 'shares': 500000, 'ownership_percentage': 5.0, 'share_type': 'preferred', 'liquidation_preference': 2.0}
        ]
        
        priority_order = get_liquidation_priority(cap_table)
        
        # Series B should have highest priority (highest liquidation preference)
        assert priority_order[0]['holder'] == 'Series B'
        # Series A should be second
        assert priority_order[1]['holder'] == 'Series A'
        # Common shares should be last
        assert priority_order[2]['holder'] == 'Founder'
    
    def test_calculate_cap_table_metrics(self):
        """Test cap table metrics calculation"""
        cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Investor', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'preferred', 'liquidation_preference': 1.5}
        ]
        
        metrics = calculate_cap_table_metrics(cap_table)
        
        assert 'ownership_distribution' in metrics
        assert 'dilution_analysis' in metrics
        assert 'valuation_metrics' in metrics
        
        ownership_dist = metrics['ownership_distribution']
        assert ownership_dist['total_shares'] == 10000000
        assert ownership_dist['common_shares'] == 8000000
        assert ownership_dist['preferred_shares'] == 2000000
        
        dilution_analysis = metrics['dilution_analysis']
        assert 'founder_dilution' in dilution_analysis
        assert 'investor_dilution' in dilution_analysis
    
    def test_cap_table_engine_integration(self):
        """Test integration of cap table engine functions"""
        # Create default cap table
        cap_table = create_default_cap_table()
        
        # Calculate changes
        changes_result = calculate_cap_table_changes(
            cap_table, 2000000, 8000000, 20.0, 10.0
        )
        
        # Generate waterfall analysis
        waterfall_result = generate_waterfall_analysis(changes_result['post_investment'])
        
        # Calculate metrics
        metrics = calculate_cap_table_metrics(changes_result['post_investment'])
        
        # Verify all results have expected structure
        assert 'post_investment' in changes_result
        assert 'waterfall' in waterfall_result
        assert 'ownership_distribution' in metrics
    
    def test_cap_table_engine_edge_cases(self):
        """Test cap table engine with edge cases"""
        # Test with zero investment
        cap_table = create_default_cap_table()
        result = calculate_cap_table_changes(cap_table, 0, 8000000, 0.0, 0.0)
        
        # Should return same cap table
        assert result['post_investment'] == cap_table
        
        # Test with very large investment
        result = calculate_cap_table_changes(cap_table, 100000000, 8000000, 90.0, 0.0)
        post_investment = result['post_investment']
        
        # New investor should have 90% ownership
        new_investor = next(entry for entry in post_investment if entry['holder'] == 'New Investor')
        assert new_investor['ownership_percentage'] == pytest.approx(90.0, rel=1e-6)
    
    def test_cap_table_engine_error_handling(self):
        """Test error handling in cap table engine"""
        # Test with invalid cap table
        with pytest.raises(ValueError):
            calculate_cap_table_changes([], 2000000, 8000000, 20.0, 0.0)
        
        # Test with invalid ownership percentages
        invalid_cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 120.0, 'share_type': 'common', 'liquidation_preference': 1.0}
        ]
        
        with pytest.raises(ValueError):
            calculate_cap_table_changes(invalid_cap_table, 2000000, 8000000, 20.0, 0.0)
        
        # Test with negative investment amount
        cap_table = create_default_cap_table()
        with pytest.raises(ValueError):
            calculate_cap_table_changes(cap_table, -2000000, 8000000, 20.0, 0.0)
    
    @patch('apps.workers.cap_table_engine.logging')
    def test_cap_table_engine_logging(self, mock_logging):
        """Test that cap table engine logs appropriately"""
        cap_table = create_default_cap_table()
        calculate_cap_table_changes(cap_table, 2000000, 8000000, 20.0, 0.0)
        
        # Verify that logging was called
        mock_logging.info.assert_called()
    
    def test_waterfall_analysis_edge_cases(self):
        """Test waterfall analysis with edge cases"""
        cap_table = [
            {'holder': 'Founder', 'shares': 8000000, 'ownership_percentage': 80.0, 'share_type': 'common', 'liquidation_preference': 1.0},
            {'holder': 'Investor', 'shares': 2000000, 'ownership_percentage': 20.0, 'share_type': 'preferred', 'liquidation_preference': 1.5}
        ]
        
        # Test with zero exit value
        payouts = calculate_waterfall_for_exit(cap_table, 0)
        assert all(payout == 0 for payout in payouts.values())
        
        # Test with very large exit value
        large_exit = 1000000000  # $1B
        payouts = calculate_waterfall_for_exit(cap_table, large_exit)
        total_payouts = sum(payouts.values())
        assert total_payouts == large_exit
