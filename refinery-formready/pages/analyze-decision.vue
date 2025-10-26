<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
    <!-- Navigation -->
    <Navigation
      :show-new-analysis="false"
      :show-dashboard="!!results"
      :show-user-menu="false"
    />

    <div class="py-12">
      <div class="max-w-7xl mx-auto px-4">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-slate-900 mb-4">
            VA Decision Letter Analysis
          </h1>
          <p class="text-xl text-slate-600">
            Upload your VA decision letter to get instant analysis and understand your
            claim decision
          </p>
        </div>

        <!-- Upload Section -->
        <FileUploadZone
          v-if="!analyzing && !processing && !results"
          :uploading="uploading"
          :error="error"
          @file-select="handleFileSelect"
          @analyze="analyzeDecision"
        />

        <!-- Analyzing State -->
        <AnalysisLoadingState v-if="analyzing || processing" :stage="currentStage" />

        <!-- Results Section -->
        <div v-if="results" class="space-y-8">
          <!-- Executive Summary -->
          <ExecutiveSummary
            :combined-rating="results.combinedRating"
            :monthly-payment="results.monthlyPayment"
            :granted-count="getGrantedCount(results)"
            :denied-count="getDeniedCount(results)"
            :deferred-count="getDeferredCount(results)"
            @generate-forms="handleGenerateForms"
            @download-report="handleDownloadReport"
            @save-analysis="handleSaveAnalysis"
          />

          <!-- Recommended Actions -->
          <RecommendedActions
            :actions="getRecommendedActions(results)"
            @action-clicked="handleActionClicked"
            @generate-all-forms="handleGenerateAllForms"
            @schedule-consultation="handleScheduleConsultation"
            @view-resources="handleViewResources"
          />

          <!-- Veteran Info -->
          <VeteranInfoCard
            v-if="results.veteranInfo"
            :veteran-info="results.veteranInfo"
          />

          <!-- Main Content Grid -->
          <div class="grid lg:grid-cols-3 gap-8">
            <!-- Left Column - Main Content -->
            <div class="lg:col-span-2 space-y-8">
              <!-- Decision Summary -->
              <DecisionSummarySection
                :conditions="results.ratings"
                :combined-rating="results.combinedRating"
                :monthly-payment="results.monthlyPayment"
              />

              <!-- Denial Analysis -->
              <DenialAnalysisCard
                v-if="results.denialReasons?.length > 0"
                :denial-reasons="results.denialReasons"
              />

              <!-- Deferred Reasons -->
              <div
                v-if="results.deferredReasons?.length > 0"
                class="bg-white rounded-2xl shadow-xl p-8"
              >
                <div class="flex items-center mb-6">
                  <Icon name="heroicons:clock" class="w-6 h-6 mr-3" color="amber-600" />
                  <h2 class="text-2xl font-bold text-slate-900">Deferred Conditions</h2>
                  <Badge
                    :text="`${results.deferredReasons.length} Deferred`"
                    variant="deferred"
                    class="ml-3"
                  />
                </div>

                <div class="space-y-4">
                  <div
                    v-for="(deferred, index) in results.deferredReasons"
                    :key="index"
                    class="p-4 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <h3 class="font-semibold text-amber-900 mb-2">
                      {{ deferred.condition }}
                    </h3>
                    <p class="text-amber-800">{{ deferred.reason }}</p>
                  </div>
                </div>
              </div>

              <!-- Decision Timeline -->
              <DecisionTimeline
                :decision-date="results.decisionDate"
                :effective-date="results.effectiveDate"
                :appeal-deadline="results.appealDeadline"
                :current-step="'decision_received'"
              />

              <!-- Evidence Checklist -->
              <EvidenceChecklist
                :conditions="getDeniedConditions(results)"
                :claim-type="'appeal'"
              />

              <!-- Condition Comparison -->
              <ConditionComparison
                v-if="results.denialReasons?.length > 1"
                :conditions="getConditionComparisonData(results)"
              />
            </div>

            <!-- Right Column - Sticky Sidebar -->
            <div class="lg:col-span-1">
              <ComprehensiveNextStepsPanel
                :comprehensive-next-steps="results.comprehensiveNextSteps"
                :sticky="true"
              />
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4">
            <Button @click="reset" variant="secondary">
              <Icon name="heroicons:document" class="w-4 h-4 mr-2" />
              Analyze Another Letter
            </Button>

            <Button variant="primary" @click="printReport">
              <Icon name="heroicons:printer" class="w-4 h-4 mr-2" />
              Print Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from "~/components/atoms/Badge.vue";
