import type { Metadata } from "next";
import type { ReactNode } from "react";
import SiteShell from "../../components/SiteShell";

type Resource = {
  label: string;
  href: string;
};

type ParentGuide = {
  title: string;
  topic: string;
  status: string;
  guideTitle: string;
  goal: string;
  childLanguage: string;
  prepare: string[];
  resources: Resource[];
};

type SupportSection = {
  title: string;
  text: string;
  resources: Resource[];
};

export const metadata: Metadata = {
  title: "For Parents & Caregivers",
  description:
    "Parent and caregiver resources for helping children prepare for infusions, ports, PICC lines, lab draws, MRI scans, hospital stays, ambulance rides, surgery, and other pediatric medical experiences.",
  keywords: [
    "children's medical books",
    "pediatric procedure preparation",
    "child life preparation books",
    "children's infusion book",
    "PICC line book for children",
    "lab draw book for kids",
    "MRI preparation for children",
    "surgery preparation book for kids",
    "caregiver medical trauma support"
  ]
};

const navItems = [
  ["start-here", "Start Here"],
  ["talk-guides", "Talk-to-Your-Child Guides"],
  ["book-guides", "Procedure Prep by Book"],
  ["comfort-tools", "Comfort & Coping Tools"],
  ["care-team-questions", "Questions to Ask"],
  ["practical-support", "Financial & Practical Help"],
  ["emotional-support", "Caregiver Mental Health"],
  ["safety-advocacy", "Safety & Advocacy"],
  ["school-support", "School Support"],
  ["parent-checklist", "Printable Checklist"]
];

const parentPrinciples = [
  {
    title: "Be honest, but gentle",
    text:
      "Children usually cope better when caregivers use simple, truthful words. Instead of promising that something will not hurt, prepare them for what they may feel and remind them they will not be alone.",
    example:
      "You may feel a quick pinch, pressure, cold, or noise. I will stay with you and help you breathe."
  },
  {
    title: "Give your child a job",
    text:
      "A small job gives children something they can control. Their job might be holding Benny Bear, belly breathing, counting, choosing music, looking away, or squeezing a hand.",
    example:
      "Your job is to hold Benny, keep your body still, and take slow belly breaths with me."
  },
  {
    title: "Offer small, real choices",
    text:
      "Good choices are safe choices: lap or chair, look or look away, count or listen to music, Benny in the left hand or right hand. Avoid asking if they want to do a medically necessary procedure.",
    example:
      "Do you want to sit on my lap or sit next to me while we count together?"
  },
  {
    title: "Ask for child life support",
    text:
      "Child life specialists help children and families cope with illness, injury, disability, medical tests, hospital stays, and procedures using preparation, play, coping plans, and developmentally appropriate teaching.",
    example:
      "Is a child life specialist available to help us make a coping plan?"
  }
];

