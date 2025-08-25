# Created automatically by Cursor AI (2024-12-19)

import os
import json
import zipfile
import tempfile
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
from celery import shared_task
from pydantic import BaseModel, Field
import pandas as pd
from minio import Minio
from minio.error import S3Error
import httpx
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
import markdown
import io

class ExportBundle(BaseModel):
    """Export bundle configuration"""
    pitch_id: str
    memo_content: Optional[str] = None
    valuation_data: Optional[Dict] = None
    term_sheet_data: Optional[Dict] = None
    cap_table_data: Optional[Dict] = None
    risk_assessment: Optional[Dict] = None
    panel_transcript: Optional[str] = None
    decision_summary: Optional[Dict] = None
    include_pdf: bool = True
    include_csv: bool = True
    include_zip: bool = True
    retention_days: int = 365

class ExportResult(BaseModel):
    """Export result with signed URLs"""
    bundle_id: str
    files: Dict[str, str]  # file_type -> signed_url
    expires_at: datetime
    total_size_bytes: int
    file_count: int

@shared_task(bind=True, name="generate_export_bundle")
def generate_export_bundle(self, bundle_config: Dict) -> Dict:
    """
    Generate comprehensive export bundle with all pitch analysis artifacts
    
    Args:
        bundle_config: ExportBundle configuration
        
    Returns:
        ExportResult with signed URLs for all generated files
    """
    try:
        config = ExportBundle(**bundle_config)
        bundle_id = f"export_{config.pitch_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Create temporary directory for file generation
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            files_generated = {}
            
            # Generate individual files
            if config.memo_content:
                files_generated.update(
                    generate_memo_files(temp_path, config.memo_content, bundle_id)
                )
            
            if config.valuation_data:
                files_generated.update(
                    generate_valuation_files(temp_path, config.valuation_data, bundle_id)
                )
            
            if config.term_sheet_data:
                files_generated.update(
                    generate_term_sheet_files(temp_path, config.term_sheet_data, bundle_id)
                )
            
            if config.cap_table_data:
                files_generated.update(
                    generate_cap_table_files(temp_path, config.cap_table_data, bundle_id)
                )
            
            if config.risk_assessment:
                files_generated.update(
                    generate_risk_files(temp_path, config.risk_assessment, bundle_id)
                )
            
            if config.panel_transcript:
                files_generated.update(
                    generate_panel_files(temp_path, config.panel_transcript, bundle_id)
                )
            
            if config.decision_summary:
                files_generated.update(
                    generate_decision_files(temp_path, config.decision_summary, bundle_id)
                )
            
            # Create ZIP bundle if requested
            if config.include_zip and files_generated:
                zip_path = create_zip_bundle(temp_path, files_generated, bundle_id)
                files_generated['bundle.zip'] = str(zip_path)
            
            # Upload to object storage and generate signed URLs
            signed_urls = upload_and_sign_files(files_generated, bundle_id, config.retention_days)
            
            # Calculate total size
            total_size = sum(
                Path(file_path).stat().st_size 
                for file_path in files_generated.values()
            )
            
            return ExportResult(
                bundle_id=bundle_id,
                files=signed_urls,
                expires_at=datetime.now() + timedelta(days=config.retention_days),
                total_size_bytes=total_size,
                file_count=len(files_generated)
            ).dict()
            
    except Exception as e:
        self.retry(countdown=60, max_retries=3)
        raise

def generate_memo_files(temp_path: Path, memo_content: str, bundle_id: str) -> Dict[str, str]:
    """Generate memo files (MD and PDF)"""
    files = {}
    
    # Markdown file
    md_path = temp_path / f"{bundle_id}_memo.md"
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write(memo_content)
    files['memo.md'] = str(md_path)
    
    # PDF file
    pdf_path = temp_path / f"{bundle_id}_memo.pdf"
    create_pdf_from_markdown(memo_content, pdf_path)
    files['memo.pdf'] = str(pdf_path)
    
    return files

