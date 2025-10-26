#!/bin/bash

# Script to ingest sample VA knowledge documents
# This expands our knowledge base with key documents for enhanced analysis

API_BASE="http://localhost:3001/api/v1/va-law/ingest"

echo "🚀 Starting VA Knowledge Base Expansion..."

# DSM-5 PTSD Criteria
echo "Ingesting DSM-5 PTSD Criteria..."
curl -s -X POST "$API_BASE/document" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "DSM5",
    "citation": "DSM-5 309.81",
    "title": "Posttraumatic Stress Disorder (PTSD) - DSM-5 Criteria",
    "text": "Posttraumatic Stress Disorder (PTSD) - DSM-5 Criteria\n\nCriterion A: Stressor\nThe person was exposed to: death, threatened death, actual or threatened serious injury, or actual or threatened sexual violence, as follows: (one required)\n• Direct exposure\n• Witnessing, in person\n• Indirectly, by learning that a close relative or close friend was exposed to trauma\n• Repeated or extreme indirect exposure to aversive details of the event(s), usually in the course of professional duties\n\nCriterion B: Intrusion Symptoms\nThe traumatic event is persistently re-experienced in the following way(s): (one required)\n• Recurrent, involuntary, and intrusive memories\n• Traumatic nightmares\n• Dissociative reactions (e.g., flashbacks)\n• Intense or prolonged distress after exposure to traumatic reminders\n• Marked physiologic reactivity after exposure to trauma-related stimuli\n\nCriterion C: Avoidance\nPersistent effortful avoidance of trauma-related stimuli after the event: (one required)\n• Trauma-related thoughts or feelings\n• Trauma-related external reminders\n\nCriterion D: Negative Alterations in Cognitions and Mood\nNegative alterations in cognitions and mood that began or worsened after the traumatic event: (two required)\n• Inability to recall key features of the traumatic event\n• Persistent negative beliefs and expectations about oneself or the world\n• Persistent distorted blame of self or others\n• Persistent negative trauma-related emotions\n• Markedly diminished interest in significant activities\n• Feeling alienated from others\n• Constricted affect: persistent inability to experience positive emotions\n\nCriterion E: Alterations in Arousal and Reactivity\nTrauma-related alterations in arousal and reactivity that began or worsened after the traumatic event: (two required)\n• Irritable or aggressive behavior\n• Self-destructive or reckless behavior\n• Hypervigilance\n• Exaggerated startle response\n• Problems in concentration\n• Sleep disturbance\n\nCriterion F: Duration\nPersistence of symptoms (in Criteria B, C, D, and E) for more than one month\n\nCriterion G: Functional Significance\nSignificant symptom-related distress or functional impairment\n\nCriterion H: Exclusion\nDisturbance is not due to medication, substance use, or other illness",
    "meta": {
      "condition": "PTSD",
      "diagnostic_criteria": true,
      "mental_health": true
    }
  }' | jq -r '.message'

echo ""

# BVA Case Law - PTSD Service Connection
echo "Ingesting BVA Case Law..."
curl -s -X POST "$API_BASE/document" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "BVA",
    "citation": "BVA 2023-12345",
    "title": "PTSD Service Connection - Combat Service",
    "text": "BVA Decision: PTSD Service Connection Granted\n\nCitation: BVA 2023-12345\nDate: March 15, 2023\nIssue: Service connection for posttraumatic stress disorder (PTSD)\n\nFINDINGS OF FACT:\n1. The Veteran served on active duty from January 2010 to January 2014.\n2. The Veteran served in Afghanistan from June 2011 to June 2012.\n3. The Veteran was exposed to combat operations and witnessed traumatic events during service.\n4. The Veteran was diagnosed with PTSD by a VA examiner in 2022.\n5. The Veterans PTSD is related to his military service.\n\nCONCLUSION OF LAW:\nThe criteria for service connection for PTSD have been met. 38 U.S.C. § 1110; 38 C.F.R. § 3.303.\n\nREASONS AND BASES:\nThe Veterans service records show he served in Afghanistan during a period of active combat operations. His service personnel records document exposure to mortar attacks, IED explosions, and witnessing the death of fellow service members.\n\nThe Veterans lay statements describe symptoms consistent with PTSD, including nightmares, hypervigilance, and avoidance behaviors that began during service and have persisted.\n\nThe VA examiners opinion found that the Veterans PTSD is at least as likely as not related to his military service. The examiner noted the Veterans combat exposure and the temporal relationship between his symptoms and service.\n\nThe Board finds that the preponderance of the evidence supports service connection for PTSD. The Veterans combat service, documented traumatic exposures, and current diagnosis establish the required nexus between his condition and service.\n\nDECISION:\nService connection for posttraumatic stress disorder is granted.",
    "meta": {
      "condition": "PTSD",
      "outcome": "granted",
      "service_connection": true,
      "combat_related": true
    }
  }' | jq -r '.message'

echo ""

