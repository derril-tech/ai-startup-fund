# Data Retention Policy - Operational Runbook

## Overview
This document defines the data retention policies for the AI Startup Fund platform to ensure compliance with regulations, optimize storage costs, and maintain data security.

## Data Classification

### 1. User Data
- **Personal Information**: Names, emails, contact details
- **Authentication Data**: Passwords (hashed), session tokens
- **Usage Data**: Login history, feature usage, preferences
- **Retention**: 7 years after account deactivation

### 2. Pitch Data
- **Pitch Documents**: PDFs, presentations, business plans
- **KPI Data**: Financial metrics, growth data, customer metrics
- **Analysis Results**: Valuations, risk assessments, panel simulations
- **Retention**: 10 years after pitch creation

### 3. Financial Data
- **Investment Decisions**: Term sheets, cap tables, valuations
- **Transaction Records**: Payment history, fee calculations
- **Compliance Data**: Regulatory filings, audit trails
- **Retention**: 10 years after transaction completion

### 4. System Data
- **Logs**: Application logs, access logs, error logs
- **Metrics**: Performance data, usage statistics
- **Backups**: Database backups, file backups
- **Retention**: 3 years for logs, 1 year for metrics, 30 days for backups

## Retention Schedule

### Immediate Deletion (< 30 days)
- Temporary files and caches
- Session data
- Failed upload attempts
- Debug logs

### Short-term Retention (30 days - 1 year)
- Application logs
- Performance metrics
- Backup files
- Temporary exports

### Medium-term Retention (1-5 years)
- User activity logs
- System metrics
- Audit trails
- Compliance documentation

### Long-term Retention (5-10 years)
- Pitch documents and analysis
- Investment decisions
- Financial records
- Legal documents

### Permanent Retention
- Company formation documents
- Regulatory licenses
- Tax records (as required by law)

## Data Storage Tiers

### Hot Storage (Frequently Accessed)
- **Duration**: 0-90 days
- **Storage Type**: SSD, high-performance
- **Cost**: High
- **Examples**: Recent pitches, active user data

### Warm Storage (Occasionally Accessed)
- **Duration**: 90 days - 2 years
- **Storage Type**: Standard storage
- **Cost**: Medium
- **Examples**: Historical pitches, user activity

### Cold Storage (Rarely Accessed)
- **Duration**: 2-10 years
- **Storage Type**: Archive storage
- **Cost**: Low
- **Examples**: Old exports, compliance data

### Deep Archive (Compliance Only)
- **Duration**: 10+ years
- **Storage Type**: Glacier storage
- **Cost**: Minimal
- **Examples**: Legal documents, tax records

## Data Deletion Process

### Automatic Deletion
```python
# Example retention job
def cleanup_expired_data():
    # Delete expired exports
    delete_expired_exports(retention_days=365)
    
    # Archive old pitches
    archive_old_pitches(retention_days=1825)  # 5 years
    
    # Clean up old logs
    cleanup_old_logs(retention_days=1095)  # 3 years
    
    # Delete temporary files
    cleanup_temp_files(retention_days=30)
```

### Manual Deletion
- **User Request**: Data deletion upon user request
- **Legal Request**: Compliance with legal orders
- **Business Decision**: Strategic data cleanup

### Deletion Verification
- **Automated Checks**: Verify deletion completion
- **Audit Trail**: Log all deletion activities
- **Confirmation**: Send confirmation to stakeholders

## Compliance Requirements

### GDPR Compliance
- **Right to Erasure**: Honor user deletion requests
- **Data Portability**: Provide data export capability
- **Consent Management**: Track user consent
- **Retention Limits**: Respect stated retention periods

### Financial Regulations
- **SEC Requirements**: 7-year retention for financial records
- **SOX Compliance**: Audit trail preservation
- **Tax Requirements**: Tax record retention as per jurisdiction

### Industry Standards
- **SOC 2**: Security and availability controls
- **ISO 27001**: Information security management
- **PCI DSS**: Payment card data protection

## Data Security

### Encryption
- **At Rest**: AES-256 encryption for all stored data
- **In Transit**: TLS 1.3 for all data transmission
- **Key Management**: AWS KMS for encryption keys

### Access Controls
- **Role-Based Access**: RBAC for data access
- **Least Privilege**: Minimal required permissions
- **Audit Logging**: All access attempts logged

### Data Classification
- **Public**: Marketing materials, public reports
- **Internal**: Company documents, internal metrics
- **Confidential**: User data, financial information
- **Restricted**: Legal documents, security data

## Backup and Recovery

### Backup Strategy
- **Frequency**: Daily incremental, weekly full
- **Retention**: 30 days for daily, 1 year for weekly
- **Location**: Multi-region, disaster recovery site
- **Testing**: Monthly backup restoration tests

### Recovery Procedures
- **RTO (Recovery Time Objective)**: 4 hours
- **RPO (Recovery Point Objective)**: 1 hour
- **Escalation**: Automated alerts to on-call team

## Monitoring and Alerting

### Retention Monitoring
- **Storage Usage**: Monitor storage growth
- **Deletion Jobs**: Track automated cleanup success
- **Compliance**: Alert on retention violations

### Cost Optimization
- **Storage Costs**: Monthly cost analysis
- **Access Patterns**: Identify unused data
- **Optimization**: Move data to appropriate tiers

## Implementation

### Database Retention
```sql
-- Example retention policy for PostgreSQL
CREATE POLICY retention_policy ON pitches
    FOR DELETE
    USING (created_at < NOW() - INTERVAL '10 years');

-- Automated cleanup job
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete old exports
    DELETE FROM export_bundles 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Archive old pitches
    UPDATE pitches 
    SET archived = true 
    WHERE created_at < NOW() - INTERVAL '5 years';
    
    -- Clean up old logs
    DELETE FROM audit_logs 
    WHERE created_at < NOW() - INTERVAL '3 years';
END;
$$ LANGUAGE plpgsql;
```

### File Storage Retention
```python
# Example S3 lifecycle policy
{
    "Rules": [
        {
            "ID": "HotToWarm",
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 90,
                    "StorageClass": "STANDARD_IA"
                }
            ]
        },
        {
            "ID": "WarmToCold",
            "Status": "Enabled",
            "Transitions": [
                {
                    "Days": 730,
                    "StorageClass": "GLACIER"
                }
            ]
        },
        {
            "ID": "DeleteOld",
            "Status": "Enabled",
            "Expiration": {
                "Days": 3650
            }
        }
    ]
}
```

## Maintenance and Review

### Monthly Reviews
- **Storage Usage**: Analyze growth trends
- **Cost Analysis**: Review storage costs
- **Compliance Check**: Verify retention compliance

### Quarterly Reviews
- **Policy Updates**: Update retention policies
- **Technology Review**: Evaluate new storage options
- **Compliance Audit**: Internal compliance review

### Annual Reviews
- **Legal Review**: Legal compliance assessment
- **Policy Revision**: Major policy updates
- **Technology Migration**: Storage technology updates

## Contact Information

### Data Protection Officer
- **Email**: dpo@aistartupfund.com
- **Phone**: [DPO Contact Number]

### Legal Team
- **Email**: legal@aistartupfund.com
- **Phone**: [Legal Contact Number]

### Engineering Team
- **Email**: engineering@aistartupfund.com
- **Slack**: #data-retention

## Runbook Maintenance
- **Last Updated**: [Date]
- **Next Review**: [Date + 6 months]
- **Owner**: [Data Protection Officer]
- **Approver**: [CTO]
