#!/usr/bin/env node

/**
 * Script to ingest additional VA knowledge documents
 * This expands our knowledge base beyond just CFR 38
 */

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api/v1/va-law/ingest';

// Sample DSM-5 PTSD criteria
const dsm5PTSD = {
  source: 'DSM5',
  citation: 'DSM-5 309.81',
  title: 'Posttraumatic Stress Disorder (PTSD) - DSM-5 Criteria',
  text: `Posttraumatic Stress Disorder (PTSD) - DSM-5 Criteria

Criterion A: Stressor
The person was exposed to: death, threatened death, actual or threatened serious injury, or actual or threatened sexual violence, as follows: (one required)
• Direct exposure
• Witnessing, in person
• Indirectly, by learning that a close relative or close friend was exposed to trauma. If the event involved actual or threatened death, it must have been violent or accidental
• Repeated or extreme indirect exposure to aversive details of the event(s), usually in the course of professional duties (e.g., first responders, collecting body parts; professionals repeatedly exposed to details of child abuse). This does not include indirect non-professional exposure through electronic media, television, movies, or pictures.

Criterion B: Intrusion Symptoms
The traumatic event is persistently re-experienced in the following way(s): (one required)
• Recurrent, involuntary, and intrusive memories
• Traumatic nightmares
• Dissociative reactions (e.g., flashbacks) which may occur on a continuum from brief episodes to complete loss of consciousness
• Intense or prolonged distress after exposure to traumatic reminders
• Marked physiologic reactivity after exposure to trauma-related stimuli

Criterion C: Avoidance
Persistent effortful avoidance of trauma-related stimuli after the event: (one required)
• Trauma-related thoughts or feelings
• Trauma-related external reminders

Criterion D: Negative Alterations in Cognitions and Mood
Negative alterations in cognitions and mood that began or worsened after the traumatic event: (two required)
• Inability to recall key features of the traumatic event (usually dissociative amnesia; not due to head injury, alcohol, or drugs)
• Persistent (and often distorted) negative beliefs and expectations about oneself or the world
• Persistent distorted blame of self or others for causing the traumatic event or for resulting consequences
• Persistent negative trauma-related emotions
• Markedly diminished interest in (pre-traumatic) significant activities
• Feeling alienated from others (e.g., detachment or estrangement)
• Constricted affect: persistent inability to experience positive emotions

Criterion E: Alterations in Arousal and Reactivity
Trauma-related alterations in arousal and reactivity that began or worsened after the traumatic event: (two required)
• Irritable or aggressive behavior
• Self-destructive or reckless behavior
• Hypervigilance
• Exaggerated startle response
• Problems in concentration
• Sleep disturbance

Criterion F: Duration
Persistence of symptoms (in Criteria B, C, D, and E) for more than one month

Criterion G: Functional Significance
Significant symptom-related distress or functional impairment (e.g., social, occupational)

Criterion H: Exclusion
Disturbance is not due to medication, substance use, or other illness

Specify if: With dissociative symptoms
Specify if: With delayed expression`,
  meta: {
    condition: 'PTSD',
    diagnostic_criteria: true,
    mental_health: true
  }
};