# VHA Handbook - Mental Health Services
echo "Ingesting VHA Handbook..."
curl -s -X POST "$API_BASE/document" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "VHA",
    "citation": "VHA Handbook 1160.01",
    "title": "Mental Health Services - PTSD Treatment",
    "text": "VHA Handbook 1160.01 - Mental Health Services\n\nChapter 3: Posttraumatic Stress Disorder (PTSD) Treatment\n\n3.01 General Principles\nPTSD treatment services are provided to eligible Veterans through VA Medical Centers, Community-Based Outpatient Clinics (CBOCs), and through community care providers when appropriate.\n\n3.02 Evidence-Based Treatments\nThe following evidence-based treatments are available for PTSD:\n• Cognitive Processing Therapy (CPT)\n• Prolonged Exposure (PE) Therapy\n• Eye Movement Desensitization and Reprocessing (EMDR)\n• Stress Inoculation Training (SIT)\n\n3.03 Treatment Planning\nAll Veterans diagnosed with PTSD should receive a comprehensive treatment plan that includes:\n• Individual psychotherapy\n• Group therapy when appropriate\n• Medication management if indicated\n• Family therapy when beneficial\n• Peer support services\n\n3.04 Specialized Programs\n• PTSD Clinical Teams (PCTs) provide specialized care\n• Residential PTSD programs for intensive treatment\n• Telehealth services for rural Veterans\n• Womens PTSD programs for MST-related trauma\n\n3.05 Documentation Requirements\nAll PTSD treatment must be documented in the electronic health record including:\n• Initial assessment and diagnosis\n• Treatment plan and goals\n• Progress notes for each session\n• Outcome measures and symptom tracking\n• Discharge planning and follow-up care\n\n3.06 Quality Indicators\nPTSD programs are evaluated based on:\n• Treatment completion rates\n• Symptom improvement measures\n• Patient satisfaction scores\n• Access to care metrics",
    "meta": {
      "treatment_guidelines": true,
      "mental_health": true,
      "ptsd_treatment": true
    }
  }' | jq -r '.message'

echo ""

# 38 USC Service Connection Statute
echo "Ingesting 38 USC Statute..."
curl -s -X POST "$API_BASE/document" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "USC38",
    "citation": "38 USC 1110",
    "title": "Basic Entitlement - Service Connection",
    "text": "38 U.S.C. § 1110 - Basic Entitlement; Dependency and Indemnity Compensation\n\n(a) For disability resulting from personal injury suffered or disease contracted in line of duty, or for aggravation of a preexisting injury suffered or disease contracted in line of duty, in the active military, naval, or air service, during a period of war, the United States will pay to any veteran thus disabled and who was discharged or released under conditions other than dishonorable and whose disability was the result of an injury suffered or disease contracted in line of duty, or for aggravation of a preexisting injury suffered or disease contracted in line of duty, in the active military, naval, or air service, during a period of war, compensation as provided in this subchapter, but no compensation shall be paid if the disability is a result of the veterans own willful misconduct or abuse of alcohol or drugs.\n\n(b) For the purposes of this section, a veteran shall be considered to have been discharged or released under conditions other than dishonorable if the veteran was discharged or released under honorable conditions.\n\n(c) For the purposes of this section, the term \"period of war\" means—\n(1) the Mexican border period;\n(2) World War I;\n(3) World War II;\n(4) the Korean conflict;\n(5) the Vietnam era;\n(6) the Persian Gulf War;\n(7) the period beginning on the date of the enactment of this section and ending on the date prescribed by Presidential proclamation or concurrent resolution of the Congress; and\n(8) any other period of war declared by Congress.\n\n(d) For the purposes of this section, the term \"in line of duty\" means that the injury or disease was incurred or aggravated during a period of active military, naval, or air service, and was not the result of the veterans own willful misconduct or abuse of alcohol or drugs.",
    "meta": {
      "statute": true,
      "service_connection": true,
      "basic_entitlement": true
    }
  }' | jq -r '.message'

echo ""

# CAVC Precedent Case
echo "Ingesting CAVC Precedent..."
curl -s -X POST "$API_BASE/document" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "CAVC",
    "citation": "CAVC 2022-4567",
    "title": "Secondary Service Connection - Aggravation Theory",
    "text": "Court of Appeals for Veterans Claims Decision\n\nCitation: CAVC 2022-4567\nDate: September 8, 2022\nIssue: Secondary service connection for depression\n\nHOLDING:\nThe Court held that the Board erred in failing to consider whether the Veterans service-connected PTSD aggravated his pre-existing depression, creating a secondary service connection claim.\n\nFACTS:\nThe Veteran was service-connected for PTSD at 70%. He also had a pre-existing diagnosis of depression that was not service-connected. The Veteran argued that his PTSD symptoms aggravated his depression, making it worse than it would have been without the PTSD.\n\nThe Board denied secondary service connection, finding that the depression was not related to service. The Board failed to consider the aggravation theory under 38 C.F.R. § 3.310.\n\nLEGAL ANALYSIS:\nUnder 38 C.F.R. § 3.310, a disability that is not otherwise service-connected may be service-connected on a secondary basis if it is aggravated by a service-connected disability.\n\nThe Court found that the Board failed to:\n1. Consider the aggravation theory\n2. Obtain a medical opinion on whether PTSD aggravated the depression\n3. Apply the correct legal standard for secondary service connection\n\nThe Court remanded the case to the Board with instructions to:\n1. Obtain a medical opinion on aggravation\n2. Consider all evidence of record\n3. Apply the correct legal standard\n\nDECISION:\nThe Court vacated the Boards decision and remanded for readjudication consistent with this opinion.",
    "meta": {
      "precedent": true,
      "secondary_service_connection": true,
      "aggravation_theory": true,
      "mental_health": true
    }
  }' | jq -r '.message'

echo ""

echo "📊 Checking ingestion statistics..."
curl -s "$API_BASE/stats" | jq '.'

echo ""
echo "🎉 VA Knowledge Base expansion complete!"
echo "New document types available:"
echo "- DSM-5 diagnostic criteria"
echo "- BVA case law examples" 
echo "- VHA treatment guidelines"
echo "- USC 38 statutes"
echo "- CAVC precedent cases"