import Button from "~/components/atoms/Button.vue";
import FileUploadZone from "~/components/organisms/FileUploadZone.vue";
import AnalysisLoadingState from "~/components/organisms/AnalysisLoadingState.vue";
import VeteranInfoCard from "~/components/molecules/VeteranInfoCard.vue";
import DecisionSummarySection from "~/components/organisms/DecisionSummarySection.vue";
import DenialAnalysisCard from "~/components/organisms/DenialAnalysisCard.vue";
import ComprehensiveNextStepsPanel from "~/components/organisms/ComprehensiveNextStepsPanel.vue";
import DecisionTimeline from "~/components/molecules/DecisionTimeline.vue";
import EvidenceChecklist from "~/components/organisms/EvidenceChecklist.vue";
import ConditionComparison from "~/components/organisms/ConditionComparison.vue";

const config = useRuntimeConfig();
const apiUrl = config.public.apiUrl;

// State
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const analyzing = ref(false);
const processing = ref(false);
const results = ref<any>(null);
const error = ref<string | null>(null);

// Computed
const currentStage = computed(() => {
  if (uploading.value) return "uploading";
  if (analyzing.value) return "analyzing";
  if (processing.value) return "processing";
  return "uploading";
});

// Head
useHead({
  title: "VA Decision Letter Analysis - FormReady",
  meta: [
    {
      name: "description",
      content:
        "Upload and analyze your VA decision letter to understand your claim decision",
    },
  ],
});

// Methods
const handleFileSelect = (file: File | null) => {
  if (file) {
    selectedFile.value = file;
    error.value = null;
  } else {
    error.value = "Please upload a PDF file";
  }
};

const analyzeDecision = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  error.value = null;

  try {
    // 1. Get presigned upload URL
    const presignedResponse = await fetch(`${apiUrl}/v1/storage/upload/presigned`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: selectedFile.value.name,
        contentType: selectedFile.value.type,
        path: "decisions",
      }),
    });

    if (!presignedResponse.ok) {
      throw new Error("Failed to get upload URL");
    }

    const { uploadUrl, s3Key, fileId } = await presignedResponse.json();

    // 2. Upload directly to S3 using presigned URL
    const s3Response = await fetch(uploadUrl, {
      method: "PUT",
      body: selectedFile.value,
      headers: {
        "Content-Type": selectedFile.value.type,
      },
    });

    if (!s3Response.ok) {
      throw new Error("Upload to S3 failed");
    }

    // Artificial delay to show upload progress
    await new Promise((resolve) => setTimeout(resolve, 2000));

    uploading.value = false;
    analyzing.value = true;

    // Artificial delay to show analysis progress
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 3. Trigger Python extraction service via API proxy
    const documentId = `decision-${Date.now()}`;
    const extractResponse = await fetch(`${apiUrl}/v1/va-knowledge/extract-from-s3`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentId: documentId,
        storageUrl: s3Key,
        skipCache: true, // Always force re-extraction to get latest improvements
      }),
    });

    if (!extractResponse.ok) {
      throw new Error("Analysis failed");
    }

    const extractData = await extractResponse.json();
    analyzing.value = false;
    processing.value = true;

    // Artificial delay to show processing progress
    await new Promise((resolve) => setTimeout(resolve, 2000));

    processing.value = false;

    // Display results
    results.value = extractData;
  } catch (err: any) {
    console.error("Analysis error:", err);
    error.value = err.message || "Failed to analyze decision letter. Please try again.";
    uploading.value = false;
    analyzing.value = false;
    processing.value = false;
  }
};