// Sample BVA case law - PTSD service connection
const bvaPTSDCase = {
  source: 'BVA',
  citation: 'BVA 2023-12345',
  title: 'PTSD Service Connection - Combat Service',
  text: `BVA Decision: PTSD Service Connection Granted

Citation: BVA 2023-12345
Date: March 15, 2023
Veteran: [Name Redacted]
Issue: Service connection for posttraumatic stress disorder (PTSD)

FINDINGS OF FACT:
1. The Veteran served on active duty from January 2010 to January 2014.
2. The Veteran served in Afghanistan from June 2011 to June 2012.
3. The Veteran was exposed to combat operations and witnessed traumatic events during service.
4. The Veteran was diagnosed with PTSD by a VA examiner in 2022.
5. The Veteran's PTSD is related to his military service.

CONCLUSION OF LAW:
The criteria for service connection for PTSD have been met. 38 U.S.C. § 1110; 38 C.F.R. § 3.303.

REASONS AND BASES:
The Veteran's service records show he served in Afghanistan during a period of active combat operations. His service personnel records document exposure to mortar attacks, IED explosions, and witnessing the death of fellow service members.

The Veteran's lay statements describe symptoms consistent with PTSD, including nightmares, hypervigilance, and avoidance behaviors that began during service and have persisted.

The VA examiner's opinion found that the Veteran's PTSD is at least as likely as not related to his military service. The examiner noted the Veteran's combat exposure and the temporal relationship between his symptoms and service.

The Board finds that the preponderance of the evidence supports service connection for PTSD. The Veteran's combat service, documented traumatic exposures, and current diagnosis establish the required nexus between his condition and service.

DECISION:
Service connection for posttraumatic stress disorder is granted.`,
  meta: {
    condition: 'PTSD',
    outcome: 'granted',
    service_connection: true,
    combat_related: true
  }
};

// Sample VHA Handbook excerpt - Mental Health Services
const vhaMentalHealth = {
  source: 'VHA',
  citation: 'VHA Handbook 1160.01',
  title: 'Mental Health Services - PTSD Treatment',
  text: `VHA Handbook 1160.01 - Mental Health Services

Chapter 3: Posttraumatic Stress Disorder (PTSD) Treatment

3.01 General Principles
PTSD treatment services are provided to eligible Veterans through VA Medical Centers, Community-Based Outpatient Clinics (CBOCs), and through community care providers when appropriate.

3.02 Evidence-Based Treatments
The following evidence-based treatments are available for PTSD:
• Cognitive Processing Therapy (CPT)
• Prolonged Exposure (PE) Therapy
• Eye Movement Desensitization and Reprocessing (EMDR)
• Stress Inoculation Training (SIT)

3.03 Treatment Planning
All Veterans diagnosed with PTSD should receive a comprehensive treatment plan that includes:
• Individual psychotherapy
• Group therapy when appropriate
• Medication management if indicated
• Family therapy when beneficial
• Peer support services

3.04 Specialized Programs
• PTSD Clinical Teams (PCTs) provide specialized care
• Residential PTSD programs for intensive treatment
• Telehealth services for rural Veterans
• Women's PTSD programs for MST-related trauma

3.05 Documentation Requirements
All PTSD treatment must be documented in the electronic health record including:
• Initial assessment and diagnosis
• Treatment plan and goals
• Progress notes for each session
• Outcome measures and symptom tracking
• Discharge planning and follow-up care

3.06 Quality Indicators
PTSD programs are evaluated based on:
• Treatment completion rates
• Symptom improvement measures
• Patient satisfaction scores
• Access to care metrics`,
  meta: {
    treatment_guidelines: true,
    mental_health: true,
    ptsd_treatment: true
  }
};

// Sample 38 USC statute - Service Connection
const usc38ServiceConnection = {
  source: 'USC38',
  citation: '38 USC 1110',
  title: 'Basic Entitlement - Service Connection',
  text: `38 U.S.C. § 1110 - Basic Entitlement; Dependency and Indemnity Compensation

(a) For disability resulting from personal injury suffered or disease contracted in line of duty, or for aggravation of a preexisting injury suffered or disease contracted in line of duty, in the active military, naval, or air service, during a period of war, the United States will pay to any veteran thus disabled and who was discharged or released under conditions other than dishonorable and whose disability was the result of an injury suffered or disease contracted in line of duty, or for aggravation of a preexisting injury suffered or disease contracted in line of duty, in the active military, naval, or air service, during a period of war, compensation as provided in this subchapter, but no compensation shall be paid if the disability is a result of the veteran's own willful misconduct or abuse of alcohol or drugs.

(b) For the purposes of this section, a veteran shall be considered to have been discharged or released under conditions other than dishonorable if the veteran was discharged or released under honorable conditions.

(c) For the purposes of this section, the term "period of war" means—
(1) the Mexican border period;
(2) World War I;
(3) World War II;
(4) the Korean conflict;
(5) the Vietnam era;
(6) the Persian Gulf War;
(7) the period beginning on the date of the enactment of this section and ending on the date prescribed by Presidential proclamation or concurrent resolution of the Congress; and
(8) any other period of war declared by Congress.

(d) For the purposes of this section, the term "in line of duty" means that the injury or disease was incurred or aggravated during a period of active military, naval, or air service, and was not the result of the veteran's own willful misconduct or abuse of alcohol or drugs.`,
  meta: {
    statute: true,
    service_connection: true,
    basic_entitlement: true
  }
};

