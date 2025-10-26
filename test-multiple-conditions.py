#!/usr/bin/env python3
"""
Test script for multiple conditions with MCP integration.
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

def test_multiple_conditions():
    """Test MCP integration with multiple conditions."""
    
    print("=" * 80)
    print("MULTIPLE CONDITIONS MCP TEST")
    print("=" * 80)
    
    # Test with 10-conditions PDF
    pdf_path = '_test-data/decisions/_10-conditions-with-denial-and-deferral.pdf'
    
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
    for i, denial in enumerate(result['denialReasons'], 1):
        print(f"\n   {i}. Condition: {denial['condition']}")
        print(f"      Reason: {denial['reason'][:100]}...")
        
        # Check for MCP analysis
        if 'mcpAnalysis' in denial:
            mcp = denial['mcpAnalysis']
            print(f"      🔍 MCP Analysis:")
            print(f"         - Category: {mcp.get('denialCategory', 'N/A')}")
            print(f"         - Evidence Needed: {len(mcp.get('evidenceNeeded', []))} items")
            print(f"         - Regulations: {len(mcp.get('relevantRegulations', []))} found")
            if mcp.get('cfrReferences'):
                print(f"         - CFR References: {mcp['cfrReferences']}")
        else:
            print(f"      ⚠️  No MCP analysis available")
    
    print(f"\n⏸️  Deferred Reasons: {len(result.get('deferredReasons', []))}")
    for i, deferred in enumerate(result.get('deferredReasons', []), 1):
        print(f"   {i}. {deferred['condition']}: {deferred['reason'][:80]}...")
    
    # Show comprehensive next steps summary
    if 'comprehensiveNextSteps' in result:
        next_steps = result['comprehensiveNextSteps']
        print(f"\n🎯 Comprehensive Next Steps:")
        print(f"   Summary: {next_steps.get('summary', 'N/A')}")
        print(f"   Immediate Actions: {len(next_steps.get('immediate_actions', []))} items")
        if 'appeal_options' in next_steps:
            print(f"   Appeal Options: {len(next_steps['appeal_options'].get('options', []))} available")
    
    print(f"\n💯 Combined Rating: {result.get('combinedRating', 0)}%")
    print(f"💰 Monthly Payment: ${result.get('monthlyPayment', 0)}")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_multiple_conditions()