def generate_valuation_files(temp_path: Path, valuation_data: Dict, bundle_id: str) -> Dict[str, str]:
    """Generate valuation analysis files"""
    files = {}
    
    # CSV with all valuation methods
    csv_path = temp_path / f"{bundle_id}_valuations.csv"
    create_valuation_csv(valuation_data, csv_path)
    files['valuations.csv'] = str(csv_path)
    
    # JSON with detailed data
    json_path = temp_path / f"{bundle_id}_valuations.json"
    with open(json_path, 'w') as f:
        json.dump(valuation_data, f, indent=2, default=str)
    files['valuations.json'] = str(json_path)
    
    # Summary PDF
    pdf_path = temp_path / f"{bundle_id}_valuation_summary.pdf"
    create_valuation_pdf(valuation_data, pdf_path)
    files['valuation_summary.pdf'] = str(pdf_path)
    
    return files

def generate_term_sheet_files(temp_path: Path, term_sheet_data: Dict, bundle_id: str) -> Dict[str, str]:
    """Generate term sheet files"""
    files = {}
    
    # JSON data
    json_path = temp_path / f"{bundle_id}_term_sheet.json"
    with open(json_path, 'w') as f:
        json.dump(term_sheet_data, f, indent=2, default=str)
    files['term_sheet.json'] = str(json_path)
    
    # PDF term sheet
    pdf_path = temp_path / f"{bundle_id}_term_sheet.pdf"
    create_term_sheet_pdf(term_sheet_data, pdf_path)
    files['term_sheet.pdf'] = str(pdf_path)
    
    return files

def generate_cap_table_files(temp_path: Path, cap_table_data: Dict, bundle_id: str) -> Dict[str, str]:
    """Generate cap table analysis files"""
    files = {}
    
    # Pre-investment CSV
    if 'pre_investment' in cap_table_data:
        pre_csv_path = temp_path / f"{bundle_id}_cap_table_pre.csv"
        create_cap_table_csv(cap_table_data['pre_investment'], pre_csv_path)
        files['cap_table_pre.csv'] = str(pre_csv_path)
    
    # Post-investment CSV
    if 'post_investment' in cap_table_data:
        post_csv_path = temp_path / f"{bundle_id}_cap_table_post.csv"
        create_cap_table_csv(cap_table_data['post_investment'], post_csv_path)
        files['cap_table_post.csv'] = str(post_csv_path)
    
    # Waterfall analysis CSV
    if 'waterfall' in cap_table_data:
        waterfall_csv_path = temp_path / f"{bundle_id}_waterfall.csv"
        create_waterfall_csv(cap_table_data['waterfall'], waterfall_csv_path)
        files['waterfall.csv'] = str(waterfall_csv_path)
    
    # Summary JSON
    json_path = temp_path / f"{bundle_id}_cap_table.json"
    with open(json_path, 'w') as f:
        json.dump(cap_table_data, f, indent=2, default=str)
    files['cap_table.json'] = str(json_path)
    
    return files

def generate_risk_files(temp_path: Path, risk_data: Dict, bundle_id: str) -> Dict[str, str]:
    """Generate risk assessment files"""
    files = {}
    
    # CSV export
    csv_path = temp_path / f"{bundle_id}_risks.csv"
    create_risk_csv(risk_data, csv_path)
    files['risks.csv'] = str(csv_path)
    
    # JSON data
    json_path = temp_path / f"{bundle_id}_risks.json"
    with open(json_path, 'w') as f:
        json.dump(risk_data, f, indent=2, default=str)
    files['risks.json'] = str(json_path)
    
    return files

def generate_panel_files(temp_path: Path, transcript: str, bundle_id: str) -> Dict[str, str]:
    """Generate panel simulation files"""
    files = {}
    
    # Text transcript
    txt_path = temp_path / f"{bundle_id}_panel_transcript.txt"
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(transcript)
    files['panel_transcript.txt'] = str(txt_path)
    
    return files