const parentGuides: ParentGuide[] = [
  {
    title: "Benny & Penny’s Home Infusion Day",
    topic: "Home infusions",
    status: "Cover-ready",
    guideTitle: "Helping Your Child Feel Safe During Home Infusion",
    goal:
      "Help your child understand that some medicines can come to them at home with a nurse or trained caregiver, clean supplies, tubing, a pump or IV setup, vital signs, waiting time, and comfort routines.",
    childLanguage:
      "Today your medicine comes to you at home. The nurse will bring clean supplies and help your body get the medicine it needs. We can read, rest, watch a show, or hold Benny while the medicine goes in.",
    prepare: [
      "Create a clean, calm space for supplies.",
      "Choose a comfort spot for your child.",
      "Ask about snacks, drinks, and activity limits.",
      "Keep allergies, medications, and emergency contacts nearby.",
      "Write down questions for the nurse, doctor, or pharmacy."
    ],
    resources: [
      { label: "Connecticut Children’s first infusion guide", href: "https://www.connecticutchildrens.org/growing-healthy/what-expect-your-childs-first-infusion-parents-guide" },
      { label: "Pediatric Home Service infusion services", href: "https://www.pediatrichomeservice.com/services/infusion-services/" },
      { label: "BrightStar Care pediatric infusion at home", href: "https://www.brightstarcare.com/resources/expanding-access-pediatric-infusion-care-supporting-children-families-home/" }
    ]
  },
  {
    title: "Benny & Penny’s Port Access Adventure",
    topic: "Access ports",
    status: "Cover-ready",
    guideTitle: "Preparing Your Child for Port Access",
    goal:
      "Help children understand that a port is a small helper under the skin that can give medicine, fluids, or labs with fewer repeated pokes.",
    childLanguage:
      "Your port is a special helper under your skin. The nurse will clean the area and use a small needle to wake up the port so your medicine can go in. You can hold Benny, take big breaths, and choose something fun to watch.",
    prepare: [
      "Ask whether numbing cream is recommended and when to apply it.",
      "Choose clothing that allows access to the port area.",
      "Prepare your child for masks, cleaning, sterile supplies, tape, and tubing.",
      "Make a look-or-look-away plan before the appointment.",
      "Ask whether child life support is available."
    ],
    resources: [
      { label: "Children’s Mercy Port-A-Cath prep", href: "https://www.childrensmercy.org/your-visit/before-you-arrive/what-to-expect/port-a-cath-prep/" },
      { label: "Association of Child Life Professionals port access PDF", href: "https://www.childlife.org/docs/default-source/publications/bulletin/fall-2024/sr_supporting-children-through-a-port-access.pdf" }
    ]
  },
  {
    title: "Benny & Penny’s PICC Line Adventure",
    topic: "PICC lines",
    status: "Cover-ready",
    guideTitle: "Helping Your Child Understand a PICC Line",
    goal:
      "Help children understand that a PICC line is a special tube used for longer-term medicine, fluids, nutrition, or blood draws, and that keeping it clean and safe matters.",
    childLanguage:
      "A PICC line is a special tube that helps your body get medicine without needing a new poke every time. We keep it clean and safe, like a special helper for your treatment.",
    prepare: [
      "Ask how to protect the line during dressing, bathing, sleep, school, and play.",
      "Ask what symptoms need urgent attention.",
      "Learn who to call if the dressing becomes wet, loose, dirty, or if the line is pulled.",
      "Keep supplies organized as instructed by the care team.",
      "Teach your child not to pull, twist, or play with the line."
    ],
    resources: [
      { label: "Children’s Mercy preparing for a PICC line", href: "https://www.childrensmercy.org/your-visit/before-you-arrive/what-to-expect/preparing-for-a-picc-line/" },
      { label: "RadiologyInfo pediatric PICC line placement", href: "https://www.radiologyinfo.org/en/info/picc-line-placement" },
      { label: "UNC caring for a child’s central venous catheter", href: "https://www.med.unc.edu/surgery/pedssurgery/forpatients/informational-videos/caring-for-your-childs-central-venous-catheter/" }
    ]
  },
  {
    title: "Benny & Penny’s Subcutaneous Infusion Adventure",
    topic: "Subcutaneous infusion",
    status: "Cover-ready",
    guideTitle: "Explaining Subcutaneous Infusions in Kid-Friendly Words",
    goal:
      "Help children understand that some medicine goes into the soft layer under the skin instead of into a vein, often with a small needle or infusion set, tape, tubing, and a slower routine.",
    childLanguage:
      "This medicine goes under the skin, where your body can slowly drink it in. You may feel a pinch or pressure, and then we can help your body relax while the medicine works.",
    prepare: [
      "Ask which body area will be used.",
      "Ask what your child may feel during and after the infusion.",
      "Ask how much swelling, redness, soreness, or pressure is expected.",
      "Ask when to call the care team.",
      "Use distraction, breathing, comfort positioning, and a calm reward afterward."
    ],
    resources: [
      { label: "AboutKidsHealth subcutaneous injections", href: "https://www.aboutkidshealth.ca/scinjections" },
      { label: "Royal Children’s Hospital subcutaneous injections", href: "https://www.rch.org.au/rchcpg/hospital_clinical_guideline_index/Subcutaneous_injections_and_device_management/" },
      { label: "Banner Health parent guide to subcutaneous injections", href: "https://www.bannerhealth.com/healthcareblog/teach-me/subcutaneous-injections-for-children" }
    ]
  },
  {
    title: "Benny & Penny’s Special Line Adventure",
    topic: "Central and special lines",
    status: "Coming soon",
    guideTitle: "Understanding Central Lines and Special IV Lines",
    goal:
      "Help children understand that central lines and special IV lines can give medicine, fluids, nutrition, blood products, or allow blood draws when care is ongoing.",
    childLanguage:
      "This special line helps your medicine get where it needs to go. We keep it clean, safe, and covered so it can keep helping your body.",
    prepare: [
      "Ask what type of line your child has.",
      "Ask what activities are safe or restricted.",
      "Ask how to protect the line during bath time, sleep, school, and play.",
      "Ask about signs of infection or line problems.",
      "Ask who to call urgently if the line is pulled, damaged, wet, or dirty."
    ],
    resources: [
      { label: "Nemours KidsHealth central lines", href: "https://kidshealth.org/en/parents/central-lines.html" },
      { label: "Hasbro Children’s central lines", href: "https://www.brownhealth.org/centers-services/pediatric-surgical-services-hasbro-childrens/central-lines" },
      { label: "Starship central venous catheter care", href: "https://www.starship.org.nz/guidelines/central-venous-catheter-cvc-care-for-an-infant-child-or-young-person/" }
    ]
  },
  {
    title: "Benny & Penny’s Lab Draw Adventure",
    topic: "Lab draws",
    status: "Coming soon",
    guideTitle: "Helping Your Child Cope With Blood Draws",
    goal:
      "Prepare children for a blood draw with honest, simple words about the tourniquet, cleaning, quick poke, tubes, bandage, and comfort plan.",
    childLanguage:
      "The lab helper needs a small amount of blood to learn more about your body. You may feel a tight squeeze on your arm and a quick pinch. Your job is to hold still, breathe, and squeeze my hand or Benny.",
    prepare: [
      "Bring comfort items or distraction tools.",
      "Ask about numbing cream when appropriate.",
      "Practice belly breathing before the appointment.",
      "Create a look-or-look-away plan.",
      "Ask whether your child can sit with you."
    ],
    resources: [
      { label: "CHOP prepare for a blood draw", href: "https://www.chop.edu/centers-programs/child-life-education-and-creative-arts-therapy/resources/prepare-blood-draw" },
      { label: "MedlinePlus preparing your child for a lab test", href: "https://medlineplus.gov/lab-tests/how-to-prepare-your-child-for-a-lab-test/" },
      { label: "Children’s Wisconsin coping with blood draws", href: "https://childrenswi.org/teaching-sheet/child-life/coping-with-blood-draws" },
      { label: "Autism Speaks blood draw guide PDF", href: "https://www.autismspeaks.org/sites/default/files/2018-08/Blood%20Work%20Parents.pdf" }
    ]
  },
  {
    title: "Benny & Penny’s MRI Adventure",
    topic: "MRI scans",
    status: "Coming soon",
    guideTitle: "Preparing Your Child for an MRI Scan",
    goal:
      "Help children understand that an MRI is a camera that takes pictures inside the body, and prepare them for loud sounds, lying still, headphones, the scanner bed, and possible IV contrast or sedation.",
    childLanguage:
      "The MRI is a big camera that takes pictures of the inside of your body. It makes loud knocking and tapping sounds, but it does not hurt. Your job is to stay as still as a statue while the camera works.",
    prepare: [
      "Ask whether a preparation video, mock MRI, or child life support is available.",
      "Practice lying still at home.",
      "Prepare for loud sounds with headphones or ear protection.",
      "Ask whether contrast, IV placement, or sedation may be needed.",
      "Ask what metal items must be removed."
    ],
    resources: [
      { label: "CHOP getting an MRI", href: "https://www.chop.edu/health-resources/getting-mri" },
      { label: "CHOP radiology coping support", href: "https://www.chop.edu/health-resources/helping-your-child-cope-radiology-procedures" },
      { label: "CHOP radiology child life services", href: "https://www.chop.edu/services/radiology-child-life-services" }
    ]
  },
  {
    title: "Benny & Penny’s Hospital Sleepover",
    topic: "Hospital stays",
    status: "Coming soon",
    guideTitle: "Helping Your Child Through a Hospital Stay",
    goal:
      "Help children understand that a hospital stay means sleeping somewhere new so the care team can help their body, check vitals, use monitors, give medicine, and keep them safe.",
    childLanguage:
      "Tonight we are having a hospital sleepover so the doctors and nurses can help your body. The room may look different from home, but I will help you feel safe. We can bring things that remind you of home.",
    prepare: [
      "Bring comfort items if allowed.",
      "Ask about parent sleeping arrangements, meals, visiting, quiet hours, and sibling rules.",
      "Keep a notebook of questions, names, medications, and updates.",
      "Ask about child life, social work, spiritual care, and interpreter services.",
      "Plan a familiar bedtime routine as much as possible."
    ],
    resources: [
      { label: "UCSF preparing kids for a hospital stay", href: "https://www.ucsfbenioffchildrens.org/your-stay/preparing-kids-for-a-hospital-stay" },
      { label: "UCLA preparing for a hospital stay", href: "https://www.uclahealth.org/medical-services/child-life/preparing-your-childs-hospital-stay" },
      { label: "Seattle Children’s hospital stay preparation", href: "https://www.seattlechildrens.org/healthy-tides/where-to-turn-when-preparing-for-your-childs-hospital-stay/" }
    ]
  },
  {
    title: "Benny & Penny’s Ambulance Adventure",
    topic: "Ambulance rides",
    status: "Coming soon",
    guideTitle: "Preparing for Emergency Transport and Ambulance Rides",
    goal:
      "Help families explain that ambulances are used when a child needs medical help quickly or safely during transport, and prepare children for lights, sirens, straps, monitors, oxygen, and EMS helpers.",
    childLanguage:
      "The ambulance helpers are here to take care of you and get you to the hospital safely. They may use lights, sounds, straps, stickers, or a mask to help your body. I will stay as close as the helpers say is safe.",
    prepare: [
      "Keep a written medical summary available.",
      "Keep medication, allergy, insurance, and emergency contact information accessible.",
      "Pack comfort items when time allows.",
      "Stay calm and give clear information to EMS.",
      "Follow EMS instructions about where caregivers can safely sit."
    ],
    resources: [
      { label: "Children’s Mercy emergency preparedness tips", href: "https://www.childrensmercy.org/parent-ish/2026/06/emergency-services/" },
      { label: "HRSA Emergency Medical Services for Children", href: "https://mchb.hrsa.gov/programs-impact/emergency-medical-services-children-emsc" }
    ]
  },
  {
    title: "Benny & Penny’s Surgery Day",
    topic: "Surgery day",
    status: "Coming soon",
    guideTitle: "Talking to Your Child About Surgery Day",
    goal:
      "Help children understand surgery day in calm, truthful language, including check-in, waiting, vitals, gowns, anesthesia, separation, recovery, comfort, and going home or staying overnight.",
    childLanguage:
      "The doctors are going to help fix something inside your body. You will get sleepy medicine so you do not feel the surgery. When you wake up, I will be close by and the nurses will help keep you comfortable.",
    prepare: [
      "Ask what words to use for the specific surgery.",
      "Ask when to stop food, drinks, or medicines.",
      "Ask who can stay with your child before and after surgery.",
      "Ask whether child life preparation is available.",
      "Ask about anesthesia, pain control, recovery, and discharge instructions."
    ],
    resources: [
      { label: "CHOP preparing your child for surgery", href: "https://www.chop.edu/patients-and-visitors/guide-your-childs-surgery/preparing-your-child-surgery" },
      { label: "Children’s Mercy preparing for surgery", href: "https://www.childrensmercy.org/departments-and-clinics/surgery/preparing-for-surgery/" },
      { label: "American Society of Anesthesiologists kids surgery checklist", href: "https://madeforthismoment.asahq.org/preparing-for-surgery/prep/preparing-for-surgery-kids-checklist/" }
    ]
  }
];

