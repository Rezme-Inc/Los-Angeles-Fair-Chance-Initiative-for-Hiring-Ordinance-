"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, FileText, Info, Send, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image"; // Add this import for the logo

interface Step {
  id: number;
  title: string;
  completed: boolean;
}

interface RequiredDocument {
  type: "jobDescription" | "backgroundCheck" | "restorativeRecord";
  file: File | null;
  notes: string;
}

export default function AssessmentEvaluate() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [showBlockingDialog, setShowBlockingDialog] = useState(false);
  const [showCompletionWarning, setShowCompletionWarning] = useState(false);
  const [showComplianceConfirmation, setShowComplianceConfirmation] = useState(false);
  const [showTimeframeDialog, setShowTimeframeDialog] = useState(false);
  const [showFinalDialog, setShowFinalDialog] = useState(false);
  const [complianceAcknowledged, setComplianceAcknowledged] = useState(false);
  const [responseTimeframe, setResponseTimeframe] = useState("");
  const [giveAnotherChance, setGiveAnotherChance] = useState<boolean | null>(null);
  const [showOfferLetterDialog, setShowOfferLetterDialog] = useState(false);
  const [offerLetterData, setOfferLetterData] = useState({
    applicantName: "",
    position: "",
    employer: "",
    date: new Date().toISOString().split('T')[0],
    businessRisk: "",
    safetyRisk: "",
    additionalChecks: [""],
    employerContact: "",
    employerAddress: "",
    contactPhone: "",
    contactEmail: ""
  });
  const [isEditingLetter, setIsEditingLetter] = useState(false);
  const [showWOTCModal, setShowWOTCModal] = useState(false);
  const [showWOTCSigningScreen, setShowWOTCSigningScreen] = useState(false);
  const [steps, setSteps] = useState<Step[]>([
    { id: 1, title: "Confirm Conditional Offer", completed: false },
    { id: 2, title: "Background Report Review", completed: false },
    { id: 3, title: "Direct Job-Relation Inquiry", completed: false },
    { id: 4, title: "Time Elapsed Analysis", completed: false },
    { id: 5, title: "Evidence of Rehabilitation", completed: false },
    { id: 6, title: "Assessment Summary", completed: false },
    { id: 7, title: "Individualized Assessments Review", completed: false },
    { id: 8, title: "Final Decision & Notification of Rights", completed: false },
  ]);

  const [hasConditionalOffer, setHasConditionalOffer] = useState<string | null>(null);

  const [documentValidation, setDocumentValidation] = useState({
    isOld: false,
    isJuvenile: false,
    isDecriminalized: false,
  });

  const [jobRelation, setJobRelation] = useState({
    isRelated: null as boolean | null,
    duties: [] as string[],
    explanation: "",
  });

  const [timeElapsed, setTimeElapsed] = useState<string>("");

  const [rehabilitation, setRehabilitation] = useState({
    hasEvidence: null as boolean | null,
    notes: "",
  });

  const [certificationChecked, setCertificationChecked] = useState(false);

  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [noticeData, setNoticeData] = useState({
    date: new Date().toISOString().split('T')[0],
    applicantName: "",
    position: "",
    preliminaryDecision: "",
    convictions: ["", "", ""],
    additionalDocuments: "",
    employerName: "",
    employerAddress: "",
    employerEmail: "",
    employerPhone: "",
    employerContact: "",
    contactInfo: {
      name: "",
      mailingAddress: "",
      emailAddress: ""
    }
  });
  const [isEditingNotice, setIsEditingNotice] = useState(false);

  const [showFinalNoticeDialog, setShowFinalNoticeDialog] = useState(false);
  const [finalNoticeData, setFinalNoticeData] = useState({
    date: new Date().toISOString().split('T')[0],
    applicantName: "",
    employerContact: "",
    employerCompany: "",
    employerAddress: "",
    employerPhone: "",
    initialNoticeDate: "",
    responseReceived: "none", // 'none', 'noResponse', 'infoSubmitted'
    responseDetails: "",
    convictionError: "none", // 'none', 'was', 'wasNot'
    convictions: ["", "", ""],
    assessmentNotes: "",
    timeSinceOffense: "",
    timeSinceSentence: "",
    position: "",
    jobDuties: "",
    fitnessImpact: "",
    reconsideration: "none", // 'none', 'notAllowed', 'allowed'
    reconsiderationProcess: "",
    preliminaryDecision: "", // Add this line
    employerTitle: "" // Add this line
  });
  const [isEditingFinalNotice, setIsEditingFinalNotice] = useState(false);

  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const [showWOTCCongratsModal, setShowWOTCCongratsModal] = useState(false);

  const [documents, setDocuments] = useState<Record<string, RequiredDocument>>({
    jobDescription: { type: "jobDescription", file: null, notes: "" },
    backgroundCheck: { type: "backgroundCheck", file: null, notes: "" },
    restorativeRecord: { type: "restorativeRecord", file: null, notes: "" },
  });

  // Add state for the modal
  const [showComplianceModal, setShowComplianceModal] = useState(false);

  const [showReassessmentReminder, setShowReassessmentReminder] = useState(false);

  const [reassessmentData, setReassessmentData] = useState({
    hasError: "",
    errorDescription: "",
    evidence: ["", "", "", ""],
    rescindReason: ""
  });

  useEffect(() => {
    setDocuments({
      jobDescription: {
        type: "jobDescription",
        file: typeof window !== "undefined" ? new File([
          "Sample content for Entry Level Sales Associate Job Description"
        ], "Entry_Level_Sales_Associate_Job_Description.pdf", { type: "application/pdf" }) : null,
        notes: "",
      },
      backgroundCheck: {
        type: "backgroundCheck",
        file: typeof window !== "undefined" ? new File([
          "Sample content for Background Check Summary Jacobi Iverson"
        ], "Background_Check_Summary_Jacobi_Iverson.pdf", { type: "application/pdf" }) : null,
        notes: "",
      },
      restorativeRecord: {
        type: "restorativeRecord",
        file: typeof window !== "undefined" ? new File([
          "Sample content for Jacobi Iverson Restorative Record"
        ], "Jacobi Iverson Restorative Record (0) (1).pdf", { type: "application/pdf" }) : null,
        notes: "",
      },
    });
  }, []);

  const handleStepClick = (stepId: number) => {
    const previousStepsCompleted = steps
      .filter(step => step.id < stepId)
      .every(step => step.completed);

    if (!previousStepsCompleted) {
      toast({
        title: "Cannot Skip Steps",
        description: "Please complete the previous steps before proceeding.",
      });
      return;
    }

    if (stepId > 1 && hasConditionalOffer === "no") {
      setShowBlockingDialog(true);
      return;
    }

    setCurrentStep(stepId);
  };

  const handleNext = () => {
    if (currentStep === 1 && hasConditionalOffer === "no") {
      setShowOfferLetterDialog(true);
      return;
    }

    setSteps(prev => prev.map(step => 
      step.id === currentStep ? { ...step, completed: true } : step
    ));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleComplete = () => {
    setShowCompletionWarning(true);
  };

  const handleComplianceAcknowledge = () => {
    setShowCompletionWarning(false);
    setShowComplianceConfirmation(true);
  };

  const handleComplianceConfirm = () => {
    setShowComplianceConfirmation(false);
    setShowTimeframeDialog(true);
  };

  const handleTimeframeSubmit = () => {
    setShowTimeframeDialog(false);
    setShowFinalDialog(true);
  };

  const handleReturnToDashboard = () => {
    router.push("/");
  };

  const handleSendOfferLetter = () => {
    toast({
      title: "Conditional Offer Letter Sent",
      description: "The letter has been sent to the candidate. Please wait for their acknowledgment before proceeding with the background check.",
    });
    setShowOfferLetterDialog(false);
    setHasConditionalOffer("yes");
  };

  const handleProceedWithHire = () => {
    setShowWOTCModal(true);
  };

  const handleContinueToSigning = () => {
    setShowWOTCModal(false);
    setShowWOTCSigningScreen(true);
  };

  const handleSignAndSend = () => {
    toast({
      title: "Forms Signed and Sent",
      description: "The WOTC forms have been signed and sent for review.",
    });
    setShowWOTCCongratsModal(true);
  };

  const getLegalGuidance = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground">
              An employer can only ask about criminal history after extending a conditional job offer. If an employer asks about criminal history too early, they cannot later use a candidate's non-response or omission as grounds for withdrawing a job offer or taking negative action.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground mb-2">
              Employers are strictly prohibited from inquiring about or using certain types of criminal history when making employment decisions.
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              This includes:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Arrests not resulting in conviction (except limited exceptions under CA Labor Code § 432.7)</li>
              <li>• Participation in pretrial or posttrial diversion or deferred judgment programs</li>
              <li>• Convictions that have been sealed, expunged, dismissed, pardoned, or otherwise rendered legally inoperative</li>
              <li>• Any juvenile court proceedings</li>
              <li>• Non-felony marijuana possession convictions older than two years</li>
              <li>• Any conviction older than seven years from the date of disposition</li>
            </ul>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground mb-4">
              Before rejecting a candidate based on criminal history, employers must evaluate:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• The seriousness and context of the offense</li>
              <li>• Time passed since the offense or sentence</li>
              <li>• Relevance of the offense to the job duties</li>
              <li>• Any evidence of rehabilitation or mitigating factors the candidate provides</li>
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground mb-2">
              Evidence of Rehabilitation or Mitigating Circumstances" may include, but is not limited to:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Consideration of the age of the person at the time of the Conviction</li>
              <li>• The time that has passed since the offense or conduct and/or completion of the sentence</li>
            </ul>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <div className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Employers are required to consider a wide range of factors that demonstrate rehabilitation or provide context for an individual's criminal history. These may include:
              </p>

              <div>
                <h4 className="text-sm font-medium mb-2">Compliance with parole or probation</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Satisfactory completion of all terms and conditions</li>
                  <li>• Note: Inability to pay fines, fees, or restitution due to indigence does not count as noncompliance</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Employment history</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Length and consistency of employment before and after the offense</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Age at the time of conviction</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Younger age at the time of the offense may weigh in favor of rehabilitation</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Employer recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Especially those relating to performance and conduct in post-conviction employment</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Educational or vocational training</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Achievements since the conviction, including while incarcerated</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Rehabilitative treatment program participation</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Such as alcohol or drug treatment</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Self-improvement efforts, including:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>a. Job training</li>
                  <li>b. Counseling</li>
                  <li>c. Community service</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Supporting documentation, such as:</h4>
                <p className="text-sm text-muted-foreground mb-2">a. Letters of recommendation from:</p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li>• Community organizations</li>
                  <li>• Counselors or case managers</li>
                  <li>• Teachers or community leaders</li>
                  <li>• Parole/probation officers</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">b. Other written materials that demonstrate rehabilitation or mitigating circumstances</p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Voluntarily provided mitigating factors, which may include:</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>a. Homelessness</li>
                  <li>b. Trauma</li>
                  <li>c. Domestic or dating violence</li>
                  <li>d. Sexual assault</li>
                  <li>e. Human trafficking</li>
                  <li>f. Duress or coercive conditions</li>
                  <li>g. Intimate partner abuse (physical or emotional)</li>
                  <li>h. Untreated substance abuse or mental illness</li>
                </ul>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground">
              If the employer plans to withdraw an offer based on criminal history, they must first send a written notice by mail and email (if possible), stating:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• The intent to take adverse action</li>
              <li>• The applicant's right to respond</li>
              <li>• The timeline for response and acceptable types of evidence, such as disputes to the record or evidence of rehabilitation</li>
            </ul>
          </div>
        );
      case 7:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Initial Individualized Assessment must include at a minimum, consideration of the following factors:
            </p>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground font-medium">a. The nature and gravity of the offense or conduct, including but not limited to:</p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li>• Whether the harm was to property or people</li>
                  <li>• The degree or severity of the harm or offense</li>
                  <li>• The age of the Applicant or Employee when the conduct occurred</li>
                  <li>• The permanence of the harm or offense</li>
                </ul>
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium">b. The time that has passed since the offense or conduct and/or completion of the sentence</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium">c. The nature of the Employment position sought or held, including consideration of:</p>
                <ul className="text-sm text-muted-foreground space-y-2 pl-4">
                  <li>• The specific duties of the job</li>
                  <li>• Whether the Employment position offers the opportunity for the same or a similar offense to occur</li>
                  <li>• Whether circumstances leading to the conduct for which the person was convicted or that is the subject of an Unresolved Arrest will recur in the Employment position</li>
                </ul>
              </div>

              <div>
                <p className="text-sm text-muted-foreground font-medium">d. Evidence of Rehabilitation or Mitigating Circumstances</p>
                <p className="text-sm text-muted-foreground">
                  If the Applicant or Employee voluntarily provides to the Employer any Evidence of Rehabilitation or Mitigating Circumstances before or during the Initial Individualized Assessment, that evidence must also be considered as part of the Initial Individualized Assessment.
                </p>
              </div>
            </div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold"></h3>
            <p className="text-sm text-muted-foreground mb-4">
              The Employer shall consider all information and documents, whether written or oral, timely submitted by the Applicant or Employee pursuant to this Section before making a final decision or taking an Adverse Action. If the employer decides to rescind the offer after the second assessment, they must send a written final notice by both regular and electronic mail (if possible), stating the final decision and related rationale.
            </p>
            
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Violations can result in escalating fines per applicant:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• First violation: up to $5,000</li>
                <li>• Second violation: up to $10,000</li>
                <li>• Third and subsequent violations: up to $20,000</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                At least 50% of the fines go to the harmed applicant or employee.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Select a step to view relevant legal guidance.
          </div>
        );
    }
  };

  const getCompanyPolicy = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Internal policy requires documented confirmation of conditional offer before accessing any conviction history information.
            </p>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Company guidelines for evaluating conviction history emphasize consideration of only legally permissible information that directly relates to job duties.
            </p>
          </div>
        );
        case 5:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Invite and log mitigating materials during the ≥ 7‑business‑day pre‑adverse window: certificates, sobriety proof, references, completion of supervision, education, NA/AA letters. Weight evidence in line with EEOC factors (training, job history, character refs).
            </p>
          </div>
        );
        case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
            Pursuant to the San Francisco Fair Chance Ordinance, we consider for employment qualified applicants with arrest and conviction records.
            </p>
          </div>
        );
        case 7:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
            Before taking adverse action such as failing/refusing to hire, discharging, or not promoting an individual based on a conviction history or unresolved arrest, we give the candidate an opportunity to present evidence that the information is inaccurate, that they have been rehabilitated, or other mitigating factors.
            </p>
          </div>
        );
        case 8:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
            We are committed to fair hiring practices and fully adheres to the requirements set forth by the San Francisco Office of Labor Standards Enforcement (OLSE) under the Fair Chance Ordinance (FCO). This includes providing applicants with automated notice of their right to file a complaint with the OLSE if they believe we are not in compliance with the law.
            </p>
          </div>
        );
        case 4:
          return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Record date of conviction and completion of sentence; calculate years elapsed. Highlight whether ≥ 7 yrs have passed (FCO safe‑harbor unless role supervises minors/dependent adults).
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              If a candidate's background check reveals a criminal history, we use guidance from the Equal Employment Opportunity Commission (EEOC) recommendations based on the Green Factors, also called the "nature-time-nature" test, which considers:
            </p>
            <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4">
              <li>The nature and gravity of the offense</li>
              <li>The time elapsed since the offense</li>
              <li>The nature of the job being sought</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              The outcome of the nature-time-nature test is to determine if the offense and surrounding circumstances are so correlated as to negatively impact the candidate's ability to perform the specific role. If the candidate's past criminal history has no strong correlation to the role or our organization, then we may consider moving forward in the hiring process.
            </p>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            Select a step to view relevant company policies.
          </div>
        );
    }
  };

  const getCandidateContext = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Candidate received conditional offer on May 5, 2025.
            </p>
          </div>
        );
        case 7:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Candidate will receive notice of decision and can be contacted via conversational agent or messaging through the secure Restorative Record platform.
            </p>
          </div>
        );
        case 6:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Candidate's initial Restorative Record can be accessed at: 
              <a href="https://cornell.restorativerecord.com/restorative-record/98ab893c-2377-4f3b-9ee2-8fd898da22c4" target="_blank" rel="noopener noreferrer">https://cornell.restorativerecord.com/restorative-record/98ab893c-2377-4f3b-9ee2-8fd898da22c4</a>
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Job Duties & Responsibilities</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Prospect and qualify leads through cold calls, email outreach, and inbound inquiries</li>
              <li>• Conduct virtual or in-person product demonstrations and communicate clear value propositions</li>
              <li>• Log all interactions and sales activities in the company's CRM platform, ensuring accurate and up-to-date
              pipeline data</li>
              <li>• Collaborate cross-functionally with marketing and customer success to support a cohesive customer journey</li>
            </ul>
          </div>
        );
        case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Nature & Circumstances of the Offense</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Offense: Possession with Intent to Sell a Controlled Substance (Class B felony)</li>
              <li>• Jurisdiction & Disposition: Kings County, NY; convicted 12 May 2018; indeterminate 1–9 year sentence</li>
              <li>• Custody Period: Served 4 years in state prison (Jun 2019 – Jun 2023)</li>
              <li>• Supervision: Paroled Jun 2023; completed all parole obligations May 2025</li>
              <li>• Conduct on Supervision: One curfew violation (Sep 2023) resulted in a formal warning; no sanctions or subsequent incidents</li>
            </ul>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Time Elapsed Since Offense & Completion of Sentence</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Conviction Date to Present: ~ 7 years (86 months)</li>
              <li>• Release to Present: ~ 23 months</li>
              <li>• Completion of Supervision to Present: &lt; 1 month (fully resolved)</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              The substantial passage of time and successful completion of supervision signal reduced recidivism risk under established criminogenic‑need models.
            </p>
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Evidence of Rehabilitation & Good Conduct</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Recovery & Support</h4>
                <p className="text-sm text-muted-foreground">
                  • 18‑month verified sobriety; Narcotics Anonymous sponsor support
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Education</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• GED with honors</li>
                  <li>• A.A.S., Business Administration – Borough of Manhattan CC (CUNY)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Industry Credentials</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• OSHA 10‑Hour General Industry (Mar 2020)</li>
                  <li>• CA Dept. of Public Health – Food Handler Certificate (valid through Apr 2023)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Professional Development</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Self‑taught data analysis (Excel, SQL basics)</li>
                  <li>• Project management coursework</li>
                  <li>• Bilingual (English/Spanish)</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Community Service</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Reentry Coordinator, Osborne Association – founded 20‑student mentorship program for children of incarcerated parents</li>
                  <li>• Facilitator of restorative‑justice circles inside custody</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground">
            The candidate holds a Certificate of Rehabilitation—a court-issued order affirming that an individual convicted of a felony and previously incarcerated in state or local prison has demonstrated rehabilitation under the law.
          </div>
        );
    }
  };

  const renderOfferLetterContent = () => {
    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className={!isEditingLetter ? "space-y-4" : "hidden"}>
          <p>{offerLetterData.date}</p>
          <p>RE: Conditional Job Offer & Notice of Intent to Conduct Background Check</p>
          <p>Dear {offerLetterData.applicantName || "[APPLICANT NAME]"},</p>
          <p>
            We are writing to make you a conditional offer of employment for the position of {offerLetterData.position || "[INSERT POSITION]"}. We are informing you that before this job offer becomes final, we will conduct a review of your criminal history background.
          </p>
          <p>We have good cause to conduct a review of criminal history for this position because:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              If we do not review the criminal history of applicants for this position, we will face a significant risk to our business operations or business reputation because {offerLetterData.businessRisk || "[explain the reasoning, i.e., the sensitive, serious, public, or critical nature of the business and job position, which requires the conduct of criminal background checks.]"}
              <br />
              <span className="text-sm text-muted-foreground">Los Angeles County Code Chapter 8.300.050. D</span>
            </li>
            <li>
              a review of criminal history is necessary for the position due to concerns regarding the safety of, or risk of harm or harassment to {offerLetterData.safetyRisk || "[identify the persons at risk, i.e, staff, employees, contractors, vendors, associates, clients, customers, minors, dependents, or persons 65 years or older, or the general public]"}
              <br />
              <span className="text-sm text-muted-foreground">Los Angeles County Code Chapter 8.300.050. D.6</span>
            </li>
          </ul>
          <p>In addition to your criminal history information, we will also be reviewing the following information, background or history as part of the overall background check process before your job offer becomes final:</p>
          <ul className="list-disc pl-5 space-y-2">
            {offerLetterData.additionalChecks && offerLetterData.additionalChecks.length > 0 ? (
              offerLetterData.additionalChecks.map((check, index) => (
                <li key={index}>{check || "______________________________________"}</li>
              ))
            ) : (
              <li>______________________________________</li>
            )}
          </ul>
          <div className="mt-6">
            <p>Sincerely,</p>
            <p>{offerLetterData.employerContact || "[EMPLOYER CONTACT]"}</p>
            <p>{offerLetterData.employer || "[EMPLOYER]"}</p>
            <p>{offerLetterData.employerAddress || "[EMPLOYER ADDRESS]"}</p>
            <p>{offerLetterData.contactPhone || "[CONTACT'S PHONE NUMBER]"}</p>
            <p>{offerLetterData.contactEmail || "[CONTACT'S EMAIL]"}</p>
          </div>
        </div>
        <div className={isEditingLetter ? "space-y-4" : "hidden"}>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={offerLetterData.date}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicantName">Applicant Name</Label>
            <Input
              id="applicantName"
              value={offerLetterData.applicantName}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, applicantName: e.target.value }))}
              placeholder="Enter applicant name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={offerLetterData.position}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Enter position title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="businessRisk">Business Risk Explanation</Label>
            <Textarea
              id="businessRisk"
              value={offerLetterData.businessRisk}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, businessRisk: e.target.value }))}
              placeholder="Explain the reasoning for conducting criminal background checks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="safetyRisk">Safety Risk Explanation</Label>
            <Textarea
              id="safetyRisk"
              value={offerLetterData.safetyRisk}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, safetyRisk: e.target.value }))}
              placeholder="Identify the persons at risk"
            />
          </div>
          <div className="space-y-2">
            <Label>Additional Background Checks</Label>
            {offerLetterData.additionalChecks && offerLetterData.additionalChecks.map((check, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={check}
                  onChange={(e) => {
                    const newChecks = [...(offerLetterData.additionalChecks || [])];
                    newChecks[index] = e.target.value;
                    setOfferLetterData(prev => ({ ...prev, additionalChecks: newChecks }));
                  }}
                  placeholder="Enter additional check"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    const newChecks = (offerLetterData.additionalChecks || []).filter((_, i) => i !== index);
                    setOfferLetterData(prev => ({ ...prev, additionalChecks: newChecks }));
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setOfferLetterData(prev => ({
                ...prev,
                additionalChecks: [...(prev.additionalChecks || []), ""]
              }))}
            >
              Add Check
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employerContact">Employer Contact</Label>
            <Input
              id="employerContact"
              value={offerLetterData.employerContact}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, employerContact: e.target.value }))}
              placeholder="Enter employer contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employer">Employer</Label>
            <Input
              id="employer"
              value={offerLetterData.employer}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, employer: e.target.value }))}
              placeholder="Enter employer name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employerAddress">Employer Address</Label>
            <Textarea
              id="employerAddress"
              value={offerLetterData.employerAddress}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, employerAddress: e.target.value }))}
              placeholder="Enter employer address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              value={offerLetterData.contactPhone}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, contactPhone: e.target.value }))}
              placeholder="Enter contact phone number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              value={offerLetterData.contactEmail}
              onChange={(e) => setOfferLetterData(prev => ({ ...prev, contactEmail: e.target.value }))}
              placeholder="Enter contact email"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderNoticeContent = () => {
    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className={!isEditingNotice ? "space-y-4" : "hidden"}>
          <p>{noticeData.date}</p>
          <p className="font-semibold">RE: Preliminary Notice of Adverse Action</p>
          <p>Dear {noticeData.applicantName || "[APPLICANT/EMPLOYEE NAME]"},</p>
          
          <p>After reviewing the results of your criminal background check, we have made a preliminary (nonfinal) decision to take the following action:</p>
          
          <p>{noticeData.preliminaryDecision || "[Identify the preliminary decision for adverse action, i.e., withdrawal of conditional job offer, denial of promotion, discharge, transfer or discipline. Example: 'We intend to withdraw our conditional job offer for the position of [JOB POSITION]'; or, 'We intend to deny your promotion to the position of [JOB POSITION].']"}</p>
          
          <p>This decision was based on the following convictions or unresolved arrests:</p>
          
          <ul className="list-disc pl-5">
            {noticeData.convictions.map((conviction, idx) => (
              <li key={idx}>{conviction || "____________________________________"}</li>
            ))}
          </ul>
          
          <p>Attached to this Preliminary Notice are the following documents:</p>
          
          <ul className="list-disc pl-5">
            <li>A copy of your Criminal Background Check Report.</li>
            <li>{noticeData.additionalDocuments || "[If applicable, identify any other information or documentation relating to the applicant's or employee's criminal history obtained by the employer, including but not limited to, internet searches, court records, news articles, and/or social media content]"}</li>
            <li>A copy of our Initial Individualized Assessment, which explains in detail our concerns regarding how your criminal history has a direct, adverse and negative bearing on your ability to perform the duties of the job position.</li>
          </ul>
          
          <div className="mt-6">
            <h3 className="font-semibold">YOUR RIGHT TO RESPOND TO THIS PRELIMINARY NOTICE AND IMPORTANT DEADLINES:</h3>
            
            <p>You may respond to this Preliminary Notice before our decision becomes final.</p>
            
            <p>You have FIVE (5) BUSINESS DAYS from the receipt of this Preliminary Notice to do one of the following:</p>
            
            <ol className="list-decimal pl-5 space-y-2">
              <li>Submit a written Response to this Preliminary Notice containing:
                <ul className="list-disc pl-5 mt-1">
                  <li>Information challenging the accuracy of the criminal background check report or other criminal history information; and/or</li>
                  <li>Evidence of rehabilitation or mitigating circumstances.</li>
                </ul>
              </li>
              <li>Submit a written request to extend the deadline to submit your Response for TEN (10) ADDITIONAL BUSINESS DAYS, affirming that you need additional time to gather or obtain relevant information, evidence and/or documents for your Response.</li>
              <li>Notify us that you will NOT be submitting a written Response but are instead electing to present evidence of rehabilitation or mitigating circumstances orally, via in-person, virtual or telephone contact. The meeting will take place within ten (10) Business Days of your request.</li>
            </ol>
            
            <p className="mt-4 font-semibold">NOTE: If you do not take any of the above actions within FIVE (5) BUSINESS DAYS from the receipt of this Preliminary Notice, the decision contained in this Preliminary Notice will become final.</p>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold">RESPONSE EXAMPLES: Below are examples of information and records you may send us for our consideration:</h3>
            
            <h4 className="font-semibold mt-4">Information Challenging the Accuracy of the Criminal History Record or Criminal Background Check:</h4>
            <ul className="list-disc pl-5">
              <li>Evidence that you were not convicted or not arrested of one or more of the offenses we listed above.</li>
              <li>Evidence that the criminal history report or background check record is inaccurate (i.e., data errors, single criminal charge is listed multiple times, expunged or sealed records listed, etc.).</li>
            </ul>
            
            <h4 className="font-semibold mt-4">Evidence of Rehabilitation or Mitigating Circumstances:</h4>
            <ul className="list-disc pl-5">
              <li>Facts or circumstances surrounding the offense or conduct, showing that the conduct was less serious than the conviction seems.</li>
              <li>The time that has passed since the conduct that led to your conviction(s) or since your release from incarceration.</li>
              <li>The length and consistency of employment history or community involvement (such as volunteer activities) before and after the offense(s).</li>
              <li>Employer recommendations, especially concerning post-conviction employment.</li>
              <li>Employment or character references from people who know you, such as letters from teachers, counselors, supervisors, clergy, and probation or parole officers.</li>
              <li>Educational attainment or vocational or professional training since the conviction, including training received while incarcerated.</li>
              <li>Evidence that you attended school, job training, or counseling.</li>
              <li>Completion of or active participation in rehabilitative treatment.</li>
              <li>Evidence that you have performed the same type of work since your conviction.</li>
              <li>Whether you are bonded under a federal, state, or local bonding program.</li>
              <li>Your satisfactory compliance with all terms and conditions of parole and/or probation.</li>
              <li>Any other evidence of your rehabilitation efforts or evidence showing your present fitness for the job position.</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold">CONTACT INFO: Please send your Response, requests for extension, submissions and/or any additional information you would like us to consider to:</h3>
            
            <p>{noticeData.contactInfo.name || "[INSERT NAME AND MAILING ADDRESS, EMAIL ADDRESS]"}</p>
          </div>
          
          <div className="mt-6">
            <h3 className="font-semibold">NEXT STEPS AFTER SUBMISSION OF RESPONSE: Second Individualized Assessment and Final Notice</h3>
            
            <p>Within THIRTY (30) CALENDAR DAYS of receipt of your Response to this Preliminary Notice, we will do the following:</p>
            
            <ul className="list-disc pl-5">
              <li>We will review your Response, including any information and records you timely submit to us, and conduct a Second Individualized Assessment, in order to reassess whether your criminal history has a direct, adverse and negative bearing on your ability to perform the duties of the job position.</li>
              <li>If after conducting the Second Individualized Assessment, we make a final decision to {noticeData.preliminaryDecision || "[Identify the adverse action, i.e., withdraw the conditional job offer, deny the promotion, discharge, etc.]"}, we will send you a Final Notice of Adverse Action.</li>
            </ul>
          </div>
          
          <div className="mt-6">
            <p>Sincerely,</p>
            <p>{noticeData.employerName || "[EMPLOYER COMPANY NAME]"}</p>
            <p>{noticeData.employerContact || "[H.R CONTACT NAME]"}</p>
            <p>{noticeData.employerAddress || "[EMPLOYER ADDRESS]"}</p>
            <p>{noticeData.employerEmail || "[CONTACT'S EMAIL]"}</p>
            <p>{noticeData.employerPhone || "[CONTACT'S PHONE NUMBER]"}</p>
          </div>
        </div>
        
        <div className={isEditingNotice ? "space-y-4" : "hidden"}>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={noticeData.date}
              onChange={(e) => setNoticeData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="applicantName">Applicant/Employee Name</Label>
            <Input
              id="applicantName"
              value={noticeData.applicantName}
              onChange={(e) => setNoticeData(prev => ({ ...prev, applicantName: e.target.value }))}
              placeholder="Enter applicant/employee name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              value={noticeData.position}
              onChange={(e) => setNoticeData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Enter position"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preliminaryDecision">Preliminary Decision</Label>
            <Textarea
              id="preliminaryDecision"
              value={noticeData.preliminaryDecision}
              onChange={(e) => setNoticeData(prev => ({ ...prev, preliminaryDecision: e.target.value }))}
              placeholder="Describe the preliminary decision"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Convictions or Unresolved Arrests</Label>
            {noticeData.convictions.map((conviction, idx) => (
              <Input
                key={idx}
                value={conviction}
                onChange={e => setNoticeData(prev => {
                  const convictions = [...prev.convictions];
                  convictions[idx] = e.target.value;
                  return { ...prev, convictions };
                })}
                placeholder={`Conviction ${idx + 1}`}
              />
            ))}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="additionalDocuments">Additional Documents</Label>
            <Textarea
              id="additionalDocuments"
              value={noticeData.additionalDocuments}
              onChange={(e) => setNoticeData(prev => ({ ...prev, additionalDocuments: e.target.value }))}
              placeholder="List any additional documents"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerName">Employer Company Name</Label>
            <Input
              id="employerName"
              value={noticeData.employerName}
              onChange={(e) => setNoticeData(prev => ({ ...prev, employerName: e.target.value }))}
              placeholder="Enter employer company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerContact">H.R Contact Name</Label>
            <Input
              id="employerContact"
              value={noticeData.employerContact}
              onChange={(e) => setNoticeData(prev => ({ ...prev, employerContact: e.target.value }))}
              placeholder="Enter H.R contact name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerAddress">Employer Address</Label>
            <Input
              id="employerAddress"
              value={noticeData.employerAddress}
              onChange={(e) => setNoticeData(prev => ({ ...prev, employerAddress: e.target.value }))}
              placeholder="Enter employer address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerEmail">Contact's Email</Label>
            <Input
              id="employerEmail"
              type="email"
              value={noticeData.employerEmail}
              onChange={(e) => setNoticeData(prev => ({ ...prev, employerEmail: e.target.value }))}
              placeholder="Enter contact's email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="employerPhone">Contact's Phone Number</Label>
            <Input
              id="employerPhone"
              value={noticeData.employerPhone}
              onChange={(e) => setNoticeData(prev => ({ ...prev, employerPhone: e.target.value }))}
              placeholder="Enter contact's phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfoName">Response Contact Name</Label>
            <Input
              id="contactInfoName"
              value={noticeData.contactInfo.name}
              onChange={(e) => setNoticeData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, name: e.target.value }
              }))}
              placeholder="Enter response contact name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfoMailingAddress">Response Contact Mailing Address</Label>
            <Input
              id="contactInfoMailingAddress"
              value={noticeData.contactInfo.mailingAddress}
              onChange={(e) => setNoticeData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, mailingAddress: e.target.value }
              }))}
              placeholder="Enter response contact mailing address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="contactInfoEmail">Response Contact Email</Label>
            <Input
              id="contactInfoEmail"
              type="email"
              value={noticeData.contactInfo.emailAddress}
              onChange={(e) => setNoticeData(prev => ({
                ...prev,
                contactInfo: { ...prev.contactInfo, emailAddress: e.target.value }
              }))}
              placeholder="Enter response contact email"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderFinalNoticeContent = () => {
    return (
      <div className="space-y-6 max-h-[60vh] overflow-y-auto">
        <div className={!isEditingFinalNotice ? "space-y-4" : "hidden"}>
          <p>{finalNoticeData.date}</p>
          <p className="font-semibold">RE: Final Notice of Adverse Action</p>
          <p>Dear {finalNoticeData.applicantName || "[CANDIDATE NAME]"}:</p>
          <p>
            On {finalNoticeData.initialNoticeDate || "[DATE]"} we sent you a Preliminary Notice of Adverse Action, informing you of our preliminary decision to {finalNoticeData.preliminaryDecision || "[Identify the adverse action, i.e., withdraw job offer, deny promotion, termination, discipline, etc.]"}. This letter is to notify you that this decision is now final, as follows:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={finalNoticeData.responseReceived === 'noResponse'}
                onCheckedChange={() => setFinalNoticeData(prev => ({ ...prev, responseReceived: 'noResponse' }))}
              />
              <span>We did not receive a timely response from you after sending you the Preliminary Notice of Adverse Action, and therefore, our decision to {finalNoticeData.preliminaryDecision || "[identify the adverse action]"} is now final.</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={finalNoticeData.responseReceived === 'infoSubmitted'}
                onCheckedChange={() => setFinalNoticeData(prev => ({ ...prev, responseReceived: 'infoSubmitted' }))}
              />
              <span>We made a final decision to {finalNoticeData.preliminaryDecision || "[identify the adverse action]"}, after considering the information, documents and/or records you submitted in response to the Preliminary Notice of Adverse Action, and conducting a Second Individualized Assessment. A copy of the Second Individualized Assessment is enclosed.</span>
            </div>
          </div>
          <p className="font-semibold mt-4">Our final decision is based on the following criminal history:</p>
          <p>Conviction or Unresolved Arrest & Date</p>
          <ol className="list-decimal pl-5">
            {finalNoticeData.convictions.map((conv, idx) => (
              <li key={idx}>{conv || <span className="text-muted-foreground">[LIST CONVICTION(S) THAT LED TO DECISION]</span>}</li>
            ))}
          </ol>
          <p className="font-semibold mt-4">Request for Reconsideration with Employer (Please check one):</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={finalNoticeData.reconsideration === 'notAllowed'}
                onCheckedChange={() => setFinalNoticeData(prev => ({ ...prev, reconsideration: 'notAllowed' }))}
              />
              <span>Unfortunately, we do not offer any other internal procedure to challenge or request reconsideration of this final decision.</span>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={finalNoticeData.reconsideration === 'allowed'}
                onCheckedChange={() => setFinalNoticeData(prev => ({ ...prev, reconsideration: 'allowed' }))}
              />
              <span>We do offer a way for you to challenge or request reconsideration of this final decision with us as follows: {finalNoticeData.reconsiderationProcess || "[describe internal procedure]"}</span>
            </div>
          </div>
          <p className="font-semibold mt-4">Your Right to File a Fair Chance Complaint with the County of Los Angeles and/or State</p>
          <p className="font-semibold">County of Los Angeles:</p>
          <p>If you believe your rights under the County's Fair Chance Ordinance for Employers have been violated during this process, you have the right to file a complaint with the Los Angeles County Department of Consumer & Business Affairs - Office of Labor Equity, as follows:</p>
          <p>Online: Fair Chance Ordinance for Employers – Consumer & Business</p>
          <p>Phone: 800.593.8222</p>
          <p>Email: FairChance@dcba.lacounty.gov</p>
          <p className="font-semibold mt-4">State:</p>
          <p>If you believe your rights under California's Fair Chance Act have been violated during this process, you have the right to file a complaint with the State's Civil Rights Department (CRD). Information regarding how to file a complaint can be found on the following CRD link: <a href="https://calcivilrights.ca.gov/complaintprocess/how-to-file-a-complaint/" target="_blank" rel="noopener noreferrer">https://calcivilrights.ca.gov/complaintprocess/how-to-file-a-complaint/</a></p>
          <div className="mt-6">
            <p>Sincerely,</p>
            <p>{finalNoticeData.employerContact || "[CONTACT NAME]"}</p>
            <p>{finalNoticeData.employerTitle || "[CONTACT JOB TITLE]"}</p>
          </div>
        </div>
        <div className={isEditingFinalNotice ? "space-y-4" : "hidden"}>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={finalNoticeData.date}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="applicantName">Candidate Name</Label>
            <Input
              id="applicantName"
              value={finalNoticeData.applicantName}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, applicantName: e.target.value }))}
              placeholder="Enter candidate name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="initialNoticeDate">Initial Notice Date</Label>
            <Input
              id="initialNoticeDate"
              type="date"
              value={finalNoticeData.initialNoticeDate}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, initialNoticeDate: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preliminaryDecision">Preliminary Decision</Label>
            <Input
              id="preliminaryDecision"
              value={finalNoticeData.preliminaryDecision}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, preliminaryDecision: e.target.value }))}
              placeholder="Enter preliminary decision"
            />
          </div>
          <div className="space-y-2">
            <Label>Convictions</Label>
            {finalNoticeData.convictions.map((conviction, index) => (
              <Input
                key={index}
                value={conviction}
                onChange={e => {
                  const newConvictions = [...finalNoticeData.convictions];
                  newConvictions[index] = e.target.value;
                  setFinalNoticeData(prev => ({ ...prev, convictions: newConvictions }));
                }}
                placeholder={`Enter conviction ${index + 1}`}
              />
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="reconsiderationProcess">Internal Procedure for Reconsideration</Label>
            <Textarea
              id="reconsiderationProcess"
              value={finalNoticeData.reconsiderationProcess}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, reconsiderationProcess: e.target.value }))}
              placeholder="Describe internal procedure for reconsideration"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employerContact">Contact Name</Label>
            <Input
              id="employerContact"
              value={finalNoticeData.employerContact}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, employerContact: e.target.value }))}
              placeholder="Enter contact name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employerTitle">Contact Job Title</Label>
            <Input
              id="employerTitle"
              value={finalNoticeData.employerTitle}
              onChange={e => setFinalNoticeData(prev => ({ ...prev, employerTitle: e.target.value }))}
              placeholder="Enter contact job title"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Confirm Conditional Offer</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="offer-yes"
                  name="conditional-offer"
                  checked={hasConditionalOffer === "yes"}
                  onChange={() => setHasConditionalOffer("yes")}
                  className="h-5 w-5 appearance-none rounded-full border-2 border-gray-400 bg-white checked:bg-cinnabar checked:border-cinnabar checked:ring-0 checked:ring-offset-0 focus:ring-0 focus:ring-offset-0 transition
                    before:content-[''] before:block before:w-3 before:h-3 before:rounded-full before:mx-auto before:my-auto before:bg-cinnabar before:opacity-0 checked:before:opacity-100"
                  style={{
                    boxShadow: "none",
                    outline: "none",
                    position: "relative",
                  }}
                />
                <label htmlFor="offer-yes" className="text-base font-poppins font-normal">Yes, a conditional offer has been extended</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="offer-no"
                  name="conditional-offer"
                  checked={hasConditionalOffer === "no"}
                  onChange={() => setHasConditionalOffer("no")}
                  className="h-5 w-5 appearance-none rounded-full border-2 border-gray-400 bg-white checked:bg-cinnabar checked:border-cinnabar checked:ring-0 checked:ring-offset-0 focus:ring-0 focus:ring-offset-0 transition
                    before:content-[''] before:block before:w-3 before:h-3 before:rounded-full before:mx-auto before:my-auto before:bg-cinnabar before:opacity-0 checked:before:opacity-100"
                  style={{
                    boxShadow: "none",
                    outline: "none",
                    position: "relative",
                  }}
                />
                <label htmlFor="offer-no" className="text-base font-poppins font-normal">No, a conditional offer has not been extended</label>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Validate Document Basis</h2>
            <p className="text-muted-foreground">
              Review the following criteria to ensure only legally permissible information is considered.
            </p>
            <div className="space-y-6">
              {/* Checklist Item 1 */}
              <div className="flex items-center gap-4">
                <Checkbox
                  id="old"
                  checked={documentValidation.isOld}
                  onCheckedChange={(checked) =>
                    setDocumentValidation(prev => ({ ...prev, isOld: checked as boolean }))
                  }
                  className="h-6 w-6 border-2 border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:text-green-500 focus:ring-0 focus:ring-offset-0 transition"
                  style={{ borderColor: "#d1d5db" }}
                />
                <div>
                  <div className="text-base font-bold font-poppins leading-tight">
                    Is the conviction more than 7 years old?
                  </div>
                  <div className="text-base font-normal font-poppins text-muted-foreground mt-1">
                    Unless supervising minors/dependent adults, convictions older than 7 years cannot be considered.
                  </div>
                </div>
              </div>
              {/* Checklist Item 2 */}
              <div className="flex items-center gap-4">
                <Checkbox
                  id="juvenile"
                  checked={documentValidation.isJuvenile}
                  onCheckedChange={(checked) =>
                    setDocumentValidation(prev => ({ ...prev, isJuvenile: checked as boolean }))
                  }
                  className="h-6 w-6 border-2 border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:text-green-500 focus:ring-0 focus:ring-offset-0 transition"
                  style={{ borderColor: "#d1d5db" }}
                />
                <div>
                  <div className="text-base font-bold font-poppins leading-tight">
                    Is the offense juvenile-related?
                  </div>
                  <div className="text-base font-normal font-poppins text-muted-foreground mt-1">
                    Juvenile records cannot be considered in employment decisions.
                  </div>
                </div>
              </div>
              {/* Checklist Item 3 */}
              <div className="flex items-center gap-4">
                <Checkbox
                  id="decriminalized"
                  checked={documentValidation.isDecriminalized}
                  onCheckedChange={(checked) =>
                    setDocumentValidation(prev => ({ ...prev, isDecriminalized: checked as boolean }))
                  }
                  className="h-6 w-6 border-2 border-gray-300 bg-white data-[state=checked]:bg-white data-[state=checked]:text-green-500 focus:ring-0 focus:ring-offset-0 transition"
                  style={{ borderColor: "#d1d5db" }}
                />
                <div>
                  <div className="text-base font-bold font-poppins leading-tight">
                    Is the conduct now decriminalized?
                  </div>
                  <div className="text-base font-normal font-poppins text-muted-foreground mt-1">
                    Decriminalized conduct (e.g., cannabis-related) cannot be considered.
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Direct Job-Relation Inquiry</h2>
            <RadioGroup
              value={jobRelation.isRelated === null ? "" : jobRelation.isRelated.toString()}
              onValueChange={(value) => setJobRelation(prev => ({ ...prev, isRelated: value === "true" }))}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="related-yes" />
                  <Label htmlFor="related-yes">Yes, the conviction is directly related to job duties</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="related-no" />
                  <Label htmlFor="related-no">No, the conviction is not directly related</Label>
                </div>
              </div>
            </RadioGroup>

            {jobRelation.isRelated && (
              <div className="space-y-4">
                <div>
                  <Label>Select Related Job Duties</Label>
                  <Select
                    value={jobRelation.duties[0]}
                    onValueChange={(value) => setJobRelation(prev => ({ ...prev, duties: [value] }))}
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Choose a job duty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="financial">Financial Management</SelectItem>
                      <SelectItem value="sensitive">Access to Sensitive Data</SelectItem>
                      <SelectItem value="supervision">Supervision of Others</SelectItem>
                      <SelectItem value="security">Security Responsibilities</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Explain the Direct Relationship</Label>
                  <Textarea
                    value={jobRelation.explanation}
                    onChange={(e) => setJobRelation(prev => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Describe how the conviction directly relates to job responsibilities..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Time Elapsed Analysis</h2>
            <Select
              value={timeElapsed}
              onValueChange={setTimeElapsed}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select time elapsed since offense" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                <SelectItem value="1-3">1-3 years</SelectItem>
                <SelectItem value="3-7">3-7 years</SelectItem>
                <SelectItem value="more-than-7">More than 7 years</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Evidence of Rehabilitation</h2>
            <RadioGroup
              value={rehabilitation.hasEvidence === null ? "" : rehabilitation.hasEvidence.toString()}
              onValueChange={(value) => setRehabilitation(prev => ({ ...prev, hasEvidence: value === "true" }))}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="evidence-yes" />
                  <Label htmlFor="evidence-yes">Yes, evidence was provided</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="evidence-no" />
                  <Label htmlFor="evidence-no">No evidence was provided</Label>
                </div>
              </div>
            </RadioGroup>

            <div>
              <Label>Rehabilitation Notes</Label>
              <Textarea
                value={rehabilitation.notes}
                onChange={(e) => setRehabilitation(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Document any evidence of rehabilitation or mitigating factors..."
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Assessment Summary</h2>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Job-relatedness</h3>
                <p>{jobRelation.isRelated ? "Directly related" : "Not directly related"}</p>
                {jobRelation.isRelated && (
                  <>
                    <p className="text-sm text-muted-foreground mt-2">Related duties:</p>
                    <ul className="list-disc pl-5">
                      {jobRelation.duties.map(duty => (
                        <li key={duty}>{duty}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Time Elapsed</h3>
                <p>{timeElapsed.replace("-", " to ")}</p>
              </div>

              <div className="rounded-lg border p-4">
                <h3 className="font-semibold mb-2">Rehabilitation Evidence</h3>
                <p>{rehabilitation.hasEvidence ? "Evidence provided" : "No evidence provided"}</p>
                {rehabilitation.notes && (
                  <p className="text-sm text-muted-foreground mt-2">{rehabilitation.notes}</p>
                )}
              </div>

              <div className="flex items-start space-x-3 mt-6">
                <Checkbox
                  id="certification"
                  checked={certificationChecked}
                  onCheckedChange={(checked) => setCertificationChecked(checked as boolean)}
                />
                <Label htmlFor="certification" className="text-sm">
                  I certify that this decision complies with the Fair Chance Ordinance and is based solely on legally permissible information.
                </Label>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Candidate Notification</h2>
            <div className="rounded-lg border p-4 bg-muted">
              <h3 className="font-semibold mb-2">Notice of Intent to Take Adverse Action</h3>
              <p className="text-sm text-muted-foreground">
                You must give the candidate 7 days to respond before proceeding with any adverse action. During this time, no hiring decision may be finalized.
              </p>
            </div>
            <Button
              onClick={() => setShowNoticeDialog(true)}
            >
              Preview & Send Notice
            </Button>
          </div>
        );

      case 8:
        if (showWOTCSigningScreen) {
          return (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">WOTC Tax Credit Details</h2>
              <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-300 mb-2">
                  Tax Credit Value
                </h3>
                <p className="text-green-700 dark:text-green-400 text-lg">
                  You are eligible for <span className="font-bold">40% of first-year wages</span> (up to $6,000) if the person works at least 400 hours as part of a WOTC targeted group.
                </p>
              </div>
              <Card className="p-6 bg-secondary">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Policy Information</h4>
                    <p className="text-sm text-muted-foreground">
                      The Work Opportunity Tax Credit (WOTC) is a federal tax credit available to employers who invest in American job seekers who have consistently faced barriers to employment. Employers may meet their business needs and claim a tax credit if they hire an individual who is in a WOTC targeted group.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Employers must apply for and receive a certification verifying the new hire is a member of a targeted group before they can claim the tax credit. After the required certification is secured, taxable employers claim the WOTC as a general business credit against their income taxes, and tax-exempt employers claim the WOTC against their payroll taxes.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      WOTC is authorized until December 31, 2025 (Section 113 of Division EE of P.L. 116-260 -- Consolidated Appropriations Act, 2021).
                    </p>
                  </div>
                </div>
              </Card>
              <div className="flex justify-end mt-6">
                <Button onClick={handleSignAndSend}>
                  SIGN & SEND FOR REVIEW
                </Button>
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Final Decision</h2>
            <div className="space-y-4">
              <Textarea
                placeholder="Provide final justification for the hiring decision..."
              />
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 ia-button-outline px-5 py-2 rounded-md text-base font-poppins"
                  onClick={handleProceedWithHire}
                >
                  Proceed with Hire
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1 ia-button-primary bg-cinnabar text-white hover:bg-cinnabar-600 px-5 py-2 rounded-md text-base font-poppins"
                  onClick={() => setShowFinalNoticeDialog(true)}
                >
                  Take Adverse Action
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-1/3 border-r p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* RezMe Logo */}
            <div className="flex items-center mb-6">
              <Image
                src="/rezme-logo.png"
                alt="rézme logo"
                width={160}
                height={48}
                priority
                className="ml-2 mt-2"
                style={{ maxWidth: 200, maxHeight: 60, width: "auto", height: "auto" }}
              />
            </div>
            <h2 className="text-xl font-semibold mb-2">Assessment Progress</h2>
            <div className="space-y-4">
              {steps.map((step) => (
                <button
                  key={step.id}
                  className={`w-full p-3 rounded-lg border ${
                    currentStep === step.id ? "bg-secondary" : ""
                  } transition-colors hover:bg-secondary/50`}
                  onClick={() => handleStepClick(step.id)}
                >
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border" />
                    )}
                    <span className={step.completed ? "text-muted-foreground" : ""}>
                      {step.title}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="space-y-6">
            <Card className="mb-6 p-4 flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-cinnabar text-white">
                  <FileText className="w-8 h-8" />
                </div>
                <span className="text-lg font-bold text-foreground text-center break-words leading-tight mt-2 max-w-[200px]">
                  Regulations regarding job postings or job bulletins
                </span>
                <Button className="mt-4 border-cinnabar text-cinnabar hover:bg-cinnabar hover:text-white transition font-poppins" variant="outline" onClick={() => setShowComplianceModal(true)}>
                  View Regulations
                </Button>
              </div>
            </Card>

            {/* Compliance Statement Modal */}
            <Dialog open={showComplianceModal} onOpenChange={setShowComplianceModal}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Regulations regarding job postings or job bulletins</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <div className="space-y-4 mt-2 text-gray-700 text-base">
                    <div className="bg-muted p-4 rounded-md border text-gray-900 space-y-4">
                      <div>
                        <h3 className="font-semibold text-cinnabar mb-2">Prohibited Language</h3>
                        <p className="mb-2">In job postings, employers can NOT include language such as:</p>
                        <ul className="list-disc pl-6 space-y-1">
                          <li>No Felons</li>
                          <li>No Convictions</li>
                          <li>Must Have Clean Background</li>
                          <li>Must Pass Background Check</li>
                          <li>etc.</li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-cinnabar mb-2">Required Language</h3>
                        <p>In all job postings, employers MUST include language stating that qualified applications with arrest or conviction records will be considered for employment in accordance with the Los Angeles County Fair Chance Ordinance for Employers and the California Fair Chance Act.</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-cinnabar mb-2">Legal Restrictions</h3>
                        <p>If an organization prevents the hiring of individuals with a criminal history as required by law, the organization must specify the laws or regulation that impose these restrictions.</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-cinnabar mb-2">Criminal History Review Notice</h3>
                        <p>If your organization plans to conduct a review of criminal history after the interview process, the job posting must include a list of all material job duties of the specific position in which you believe a criminal history may have a direct, adverse, and negative relationship potentially resulting in the withdrawal of a conditional offer of employment.</p>
                      </div>
                    </div>
                  </div>
                </DialogDescription>
                <div className="flex justify-end mt-4">
                  <Button onClick={() => setShowComplianceModal(false)} variant="outline">Close</Button>
                </div>
              </DialogContent>
            </Dialog>

            <Card className="p-6">
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  className="ia-button-outline px-5 py-2 rounded-md text-base font-poppins"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep !== 8 && (
                  <Button
                    className="ia-button-primary bg-cinnabar text-white hover:bg-cinnabar-600 px-5 py-2 rounded-md text-base font-poppins"
                    onClick={currentStep === 8 ? handleComplete : handleNext}
                    disabled={
                      (currentStep === 1 && !hasConditionalOffer) ||
                      (currentStep === 6 && !certificationChecked)
                    }
                  >
                    {currentStep === 8 ? "Complete" : (
                      <>
                        Next
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                <h3 className="font-semibold">Critical Information</h3>
              </div>
              
              {/* Tabs with Cinnabar accent for selected, light Cinnabar for unselected */}
              <Tabs defaultValue="policy" className="w-full">
                <TabsList className="w-full flex bg-transparent mb-0 p-0 rounded-none border-0 shadow-none justify-start gap-4">
                  <TabsTrigger
                    value="legal"
                    className={`font-poppins text-base px-8 py-3 rounded-t-xl font-semibold
                      data-[state=active]:bg-cinnabar data-[state=active]:text-white
                      data-[state=inactive]:bg-[#ffeceb] data-[state=inactive]:text-cinnabar
                      border-0 shadow-none outline-none transition-none
                    `}
                    style={{ zIndex: 2 }}
                  >
                    Legal
                  </TabsTrigger>
                  <TabsTrigger
                    value="policy"
                    className={`font-poppins text-base px-8 py-3 rounded-t-xl font-semibold
                      data-[state=active]:bg-cinnabar data-[state=active]:text-white
                      data-[state=inactive]:bg-[#ffeceb] data-[state=inactive]:text-cinnabar
                      border-0 shadow-none outline-none transition-none
                    `}
                    style={{ zIndex: 1 }}
                  >
                    Company Policy
                  </TabsTrigger>
                  <TabsTrigger
                    value="context"
                    className={`font-poppins text-base px-8 py-3 rounded-t-xl font-semibold
                      data-[state=active]:bg-cinnabar data-[state=active]:text-white
                      data-[state=inactive]:bg-[#ffeceb] data-[state=inactive]:text-cinnabar
                      border-0 shadow-none outline-none transition-none
                    `}
                    style={{ zIndex: 0 }}
                  >
                    Candidate Context
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="legal" className="pt-8 p-4 border rounded-b-lg border-t-0 -mt-2">
                  {getLegalGuidance()}
                </TabsContent>
                <TabsContent value="policy" className="pt-8 p-4 border rounded-b-lg border-t-0 -mt-2">
                  {getCompanyPolicy()}
                </TabsContent>
                <TabsContent value="context" className="pt-8 p-4 border rounded-b-lg border-t-0 -mt-2">
                  {getCandidateContext()}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showOfferLetterDialog} onOpenChange={setShowOfferLetterDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Conditional Offer Letter</DialogTitle>
            <DialogDescription>
              Review and send the conditional offer letter to proceed with the background check.
            </DialogDescription>
          </DialogHeader>
          
          {renderOfferLetterContent()}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditingLetter(!isEditingLetter)}
            >
              {isEditingLetter ? (
                <>Preview Letter</>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Letter
                </>
              )}
            </Button>
            <Button
              className="ia-button-primary bg-cinnabar text-white hover:bg-cinnabar-600"
              onClick={handleSendOfferLetter}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Offer Letter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Notice of Preliminary Decision</DialogTitle>
            <DialogDescription>
              Review and send the notice of preliminary decision to revoke job offer.
            </DialogDescription>
          </DialogHeader>
          
          {renderNoticeContent()}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditingNotice(!isEditingNotice)}
            >
              {isEditingNotice ? (
                <>Preview Notice</>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notice
                </>
              )}
            </Button>
            <Button
              className="ia-button-primary bg-cinnabar text-white hover:bg-cinnabar-600"
              onClick={() => {
                toast({
                  title: "Notice Sent",
                  description: "The candidate has been notified and has 7 days to respond.",
                });
                setShowNoticeDialog(false);
                setShowReassessmentReminder(true); // Show the reminder dialog
                // handleNext(); // Move to next step only after closing the reminder
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Notice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalNoticeDialog} onOpenChange={setShowFinalNoticeDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Final Notice of Decision</DialogTitle>
            <DialogDescription>
              Review and send the final notice of decision to revoke job offer.
            </DialogDescription>
          </DialogHeader>
          
          {renderFinalNoticeContent()}

          <div className="flex justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditingFinalNotice(!isEditingFinalNotice)}
            >
              {isEditingFinalNotice ? (
                <>Preview Notice</>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notice
                </>
              )}
            </Button>
            <Button
              className="ia-button-primary bg-cinnabar text-white hover:bg-cinnabar-600"
              onClick={() => {
                toast({
                  title: "Final Notice Sent",
                  description: "The final notice has been sent to the candidate.",
                });
                setShowFinalNoticeDialog(false);
                setShowCompleteModal(true);
              }}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Final Notice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showBlockingDialog} onOpenChange={setShowBlockingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conditional Offer Required</DialogTitle>
            <DialogDescription>
              You must extend a conditional offer before accessing or considering conviction history. This is a requirement under San Francisco's Fair Chance Ordinance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => router.push("/")}>Return to Dashboard</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompletionWarning} onOpenChange={setShowCompletionWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Important Notice</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                Before taking adverse action such as failing/refusing to hire, discharging, or not promoting an individual based on a conviction history or unresolved arrest, you must give the individual an opportunity to present evidence that:
                           </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>The information is inaccurate</li>
                <li>The individual has been rehabilitated</li>
                <li>There are other mitigating factors</li>
              </ul>
              <p className="text-sm text-muted-foreground">
                This follows procedures outlined in Police Code Section 4909 or L.E.C. Article 142.4
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleComplianceAcknowledge}>I Understand</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showComplianceConfirmation} onOpenChange={setShowComplianceConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compliance Acknowledgment</DialogTitle>
            <DialogDescription className="space-y-4">
              <p className="text-sm">
                SEC. 4909. IMPLEMENTATION AND ENFORCEMENT OF EMPLOYMENT PROVISIONS.
                (a) Administrative Enforcement.
                (1) With regard to the employment provisions of this Article 49, the OLSE is authorized to take appropriate steps to enforce this Article and coordinate enforcement, including the investigation of any possible violations of this Article. Where the OLSE has reason to believe that a violation has occurred, it may order any appropriate temporary or interim relief to mitigate the violation or maintain the status quo pending completion of a full investigation or hearing. The OLSE shall not find a violation based on an Employer's decision that an applicant or employee's Conviction History is Directly Related, but otherwise may find a violation of this Article, including if the Employer failed to conduct the individualized assessment as required under Section 4904(f).
              </p>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="compliance"
                  checked={complianceAcknowledged}
                  onCheckedChange={(checked) => setComplianceAcknowledged(checked as boolean)}
                />
                <Label htmlFor="compliance">
                  I acknowledge and understand these requirements
                </Label>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleComplianceConfirm} disabled={!complianceAcknowledged}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showTimeframeDialog} onOpenChange={setShowTimeframeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Additional Evidence Opportunity</DialogTitle>
            <DialogDescription>
              Would you like to give the candidate another chance to provide evidence or dispute the information in the criminal background report?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <RadioGroup
              value={giveAnotherChance === null ? "" : giveAnotherChance.toString()}
              onValueChange={(value) => setGiveAnotherChance(value === "true")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>

            {giveAnotherChance && (
              <div className="space-y-2">
                <Label>Response Timeframe (in business days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={responseTimeframe}
                  onChange={(e) => setResponseTimeframe(e.target.value)}
                  placeholder="Enter number of days"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={handleTimeframeSubmit} disabled={giveAnotherChance === null || (giveAnotherChance && !responseTimeframe)}>
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showFinalDialog} onOpenChange={setShowFinalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assessment Complete</DialogTitle>
            <DialogDescription className="space-y-4">
              <p>
                Congratulations! You have completed the Fair Chance assessment process.
                {giveAnotherChance && (
                  <>
                    <br /><br />
                    If the candidate does not respond within {responseTimeframe} business days, your decision will be final and all documentation will be stored for future compliance audits.
                  </>
                )}
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={handleReturnToDashboard}>
              Return to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWOTCModal} onOpenChange={setShowWOTCModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Congratulations on Your Fair Chance Hire!</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <p>Based on your Fair Chance Hiring Protocol, WE applied for WOTC, by following these steps:</p>
              
              <div className="space-y-2">
                <p>✓ Pre-Screening: Checked that the candidate qualifies for the WOTC.</p>
                
                <p>WE auto filled out the two required forms:</p>
                <ul className="list-disc pl-6">
                  <li>The Individual Characteristics Form (ETA 9061)</li>
                  <li>The Pre-Screening Notice and Certification Request (IRS Form 8850)</li>
                </ul>

                <ul className="space-y-2 mt-4">
                  <li>• You can sign the necessary forms with the person applying for the job on the next screen.</li>
                  <li>• Forms have been automatically filed and sent online to the Work Opportunity Tax Credit Online (eWOTC) system.</li>
                  <li>• Digital Forms were also downloaded and sent by mail to the EDD.</li>
                  <li>• Forms are automatically sent within 28 days of the person starting the job.</li>
                  <li>• Since the person qualifies as a long-term unemployed recipient, we'll include the Self-Attestation Form (ETA Form 9175) from them.</li>
                </ul>
              </div>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button onClick={handleContinueToSigning}>
              Continue to Signing Forms
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assessment Complete</DialogTitle>
            <DialogDescription>
              You have completed the Fair Chance assessment process. Click Complete to finalize.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => { setShowCompleteModal(false); handleComplete(); }}>
              Complete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showWOTCCongratsModal} onOpenChange={setShowWOTCCongratsModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription>
              Through our integration with your HRIS, we will track your employee's hours and eligibility for the maximum tax credit return. All compliance steps have been recorded and securely stored for audit purposes for three years.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => { setShowWOTCCongratsModal(false); router.push("/"); }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reassessment Reminder Dialog */}
      <Dialog open={showReassessmentReminder} onOpenChange={setShowReassessmentReminder}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-4 border-b">
            <DialogTitle>Second Individualized Assessment</DialogTitle>
          </DialogHeader>
          <DialogDescription className="pt-4">
            <div className="space-y-6 text-gray-700 text-base">
              <p>
                You've indicated an intent to revoke this offer based on criminal history. We have stored your initial assessment of the candidate during the necessary individualized assessment of an applicant's criminal history that you conducted.
              </p>
              
              <p>
                Per compliance requirements, the candidate shall have at least five (5) business days to respond to the preliminary notice of adverse action before the employer can make a final decision.
              </p>

              <p>Within the 5-day period, if the individual notifies the employer in writing that they:</p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>dispute the accuracy of the criminal history information and is taking steps to obtain evidence supporting that assertion, or</li>
                <li>needs additional time to obtain written evidence of rehabilitation or mitigating circumstances, the individual will be provided at least ten (10) additional business days;</li>
              </ol>

              <p>In lieu of submission of any written materials, upon request, and employer shall provide the applicant or employee with an opportunity present evidence of rehabilitation or mitigating circumstance orally to the employer, via in-person, virtual, or telephone contact.</p>

              <p>When this information is provided by the candidate, your system will be updated with this content and you can perform a second individualized assessment, documented in writing, assessing the same factors contained in the initial individualized assessment.</p>

              <div className="space-y-6">
                <h3 className="font-semibold text-gray-900">FAIR CHANCE ORDINANCE FOR EMPLOYERS</h3>
                <p>County Code Section 8.300 et. seq.</p>
                <h3 className="font-semibold text-gray-900">SECOND INDIVIDUALIZED ASSESSMENT FORM</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employerName">Employer Name</Label>
                    <Input id="employerName" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="applicantName">Applicant/Employee Name</Label>
                    <Input id="applicantName" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="position">Position Applied For/Under Review</Label>
                    <Input id="position" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="conditionalOfferDate">Date of Conditional Job Offer</Label>
                    <Input id="conditionalOfferDate" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="initialAssessmentDate">Date of Initial Individualized Assessment</Label>
                    <Input id="initialAssessmentDate" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="secondAssessmentDate">Date of Second Individualized Assessment</Label>
                    <Input id="secondAssessmentDate" type="date" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="assessor">Second Individualized Assessment Performed by</Label>
                    <Input id="assessor" className="mt-1" />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-semibold text-gray-900">SECTION 1. DOCUMENTS, RECORDS AND INFORMATION PROVIDED BY THE APPLICANT OR EMPLOYEE IN RESPONSE TO PRELIMINARY NOTICE OF ADVERSE ACTION</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">A. CRIMINAL HISTORY INFORMATION</h4>
                      <p className="text-sm text-muted-foreground">List any documents or records provided by the applicant or employee disputing the accuracy of the criminal background check report or criminal history information, and/or providing an explanation regarding criminal history:</p>
                      
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div>
                          <Label>Name/Title of Document or Record</Label>
                          <Input className="mt-1" />
                        </div>
                        <div>
                          <Label>Date of Document or Record</Label>
                          <Input type="date" className="mt-1" />
                        </div>
                        <div>
                          <Label>Description of Error or Explanation</Label>
                          <Textarea className="mt-1" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold">B. EVIDENCE OF REHABILITATION OR MITIGATING CIRCUMSTANCES</h4>
                      <p className="text-sm text-muted-foreground">Name/Title of Document, Record or Information Evidencing Rehabilitation or Mitigating Circumstances:</p>
                      
                      {[1, 2, 3].map((num) => (
                        <div key={num} className="grid grid-cols-3 gap-4 mt-2">
                          <div>
                            <Label>Document {num}</Label>
                            <Input className="mt-1" />
                          </div>
                          <div>
                            <Label>Date</Label>
                            <Input type="date" className="mt-1" />
                          </div>
                          <div>
                            <Label>Description/Explanation</Label>
                            <Textarea className="mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900">SECTION 2. SECOND INDIVIDUALIZED ASSESSMENT - FACTORS</h3>
                    <p className="text-sm text-muted-foreground">INSTRUCTIONS: For each Conviction or Unresolved Arrest that was the basis for the Employer's Preliminary Notice of Adverse Action, reassess whether the individual's Criminal History has a direct, adverse and negative bearing on their ability to perform the duties or responsibilities of the position, by taking into account the information, documents and/or records provided by the applicant or employee as identified in SECTION 1.</p>

                    <div className="space-y-4">
                      <div>
                        <Label>Conviction or Unresolved Arrest</Label>
                        <Input className="mt-1" />
                      </div>
                      <div>
                        <Label>Date of Conviction or Unresolved Arrest</Label>
                        <Input type="date" className="mt-1" />
                      </div>

                      <div>
                        <Label>1. The seriousness and type of criminal conduct</Label>
                        <p className="text-sm text-muted-foreground">Factors may include: the individual's specific personal conduct, whether the harm was to property or people; the level or degree of injury or loss; the permanence of the harm; the person's age when the conduct occurred; the context in which the offense occurred</p>
                        <Textarea className="mt-1" />
                      </div>

                      <div>
                        <Label>2. The time that has passed since the criminal conduct and/or completion of the sentence</Label>
                        <p className="text-sm text-muted-foreground">Factors may include: the amount of time that has passed since the conduct/incident underlying the conviction, and/or the amount of time that has passed since the person's release from incarceration</p>
                        <Textarea className="mt-1" />
                      </div>

                      <div>
                        <Label>3. The nature of the job sought or held by the applicant or employee</Label>
                        <div className="space-y-2">
                          <Label>A. List the specific duties and responsibilities of the job position</Label>
                          <Textarea className="mt-1" />
                          
                          <Label>B. Assess the likelihood of a recurrence in the job position</Label>
                          <p className="text-sm text-muted-foreground">Factors may include: Whether the job offers the opportunity for the same or a similar offense to occur; whether circumstances leading to the conduct for which the person was convicted or that is the subject of an unresolved arrest will recur in the job; whether the context in which the conviction occurred is likely to arise in the workplace; whether the type or degree of harm that resulted from the conviction is likely to occur in the workplace.</p>
                          <Textarea className="mt-1" />
                        </div>
                      </div>

                      <div>
                        <Label>4. List any relevant work experience or job training of the applicant or employee following the criminal conduct</Label>
                        <Textarea className="mt-1" />
                      </div>

                      <div>
                        <Label>5. List any other relevant Section 1 information or documentation provided by the applicant or employee in response to the Preliminary Notice of Adverse Action that was considered for the Employer's Second Individualized Assessment</Label>
                        <Textarea className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="font-semibold text-gray-900">SECTION 3. Final Determination</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="optionA" />
                        <div>
                          <Label htmlFor="optionA">Option A: (Criminal History has no direct, adverse and negative bearing on job position)</Label>
                          <p className="text-sm text-muted-foreground">Based on the Second Individualized Assessment, the criminal history information does not have a direct, adverse and negative bearing on the individual's ability to perform the duties or responsibilities necessarily related to the job position</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <Checkbox id="optionB" />
                        <div>
                          <Label htmlFor="optionB">Option B: (Final Decision to Rescind Conditional Job offer or Take Adverse Action)</Label>
                          <p className="text-sm text-muted-foreground">Based on the Second Individualized Assessment, the Employer has determined that the criminal history information has a direct, adverse and negative bearing on the individual's ability to perform the duties or responsibilities necessarily related to the job position such that it justifies a final decision to rescind the conditional job offer or take adverse action for the following reasons:</p>
                        </div>
                      </div>

                      <div>
                        <Label>Explain the link between the specific aspects of the individual's criminal history with risks inherent in the duties or responsibilities of the job position</Label>
                        <Textarea className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    320W. TempleSt.,Room G-10 • LosAngeles,CA,90012-2706 • toll-free800.593.82.22 • fax 13.687.1137
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
          <div className="flex justify-end gap-3 mt-6 sticky bottom-0 bg-background pt-4 border-t">
            <Button variant="outline" onClick={() => setShowReassessmentReminder(false)}>
              Save Draft
            </Button>
            <Button onClick={() => { setShowReassessmentReminder(false); handleNext(); }}>
              Complete Reassessment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}