def generate_decision_files(temp_path: Path, decision_data: Dict, bundle_id: str) -> Dict[str, str]:
    """Generate decision summary files"""
    files = {}
    
    # JSON data
    json_path = temp_path / f"{bundle_id}_decision.json"
    with open(json_path, 'w') as f:
        json.dump(decision_data, f, indent=2, default=str)
    files['decision.json'] = str(json_path)
    
    # Summary PDF
    pdf_path = temp_path / f"{bundle_id}_decision_summary.pdf"
    create_decision_pdf(decision_data, pdf_path)
    files['decision_summary.pdf'] = str(pdf_path)
    
    return files

def create_zip_bundle(temp_path: Path, files: Dict[str, str], bundle_id: str) -> Path:
    """Create ZIP bundle of all generated files"""
    zip_path = temp_path / f"{bundle_id}_bundle.zip"
    
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for file_type, file_path in files.items():
            if Path(file_path).exists():
                zipf.write(file_path, file_type)
    
    return zip_path

def upload_and_sign_files(files: Dict[str, str], bundle_id: str, retention_days: int) -> Dict[str, str]:
    """Upload files to object storage and generate signed URLs"""
    signed_urls = {}
    
    # Initialize MinIO client
    minio_client = Minio(
        os.getenv('MINIO_ENDPOINT', 'localhost:9000'),
        access_key=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
        secret_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
        secure=False  # Set to True for HTTPS
    )
    
    bucket_name = 'exports'
    
    # Ensure bucket exists
    try:
        minio_client.make_bucket(bucket_name)
    except S3Error as e:
        if e.code != 'BucketAlreadyOwnedByYou':
            raise
    
    # Upload files and generate signed URLs
    for file_type, file_path in files.items():
        if Path(file_path).exists():
            object_name = f"{bundle_id}/{file_type}"
            
            # Upload file
            minio_client.fput_object(
                bucket_name, 
                object_name, 
                file_path,
                content_type=get_content_type(file_type)
            )
            
            # Generate signed URL
            signed_url = minio_client.presigned_get_object(
                bucket_name,
                object_name,
                expires=timedelta(days=retention_days)
            )
            
            signed_urls[file_type] = signed_url
    
    return signed_urls

def get_content_type(file_type: str) -> str:
    """Get MIME content type for file extension"""
    content_types = {
        '.pdf': 'application/pdf',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.md': 'text/markdown',
        '.txt': 'text/plain',
        '.zip': 'application/zip'
    }
    
    ext = Path(file_type).suffix.lower()
    return content_types.get(ext, 'application/octet-stream')

def create_pdf_from_markdown(markdown_content: str, output_path: Path):
    """Convert markdown content to PDF"""
    # Convert markdown to HTML
    html_content = markdown.markdown(markdown_content)
    
    # Create PDF
    doc = SimpleDocTemplate(str(output_path), pagesize=A4)
    styles = getSampleStyleSheet()
    story = []
    
    # Convert HTML to PDF elements (simplified)
    paragraphs = html_content.split('\n\n')
    for para in paragraphs:
        if para.strip():
            story.append(Paragraph(para.strip(), styles['Normal']))
            story.append(Spacer(1, 12))
    
    doc.build(story)

def create_valuation_csv(valuation_data: Dict, output_path: Path):
    """Create CSV file from valuation data"""
    rows = []
    
    for method, data in valuation_data.items():
        if isinstance(data, dict) and 'valuation' in data:
            rows.append({
                'Method': method,
                'Valuation': data['valuation'],
                'Confidence': data.get('confidence', ''),
                'Notes': data.get('notes', '')
            })
    
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)