const comfortItems = [
  "Stuffed animal",
  "Blanket",
  "Favorite book",
  "Headphones",
  "Tablet or music",
  "Small toy",
  "Fidget item",
  "Family photo",
  "Sensory item"
];

const copingTools = [
  "Belly breathing",
  "Counting",
  "Guided imagery",
  "Watching a show",
  "Music",
  "Squeezing a hand or stress ball",
  "Looking away",
  "Comfort positioning",
  "Medical play before the visit"
];

const parentPhrases = [
  "You are safe.",
  "I am right here.",
  "Your job is to breathe slowly.",
  "You can be scared and brave at the same time.",
  "This part is hard, and it will not last forever.",
  "The nurse is helping your body.",
  "Let us count together.",
  "Benny is staying with you."
];

const phrasesToAvoid = [
  "Do not cry.",
  "Be a big kid.",
  "It will not hurt, when it may hurt.",
  "The nurse will give you a shot if you do not behave.",
  "You are fine, when your child is clearly upset.",
  "This is nothing."
];

const questionGroups = [
  {
    title: "Before the appointment",
    questions: [
      "What should I tell my child before we arrive?",
      "What words do you recommend using for this procedure?",
      "Is there a child life specialist available?",
      "Can we use numbing cream or other pain-reducing options?",
      "Can my child bring a comfort item?",
      "Can my child sit on my lap or use comfort positioning?",
      "How long should the appointment take?",
      "Are there eating, drinking, medication, or activity restrictions?"
    ]
  },
  {
    title: "During the appointment",
    questions: [
      "Can you explain each step before you do it?",
      "Can we pause for a breathing break if medically safe?",
      "Can my child choose whether to look or look away?",
      "Can we use distraction?",
      "Can we reduce the number of people in the room if my child is overwhelmed?"
    ]
  },
  {
    title: "After the appointment",
    questions: [
      "What symptoms are expected?",
      "What symptoms are not normal?",
      "Who do we call during business hours?",
      "Who do we call after hours?",
      "When should we go to urgent care or the emergency department?",
      "Are there activity restrictions after this procedure?",
      "What should school, daycare, or other caregivers know?"
    ]
  }
];

