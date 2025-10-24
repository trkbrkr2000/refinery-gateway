"""
VA Decision Letter Extraction Pipeline

Clean, sequential extraction flow:
1. Parse PDF locally → markdown text
2. Separate into sections (## headers)
3. Parse each section for ratings, denials, deferrals
4. Return structured results

This is the main orchestrator for all VA decision letter processing.
"""

from typing import Dict, List
from services.pdf_converter import PDFConverterService
from services.parsing import (
    parse_va_sections,
    extract_ratings_table,
    extract_denial_reasons,
    extract_deferred_conditions
)
from services.llm_parser import get_llm_parser


class ExtractionPipeline:
    """
    Orchestrates the complete extraction pipeline for VA decision letters

    Flow:
        PDF → Markdown → Sections → Parse Sections → Results
    """

    def __init__(self):
        self.pdf_converter = PDFConverterService()
        self.llm_parser = get_llm_parser()  # May be None if no API key

    def extract_from_pdf(self, pdf_path: str) -> Dict:
        """
        Complete extraction pipeline for a VA decision letter PDF

        Args:
            pdf_path: Path to the PDF file (local or S3)

        Returns:
            Dictionary with:
                - ratings: List of all conditions (granted/denied/deferred)
                - denialReasons: List of reasons for denied conditions
                - deferredConditions: List of deferred conditions with reasons
                - sections: Raw section data (for debugging)
        """
        print("=" * 60)
        print("🚀 STARTING VA DECISION LETTER EXTRACTION PIPELINE")
        print("=" * 60)

        # STEP 1: Parse PDF to markdown
        print("\n📄 STEP 1: Converting PDF to markdown...")
        pdf_data = self.pdf_converter.convert_pdf(pdf_path)
        markdown_text = pdf_data["markdown_text"]
        print(f"✅ Converted PDF: {len(markdown_text)} characters")

        # STEP 2: Separate into sections
        print("\n📂 STEP 2: Parsing document sections...")
        sections = parse_va_sections(markdown_text)
        print(f"✅ Found {len(sections)} sections:")
        for section_name in sections.keys():
            section_length = len(sections[section_name])
            print(f"   - {section_name} ({section_length} chars)")

        # STEP 3: Parse sections for data
        print("\n🔍 STEP 3: Extracting ratings from sections...")
        ratings = self._extract_ratings_with_fallback(markdown_text, sections)

        granted = [r for r in ratings if r["decision"] == "granted"]
        denied = [r for r in ratings if r["decision"] == "denied"]
        deferred = [r for r in ratings if r["decision"] == "deferred"]

        print(f"✅ Found {len(ratings)} total ratings:")
        print(f"   - {len(granted)} granted")
        print(f"   - {len(denied)} denied")
        print(f"   - {len(deferred)} deferred")

        # STEP 4: Extract denial reasons
        print("\n📝 STEP 4: Extracting denial reasons...")
        denial_reasons = []
        if denied:
            denial_reasons = self._extract_denial_reasons_with_fallback(
                markdown_text,
                sections,
                ratings
            )
            print(f"✅ Extracted {len(denial_reasons)} denial reasons")
        else:
            print("⏭️  No denied conditions, skipping denial reasons")

        # STEP 5: Extract deferred details
        print("\n⏸️  STEP 5: Extracting deferred condition details...")
        deferred_conditions = []
        if deferred:
            deferred_conditions = self._extract_deferred_with_fallback(
                markdown_text,
                sections
            )
            print(f"✅ Extracted {len(deferred_conditions)} deferred conditions")
        else:
            print("⏭️  No deferred conditions found")

        # STEP 6: Return results
        print("\n" + "=" * 60)
        print("✅ EXTRACTION COMPLETE")
        print("=" * 60)

        return {
            "ratings": ratings,
            "granted": granted,
            "denied": denied,
            "deferred": deferred,
            "denialReasons": denial_reasons,
            "deferredConditions": deferred_conditions,
            "sections": list(sections.keys()),  # Just section names for debugging
        }

    def _extract_ratings_with_fallback(self, text: str, sections: Dict[str, str]) -> List[Dict]:
        """
        Extract ratings using regex first, LLM fallback if needed

        Args:
            text: Full markdown text
            sections: Parsed sections dictionary

        Returns:
            List of rating dictionaries
        """
        # Try regex first
        ratings = extract_ratings_table(text)

        # LLM fallback if no results
        if not ratings and self.llm_parser:
            print("⚠️  Regex found 0 ratings, trying LLM fallback...")
            ratings = self.llm_parser.extract_ratings(sections)
            if ratings:
                print(f"✅ LLM fallback succeeded: {len(ratings)} ratings")

        return ratings

    def _extract_denial_reasons_with_fallback(
        self,
        text: str,
        sections: Dict[str, str],
        ratings: List[Dict]
    ) -> List[Dict]:
        """
        Extract denial reasons using regex first, LLM fallback if needed

        Args:
            text: Full markdown text
            sections: Parsed sections dictionary
            ratings: List of all ratings (to find denied conditions)

        Returns:
            List of denial reason dictionaries
        """
        # Try regex first
        denial_reasons = extract_denial_reasons(text, ratings)

        # LLM fallback for missing reasons
        denied_conditions = [r["condition"] for r in ratings if r["decision"] == "denied"]
        missing_conditions = [
            cond for cond in denied_conditions
            if not any(dr["condition"] == cond for dr in denial_reasons)
        ]

        if missing_conditions and self.llm_parser:
            print(f"⚠️  Missing {len(missing_conditions)} denial reasons, trying LLM fallback...")
            llm_reasons = self.llm_parser.extract_denial_reasons(sections, missing_conditions)
            if llm_reasons:
                print(f"✅ LLM found {len(llm_reasons)} additional reasons")
                denial_reasons.extend(llm_reasons)

        return denial_reasons

    def _extract_deferred_with_fallback(
        self,
        text: str,
        sections: Dict[str, str]
    ) -> List[Dict]:
        """
        Extract deferred conditions using regex first, LLM fallback if needed

        Args:
            text: Full markdown text
            sections: Parsed sections dictionary

        Returns:
            List of deferred condition dictionaries
        """
        # Try regex first
        deferred = extract_deferred_conditions(text)

        # LLM fallback if no results
        if not deferred and self.llm_parser:
            print("⚠️  Regex found 0 deferred, trying LLM fallback...")
            deferred = self.llm_parser.extract_deferred_conditions(sections)
            if deferred:
                print(f"✅ LLM fallback succeeded: {len(deferred)} deferred")

        return deferred


# Singleton instance
_pipeline = None


def get_extraction_pipeline() -> ExtractionPipeline:
    """Get singleton extraction pipeline instance"""
    global _pipeline
    if _pipeline is None:
        _pipeline = ExtractionPipeline()
    return _pipeline
