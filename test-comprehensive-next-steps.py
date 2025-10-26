#!/usr/bin/env python3
"""
Test script to show comprehensive next steps in detail.
"""

import sys
import os
import json

# Add refinery-python to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'refinery-python'))

# Set environment variables for testing
os.environ['MCP_ENABLED'] = 'true'
os.environ['MCP_SERVER_URL'] = 'http://localhost:3001'
os.environ['ENABLE_LAYMAN_TRANSLATION'] = 'false'  # Disable translation for faster testing

import pymupdf4llm
from services.simple_parser import parse_va_decision_letter_simple

def test_comprehensive_next_steps():
    """Test comprehensive next steps with detailed output."""
    
    print("=" * 80)
    print("COMPREHENSIVE NEXT STEPS TEST")
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
    
    # Parse with comprehensive next steps
    print("\n2️⃣  Parsing with comprehensive next steps...")
    result = parse_va_decision_letter_simple(markdown_text, translate_denials=False)
    
    # Display comprehensive next steps
    if 'comprehensiveNextSteps' in result:
        next_steps = result['comprehensiveNextSteps']
        
        print("\n" + "=" * 80)
        print("COMPREHENSIVE NEXT STEPS")
        print("=" * 80)
        
        print(f"\n📋 Summary: {next_steps.get('summary', 'N/A')}")
        
        print(f"\n⚡ Immediate Actions ({len(next_steps.get('immediate_actions', []))}):")
        for i, action in enumerate(next_steps.get('immediate_actions', [])[:5], 1):
            print(f"   {i}. {action}")
        
        if 'appeal_options' in next_steps:
            appeal = next_steps['appeal_options']
            print(f"\n🔄 Appeal Options:")
            print(f"   Overview: {appeal.get('overview', 'N/A')}")
            
            if 'options' in appeal:
                print(f"\n   Available Options:")
                for option in appeal['options'][:2]:  # Show first 2 options
                    print(f"   • {option.get('option', 'N/A')}")
                    print(f"     Best for: {option.get('best_for', 'N/A')}")
                    print(f"     Deadline: {option.get('deadline', 'N/A')}")
                    print(f"     Pros: {', '.join(option.get('pros', [])[:2])}")
                    print()
        
        if 'evidence_gathering' in next_steps:
            evidence = next_steps['evidence_gathering']
            print(f"\n📁 Evidence Gathering:")
            if 'priority_evidence' in evidence:
                print(f"   Priority Evidence:")
                for item in evidence['priority_evidence'][:3]:
                    print(f"   • {item}")
        
        if 'timeline' in next_steps:
            timeline = next_steps['timeline']
            print(f"\n⏰ Timeline:")
            for period, actions in timeline.items():
                if actions:
                    print(f"   {period.title()}: {', '.join(actions[:2])}")
        
        if 'resources' in next_steps:
            resources = next_steps['resources']
            print(f"\n🔗 Resources:")
            if 'free_help' in resources:
                free_help = resources['free_help'][:2]
                if free_help and isinstance(free_help[0], dict):
                    for item in free_help:
                        print(f"   • {item.get('name', 'N/A')}: {item.get('description', 'N/A')}")
                else:
                    print(f"   Free Help: {', '.join(free_help)}")
    else:
        print("\n⚠️  No comprehensive next steps found")
    
    print("\n" + "=" * 80)
    print("TEST COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    test_comprehensive_next_steps()