const practicalSupport: SupportSection[] = [
  {
    title: "Start with your child’s care team",
    text:
      "Ask for the hospital social worker, case manager, financial counselor, insurance authorization team, nurse navigator, home infusion pharmacy support team, or family resource center.",
    resources: [
      { label: "Family Voices", href: "https://familyvoices.org/" },
      { label: "Family-to-Family Health Information Centers", href: "https://familyvoices.org/felsc/whataref2fs/" }
    ]
  },
  {
    title: "Insurance and coverage",
    text:
      "Medicaid and CHIP may provide health coverage for eligible children and families. Program rules vary by state and household situation.",
    resources: [
      { label: "HealthCare.gov Medicaid and CHIP coverage", href: "https://www.healthcare.gov/medicaid-chip/" },
      { label: "HealthCare.gov Children’s Health Insurance Program", href: "https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/" },
      { label: "Medicaid.gov CHIP", href: "https://www.medicaid.gov/chip" }
    ]
  },
  {
    title: "Medication, copay, and disease-specific help",
    text:
      "Some nonprofit programs offer case management, copay assistance, medication cost help, financial aid funds, disease-specific assistance, or transportation support.",
    resources: [
      { label: "Patient Advocate Foundation", href: "https://www.patientadvocate.org/" },
      { label: "HealthWell Pediatric Assistance Fund", href: "https://www.healthwellfoundation.org/fund/pediatric-assistance-fund/" },
      { label: "NeedyMeds", href: "https://www.needymeds.org/" },
      { label: "NORD Patient Assistance", href: "https://rarediseases.org/patient-assistance/" },
      { label: "PAN Foundation", href: "https://www.panfoundation.org/" },
      { label: "The Assistance Fund", href: "https://tafcares.org/" }
    ]
  },
  {
    title: "Travel and lodging",
    text:
      "Families who must travel for pediatric care may be able to ask hospitals about lodging, travel help, transportation grants, and local family-support programs.",
    resources: [
      { label: "Ronald McDonald House programs", href: "https://ronaldmcdonaldhouse.org/our-core-programs/ronald-mcdonald-house-programs" },
      { label: "PAN Foundation transportation grants", href: "https://www.panfoundation.org/apply-and-manage-grants/our-grants/transportation-grants/" }
    ]
  }
];