def create_valuation_pdf(valuation_data: Dict, output_path: Path):
    """Create PDF summary of valuations"""
    doc = SimpleDocTemplate(str(output_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    story.append(Paragraph("Valuation Analysis Summary", title_style))
    
    # Valuation table
    data = [['Method', 'Valuation', 'Confidence', 'Notes']]
    for method, val_data in valuation_data.items():
        if isinstance(val_data, dict) and 'valuation' in val_data:
            data.append([
                method,
                f"${val_data['valuation']:,.0f}",
                str(val_data.get('confidence', '')),
                str(val_data.get('notes', ''))
            ])
    
    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(table)
    doc.build(story)

def create_term_sheet_pdf(term_sheet_data: Dict, output_path: Path):
    """Create PDF term sheet"""
    doc = SimpleDocTemplate(str(output_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    story.append(Paragraph(f"{term_sheet_data.get('instrument_type', 'Investment')} Term Sheet", title_style))
    
    # Basic info
    story.append(Paragraph(f"Company: {term_sheet_data.get('company_name', '')}", styles['Normal']))
    story.append(Paragraph(f"Investor: {term_sheet_data.get('investor_name', '')}", styles['Normal']))
    story.append(Paragraph(f"Investment Amount: ${term_sheet_data.get('investment_amount', 0):,.0f}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    doc.build(story)

def create_cap_table_csv(cap_table_data: List[Dict], output_path: Path):
    """Create CSV from cap table data"""
    df = pd.DataFrame(cap_table_data)
    df.to_csv(output_path, index=False)

def create_waterfall_csv(waterfall_data: Dict, output_path: Path):
    """Create CSV from waterfall analysis"""
    rows = []
    for exit_value, payouts in waterfall_data.items():
        for holder, payout in payouts.items():
            rows.append({
                'Exit Value': exit_value,
                'Holder': holder,
                'Payout': payout
            })
    
    df = pd.DataFrame(rows)
    df.to_csv(output_path, index=False)

def create_risk_csv(risk_data: Dict, output_path: Path):
    """Create CSV from risk assessment"""
    risks = risk_data.get('risks', [])
    df = pd.DataFrame(risks)
    df.to_csv(output_path, index=False)

def create_decision_pdf(decision_data: Dict, output_path: Path):
    """Create PDF decision summary"""
    doc = SimpleDocTemplate(str(output_path), pagesize=letter)
    styles = getSampleStyleSheet()
    story = []
    
    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    story.append(Paragraph("Investment Decision Summary", title_style))
    
    # Decision details
    story.append(Paragraph(f"Recommendation: {decision_data.get('recommendation', '')}", styles['Normal']))
    story.append(Paragraph(f"Check Size: ${decision_data.get('check_size', 0):,.0f}", styles['Normal']))
    story.append(Paragraph(f"Confidence: {decision_data.get('confidence', '')}", styles['Normal']))
    story.append(Spacer(1, 20))
    
    doc.build(story)

@shared_task(name="cleanup_expired_exports")
def cleanup_expired_exports() -> Dict:
    """Clean up expired export files from object storage"""
    try:
        minio_client = Minio(
            os.getenv('MINIO_ENDPOINT', 'localhost:9000'),
            access_key=os.getenv('MINIO_ACCESS_KEY', 'minioadmin'),
            secret_key=os.getenv('MINIO_SECRET_KEY', 'minioadmin'),
            secure=False
        )
        
        bucket_name = 'exports'
        cutoff_date = datetime.now() - timedelta(days=365)  # Default retention
        deleted_count = 0
        
        # List and delete expired objects
        objects = minio_client.list_objects(bucket_name, recursive=True)
        for obj in objects:
            if obj.last_modified < cutoff_date:
                minio_client.remove_object(bucket_name, obj.object_name)
                deleted_count += 1
        
        return {
            'deleted_count': deleted_count,
            'cutoff_date': cutoff_date.isoformat(),
            'status': 'completed'
        }
        
    except Exception as e:
        return {
            'error': str(e),
            'status': 'failed'
        }

@shared_task(name="audit_export_activity")
def audit_export_activity(pitch_id: str, user_id: str, action: str) -> Dict:
    """Audit export activity for compliance and tracking"""
    audit_record = {
        'timestamp': datetime.now().isoformat(),
        'pitch_id': pitch_id,
        'user_id': user_id,
        'action': action,
        'ip_address': 'tracked_via_middleware',
        'user_agent': 'tracked_via_middleware'
    }
    
    # In a real implementation, this would be stored in a database
    # For now, we'll just return the audit record
    return audit_record
