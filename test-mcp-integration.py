#!/usr/bin/env python3
"""
Test script for MCP integration with Python decision letter parser.
"""

import sys
import os

# Add refinery-python to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'refinery-python'))

# Set environment variables for testing
os.environ['MCP_ENABLED'] = 'true'
os.environ['MCP_SERVER_URL'] = 'http://localhost:3001'
os.environ['ENABLE_LAYMAN_TRANSLATION'] = 'false'  # Disable translation for faster testing

import pymupdf4llm
from services.simple_parser import parse_va_decision_letter_simple

def test_mcp_integration():
    """Test MCP integration with a sample decision letter."""
    
    print("=" * 80)
    print("MCP INTEGRATION TEST")
    print("=" * 80)
    
    # Test with PTSD denial PDF
    pdf_path = '_test-data/decisions/_ptsd-denial.pdf'
    
    if not os.path.exists(pdf_path):
        print(f"❌ Test PDF not found: {pdf_path}")
        return
    
    print(f"\n📄 Processing: {pdf_path}")
    print("-" * 80)
    
    # Convert PDF to markdown
    print("\n1️⃣  Converting PDF to markdown...")
    markdown_text = pymupdf4llm.to_markdown(pdf_path)
    print(f"   ✅ Extracted {len(markdown_text)} characters")
    
    # Parse with MCP enhancement
    print("\n2️⃣  Parsing decision letter with MCP enhancement...")
    result = parse_va_decision_letter_simple(markdown_text, translate_denials=False)
    
    # Display results
    print("\n" + "=" * 80)
    print("RESULTS")
    print("=" * 80)
    
    print(f"\n📊 Conditions Found: {len(result['conditions'])}")
    for condition in result['conditions']:
        print(f"   - {condition['condition']}: {condition['decision']} ({condition['ratingPercentage']}%)")
    
    print(f"\n❌ Denial Reasons: {len(result['denialReasons'])}")
    for denial in result['denialReasons']:
        print(f"\n   Condition: {denial['condition']}")
        print(f"   Reason: {denial['reason'][:100]}...")
        
        # Check for MCP analysis
        if 'mcpAnalysis' in denial:
            mcp = denial['mcpAnalysis']
            print(f"   🔍 MCP Analysis:")
            print(f"      - Category: {mcp.get('denialCategory', 'N/A')}")
            print(f"      - Evidence Needed: {len(mcp.get('evidenceNeeded', []))} items")
            print(f"      - Regulations: {len(mcp.get('relevantRegulations', []))} found")
            print(f"      - CFR References: {mcp.get('cfrReferences', [])}")
        else:
            print(f"   ⚠️  No MCP analysis available")
    
    print(f"\n⏸️  Deferred Reasons: {len(result.get('deferredReasons', []))}")
    
    print(f"\n💯 Combined Rating: {result.get('combinedRating', 0)}%")
    print(f"💰 Monthly Payment: ${result.get('monthlyPayment', 0)}")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_mcp_integration()