const emotionalSupport: SupportSection[] = [
  {
    title: "Medical trauma and procedure stress",
    text:
      "Medical experiences can feel frightening for children and caregivers. Support is available when pain, serious illness, procedures, hospitalization, or treatment experiences feel overwhelming.",
    resources: [
      { label: "National Child Traumatic Stress Network medical trauma", href: "https://www.nctsn.org/what-is-child-trauma/trauma-types/medical-trauma" },
      { label: "National Child Traumatic Stress Network", href: "https://www.nctsn.org/" },
      { label: "SAMHSA trauma-informed approaches", href: "https://www.samhsa.gov/mental-health/trauma-violence/trauma-informed-approaches-programs" }
    ]
  },
  {
    title: "Parent and caregiver mental health",
    text:
      "Caregivers may feel exhausted, anxious, financially strained, or emotionally drained. Asking for support is part of caring for the whole family.",
    resources: [
      { label: "SAMHSA mental health for children and families", href: "https://www.samhsa.gov/mental-health/children-and-families" },
      { label: "SAMHSA caregiver resources", href: "https://www.samhsa.gov/mental-health/children-and-families/coping-resources/caregiver" },
      { label: "988 Suicide & Crisis Lifeline", href: "https://988lifeline.org" },
      { label: "988 Lifeline chat", href: "https://988lifeline.org/chat/" }
    ]
  }
];

const safetyResources: SupportSection[] = [
  {
    title: "Children’s Advocacy Centers",
    text:
      "Children’s Advocacy Centers coordinate child-focused services for children and families impacted by suspected abuse, including advocacy, therapy, medical exams, forensic interviews, and coordination with protective and legal systems.",
    resources: [
      { label: "National Children’s Alliance CAC model", href: "https://www.nationalchildrensalliance.org/cac-model/" },
      { label: "National Children’s Alliance fact sheet", href: "https://www.nationalchildrensalliance.org/media-room/nca-digital-media-kit/fact-sheet/" }
    ]
  },
  {
    title: "Child abuse information and reporting",
    text:
      "If a child is in immediate danger, call emergency services. For suspected abuse or neglect, families and professionals can use official state and national reporting resources.",
    resources: [
      { label: "Child Welfare Information Gateway: how to report", href: "https://www.childwelfare.gov/how-report-child-abuse-and-neglect/" },
      { label: "Child Welfare Information Gateway: mandatory reporting", href: "https://www.childwelfare.gov/resources/mandatory-reporting-child-abuse-and-neglect/" },
      { label: "Childhelp National Child Abuse Hotline", href: "https://childhelphotline.org/" },
      { label: "CDC preventing child abuse and neglect", href: "https://www.cdc.gov/child-abuse-neglect/prevention/index.html" },
      { label: "Prevent Child Abuse America", href: "https://preventchildabuse.org/" }
    ]
  }
];