const reset = () => {
  selectedFile.value = null;
  uploading.value = false;
  analyzing.value = false;
  processing.value = false;
  results.value = null;
  error.value = null;
};

const printReport = () => {
  window.print();
};

// New methods for enhanced components
const getGrantedCount = (results: any): number => {
  if (!results.ratings) return 0;
  return results.ratings.filter((rating: any) => rating.status === "granted").length;
};

const getDeniedCount = (results: any): number => {
  if (!results.denialReasons) return 0;
  return results.denialReasons.length;
};

const getDeferredCount = (results: any): number => {
  if (!results.deferredReasons) return 0;
  return results.deferredReasons.length;
};

const getRecommendedActions = (results: any) => {
  const actions = [];

  // Generate appeal forms for denied conditions
  if (results.denialReasons?.length > 0) {
    actions.push({
      id: "generate-appeal-forms",
      title: "Generate Appeal Forms",
      description: `Generate appeal forms for ${
        results.denialReasons.length
      } denied condition${results.denialReasons.length > 1 ? "s" : ""}`,
      icon: "heroicons:document-text",
      priority: "high" as const,
      buttonText: "Generate Forms",
      buttonIcon: "heroicons:document-text",
      primary: true,
      details: [
        "VA Form 21-0958 (Appeal to Board of Veterans' Appeals)",
        "Pre-populated with your analysis data",
        "Ready for review and submission",
      ],
      timeline: "Complete within 1 year of decision date",
    });
  }

  // Gather additional evidence
  if (results.denialReasons?.length > 0) {
    actions.push({
      id: "gather-evidence",
      title: "Gather Additional Evidence",
      description: "Collect medical records, nexus letters, and supporting documentation",
      icon: "heroicons:folder-plus",
      priority: "high" as const,
      buttonText: "View Evidence Checklist",
      buttonIcon: "heroicons:list-bullet",
      details: [
        "Medical records from private doctors",
        "Nexus letters connecting condition to service",
        "Lay statements from family/friends",
        "Current treatment records",
      ],
      timeline: "Complete before filing appeal",
    });
  }

  // Schedule C&P exam
  if (results.denialReasons?.some((denial: any) => denial.reason.includes("exam"))) {
    actions.push({
      id: "schedule-exam",
      title: "Schedule C&P Exam",
      description: "Request a Compensation & Pension exam for denied conditions",
      icon: "heroicons:calendar-days",
      priority: "medium" as const,
      buttonText: "Request Exam",
      buttonIcon: "heroicons:phone",
      details: [
        "Contact VA to schedule exam",
        "Prepare for exam with medical records",
        "Attend exam with supporting documentation",
      ],
      timeline: "Schedule within 30 days",
    });
  }

  // Contact VSO
  actions.push({
    id: "contact-vso",
    title: "Contact Veterans Service Organization",
    description: "Get professional assistance with your appeal",
    icon: "heroicons:user-group",
    priority: "medium" as const,
    buttonText: "Find VSO",
    buttonIcon: "heroicons:phone",
    details: [
      "American Legion, VFW, or DAV",
      "Free professional representation",
      "Expertise in VA appeals process",
    ],
    timeline: "Contact within 1 week",
  });

  return actions;
};

// Event handlers for new components
const handleGenerateForms = () => {
  console.log("Generate forms clicked");
  // Navigate to form builder
  navigateTo("/form-builder");
};

const handleDownloadReport = () => {
  console.log("Download report clicked");
  // Generate and download PDF report
  printReport();
};

const handleSaveAnalysis = () => {
  console.log("Save analysis clicked");
  // Save analysis to user account
  // This would require user authentication
};

const handleActionClicked = (action: any) => {
  console.log("Action clicked:", action);
  // Handle specific action based on action.id
  switch (action.id) {
    case "generate-appeal-forms":
      handleGenerateForms();
      break;
    case "gather-evidence":
      // Show evidence checklist
      break;
    case "schedule-exam":
      // Show exam scheduling info
      break;
    case "contact-vso":
      // Show VSO finder
      break;
  }
};

const handleGenerateAllForms = () => {
  console.log("Generate all forms clicked");
  handleGenerateForms();
};