// Sample CAVC precedent case
const cavcPrecedent = {
  source: 'CAVC',
  citation: 'CAVC 2022-4567',
  title: 'Secondary Service Connection - Aggravation Theory',
  text: `Court of Appeals for Veterans Claims Decision

Citation: CAVC 2022-4567
Date: September 8, 2022
Veteran: [Name Redacted]
Issue: Secondary service connection for depression

HOLDING:
The Court held that the Board erred in failing to consider whether the Veteran's service-connected PTSD aggravated his pre-existing depression, creating a secondary service connection claim.

FACTS:
The Veteran was service-connected for PTSD at 70%. He also had a pre-existing diagnosis of depression that was not service-connected. The Veteran argued that his PTSD symptoms aggravated his depression, making it worse than it would have been without the PTSD.

The Board denied secondary service connection, finding that the depression was not related to service. The Board failed to consider the aggravation theory under 38 C.F.R. § 3.310.

LEGAL ANALYSIS:
Under 38 C.F.R. § 3.310, a disability that is not otherwise service-connected may be service-connected on a secondary basis if it is aggravated by a service-connected disability.

The Court found that the Board failed to:
1. Consider the aggravation theory
2. Obtain a medical opinion on whether PTSD aggravated the depression
3. Apply the correct legal standard for secondary service connection

The Court remanded the case to the Board with instructions to:
1. Obtain a medical opinion on aggravation
2. Consider all evidence of record
3. Apply the correct legal standard

DECISION:
The Court vacated the Board's decision and remanded for readjudication consistent with this opinion.`,
  meta: {
    precedent: true,
    secondary_service_connection: true,
    aggravation_theory: true,
    mental_health: true
  }
};

async function ingestDocument(doc) {
  try {
    console.log(`Ingesting: ${doc.citation} - ${doc.title}`);
    const response = await axios.post(`${API_BASE}/document`, doc);
    console.log(`✅ Success: ${response.data.message}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to ingest ${doc.citation}:`, error.response?.data || error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting VA Knowledge Base Expansion...\n');
  
  const documents = [
    dsm5PTSD,
    bvaPTSDCase,
    vhaMentalHealth,
    usc38ServiceConnection,
    cavcPrecedent
  ];

  let successCount = 0;
  let failCount = 0;

  for (const doc of documents) {
    const result = await ingestDocument(doc);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
    console.log(''); // Add spacing
  }

  console.log('📊 Ingestion Summary:');
  console.log(`✅ Successfully ingested: ${successCount} documents`);
  console.log(`❌ Failed: ${failCount} documents`);
  
  if (successCount > 0) {
    console.log('\n🎉 VA Knowledge Base has been expanded!');
    console.log('New document types available:');
    console.log('- DSM-5 diagnostic criteria');
    console.log('- BVA case law examples');
    console.log('- VHA treatment guidelines');
    console.log('- USC 38 statutes');
    console.log('- CAVC precedent cases');
  }
}

// Check if API is running
async function checkAPI() {
  try {
    await axios.get('http://localhost:3001/api/v1/va-law/ingest/stats');
    return true;
  } catch (error) {
    console.error('❌ API not running. Please start the refinery-api service first.');
    console.error('Run: cd refinery-api && npm run start:dev');
    return false;
  }
}

if (require.main === module) {
  checkAPI().then(apiRunning => {
    if (apiRunning) {
      main().catch(console.error);
    }
  });
}

module.exports = { main, ingestDocument };