const schoolResources: SupportSection[] = [
  {
    title: "504 plans, IEPs, and school health support",
    text:
      "Children with chronic illness, medical devices, infusions, surgery recovery, frequent appointments, fatigue, pain, or anxiety may need a 504 plan, IEP evaluation, school health plan, medication plan, absence plan, activity restrictions, or emergency action plan.",
    resources: [
      { label: "U.S. Department of Education Section 504", href: "https://www.ed.gov/laws-and-policy/individuals-disabilities/section-504" },
      { label: "Section 504 FAPE FAQs", href: "https://www.ed.gov/laws-and-policy/civil-rights-laws/disability-discrimination/frequently-asked-questions-section-504-free-appropriate-public-education-fape" },
      { label: "IDEA parents and families", href: "https://sites.ed.gov/idea/parents-families/" },
      { label: "Center for Parent Information and Resources IDEA", href: "https://www.parentcenterhub.org/idea/" },
      { label: "Find your Parent Center", href: "https://www.parentcenterhub.org/find-your-center/" }
    ]
  }
];

const donateGroups: SupportSection[] = [
  {
    title: "Pediatric medical care and child life programs",
    text:
      "These organizations support pediatric care, hospital programs, equipment, research, family support, and child life services.",
    resources: [
      { label: "Donate to St. Jude Children’s Research Hospital", href: "https://www.stjude.org/donate" },
      { label: "Donate to Children’s Miracle Network Hospitals", href: "https://childrensmiraclenetworkhospitals.org/donate/" }
    ]
  },
  {
    title: "Mental health, abuse prevention, and advocacy",
    text:
      "These organizations support child and family mental health resources, education, advocacy, and abuse-prevention programs.",
    resources: [
      { label: "Donate to Child Mind Institute", href: "https://childmind.org/give/donate/" },
      { label: "Donate to NAMI", href: "https://donate.nami.org/" },
      { label: "Donate to Childhelp", href: "https://childhelp.org/donate/" },
      { label: "Donate to Prevent Child Abuse America", href: "https://preventchildabuse.org/donate/" }
    ]
  }
];

const checklistItems = [
  "I know why my child needs this appointment or procedure.",
  "I know what words I will use to explain it.",
  "I know what my child may see, hear, feel, or smell.",
  "I asked about child life support.",
  "I asked about numbing cream or comfort options.",
  "I packed comfort items.",
  "I packed insurance cards and medical information.",
  "I made a list of questions.",
  "I planned a simple reward or calm activity afterward."
];

const medicalInfoItems = [
  "Diagnosis or reason for care",
  "Allergies",
  "Medications",
  "Medical devices or lines",
  "Pharmacy",
  "Doctor or clinic contact",
  "Home infusion company contact",
  "Emergency contact",
  "Insurance information"
];