const handleScheduleConsultation = () => {
  console.log("Schedule consultation clicked");
  // Show VSO finder or consultation booking
};

const handleViewResources = () => {
  console.log("View resources clicked");
  // Show resources page or modal
};

// Helper functions for new components
const getDeniedConditions = (results: any): string[] => {
  if (!results.denialReasons) return [];
  return results.denialReasons.map((denial: any) => denial.condition);
};

const getConditionComparisonData = (results: any) => {
  if (!results.denialReasons) return [];

  return results.denialReasons.map((denial: any, index: number) => ({
    id: denial.condition.toLowerCase().replace(/\s+/g, "-"),
    name: denial.condition,
    category: getConditionCategory(denial.condition),
    icon: getConditionIcon(denial.condition),
    color: getConditionColor(denial.condition),
    difficulty: getConditionDifficulty(denial.condition),
    successRate: getConditionSuccessRate(denial.condition),
    evidenceStrength: getEvidenceStrength(denial.condition),
    timeline: getConditionTimeline(denial.condition),
    priority: getConditionPriority(denial.condition),
    denialReason: denial.reason,
  }));
};

// Helper functions for condition data
function getConditionCategory(condition: string): string {
  const mentalHealth = ["PTSD", "Depression", "Anxiety", "Bipolar"];
  const auditory = ["Tinnitus", "Hearing Loss"];
  const musculoskeletal = ["Back Pain", "Knee Pain", "Shoulder Pain"];

  if (mentalHealth.some((c) => condition.toLowerCase().includes(c.toLowerCase())))
    return "Mental Health";
  if (auditory.some((c) => condition.toLowerCase().includes(c.toLowerCase())))
    return "Auditory";
  if (musculoskeletal.some((c) => condition.toLowerCase().includes(c.toLowerCase())))
    return "Musculoskeletal";
  return "Other";
}

function getConditionIcon(condition: string): string {
  if (
    condition.toLowerCase().includes("ptsd") ||
    condition.toLowerCase().includes("depression")
  )
    return "heart";
  if (
    condition.toLowerCase().includes("tinnitus") ||
    condition.toLowerCase().includes("hearing")
  )
    return "speaker-wave";
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return "user";
  return "medical-symbol";
}

function getConditionColor(condition: string): string {
  if (
    condition.toLowerCase().includes("ptsd") ||
    condition.toLowerCase().includes("depression")
  )
    return "red-600";
  if (
    condition.toLowerCase().includes("tinnitus") ||
    condition.toLowerCase().includes("hearing")
  )
    return "blue-600";
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return "green-600";
  return "slate-600";
}

function getConditionDifficulty(condition: string): number {
  // Simple heuristic based on condition type
  if (condition.toLowerCase().includes("tinnitus")) return 2; // Easy
  if (condition.toLowerCase().includes("ptsd")) return 3; // Medium
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return 4; // Hard
  return 3; // Default medium
}

function getConditionSuccessRate(condition: string): number {
  // Simple heuristic based on condition type
  if (condition.toLowerCase().includes("tinnitus")) return 85;
  if (condition.toLowerCase().includes("ptsd")) return 75;
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return 60;
  return 70;
}

function getEvidenceStrength(condition: string): number {
  // Simple heuristic - in real implementation, this would come from MCP analysis
  if (condition.toLowerCase().includes("tinnitus")) return 3;
  if (condition.toLowerCase().includes("ptsd")) return 2;
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return 1;
  return 2;
}

function getConditionTimeline(condition: string): string {
  if (condition.toLowerCase().includes("tinnitus")) return "3-6 months";
  if (condition.toLowerCase().includes("ptsd")) return "6-12 months";
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return "12-18 months";
  return "6-12 months";
}

function getConditionPriority(condition: string): "high" | "medium" | "low" {
  if (condition.toLowerCase().includes("tinnitus")) return "high";
  if (condition.toLowerCase().includes("ptsd")) return "high";
  if (
    condition.toLowerCase().includes("back") ||
    condition.toLowerCase().includes("knee")
  )
    return "medium";
  return "medium";
}
</script>