export default function ForParentsPage() {
  return (
    <SiteShell>
      <div className="page-wrap pb-16 pt-4">
        <section className="text-center">
          <p className="small-label">For parents, caregivers, nurses, child life teams, and family-support advocates</p>
          <h1 className="mx-auto mt-3 max-w-4xl font-serif text-4xl font-semibold leading-tight text-teal sm:text-5xl">
            Parent & Caregiver Resource Hub
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-ink">
            Medical days can feel big for little hearts. Benny & Penny Adventures helps families explain common pediatric medical experiences in gentle, age-appropriate language while building comfort, coping, and confidence.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a className="btn" href="#book-guides">Explore procedure guides</a>
            <a className="btn-ghost" href="#parent-checklist">View parent checklist</a>
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-coral bg-blush/70 p-5 text-sm leading-7 text-ink sm:p-6" aria-label="Important medical disclaimer">
          <h2 className="font-serif text-2xl font-semibold text-teal">Important note for families</h2>
          <p className="mt-3">
            These guides are educational and supportive, but they are not a replacement for medical advice, diagnosis, treatment, emergency care, or instructions from your child&apos;s healthcare team.
          </p>
          <p className="mt-3">
            Always follow the care plan from your child&apos;s doctor, nurse, pharmacist, home infusion company, hospital, child life specialist, or emergency medical team. If your child is having a medical emergency, call emergency services immediately.
          </p>
          <p className="mt-3">
            For emotional crisis support in the United States, call or text <strong>988</strong> or use the{" "}
            <ExternalLink href="https://988lifeline.org/chat/">988 Lifeline chat</ExternalLink>.
          </p>
        </section>

        <nav className="mt-8 rounded-3xl border border-tan bg-white/70 p-4 shadow-sm" aria-label="Parent resource sections">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {navItems.map(([href, label]) => (
              <a key={href} href={`#${href}`} className="rounded-2xl bg-cream px-4 py-3 text-sm font-extrabold text-teal transition hover:bg-green hover:text-coral">
                {label}
              </a>
            ))}
          </div>
        </nav>

        <Section id="start-here" label="Start here" title="How to prepare your child for a medical day">
          <div className="grid gap-5 lg:grid-cols-4">
            {parentPrinciples.map((principle) => (
              <article key={principle.title} className="panel-card p-5">
                <h3 className="font-serif text-xl font-semibold text-teal">{principle.title}</h3>
                <p className="mt-3 text-sm leading-7 text-ink">{principle.text}</p>
                <blockquote className="mt-4 rounded-2xl bg-green p-4 text-sm font-bold leading-7 text-teal">
                  “{principle.example}”
                </blockquote>
              </article>
            ))}
          </div>
        </Section>

        <Section id="talk-guides" label="Talk-to-your-child guides" title="A simple script you can use before any procedure">
          <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="panel-card p-6">
              <h3 className="font-serif text-2xl font-semibold text-teal">Simple words to use</h3>
              <p className="mt-4 text-lg leading-8 text-ink">
                “The nurses and doctors are helping your body. Some parts may feel strange, loud, cold, tight, or uncomfortable, but you will not be alone. We will make a plan together.”
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MiniList title="Your child may see" items={["Nurses, doctors, or EMS helpers", "Gloves, masks, gowns, and clean supplies", "Tubing, tape, syringes, stickers, or monitors", "A hospital bed, chair, scanner, or exam table"]} />
                <MiniList title="Your child may feel" items={["Nervous or curious", "Brave and scared at the same time", "A pinch, pressure, cold feeling, loud sound, or tight band", "Tired, frustrated, or ready for a break"]} />
              </div>
            </article>
            <article className="panel-card bg-green/70 p-6">
              <h3 className="font-serif text-2xl font-semibold text-teal">Build a comfort plan</h3>
              <p className="mt-3 text-sm leading-7 text-ink">Before the visit, choose one item from each category and tell your child what their job will be.</p>
              <ul className="mt-4 space-y-3 text-sm font-bold text-teal">
                {["Comfort object", "Distraction activity", "Breathing plan", "Parent or caregiver phrase", "Small reward or calm activity afterward"].map((item) => (
                  <li key={item} className="rounded-2xl bg-white/75 px-4 py-3">✓ {item}</li>
                ))}
              </ul>
            </article>
          </div>
        </Section>

        <Section id="book-guides" label="Procedure prep by book" title="Book-by-book parent guides">
          <div className="grid gap-5">
            {parentGuides.map((guide, index) => (
              <article key={guide.title} className="panel-card overflow-hidden">
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="bg-green/70 p-6">
                    <div className="small-label">Book {index + 1} · {guide.status}</div>
                    <h3 className="mt-2 font-serif text-2xl font-semibold leading-tight text-teal">{guide.title}</h3>
                    <p className="mt-2 text-sm font-extrabold text-coral">Topic: {guide.topic}</p>
                    <p className="mt-5 text-sm leading-7 text-ink">{guide.goal}</p>
                    <blockquote className="mt-5 rounded-2xl bg-white/80 p-4 text-sm font-bold leading-7 text-teal">
                      “{guide.childLanguage}”
                    </blockquote>
                  </div>
                  <div className="p-6">
                    <h4 className="font-serif text-xl font-semibold text-teal">{guide.guideTitle}</h4>
                    <div className="mt-5 grid gap-5 md:grid-cols-2">
                      <MiniList title="What parents can prepare" items={guide.prepare} />
                      <div>
                        <h5 className="text-sm font-extrabold uppercase tracking-[0.12em] text-coral">Helpful resources</h5>
                        <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
                          {guide.resources.map((resource) => (
                            <li key={resource.href}>
                              <ExternalLink href={resource.href}>{resource.label}</ExternalLink>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Section id="comfort-tools" label="Comfort and coping" title="Small tools that can make big medical moments feel safer">
          <div className="grid gap-5 lg:grid-cols-4">
            <MiniList title="Comfort items" items={comfortItems} card />
            <MiniList title="Coping tools" items={copingTools} card />
            <MiniList title="Calm phrase bank" items={parentPhrases} card />
            <MiniList title="Phrases to avoid" items={phrasesToAvoid} card />
          </div>
        </Section>

        <Section id="care-team-questions" label="Questions to ask" title="Questions parents can ask the care team">
          <div className="grid gap-5 lg:grid-cols-3">
            {questionGroups.map((group) => (
              <MiniList key={group.title} title={group.title} items={group.questions} card />
            ))}
          </div>
        </Section>

        <Section id="practical-support" label="Financial and practical help" title="When medical care becomes financially overwhelming">
          <p className="mb-6 max-w-3xl text-sm leading-7 text-ink">
            Eligibility varies by diagnosis, income, insurance, state, age, and program funding. Families should contact each organization directly and also ask the hospital social worker, case manager, or clinic team for local support.
          </p>
          <ResourceGrid sections={practicalSupport} />
        </Section>

        <Section id="emotional-support" label="Caregiver mental health" title="When the medical journey feels emotionally heavy">
          <p className="mb-6 max-w-3xl text-sm leading-7 text-ink">
            Children may feel anxious before procedures, worried about pain, or frightened by medical equipment. Caregivers may feel overwhelmed, exhausted, financially stressed, or emotionally drained. Support is available for the whole family.
          </p>
          <ResourceGrid sections={emotionalSupport} />
        </Section>

        <Section id="safety-advocacy" label="Safety and advocacy" title="Safety, abuse, and advocacy resources">
          <p className="mb-6 max-w-3xl text-sm leading-7 text-ink">
            Some families need more than medical preparation. If a child or caregiver is experiencing abuse, neglect, unsafe caregiving, domestic violence exposure, exploitation, or fear at home, support is available. If a child is in immediate danger, call emergency services.
          </p>
          <ResourceGrid sections={safetyResources} />
        </Section>

        <Section id="school-support" label="School support" title="504 plans, IEPs, and disability advocacy">
          <ResourceGrid sections={schoolResources} />
        </Section>

        <Section id="parent-checklist" label="Printable checklist" title="Parent prep checklist">
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="panel-card p-6 lg:col-span-2">
              <h3 className="font-serif text-2xl font-semibold text-teal">Before the medical day</h3>
              <Checklist items={checklistItems} />
            </div>
            <div className="panel-card p-6">
              <h3 className="font-serif text-2xl font-semibold text-teal">Comfort plan</h3>
              <div className="mt-4 space-y-4 text-sm font-bold text-teal">
                {["Comfort item", "Distraction choice", "Breathing plan", "My child’s job", "My calm phrase"].map((item) => (
                  <div key={item}>
                    <div>{item}</div>
                    <div className="mt-2 h-9 rounded-xl border border-dashed border-tan bg-white/70" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-5 panel-card p-6">
            <h3 className="font-serif text-2xl font-semibold text-teal">Medical information to keep handy</h3>
            <Checklist items={medicalInfoItems} columns />
          </div>
        </Section>

        <Section id="donate" label="Support these causes" title="Optional ways to support children and families">
          <ResourceGrid sections={donateGroups} />
        </Section>

        <section className="mt-12 rounded-3xl border border-tan bg-white/70 p-5 text-xs leading-6 text-ink sm:p-6">
          <h2 className="font-serif text-2xl font-semibold text-teal">Resource disclaimer</h2>
          <p className="mt-3">
            The resources listed on this page are provided for educational and family-support purposes only. Inclusion of a resource does not mean endorsement, and eligibility for financial, insurance, lodging, school, or advocacy programs may vary by diagnosis, state, income, insurance status, age, and program funding. Families should contact each organization directly and speak with their child&apos;s healthcare team, hospital social worker, or case manager for guidance specific to their child&apos;s needs.
          </p>
          <p className="mt-3 font-bold text-teal">Last updated: June 18, 2026</p>
        </section>
      </div>
    </SiteShell>
  );
}

function Section({ id, label, title, children }: { id: string; label: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-10">
      <p className="small-label">{label}</p>
      <h2 className="section-title mt-2 mb-6">{title}</h2>
      {children}
    </section>
  );
}

function MiniList({ title, items, card = false }: { title: string; items: string[]; card?: boolean }) {
  const content = (
    <>
      <h3 className="font-serif text-xl font-semibold text-teal">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-ink">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-coral" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </>
  );

  if (card) {
    return <article className="panel-card p-5">{content}</article>;
  }

  return <div>{content}</div>;
}

function Checklist({ items, columns = false }: { items: string[]; columns?: boolean }) {
  return (
    <ul className={`mt-4 grid gap-3 ${columns ? "sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
      {items.map((item) => (
        <li key={item} className="rounded-2xl border border-tan bg-cream px-4 py-3 text-sm font-bold text-teal">
          ☐ {item}
        </li>
      ))}
    </ul>
  );
}

function ResourceGrid({ sections }: { sections: SupportSection[] }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {sections.map((section) => (
        <article key={section.title} className="panel-card p-6">
          <h3 className="font-serif text-2xl font-semibold text-teal">{section.title}</h3>
          <p className="mt-3 text-sm leading-7 text-ink">{section.text}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-ink">
            {section.resources.map((resource) => (
              <li key={resource.href}>
                <ExternalLink href={resource.href}>{resource.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="font-extrabold text-teal underline decoration-coral/40 decoration-2 underline-offset-4 transition hover:text-coral" href={href} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
}
