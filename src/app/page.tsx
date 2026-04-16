"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import styles from "./page.module.css";

// --- PT Launch Data ---

type SectionType = "LR1" | "LR2" | "RC" | "Exp";
type SectionStatus = "not-started" | "in-progress" | "completed";

interface PTSectionData {
  pt: number;
  section: SectionType;
  status: SectionStatus;
  score?: number;
}

const SECTION_COLORS: Record<SectionType, string> = {
  LR1: "var(--turquoise)",
  LR2: "var(--cornflower)",
  RC: "var(--mango)",
  Exp: "var(--pewter)",
};

const PT_DATA: PTSectionData[] = [
  // PT 88
  { pt: 88, section: "LR1", status: "completed", score: 158 },
  { pt: 88, section: "LR2", status: "completed", score: 161 },
  { pt: 88, section: "RC",  status: "completed", score: 155 },
  { pt: 88, section: "Exp", status: "not-started" },
  // PT 89
  { pt: 89, section: "LR1", status: "completed", score: 163 },
  { pt: 89, section: "LR2", status: "in-progress" },
  { pt: 89, section: "RC",  status: "not-started" },
  { pt: 89, section: "Exp", status: "not-started" },
  // PT 90
  { pt: 90, section: "LR1", status: "not-started" },
  { pt: 90, section: "LR2", status: "not-started" },
  { pt: 90, section: "RC",  status: "not-started" },
  { pt: 90, section: "Exp", status: "not-started" },
  // PT 91
  { pt: 91, section: "LR1", status: "not-started" },
  { pt: 91, section: "LR2", status: "not-started" },
  { pt: 91, section: "RC",  status: "not-started" },
  { pt: 91, section: "Exp", status: "not-started" },
  // PT 92 — the one we practiced
  { pt: 92, section: "LR1", status: "completed", score: 162 },
  { pt: 92, section: "LR2", status: "not-started" },
  { pt: 92, section: "RC",  status: "not-started" },
  { pt: 92, section: "Exp", status: "not-started" },
  // PT 93
  { pt: 93, section: "LR1", status: "not-started" },
  { pt: 93, section: "LR2", status: "not-started" },
  { pt: 93, section: "RC",  status: "not-started" },
  { pt: 93, section: "Exp", status: "not-started" },
  // PT 94
  { pt: 94, section: "LR1", status: "not-started" },
  { pt: 94, section: "LR2", status: "not-started" },
  { pt: 94, section: "RC",  status: "not-started" },
  { pt: 94, section: "Exp", status: "not-started" },
  // PT 95-101
  ...[95,96,97,98,99,100,101].flatMap(pt => (
    (["LR1","LR2","RC","Exp"] as SectionType[]).map(section => ({ pt, section, status: "not-started" as SectionStatus }))
  )),
  // PT 102-108
  ...[102,103,104,105,106,107,108].flatMap(pt => (
    (["LR1","LR2","RC","Exp"] as SectionType[]).map(section => ({ pt, section, status: "not-started" as SectionStatus }))
  )),
];

const PT_GROUPS = [
  { label: "PT 88–94", pts: [88,89,90,91,92,93,94] },
  { label: "PT 95–101", pts: [95,96,97,98,99,100,101] },
  { label: "PT 102–108", pts: [102,103,104,105,106,107,108] },
];

const NAV_ITEMS = [
  { label: "Chandler's Prep Map", icon: "◈" },
  { label: "Table # PT", icon: "⊞", active: true },
  { label: "Workouts & Routines", icon: "⊙" },
  { label: "Training Camp", icon: "▲" },
  { label: "Review & Camo", icon: "◎" },
  { label: "Book Extras", icon: "⊕" },
];

// --- Data ---

interface Question {
  id: number;
  stimulus: string;
  stem: string;
  answers: { letter: string; text: string }[];
  correctAnswer: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    stimulus: `A study of the consumption of smartphones in five countries found that in each country, weights of discarded smartphones decreased significantly over a ten-year period. The researchers concluded that manufacturers had been making smartphones lighter.

However, a critic of the study points out that the weights recorded were the weights of smartphones at the time they were discarded, not at the time they were purchased. The critic argues that the decrease in weight could be explained by the fact that newer smartphones are kept for shorter periods before being discarded. Batteries and other components degrade over time, and a smartphone that has been used for three years will weigh slightly less than it did when new due to battery swelling, case wear, and loss of small components.

The critic's argument requires which of the following assumptions?`,
    stem: "Which one of the following is an assumption required by the critic's argument?",
    answers: [
      {
        letter: "A",
        text: "The decrease in weight of discarded smartphones was not primarily caused by manufacturers using lighter materials in newer models.",
      },
      {
        letter: "B",
        text: "Consumers in all five countries replaced their smartphones at approximately the same rate during the ten-year period.",
      },
      {
        letter: "C",
        text: "The weight loss experienced by a smartphone over three years of use is large enough to account for the observed decrease in discarded smartphone weights.",
      },
      {
        letter: "D",
        text: "Manufacturers did not simultaneously make smartphones lighter while consumers also began discarding them sooner.",
      },
      {
        letter: "E",
        text: "None of the five countries in the study experienced significant changes in the demographics of smartphone consumers during the ten-year period.",
      },
    ],
    correctAnswer: "A",
  },
  {
    id: 2,
    stimulus: `Municipal legislators are considering a proposal to ban the use of pesticides within city limits. Proponents of the ban argue that pesticide exposure is correlated with various health issues in urban populations. Opponents counter that banning pesticides would lead to an increase in disease-carrying insect populations, which would pose a greater health risk than pesticide exposure.

The opponents' argument is most vulnerable to criticism on which of the following grounds?`,
    stem: "The opponents' argument is most vulnerable to criticism on which of the following grounds?",
    answers: [
      {
        letter: "A",
        text: "It fails to consider that non-chemical pest control methods might be effective alternatives to pesticides.",
      },
      {
        letter: "B",
        text: "It assumes without justification that all pesticides are equally harmful to human health.",
      },
      {
        letter: "C",
        text: "It does not address the environmental impact of continued pesticide use on urban ecosystems.",
      },
      {
        letter: "D",
        text: "It relies on an unsupported assumption that the health risks of disease-carrying insects have been accurately quantified.",
      },
      {
        letter: "E",
        text: "It ignores the possibility that some pesticides banned in other jurisdictions have been shown to be safe.",
      },
    ],
    correctAnswer: "A",
  },
  {
    id: 3,
    stimulus: `The director of a museum of natural history has proposed that the museum replace its current collection of mounted animal specimens with high-resolution holographic displays. The director argues that holograms can depict animals in lifelike poses and natural habitats, providing a more educational experience than static mounted specimens.

Several curators have objected, arguing that part of the educational value of mounted specimens lies in their physical tangibility — visitors can observe actual textures, scales, and feathers up close in a way that even advanced holograms cannot replicate. Furthermore, the curators note that mounted specimens serve as important scientific references that researchers from around the world visit to study.`,
    stem: "Which one of the following, if true, would most strengthen the curators' objection to the director's proposal?",
    answers: [
      {
        letter: "A",
        text: "Recent surveys indicate that museum visitors rate interactive digital exhibits as more engaging than traditional displays.",
      },
      {
        letter: "B",
        text: "Holographic technology has improved to the point where it can display minute surface details with near-perfect accuracy.",
      },
      {
        letter: "C",
        text: "Many of the museum's mounted specimens are type specimens — the original examples used to formally describe and name their species — and cannot be replaced.",
      },
      {
        letter: "D",
        text: "The cost of maintaining mounted specimens is significantly higher than the cost of maintaining holographic displays.",
      },
      {
        letter: "E",
        text: "Other museums that have adopted holographic displays have seen an increase in visitor attendance.",
      },
    ],
    correctAnswer: "C",
  },
  {
    id: 4,
    stimulus: `A pharmaceutical company recently published the results of a clinical trial showing that its new drug reduces cholesterol levels by an average of 15 percent. However, the trial only included participants between the ages of 40 and 55 who had no other major health conditions. Critics argue that the drug's effectiveness cannot be generalized to the broader population based on this study alone.`,
    stem: "Which one of the following, if true, most strengthens the critics' argument?",
    answers: [
      { letter: "A", text: "Cholesterol metabolism varies significantly across age groups and in the presence of comorbid conditions." },
      { letter: "B", text: "The pharmaceutical company has a strong track record of producing effective cholesterol medications." },
      { letter: "C", text: "The clinical trial lasted for two years, which is longer than most similar studies." },
      { letter: "D", text: "Participants in the trial were required to follow a specific diet during the study period." },
      { letter: "E", text: "Several other cholesterol-reducing drugs on the market have been tested on similarly narrow populations." },
    ],
    correctAnswer: "A",
  },
  {
    id: 5,
    stimulus: `A city council is debating whether to install speed cameras on residential streets. Proponents argue that speed cameras in other cities have reduced traffic accidents by up to 30 percent. Opponents respond that the reduction in accidents is likely due to other safety improvements made at the same time as the camera installations, such as better signage and road redesign.`,
    stem: "The opponents' response is most effective against the proponents' argument if which of the following is true?",
    answers: [
      { letter: "A", text: "In cities that installed speed cameras without other improvements, accident rates did not decrease significantly." },
      { letter: "B", text: "Speed cameras generate significant revenue for the cities that install them." },
      { letter: "C", text: "The cost of installing speed cameras is lower than the cost of road redesign." },
      { letter: "D", text: "Some drivers slow down only in the immediate vicinity of speed cameras." },
      { letter: "E", text: "Traffic accidents on highways, where speed cameras are rarely installed, have also decreased." },
    ],
    correctAnswer: "A",
  },
  {
    id: 6,
    stimulus: `Ecologist: The reintroduction of wolves to Yellowstone National Park has been credited with restoring the park's ecosystem. Wolves prey on elk, which had been overgrazing riverside vegetation. With fewer elk grazing, trees and shrubs have regrown along riverbanks, stabilizing the soil and reducing erosion. However, some ranchers near the park argue that the wolves pose an unacceptable threat to their livestock.`,
    stem: "Which one of the following principles, if valid, most helps to justify the ecologist's implicit position?",
    answers: [
      { letter: "A", text: "The ecological benefits of a species reintroduction can outweigh the economic costs to nearby landowners." },
      { letter: "B", text: "Ranchers should be compensated for any livestock losses caused by reintroduced predators." },
      { letter: "C", text: "Wildlife management decisions should be based solely on scientific evidence." },
      { letter: "D", text: "The interests of the general public should always take precedence over private interests." },
      { letter: "E", text: "Ecosystems should be restored to their pre-human state whenever possible." },
    ],
    correctAnswer: "A",
  },
  {
    id: 7,
    stimulus: `Recent archaeological evidence suggests that ancient Polynesians reached South America long before European explorers. Sweet potatoes, which are native to South America, were cultivated in Polynesia as early as 1000 CE. Some scholars argue that Polynesian sailors must have traveled to South America and brought sweet potatoes back. Others contend that the sweet potatoes could have drifted across the Pacific Ocean on natural currents.`,
    stem: "Which one of the following, if true, most undermines the natural drift hypothesis?",
    answers: [
      { letter: "A", text: "Sweet potato seeds cannot survive prolonged immersion in saltwater." },
      { letter: "B", text: "The Polynesian word for sweet potato is similar to the word used by indigenous South Americans." },
      { letter: "C", text: "Polynesian navigators were capable of traveling thousands of miles across open ocean." },
      { letter: "D", text: "Other South American plant species have never been found in Polynesia." },
      { letter: "E", text: "Ocean currents between South America and Polynesia flow predominantly from west to east." },
    ],
    correctAnswer: "A",
  },
  {
    id: 8,
    stimulus: `A school district implemented a new reading program in which students spend 30 minutes each day reading books of their own choosing. After one year, standardized reading scores increased by 12 percent. The district superintendent attributed the improvement to the new program.`,
    stem: "Which one of the following, if true, most weakens the superintendent's conclusion?",
    answers: [
      { letter: "A", text: "The district also hired 20 additional reading specialists during the same year." },
      { letter: "B", text: "Students in the program reported enjoying reading more than they had before." },
      { letter: "C", text: "The new reading program was more expensive to implement than the previous curriculum." },
      { letter: "D", text: "Some students chose to read books that were below their grade level." },
      { letter: "E", text: "Standardized reading scores in neighboring districts remained unchanged during the same period." },
    ],
    correctAnswer: "A",
  },
  {
    id: 9,
    stimulus: `Art historian: It has long been assumed that the famous painting attributed to Vermeer, "The Concert," was entirely the work of Vermeer himself. However, recent X-ray analysis has revealed an underpainting in a style inconsistent with Vermeer's known techniques. This suggests that another artist began the painting before Vermeer completed it.`,
    stem: "Which one of the following is an assumption on which the art historian's argument depends?",
    answers: [
      { letter: "A", text: "Vermeer did not experiment with different painting techniques at various stages of his career." },
      { letter: "B", text: "X-ray analysis is the most reliable method for examining underpaintings." },
      { letter: "C", text: "No other paintings attributed to Vermeer contain similar inconsistencies." },
      { letter: "D", text: "The underpainting was not added to the canvas after Vermeer completed his work." },
      { letter: "E", text: "Art historians have identified the specific artist who created the underpainting." },
    ],
    correctAnswer: "A",
  },
  {
    id: 10,
    stimulus: `A technology company claims that its new artificial intelligence system can diagnose certain medical conditions with 95 percent accuracy, compared to 85 percent accuracy for experienced physicians. The company argues that hospitals should replace initial diagnostic screenings by physicians with the AI system to improve patient outcomes.`,
    stem: "The argument is most vulnerable to which of the following criticisms?",
    answers: [
      { letter: "A", text: "It ignores the possibility that the AI system and physicians may make different types of diagnostic errors." },
      { letter: "B", text: "It fails to consider whether the AI system has been tested on a sufficiently large sample." },
      { letter: "C", text: "It assumes that accuracy is the only factor relevant to patient outcomes." },
      { letter: "D", text: "It does not address the cost of implementing the AI system in hospitals." },
      { letter: "E", text: "It overlooks the possibility that physicians could improve their accuracy with additional training." },
    ],
    correctAnswer: "C",
  },
  {
    id: 11,
    stimulus: `Journalist: A recent government report states that unemployment has decreased by 2 percent over the past year. However, this statistic is misleading because it does not account for the large number of people who have stopped looking for work altogether. These individuals are not counted as unemployed in the official statistics, yet they represent a significant portion of the workforce that remains economically inactive.`,
    stem: "The journalist's argument proceeds by",
    answers: [
      { letter: "A", text: "presenting a counterexample that disproves a general claim" },
      { letter: "B", text: "questioning the methodology behind a statistic to cast doubt on a conclusion drawn from it" },
      { letter: "C", text: "showing that a correlation between two phenomena does not establish causation" },
      { letter: "D", text: "arguing that an authority figure's expertise does not extend to the matter at hand" },
      { letter: "E", text: "demonstrating that a proposed solution would create more problems than it solves" },
    ],
    correctAnswer: "B",
  },
  {
    id: 12,
    stimulus: `Marine biologist: Coral reefs are declining worldwide due to rising ocean temperatures. Some researchers have proposed transplanting heat-resistant coral species from warmer regions to cooler reefs as a way to preserve reef ecosystems. However, introducing non-native species to an ecosystem carries risks, as the transplanted corals could outcompete native species or introduce new diseases.`,
    stem: "Which one of the following best describes the role of the statement that introducing non-native species carries risks?",
    answers: [
      { letter: "A", text: "It is the main conclusion of the marine biologist's argument." },
      { letter: "B", text: "It provides evidence against the effectiveness of the proposed solution." },
      { letter: "C", text: "It identifies a potential drawback of the proposal that the argument goes on to weigh against its benefits." },
      { letter: "D", text: "It serves as a reason to be cautious about the proposed transplantation strategy." },
      { letter: "E", text: "It establishes a general principle that the argument applies to a specific case." },
    ],
    correctAnswer: "D",
  },
  {
    id: 13,
    stimulus: `Psychologist: Studies show that children who play musical instruments perform better in mathematics than children who do not. Some educators have concluded that music education directly improves mathematical ability. However, it is equally possible that children with stronger cognitive abilities are more likely to both pursue music and excel in mathematics, without one causing the other.`,
    stem: "The psychologist's reasoning is most similar to which of the following?",
    answers: [
      { letter: "A", text: "People who exercise regularly tend to be happier, but exercise may not cause happiness; instead, happier people may be more inclined to exercise." },
      { letter: "B", text: "Students who attend private schools tend to score higher on tests, so private schools must provide better education." },
      { letter: "C", text: "Countries with more physicians per capita have lower mortality rates, so training more physicians would reduce mortality." },
      { letter: "D", text: "People who eat organic food are healthier, so organic food must be more nutritious than conventional food." },
      { letter: "E", text: "Employees who receive bonuses are more productive, proving that financial incentives improve workplace performance." },
    ],
    correctAnswer: "A",
  },
  {
    id: 14,
    stimulus: `A local government passed a law requiring all new buildings to have green roofs — roofs covered with vegetation. The stated purpose is to reduce urban heat island effects and manage stormwater runoff. Opponents of the law argue that the additional construction costs will discourage new development, ultimately reducing the city's tax base and available housing.`,
    stem: "Which one of the following, if true, would most weaken the opponents' argument?",
    answers: [
      { letter: "A", text: "Cities that have implemented similar requirements have seen continued growth in new construction." },
      { letter: "B", text: "Green roofs require more maintenance than conventional roofs over their lifespan." },
      { letter: "C", text: "The urban heat island effect has measurable negative health impacts on city residents." },
      { letter: "D", text: "The cost of green roof installation has decreased by only 5 percent over the past decade." },
      { letter: "E", text: "Some developers have expressed concern about the new requirement." },
    ],
    correctAnswer: "A",
  },
  {
    id: 15,
    stimulus: `Professor: Students often complain that essay examinations are unfair because they favor students who write quickly. But the purpose of an essay examination is not to test writing speed — it is to test depth of understanding. A student who truly understands the material can express the key ideas concisely, without needing to write at length. Therefore, essay examinations do not unfairly advantage fast writers.`,
    stem: "The reasoning in the professor's argument is flawed because the argument",
    answers: [
      { letter: "A", text: "assumes that all students who write quickly also write superficially" },
      { letter: "B", text: "fails to consider that concise expression of ideas is itself a skill that varies among students" },
      { letter: "C", text: "ignores the possibility that some subjects require lengthy explanations regardless of the student's understanding" },
      { letter: "D", text: "takes for granted that the purpose of an examination determines whether the examination achieves that purpose" },
      { letter: "E", text: "overlooks the fact that essay examinations test writing ability in addition to subject knowledge" },
    ],
    correctAnswer: "C",
  },
  {
    id: 16,
    stimulus: `Historian: The popular narrative holds that the printing press democratized knowledge by making books affordable to the common person. However, for at least a century after Gutenberg's invention, books remained prohibitively expensive for most people. The true democratization of knowledge came with the rise of public libraries in the 19th century, which provided free access to books regardless of income.`,
    stem: "Which one of the following most accurately expresses the main conclusion of the historian's argument?",
    answers: [
      { letter: "A", text: "The printing press did not make books affordable to most people for at least a century." },
      { letter: "B", text: "Public libraries were more important than the printing press for democratizing knowledge." },
      { letter: "C", text: "The popular narrative about the printing press overstates its role in democratizing knowledge." },
      { letter: "D", text: "Gutenberg's invention was not significant in the history of knowledge dissemination." },
      { letter: "E", text: "Books were prohibitively expensive for most people throughout the 15th and 16th centuries." },
    ],
    correctAnswer: "C",
  },
  {
    id: 17,
    stimulus: `Nutritionist: Many people believe that eating late at night causes weight gain. However, several controlled studies have shown that total caloric intake, not the timing of meals, determines weight change. People who eat late at night tend to consume more total calories throughout the day, which accounts for their weight gain. The timing itself is irrelevant.`,
    stem: "Which one of the following, if true, most seriously challenges the nutritionist's conclusion?",
    answers: [
      { letter: "A", text: "Research indicates that the body's metabolism slows significantly during sleep, causing more calories consumed late at night to be stored as fat." },
      { letter: "B", text: "Many people who eat late at night skip breakfast the following morning." },
      { letter: "C", text: "The controlled studies referenced by the nutritionist were conducted over relatively short periods." },
      { letter: "D", text: "Some cultures traditionally eat their largest meal late in the evening without higher rates of obesity." },
      { letter: "E", text: "People who eat late at night often choose high-calorie snack foods." },
    ],
    correctAnswer: "A",
  },
  {
    id: 18,
    stimulus: `City planner: Our city should invest in a comprehensive bicycle lane network. Studies from Copenhagen and Amsterdam show that cities with extensive bicycle infrastructure see a significant reduction in car traffic and carbon emissions. Critics argue that our city's climate, with its harsh winters, makes cycling impractical for much of the year. But even if cycling decreases during winter months, the environmental and traffic benefits during the remaining eight months would justify the investment.`,
    stem: "Which one of the following is an assumption required by the city planner's argument?",
    answers: [
      { letter: "A", text: "The benefits of reduced traffic and emissions during non-winter months are not offset by increased car usage during winter." },
      { letter: "B", text: "Copenhagen and Amsterdam have climates similar to the city planner's city." },
      { letter: "C", text: "Bicycle lanes are less expensive to build and maintain than roads for cars." },
      { letter: "D", text: "Most residents of the city planner's city already own bicycles." },
      { letter: "E", text: "No other investment could achieve the same environmental benefits as a bicycle lane network." },
    ],
    correctAnswer: "A",
  },
];

// --- Component ---

function labelForCamo(c: string): string {
  switch (c) {
    case "conceptual": return "Conceptual Gap";
    case "misread": return "Misread";
    case "self-doubt": return "Self Doubt";
    case "self-confidence": return "Self Confidence";
    case "skipped": return "Skipped";
    default: return "Correct";
  }
}

function AnswerCircle({ letter, color }: { letter: string; color: string }) {
  const isMuted = letter === "—";
  return (
    <span
      className={styles.answerCircle}
      style={{
        background: isMuted ? "transparent" : color,
        borderColor: color,
        color: isMuted ? color : "#fff",
      }}
    >
      {letter}
    </span>
  );
}

export default function TestTakingInterface() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [eliminatedAnswers, setEliminatedAnswers] = useState<Record<number, Set<string>>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [isPaused, setIsPaused] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(35 * 60);
  const [timerVisible, setTimerVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [annotations, setAnnotations] = useState<
    Record<number, Array<{ start: number; end: number; color: string }>>
  >({});
  const [screen, setScreen] = useState<"launch" | "test" | "transition" | "break" | "camo" | "review">("launch");
  const [upNext, setUpNext] = useState<Array<{ pt: number; section: SectionType }>>([]);
  const [launchSearch, setLaunchSearch] = useState("");
  const [launchFilterStatus, setLaunchFilterStatus] = useState<"all" | "not-started" | "in-progress" | "completed">("all");
  const [launchFilterType, setLaunchFilterType] = useState<"all" | SectionType>("all");
  const [upNextOpen, setUpNextOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<"PT" | "S1" | "S2" | "S3" | "RC">("S1");
  const [reviewSort, setReviewSort] = useState<"order" | "wrong" | "camo">("order");
  const [reviewFilters, setReviewFilters] = useState<{
    answer: "all" | "correct" | "wrong" | "skipped";
    camo: "all" | "conceptual" | "misread" | "self-doubt" | "self-confidence";
    flag: "all" | "flagged";
    timing: "all" | "time-sink" | "near-pace" | "time-saver";
  }>({ answer: "all", camo: "all", flag: "all", timing: "all" });
  const [wajEntries, setWajEntries] = useState<Set<number>>(new Set());
  const [detailQId, setDetailQId] = useState<number | null>(null);
  const [camoAnswers, setCamoAnswers] = useState<Record<number, string>>({});
  const [camoQuestions, setCamoQuestions] = useState<number[]>([]);
  const [camoCurrentIdx, setCamoCurrentIdx] = useState(0);
  const [camoTimer, setCamoTimer] = useState(0);
  const [camoCompleted, setCamoCompleted] = useState(false);

  const stimulusRef = useRef<HTMLParagraphElement>(null);

  const question = QUESTIONS[currentQuestion];
  const totalQuestions = QUESTIONS.length;

  // Timer countdown — only runs during active test
  useEffect(() => {
    if (screen !== "test") return;
    const interval = setInterval(() => {
      if (!isPaused) {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, screen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const timerProgress = timerSeconds / (35 * 60);

  const selectAnswer = useCallback(
    (letter: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [question.id]: letter }));
    },
    [question.id]
  );

  const toggleElimination = useCallback(
    (letter: string) => {
      setEliminatedAnswers((prev) => {
        const current = new Set(prev[question.id] || []);
        if (current.has(letter)) {
          current.delete(letter);
        } else {
          current.add(letter);
        }
        return { ...prev, [question.id]: current };
      });
    },
    [question.id]
  );

  const toggleFlag = useCallback(() => {
    setFlaggedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(question.id)) {
        next.delete(question.id);
      } else {
        next.add(question.id);
      }
      return next;
    });
  }, [question.id]);

  const goToQuestion = (index: number) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentQuestion(index);
    }
  };

  const eliminated = eliminatedAnswers[question.id] || new Set();
  const selected = selectedAnswers[question.id];

  const getTextOffset = (container: Node, targetNode: Node, offset: number): number => {
    let total = 0;
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      if (node === targetNode) return total + offset;
      total += node.textContent?.length || 0;
      node = walker.nextNode();
    }
    return total + offset;
  };

  const applyHighlight = useCallback(
    (color: string) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.anchorNode || !selection.focusNode) return;
      const container = stimulusRef.current;
      if (!container || !container.contains(selection.anchorNode) || !container.contains(selection.focusNode)) return;

      const rawStart = getTextOffset(container, selection.anchorNode, selection.anchorOffset);
      const rawEnd = getTextOffset(container, selection.focusNode, selection.focusOffset);
      const [start, end] = rawStart < rawEnd ? [rawStart, rawEnd] : [rawEnd, rawStart];
      if (start === end) return;

      setAnnotations((prev) => ({
        ...prev,
        [question.id]: [...(prev[question.id] || []), { start, end, color }],
      }));
      selection.removeAllRanges();
    },
    [question.id]
  );

  const eraseHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.anchorNode || !selection.focusNode) return;
    const container = stimulusRef.current;
    if (!container || !container.contains(selection.anchorNode) || !container.contains(selection.focusNode)) return;

    const rawStart = getTextOffset(container, selection.anchorNode, selection.anchorOffset);
    const rawEnd = getTextOffset(container, selection.focusNode, selection.focusOffset);
    const [start, end] = rawStart < rawEnd ? [rawStart, rawEnd] : [rawEnd, rawStart];

    setAnnotations((prev) => {
      const current = prev[question.id] || [];
      return {
        ...prev,
        [question.id]: current.filter((a) => a.end <= start || a.start >= end),
      };
    });
    selection.removeAllRanges();
  }, [question.id]);

  const renderStyledText = (text: string, isStimulus: boolean): ReactNode => {
    const colorMap: Record<string, string> = {
      pink: "var(--highlight-pink)",
      orange: "var(--highlight-orange)",
      yellow: "var(--highlight-yellow)",
    };

    type CharStyle = { bg?: string; underline?: boolean; search?: boolean };
    const charStyles: CharStyle[] = Array.from({ length: text.length }, () => ({}));

    // Apply color annotations (stimulus only)
    if (isStimulus) {
      for (const ann of annotations[question.id] || []) {
        for (let i = ann.start; i < ann.end && i < text.length; i++) {
          if (ann.color === "underline") {
            charStyles[i].underline = true;
          } else {
            charStyles[i].bg = ann.color;
          }
        }
      }
    }

    // Apply search highlights
    if (searchQuery) {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      let match;
      while ((match = regex.exec(text)) !== null) {
        for (let i = match.index; i < match.index + match[0].length; i++) {
          charStyles[i].search = true;
        }
      }
    }

    // If no styles at all, return plain text
    if (!searchQuery && !(isStimulus && (annotations[question.id] || []).length > 0)) return text;

    // Group consecutive chars with same style
    if (text.length === 0) return text;
    const segments: { text: string; style: CharStyle }[] = [];
    let curStyle = charStyles[0];
    let curText = text[0];

    for (let i = 1; i < text.length; i++) {
      if (charStyles[i].bg === curStyle.bg && charStyles[i].underline === curStyle.underline && charStyles[i].search === curStyle.search) {
        curText += text[i];
      } else {
        segments.push({ text: curText, style: curStyle });
        curStyle = charStyles[i];
        curText = text[i];
      }
    }
    segments.push({ text: curText, style: curStyle });

    return segments.map((seg, i) => {
      if (!seg.style.bg && !seg.style.underline && !seg.style.search) return seg.text;
      const inlineStyle: CSSProperties = {};
      if (seg.style.search) {
        inlineStyle.backgroundColor = "var(--search-highlight)";
        inlineStyle.borderRadius = "2px";
        inlineStyle.padding = "0 1px";
      } else if (seg.style.bg) {
        inlineStyle.backgroundColor = colorMap[seg.style.bg] || seg.style.bg;
        inlineStyle.borderRadius = "2px";
        inlineStyle.padding = "0 1px";
      }
      if (seg.style.underline) {
        inlineStyle.textDecoration = "underline";
        inlineStyle.textDecorationThickness = "2px";
        inlineStyle.textUnderlineOffset = "3px";
      }
      return <span key={i} style={inlineStyle}>{seg.text}</span>;
    });
  };

  // Camo timer (stopwatch, counts up while on camo screen)
  useEffect(() => {
    if (screen !== "camo") return;
    const interval = setInterval(() => setCamoTimer((p) => p + 1), 1000);
    return () => clearInterval(interval);
  }, [screen]);

  const startCamo = useCallback(() => {
    const wrongIds = QUESTIONS
      .filter((q) => selectedAnswers[q.id] !== undefined && selectedAnswers[q.id] !== q.correctAnswer)
      .map((q) => q.id);
    const flaggedCorrectIds = QUESTIONS
      .filter((q) => flaggedQuestions.has(q.id) && selectedAnswers[q.id] === q.correctAnswer)
      .map((q) => q.id);
    const camoSet = [...new Set([...wrongIds, ...flaggedCorrectIds])].sort((a, b) => a - b);
    setCamoQuestions(camoSet);
    setCamoCurrentIdx(0);
    setCamoAnswers({});
    setCamoTimer(0);
    setCamoCompleted(false);
    setScreen("camo");
  }, [selectedAnswers, flaggedQuestions]);

  const answeredCount = Object.keys(selectedAnswers).length;
  const flaggedCount = flaggedQuestions.size;
  const elapsedSeconds = 35 * 60 - timerSeconds;
  const elapsedDisplay = `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60).toString().padStart(2, "0")}`;

  // ===== Review data (real answers + real camo if completed, mock timing) =====
  type CamoCategory = "correct" | "conceptual" | "misread" | "self-doubt" | "self-confidence" | "skipped";
  const reviewRows = QUESTIONS.map((q, i) => {
    const userAnswer = selectedAnswers[q.id];
    const isCorrect = userAnswer === q.correctAnswer;
    const wasFlagged = flaggedQuestions.has(q.id);
    const isInCamo = camoQuestions.includes(q.id);
    const camoAnswer = camoAnswers[q.id];
    const mockTimings = [85, 72, 95, 110, 65, 88, 130, 78, 102, 91, 67, 115, 83, 99, 74, 108, 86, 93];
    const time = mockTimings[i % mockTimings.length];
    const targetTime = 90;
    const delta = time - targetTime;

    let camo: CamoCategory = "correct";
    if (camoCompleted && isInCamo && camoAnswer) {
      const origCorrect = userAnswer === q.correctAnswer;
      const camoCor = camoAnswer === q.correctAnswer;
      if (origCorrect && camoCor) camo = "self-confidence";
      else if (!origCorrect && camoCor) camo = "misread";
      else if (!origCorrect && !camoCor) camo = "conceptual";
      else camo = "self-doubt";
    } else if (camoCompleted && !isInCamo) {
      if (!userAnswer) camo = "skipped";
      // else stays "correct"
    } else {
      // Pre-camo mock
      if (!userAnswer) camo = "skipped";
      else if (!isCorrect) {
        const cats: CamoCategory[] = ["conceptual", "misread", "self-doubt"];
        camo = cats[i % cats.length];
      } else if (wasFlagged) camo = "self-confidence";
    }

    return {
      id: q.id,
      citation: `PT92.S2.Q${q.id}`,
      userAnswer: userAnswer || "—",
      correctAnswer: q.correctAnswer,
      camoAnswer: camoAnswer || undefined,
      isCorrect,
      wasFlagged,
      isInCamo,
      time,
      delta,
      camo,
      repeatWrong: !isCorrect && i % 3 === 0,
    };
  });

  const correctCount = reviewRows.filter((r) => r.isCorrect).length;
  const wrongCount = reviewRows.filter((r) => !r.isCorrect && r.userAnswer !== "—").length;
  const skippedCount = reviewRows.filter((r) => r.userAnswer === "—").length;
  // Mock LSAT scaled score conversion (very rough)
  const rawScore = correctCount;
  const scaledScore = Math.round(140 + (rawScore / totalQuestions) * 40);

  const camoBuckets = {
    conceptual: reviewRows.filter((r) => r.camo === "conceptual").length,
    misread: reviewRows.filter((r) => r.camo === "misread").length,
    "self-doubt": reviewRows.filter((r) => r.camo === "self-doubt").length,
    "self-confidence": reviewRows.filter((r) => r.camo === "self-confidence").length,
  };

  const camoColors: Record<CamoCategory, string> = {
    correct: "var(--turquoise)",
    conceptual: "var(--perform)",
    misread: "var(--tuna)",
    "self-doubt": "var(--sangria)",
    "self-confidence": "var(--cornflower)",
    skipped: "var(--pewter)",
  };

  const camoOrder: Record<string, number> = { conceptual: 0, "self-doubt": 1, misread: 2, "self-confidence": 3, skipped: 4, correct: 5 };
  const sortedRows = (() => {
    const base = [...reviewRows];
    if (reviewSort === "wrong") base.sort((a, b) => Number(b.repeatWrong) - Number(a.repeatWrong) || Number(!a.isCorrect) - Number(!b.isCorrect));
    else if (reviewSort === "camo") base.sort((a, b) => (camoOrder[a.camo] ?? 9) - (camoOrder[b.camo] ?? 9));
    return base;
  })();

  const filteredRows = sortedRows.filter((r) => {
    if (reviewFilters.answer === "correct" && !r.isCorrect) return false;
    if (reviewFilters.answer === "wrong" && (r.isCorrect || r.userAnswer === "—")) return false;
    if (reviewFilters.answer === "skipped" && r.userAnswer !== "—") return false;
    if (reviewFilters.camo !== "all" && r.camo !== reviewFilters.camo) return false;
    if (reviewFilters.flag === "flagged" && !r.wasFlagged) return false;
    if (reviewFilters.timing === "time-sink" && r.delta <= 20) return false;
    if (reviewFilters.timing === "near-pace" && (r.delta < -15 || r.delta > 20)) return false;
    if (reviewFilters.timing === "time-saver" && r.delta >= -15) return false;
    return true;
  });

  const activeFilterCount = Object.values(reviewFilters).filter((v) => v !== "all").length;
  const detailRow = detailQId !== null ? reviewRows.find((r) => r.id === detailQId) : null;
  const detailQ = detailQId !== null ? QUESTIONS.find((q) => q.id === detailQId) : null;

  if (screen === "launch") {
    const completedSections = PT_DATA.filter(s => s.status === "completed").length;
    const avgScore = Math.round(
      PT_DATA.filter(s => s.score).reduce((sum, s) => sum + (s.score || 0), 0) /
      (PT_DATA.filter(s => s.score).length || 1)
    );

    const filteredData = PT_DATA.filter(s => {
      if (launchSearch) {
        const q = launchSearch.toLowerCase();
        if (!`pt ${s.pt}`.includes(q) && !s.section.toLowerCase().includes(q)) return false;
      }
      if (launchFilterStatus !== "all" && s.status !== launchFilterStatus) return false;
      if (launchFilterType !== "all" && s.section !== launchFilterType) return false;
      return true;
    });

    const toggleUpNext = (pt: number, section: SectionType) => {
      setUpNext(prev => {
        const exists = prev.some(s => s.pt === pt && s.section === section);
        if (exists) return prev.filter(s => !(s.pt === pt && s.section === section));
        return [...prev, { pt, section }];
      });
    };

    return (
      <div className={styles.launchContainer}>
        {/* Sidebar */}
        <aside className={styles.launchSidebar}>
          <div className={styles.launchSidebarTop}>
            <span className={styles.launchSidebarBrand}>Chandler&apos;s Prep</span>
            <div className={styles.launchLogoIcon}>C</div>
          </div>
          <div className={styles.launchSidebarSearchWrapper}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" stroke="var(--turquoise-hc)"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="var(--turquoise-hc)"/>
            </svg>
            <input
              className={styles.launchSidebarSearchInput}
              placeholder="Search..."
              value={launchSearch}
              onChange={e => setLaunchSearch(e.target.value)}
            />
          </div>
          <nav className={styles.launchNav}>
            {NAV_ITEMS.map(item => (
              <button
                key={item.label}
                className={`${styles.launchNavItem} ${item.active ? styles.launchNavItemActive : ""}`}
              >
                <span className={styles.launchNavIcon}>{item.icon}</span>
                <span className={styles.launchNavLabel}>{item.label}</span>
                <span className={styles.launchNavChevron}>›</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main className={styles.launchMain}>
          {/* Hero section — seafoam bg */}
          <section className={styles.launchHero}>
            {/* Top bar */}
            <div className={styles.launchHeroTopBar}>
              <div className={styles.launchHeroTopBarLeft} />
              <div className={styles.launchHeroTopBarRight}>
                <button className={styles.upNextBtn} onClick={() => setUpNextOpen(o => !o)}>
                  Up Next
                  {upNext.length > 0 && <span className={styles.upNextCount}>{upNext.length}</span>}
                </button>
                <div className={styles.launchNotifIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="var(--black-loophole)">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Settings chips row */}
            <div className={styles.launchHeroSettings}>
              <div className={styles.launchSettingsPill}>
                <div className={styles.launchSettingsChip}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span>Countdown</span>
                </div>
                <div className={styles.launchSettingsDivider} />
                <div className={styles.launchSettingsChip}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <span>Score</span>
                </div>
                <div className={styles.launchSettingsDivider} />
                <div className={styles.launchSettingsChip}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <span>Visible</span>
                </div>
              </div>
            </div>

            {/* Large search bar */}
            <div className={styles.launchHeroSearchWrapper}>
              <div className={styles.launchHeroSearchIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" stroke="var(--black-loophole)">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div className={styles.launchHeroSearchDivider} />
              <input
                className={styles.launchHeroSearchInput}
                placeholder="Find PRACTICE TESTS and more..."
                value={launchSearch}
                onChange={e => setLaunchSearch(e.target.value)}
              />
            </div>

            {/* Filter chips */}
            <div className={styles.launchHeroFilters}>
              {(["all","not-started","in-progress","completed"] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.launchHeroChip} ${launchFilterStatus === v ? styles.launchHeroChipActive : ""}`}
                  onClick={() => setLaunchFilterStatus(v)}
                >
                  {v === "all" ? "All" : v === "not-started" ? "Not Started" : v === "in-progress" ? "In Progress" : "Completed"}
                </button>
              ))}
              <div className={styles.launchHeroChipDivider} />
              {(["all","LR1","LR2","RC","Exp"] as const).map(v => (
                <button
                  key={v}
                  className={`${styles.launchHeroChip} ${launchFilterType === v ? styles.launchHeroChipActive : ""}`}
                  onClick={() => setLaunchFilterType(v)}
                >
                  {v === "all" ? "All Types" : v}
                </button>
              ))}
            </div>

            {/* Score summary bubble */}
            <div className={styles.launchScoreBubble}>
              <span className={styles.launchScoreBig}>{avgScore}</span>
              <div className={styles.launchScoreMeta}>
                <span className={styles.launchScoreLabel}>Avg Score</span>
                <span className={styles.launchScoreSub}>{completedSections} sections done</span>
              </div>
            </div>
          </section>

          {/* Up Next panel */}
          {upNextOpen && upNext.length > 0 && (
            <div className={styles.upNextPanel}>
              <div className={styles.upNextHeader}>
                <span className={styles.upNextTitle}>Up Next</span>
                <button className={styles.upNextClear} onClick={() => setUpNext([])}>Clear all</button>
              </div>
              {upNext.map((item, i) => (
                <div key={i} className={styles.upNextItem}>
                  <span className={styles.upNextItemLabel}>PT {item.pt} — {item.section}</span>
                  <button
                    className={styles.upNextLaunchBtn}
                    onClick={() => { setUpNextOpen(false); setScreen("test"); }}
                  >
                    Launch →
                  </button>
                  <button className={styles.upNextRemove} onClick={() => toggleUpNext(item.pt, item.section)}>✕</button>
                </div>
              ))}
            </div>
          )}

          {/* Content area */}
          <div className={styles.launchContent}>
            {/* Secondary search/sort bar */}
            <div className={styles.launchContentBar}>
              <div className={styles.launchContentSearch}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  className={styles.launchContentSearchInput}
                  placeholder="Filter by PT or section..."
                  value={launchSearch}
                  onChange={e => setLaunchSearch(e.target.value)}
                />
              </div>
              <div className={styles.launchContentSort}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--black-loophole)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="4" y1="6" x2="11" y2="6"/><line x1="4" y1="12" x2="11" y2="12"/>
                  <line x1="4" y1="18" x2="20" y2="18"/><polyline points="15 9 18 6 21 9"/>
                </svg>
                <span>Sort</span>
              </div>
            </div>

            {/* Tab strip */}
            <div className={styles.launchContentTabs}>
              <button className={`${styles.launchContentTab} ${styles.launchContentTabActive}`}>Sections</button>
              <button className={styles.launchContentTab}>All PTs</button>
              <button className={styles.launchContentTab}>Completed</button>
            </div>

            {/* PT Groups */}
            <div className={styles.launchGroups}>
              {PT_GROUPS.map(group => {
                const groupSections = filteredData.filter(s => group.pts.includes(s.pt));
                if (groupSections.length === 0) return null;
                return (
                  <div key={group.label} className={styles.launchGroup}>
                    <h3 className={styles.launchGroupLabel}>{group.label}</h3>
                    <div className={styles.launchTiles}>
                      {group.pts.flatMap(pt =>
                        (["LR1","LR2","RC","Exp"] as SectionType[])
                          .filter(sec => filteredData.some(s => s.pt === pt && s.section === sec))
                          .map(sec => {
                            const data = PT_DATA.find(s => s.pt === pt && s.section === sec)!;
                            const inUpNext = upNext.some(s => s.pt === pt && s.section === sec);
                            return (
                              <div
                                key={`${pt}-${sec}`}
                                className={`${styles.launchTile} ${data.status === "completed" ? styles.launchTileCompleted : data.status === "in-progress" ? styles.launchTileInProgress : ""}`}
                              >
                                <div className={styles.launchTileBadge} style={{ background: data.status === "completed" ? "var(--turquoise-hc)" : data.status === "in-progress" ? "var(--mango)" : "#A6EDE9", borderColor: data.status !== "not-started" ? "var(--white-loophole)" : "var(--black-loophole)" }}>
                                  <span className={styles.launchTileBadgeText} style={{ color: data.status !== "not-started" ? "#fff" : "var(--black-loophole)" }}>{pt}</span>
                                </div>
                                <div className={styles.launchTileBody}>
                                  <span className={styles.launchTilePT}>PT {pt}</span>
                                  <span
                                    className={styles.launchTileSection}
                                    style={{ color: data.status !== "not-started" ? "var(--white-loophole)" : SECTION_COLORS[sec] }}
                                  >
                                    {sec}
                                  </span>
                                  {data.score && <span className={styles.launchTileScore} style={{ color: data.status === "completed" ? "var(--white-loophole)" : "var(--black-loophole)" }}>{data.score}</span>}
                                </div>
                                {data.status === "in-progress" && <span className={styles.launchTileInProgressBadge}>●</span>}
                                <div className={styles.launchTileActions}>
                                  <button
                                    className={styles.launchTileLaunch}
                                    onClick={() => setScreen("test")}
                                    title="Launch Now"
                                  >▶</button>
                                  <button
                                    className={`${styles.launchTileAdd} ${inUpNext ? styles.launchTileAddActive : ""}`}
                                    onClick={() => toggleUpNext(pt, sec)}
                                    title={inUpNext ? "Remove from Up Next" : "Add to Up Next"}
                                  >
                                    {inUpNext ? "✓" : "+"}
                                  </button>
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (screen === "transition") {
    return (
      <div className={styles.transitionContainer}>
        <div className={styles.transitionCard}>
          <div className={styles.transitionHeader}>
            <span className={styles.transitionEyebrow}>Section Complete</span>
            <h1 className={styles.transitionTitle}>PT 92 — LR Section 1</h1>
            <p className={styles.transitionSubtitle}>
              You answered {answeredCount} of {totalQuestions} questions
              {flaggedCount > 0 ? ` · ${flaggedCount} flagged` : ""}
              {" · "}{elapsedDisplay} elapsed
            </p>
          </div>

          <div className={styles.transitionDivider} />

          <h2 className={styles.transitionPrompt}>Ready for Camo?</h2>

          <div className={styles.transitionActions}>
            <button
              className={`${styles.transitionBtn} ${styles.transitionBtnPrimary}`}
              onClick={startCamo}
            >
              <span className={styles.transitionBtnLabel}>Camo Now</span>
              <span className={styles.transitionBtnDesc}>
                Review wrong & flagged questions immediately while it's fresh
              </span>
            </button>

            <button
              className={styles.transitionBtn}
              onClick={() => setScreen("break")}
            >
              <span className={styles.transitionBtnLabel}>Camo After a Break</span>
              <span className={styles.transitionBtnDesc}>
                Step away first — review with a fresh perspective later
              </span>
            </button>
          </div>

          <button
            className={styles.skipCamoBtn}
            onClick={() => { setCamoCompleted(false); setScreen("review"); }}
          >
            If you improve, you really should Camo. But if you insist — <span className={styles.skipCamoUnderline}>Skip Camo</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "break") {
    return (
      <div className={styles.transitionContainer}>
        <div className={styles.transitionCard}>
          <div className={styles.breakIllustration}>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
              <ellipse cx="60" cy="92" rx="46" ry="10" fill="var(--text-primary)" opacity="0.08" />
              <path
                d="M22 78 Q22 50 60 50 Q98 50 98 78 L98 88 Q98 92 94 92 L26 92 Q22 92 22 88 Z"
                fill="#f4d8a8"
                stroke="var(--text-primary)"
                strokeWidth="2.5"
              />
              <path
                d="M30 60 Q42 38 60 38 Q78 38 90 60"
                fill="#fbeacb"
                stroke="var(--text-primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="48" cy="58" r="3" fill="var(--text-primary)" opacity="0.3" />
              <circle cx="62" cy="52" r="3" fill="var(--text-primary)" opacity="0.3" />
              <circle cx="76" cy="58" r="3" fill="var(--text-primary)" opacity="0.3" />
            </svg>
          </div>

          <h1 className={styles.transitionTitle}>Camo is Proofing</h1>
          <p className={styles.breakCopy}>
            Fresh bread always needs a few hours to proof so it can rise to new heights — just like your Camo.
          </p>

          <div className={styles.transitionActions}>
            <button
              className={`${styles.transitionBtn} ${styles.transitionBtnPrimary}`}
              onClick={() => setScreen("test")}
            >
              <span className={styles.transitionBtnLabel}>Take Another Section</span>
              <span className={styles.transitionBtnDesc}>
                Jump into another section while Camo proofs in the background
              </span>
            </button>

            <button
              className={styles.transitionBtn}
              onClick={() => setScreen("test")}
            >
              <span className={styles.transitionBtnLabel}>My Progress</span>
              <span className={styles.transitionBtnDesc}>
                See your dashboard and pick up where you left off
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "camo") {
    // Edge case: nothing to camo
    if (camoQuestions.length === 0) {
      setCamoCompleted(true);
      setScreen("review");
      return null;
    }

    const camoQId = camoQuestions[camoCurrentIdx];
    const camoQ = QUESTIONS.find((q) => q.id === camoQId)!;
    const originalAnswer = selectedAnswers[camoQId];
    const currentCamoAnswer = camoAnswers[camoQId];
    const camoAnsweredCount = Object.keys(camoAnswers).length;
    const allCamoAnswered = camoAnsweredCount === camoQuestions.length;

    const selectCamoAnswer = (letter: string) => {
      setCamoAnswers((prev) => ({ ...prev, [camoQId]: letter }));
    };

    const sendIt = () => {
      setCamoCompleted(true);
      setScreen("review");
    };

    return (
      <div className={styles.container}>
        {/* Camo Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.camoBadge}>Camo</span>
            <span className={styles.sectionLabel}>PT 92 — LR Section 1</span>
          </div>
          <div className={styles.headerCenter}>
            <div className={styles.camoTimerDisplay}>
              <span className={styles.camoTimerValue}>{formatTime(camoTimer)}</span>
              <span className={styles.camoTimerLabel}>elapsed</span>
            </div>
            <span className={styles.camoProgressLabel}>
              {camoAnsweredCount} / {camoQuestions.length} confirmed
            </span>
          </div>
          <div className={styles.headerRight}>
            <button
              className={`${styles.completeBtn} ${!allCamoAnswered ? styles.completeBtnDimmed : ""}`}
              onClick={sendIt}
              title={!allCamoAnswered ? `${camoQuestions.length - camoAnsweredCount} questions left to confirm` : "Submit Camo"}
            >
              Send It
            </button>
          </div>
        </header>

        {/* No annotation toolbar in Camo */}

        {/* Split Panel */}
        <main className={styles.main}>
          <div className={styles.leftPanel}>
            <div className={styles.stimulusContent}>
              <p className={styles.stimulusText}>{camoQ.stimulus}</p>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.rightPanel}>
            <div className={styles.questionStem}>
              <p>{camoQ.stem}</p>
            </div>
            <div className={styles.answersList}>
              {camoQ.answers.map((answer) => {
                const isOriginal = originalAnswer === answer.letter;
                const isSelected = currentCamoAnswer === answer.letter;

                return (
                  <div
                    key={answer.letter}
                    className={`${styles.answerRow} ${isSelected ? styles.answerSelected : ""} ${isOriginal && !isSelected ? styles.answerOriginalGhost : ""}`}
                  >
                    <button
                      className={`${styles.answerBubble} ${isSelected ? styles.bubbleSelected : ""} ${isOriginal && !isSelected ? styles.bubbleOriginalGhost : ""}`}
                      onClick={() => selectCamoAnswer(answer.letter)}
                      aria-label={`Select answer ${answer.letter}`}
                    >
                      {isSelected ? "✓" : answer.letter}
                    </button>
                    <span className={styles.answerText}>
                      {answer.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* Camo Nav Bar */}
        <footer className={styles.footer}>
          <div className={styles.navArrow}>
            <button
              className={styles.arrowBtn}
              disabled={camoCurrentIdx === 0}
              onClick={() => setCamoCurrentIdx((i) => i - 1)}
            >
              Prev
            </button>
          </div>
          <div className={styles.questionNav}>
            {camoQuestions.map((qId, i) => {
              const isAnswered = !!camoAnswers[qId];
              const isCurrent = i === camoCurrentIdx;
              const isWrong = selectedAnswers[qId] !== QUESTIONS.find((q) => q.id === qId)?.correctAnswer;
              return (
                <button
                  key={qId}
                  className={`${styles.navDot} ${isCurrent ? styles.navCurrent : ""} ${isAnswered ? styles.navAnswered : ""}`}
                  onClick={() => setCamoCurrentIdx(i)}
                  title={`Q${qId}${isWrong ? " · wrong on section" : " · flagged"}`}
                >
                  {qId}
                </button>
              );
            })}
          </div>
          <div className={styles.navArrow}>
            <button
              className={styles.arrowBtn}
              disabled={camoCurrentIdx === camoQuestions.length - 1}
              onClick={() => setCamoCurrentIdx((i) => i + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      </div>
    );
  }

  if (screen === "review") {
    const tabs: Array<{ id: typeof reviewTab; label: string; locked?: boolean }> = [
      { id: "PT", label: "PT 92" },
      { id: "S1", label: "S1 · LR" },
      { id: "S2", label: "S2 · LR" },
      { id: "S3", label: "S3 · RC", locked: true },
      { id: "RC", label: "Exp", locked: true },
    ];

    return (
      <div className={styles.reviewContainer}>
        {/* Top bar */}
        <header className={styles.reviewTopBar}>
          <button className={styles.reviewBackBtn} onClick={() => setScreen("launch")}>
            ← My Progress
          </button>
          <span className={styles.reviewBreadcrumb}>Review · PT 92 · LR Section 1</span>
          <button className={styles.reviewMenuBtn} title="Options">⋮</button>
        </header>

        {/* Section tabs */}
        <nav className={styles.reviewTabs}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`${styles.reviewTab} ${reviewTab === t.id ? styles.reviewTabActive : ""} ${t.locked ? styles.reviewTabLocked : ""}`}
              onClick={() => !t.locked && setReviewTab(t.id)}
              disabled={t.locked}
              title={t.locked ? "Complete this section to unlock" : undefined}
            >
              {t.label}
              {t.locked && <span className={styles.reviewTabLock}>🔒</span>}
            </button>
          ))}
        </nav>

        <main className={styles.reviewMain}>
          {/* Score Card */}
          <section className={styles.reviewScoreCard}>
            <div className={styles.reviewScoreLeft}>
              <span className={styles.reviewScoreLabel}>Section Score</span>
              <span className={styles.reviewScoreValue}>{scaledScore}</span>
              <span className={styles.reviewScoreSub}>Scaled · LR equivalent</span>
            </div>
            <div className={styles.reviewScoreDivider} />
            <div className={styles.reviewScoreLeft}>
              <span className={styles.reviewScoreLabel}>Camo Score</span>
              <span className={`${styles.reviewScoreValue} ${styles.reviewScoreValueCamo}`}>
                {scaledScore + Math.max(0, wrongCount - camoBuckets.conceptual)}
              </span>
              <span className={styles.reviewScoreSub}>After Camo review</span>
            </div>
            <div className={styles.reviewScoreDivider} />
            <div className={styles.reviewScoreStats}>
              <div className={styles.reviewStat}>
                <span className={styles.reviewStatNum}>{correctCount}</span>
                <span className={styles.reviewStatLabel}>Correct</span>
              </div>
              <div className={styles.reviewStat}>
                <span className={styles.reviewStatNum}>{wrongCount}</span>
                <span className={styles.reviewStatLabel}>Wrong</span>
              </div>
              <div className={styles.reviewStat}>
                <span className={styles.reviewStatNum}>{skippedCount}</span>
                <span className={styles.reviewStatLabel}>Skipped</span>
              </div>
              <div className={styles.reviewStat}>
                <span className={styles.reviewStatNum}>{elapsedDisplay}</span>
                <span className={styles.reviewStatLabel}>Time</span>
              </div>
            </div>
          </section>

          {/* Camo Summary */}
          <section className={styles.reviewCard}>
            <header className={styles.reviewCardHeader}>
              <h2 className={styles.reviewCardTitle}>Camo Summary</h2>
            </header>
            {!camoCompleted ? (
              <p className={`${styles.camoImprovementMsg} ${styles.camoSkipped}`}>
                Camo skipped — category data unavailable.
              </p>
            ) : wrongCount === 0 ? (
              <p className={styles.camoImprovementMsg}>Perfect section — no Camo needed!</p>
            ) : camoBuckets.misread > 0 ? (
              <p className={styles.camoImprovementMsg}>
                {`Nice! You picked up ${camoBuckets.misread} point${camoBuckets.misread > 1 ? "s" : ""} in Camo.`}
              </p>
            ) : camoBuckets["self-doubt"] > 0 ? (
              <p className={`${styles.camoImprovementMsg} ${styles.camoDecreased}`}>
                {`You second-guessed yourself on ${camoBuckets["self-doubt"]} question${camoBuckets["self-doubt"] > 1 ? "s" : ""} in Camo. Trust your instincts, my lamb.`}
              </p>
            ) : (
              <p className={styles.camoImprovementMsg}>
                Your Camo score stayed the same. Either these were tough questions or you rushed through Camo.
              </p>
            )}
            <div className={styles.camoBuckets}>
              <div className={styles.camoBucket}>
                <span className={styles.camoDot} style={{ background: camoColors.conceptual }} />
                <div className={styles.camoBucketBody}>
                  <span className={styles.camoBucketCount}>{camoBuckets.conceptual}</span>
                  <span className={styles.camoBucketLabel}>Conceptual Gap</span>
                </div>
              </div>
              <div className={styles.camoBucket}>
                <span className={styles.camoDot} style={{ background: camoColors.misread }} />
                <div className={styles.camoBucketBody}>
                  <span className={styles.camoBucketCount}>{camoBuckets.misread}</span>
                  <span className={styles.camoBucketLabel}>Misread</span>
                </div>
              </div>
              <div className={styles.camoBucket}>
                <span className={styles.camoDot} style={{ background: camoColors["self-doubt"] }} />
                <div className={styles.camoBucketBody}>
                  <span className={styles.camoBucketCount}>{camoBuckets["self-doubt"]}</span>
                  <span className={styles.camoBucketLabel}>Self Doubt</span>
                </div>
              </div>
              <div className={styles.camoBucket}>
                <span className={styles.camoDot} style={{ background: camoColors["self-confidence"] }} />
                <div className={styles.camoBucketBody}>
                  <span className={styles.camoBucketCount}>{camoBuckets["self-confidence"]}</span>
                  <span className={styles.camoBucketLabel}>Self Confidence</span>
                </div>
              </div>
            </div>
          </section>

          {/* Question Map */}
          <section className={styles.reviewCard}>
            <header className={styles.reviewCardHeader}>
              <h2 className={styles.reviewCardTitle}>Question Map</h2>
              <span className={styles.reviewCardHint}>
                Hover for citation · Click to open question detail
              </span>
            </header>
            <div className={styles.questionMap}>
              {reviewRows.map((r) => (
                <button
                  key={r.id}
                  className={styles.questionMapCell}
                  style={{
                    background: r.isCorrect ? "var(--bg-white)" : camoColors[r.camo],
                    color: r.isCorrect ? "var(--text-primary)" : "#fff",
                    borderColor: r.isCorrect ? "var(--text-primary)" : camoColors[r.camo],
                  }}
                  title={`${r.citation} · ${r.isCorrect ? "Correct" : labelForCamo(r.camo)} · ${r.time}s`}
                  onClick={() => setDetailQId(r.id)}
                >
                  {r.id}
                </button>
              ))}
            </div>
            <div className={styles.questionMapLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: "var(--bg-white)", border: "2px solid var(--text-primary)" }} />
                Correct
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: camoColors.conceptual }} />
                Conceptual
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: camoColors.misread }} />
                Misread
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: camoColors["self-doubt"] }} />
                Self Doubt
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: camoColors["self-confidence"] }} />
                Self Confidence
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendSwatch} style={{ background: camoColors.skipped }} />
                Skipped
              </span>
            </div>
          </section>

          {/* Review Table */}
          <section className={styles.reviewCard}>
            <header className={styles.reviewCardHeader}>
              <h2 className={styles.reviewCardTitle}>Question Review</h2>
              <div className={styles.reviewSortControls}>
                <button className={`${styles.reviewSortBtn} ${reviewSort === "order" ? styles.reviewSortActive : ""}`} onClick={() => setReviewSort("order")}>Order</button>
                <button className={`${styles.reviewSortBtn} ${reviewSort === "wrong" ? styles.reviewSortActive : ""}`} onClick={() => setReviewSort("wrong")}>Wrong first</button>
                <button className={`${styles.reviewSortBtn} ${reviewSort === "camo" ? styles.reviewSortActive : ""}`} onClick={() => setReviewSort("camo")}>Camo order</button>
              </div>
            </header>

            {/* Filter Bar */}
            <div className={styles.filterBar}>
              <span className={styles.filterLabel}>Filters</span>

              {/* Answer filter */}
              {(["correct", "wrong", "skipped"] as const).map((val) => (
                <button
                  key={val}
                  className={`${styles.filterChip} ${reviewFilters.answer === val ? styles.filterChipActive : ""}`}
                  onClick={() => setReviewFilters((f) => ({ ...f, answer: f.answer === val ? "all" : val }))}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                  {reviewFilters.answer === val && <span className={styles.filterChipX}>×</span>}
                </button>
              ))}

              <span className={styles.filterDivider} />

              {/* Camo category filter */}
              {(["conceptual", "misread", "self-doubt", "self-confidence"] as const).map((val) => (
                <button
                  key={val}
                  className={`${styles.filterChip} ${reviewFilters.camo === val ? styles.filterChipActive : ""}`}
                  style={reviewFilters.camo === val ? { background: camoColors[val], borderColor: camoColors[val], color: "#fff" } : {}}
                  onClick={() => setReviewFilters((f) => ({ ...f, camo: f.camo === val ? "all" : val }))}
                >
                  {labelForCamo(val)}
                  {reviewFilters.camo === val && <span className={styles.filterChipX}>×</span>}
                </button>
              ))}

              <span className={styles.filterDivider} />

              {/* Flag filter */}
              <button
                className={`${styles.filterChip} ${reviewFilters.flag === "flagged" ? styles.filterChipActive : ""}`}
                onClick={() => setReviewFilters((f) => ({ ...f, flag: f.flag === "flagged" ? "all" : "flagged" }))}
              >
                ⚑ Flagged
                {reviewFilters.flag === "flagged" && <span className={styles.filterChipX}>×</span>}
              </button>

              {/* Timing filter */}
              {(["time-sink", "near-pace", "time-saver"] as const).map((val) => (
                <button
                  key={val}
                  className={`${styles.filterChip} ${reviewFilters.timing === val ? styles.filterChipActive : ""}`}
                  onClick={() => setReviewFilters((f) => ({ ...f, timing: f.timing === val ? "all" : val }))}
                >
                  {val === "time-sink" ? "Time Sink" : val === "near-pace" ? "Near Pace" : "Time Saver"}
                  {reviewFilters.timing === val && <span className={styles.filterChipX}>×</span>}
                </button>
              ))}

              {activeFilterCount > 0 && (
                <button
                  className={styles.filterReset}
                  onClick={() => setReviewFilters({ answer: "all", camo: "all", flag: "all", timing: "all" })}
                >
                  Reset ({activeFilterCount})
                </button>
              )}

              <span className={styles.filterCount}>{filteredRows.length} / {reviewRows.length}</span>
            </div>

            <table className={styles.reviewTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Question</th>
                  <th>Section</th>
                  <th>Camo</th>
                  <th className={styles.tdRight}>Time</th>
                  <th className={styles.tdCenter}>WAJ</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.id} className={styles.reviewTableRow} onClick={() => setDetailQId(r.id)}>
                    <td className={styles.tdQNum}>
                      {r.id}
                      {r.repeatWrong && <span className={styles.repeatBadge} title="Repeat wrong">↻</span>}
                    </td>
                    <td className={styles.tdCitation}>{r.citation}</td>
                    <td>
                      <AnswerCircle letter={r.userAnswer} color={r.userAnswer === "—" ? "var(--pewter)" : r.isCorrect ? "var(--turquoise)" : "var(--perform)"} />
                    </td>
                    <td>
                      {!r.isInCamo || !r.camoAnswer ? (
                        <span className={styles.tdMuted}>—</span>
                      ) : (
                        <AnswerCircle
                          letter={r.camoAnswer}
                          color={r.camoAnswer === r.correctAnswer ? "var(--turquoise)" : camoColors[r.camo]}
                        />
                      )}
                    </td>
                    <td className={styles.tdRight}>
                      <span className={styles.timeMain}>{r.time}s</span>
                      <span className={styles.timeDelta} style={{ color: r.delta < 0 ? "var(--turquoise-hc)" : r.delta > 0 ? "var(--perform)" : "var(--text-muted)" }}>
                        {r.delta >= 0 ? `+${r.delta}` : r.delta}s
                      </span>
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      {!r.isCorrect && r.userAnswer !== "—" ? (
                        <button
                          className={`${styles.wajBtn} ${wajEntries.has(r.id) ? styles.wajBtnActive : ""}`}
                          onClick={() => setWajEntries((prev) => {
                            const next = new Set(prev);
                            next.has(r.id) ? next.delete(r.id) : next.add(r.id);
                            return next;
                          })}
                          title={wajEntries.has(r.id) ? "Remove from WAJ" : "Add to Wrong Answer Journal"}
                        >
                          {wajEntries.has(r.id) ? "✓" : "+"}
                        </button>
                      ) : (
                        <span className={styles.tdMuted}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>

        {/* Question Detail Drawer */}
        {detailQId !== null && detailRow && detailQ && (
          <>
            <div className={styles.drawerOverlay} onClick={() => setDetailQId(null)} />
            <aside className={styles.detailDrawer}>
              <header className={styles.drawerHeader}>
                <div className={styles.drawerHeaderLeft}>
                  <span className={styles.drawerQNum}>Q{detailRow.id}</span>
                  <span className={styles.drawerCitation}>{detailRow.citation}</span>
                  {!detailRow.isCorrect && detailRow.userAnswer !== "—" && (
                    <span
                      className={styles.drawerCamoBadge}
                      style={{ background: camoColors[detailRow.camo], borderColor: camoColors[detailRow.camo] }}
                    >
                      {labelForCamo(detailRow.camo)}
                    </span>
                  )}
                  {detailRow.isCorrect && <span className={styles.drawerCamoBadge} style={{ background: "var(--turquoise)", borderColor: "var(--turquoise)" }}>Correct</span>}
                </div>
                <button className={styles.drawerClose} onClick={() => setDetailQId(null)}>✕</button>
              </header>

              <div className={styles.drawerBody}>
                {/* Stimulus */}
                <div className={styles.drawerStimulus}>
                  <p className={styles.drawerStimulusText}>{detailQ.stimulus}</p>
                </div>

                {/* Question stem */}
                <p className={styles.drawerStem}>{detailQ.stem}</p>

                {/* Answers */}
                <div className={styles.drawerAnswers}>
                  {detailQ.answers.map((ans) => {
                    const isCorrect = ans.letter === detailQ.correctAnswer;
                    const wasSelected = ans.letter === detailRow.userAnswer;
                    const wasCamo = ans.letter === detailRow.camoAnswer;
                    return (
                      <div
                        key={ans.letter}
                        className={`${styles.drawerAnswer} ${isCorrect ? styles.drawerAnswerCorrect : ""} ${wasSelected && !isCorrect ? styles.drawerAnswerWrong : ""}`}
                      >
                        <span className={styles.drawerAnswerLetter}>{ans.letter}</span>
                        <span className={styles.drawerAnswerText}>{ans.text}</span>
                        <div className={styles.drawerAnswerTags}>
                          {wasSelected && <span className={styles.drawerTag} title="Your section answer">S</span>}
                          {wasCamo && wasCamo !== wasSelected && <span className={`${styles.drawerTag} ${styles.drawerTagCamo}`} title="Your Camo answer">C</span>}
                          {isCorrect && <span className={`${styles.drawerTag} ${styles.drawerTagCorrect}`} title="Correct answer">✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Timing */}
                <div className={styles.drawerStats}>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatValue}>{detailRow.time}s</span>
                    <span className={styles.drawerStatLabel}>Time spent</span>
                  </div>
                  <div className={styles.drawerStat}>
                    <span className={styles.drawerStatValue} style={{ color: detailRow.delta < 0 ? "var(--turquoise-hc)" : detailRow.delta > 0 ? "var(--perform)" : "var(--text-muted)" }}>
                      {detailRow.delta >= 0 ? `+${detailRow.delta}` : detailRow.delta}s
                    </span>
                    <span className={styles.drawerStatLabel}>vs pace</span>
                  </div>
                  {detailRow.wasFlagged && (
                    <div className={styles.drawerStat}>
                      <span className={styles.drawerStatValue}>⚑</span>
                      <span className={styles.drawerStatLabel}>Flagged</span>
                    </div>
                  )}
                </div>

                {/* WAJ quick-add */}
                {!detailRow.isCorrect && detailRow.userAnswer !== "—" && (
                  <button
                    className={`${styles.drawerWajBtn} ${wajEntries.has(detailRow.id) ? styles.drawerWajBtnActive : ""}`}
                    onClick={() => setWajEntries((prev) => {
                      const next = new Set(prev);
                      next.has(detailRow.id) ? next.delete(detailRow.id) : next.add(detailRow.id);
                      return next;
                    })}
                  >
                    {wajEntries.has(detailRow.id) ? "✓ In Wrong Answer Journal" : "+ Add to Wrong Answer Journal"}
                  </button>
                )}
              </div>
            </aside>
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionLabel}>PT 92 — LR Section 1</span>
          <span className={styles.questionLabel}>{question.id} / {totalQuestions} Complete</span>
        </div>

        <div className={styles.headerCenter}>
          {timerVisible && (
            <div className={styles.timerArea} onClick={() => setTimerVisible(false)}>
              <span className={styles.timerValue}>{formatTime(timerSeconds)}</span>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${timerProgress * 100}%` }}
                />
              </div>
            </div>
          )}
          {!timerVisible && (
            <div
              className={styles.timerHidden}
              onClick={() => setTimerVisible(true)}
            >
              <span className={styles.timerHiddenLabel}>Timer hidden</span>
            </div>
          )}
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.pauseBtn}
            onClick={() => setIsPaused(!isPaused)}
            title="Pause section"
          >
            {isPaused ? "▶" : "⏸"}
          </button>
          <button
            className={`${styles.flagBtn} ${flaggedQuestions.has(question.id) ? styles.flagActive : ""}`}
            onClick={toggleFlag}
            title="Flag for review"
          >
            ⚑
          </button>
          <button className={styles.completeBtn} onClick={() => setScreen("transition")}>Complete Section</button>
        </div>
      </header>

      {/* Annotation Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.searchWrapper}>
            <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className={styles.toolbarRight}>
          <button className={styles.highlightBtn} title="Pink highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("pink")}>
            <img src="/icons/Brush_Pink.svg" alt="Pink highlight" width={15} height={16} draggable={false} />
          </button>
          <button className={styles.highlightBtn} title="Orange highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("orange")}>
            <img src="/icons/Brush_Orange.svg" alt="Orange highlight" width={15} height={16} draggable={false} />
          </button>
          <button className={styles.highlightBtn} title="Yellow highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("yellow")}>
            <img src="/icons/Brush_Yellow.svg" alt="Yellow highlight" width={15} height={16} draggable={false} />
          </button>
          <button className={styles.toolBtn} title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("underline")}>U̲</button>
          <button className={styles.toolBtn} title="Eraser" onMouseDown={(e) => e.preventDefault()} onClick={eraseHighlight}>⌫</button>
          <span className={styles.toolbarDivider} />
          <button className={styles.toolBtn} title="Text size">Aa</button>
          <button className={styles.toolBtn} title="Line height">↕</button>
        </div>
      </div>

      {/* Main Split Panel */}
      <main className={styles.main}>
        {/* Left Panel — Stimulus */}
        <div className={styles.leftPanel}>
          <div className={styles.stimulusContent}>
            <p className={styles.stimulusText} ref={stimulusRef}>
              {renderStyledText(question.stimulus, true)}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Right Panel — Question & Answers */}
        <div className={styles.rightPanel}>
          <div className={styles.questionStem}>
            <p>{renderStyledText(question.stem, false)}</p>
          </div>

          <div className={styles.answersList}>
            {question.answers.map((answer) => {
              const isEliminated = eliminated.has(answer.letter);
              const isSelected = selected === answer.letter;

              return (
                <div
                  key={answer.letter}
                  className={`${styles.answerRow} ${isEliminated ? styles.answerEliminated : ""} ${isSelected ? styles.answerSelected : ""}`}
                >
                  {/* Selection bubble */}
                  <button
                    className={`${styles.answerBubble} ${isSelected ? styles.bubbleSelected : ""}`}
                    onClick={() => selectAnswer(answer.letter)}
                    aria-label={`Select answer ${answer.letter}`}
                  >
                    {isSelected ? "✓" : answer.letter}
                  </button>

                  {/* Answer text */}
                  <span
                    className={`${styles.answerText} ${isEliminated ? styles.textEliminated : ""}`}
                  >
                    {renderStyledText(answer.text, false)}
                  </span>

                  {/* Elimination X */}
                  <button
                    className={`${styles.eliminateBtn} ${isEliminated ? styles.eliminateActive : ""}`}
                    onClick={() => toggleElimination(answer.letter)}
                    aria-label={`Eliminate answer ${answer.letter}`}
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Question Navigation Bar */}
      <footer className={styles.footer}>
        <div className={styles.navArrow}>
          <button
            className={styles.arrowBtn}
            disabled={currentQuestion === 0}
            onClick={() => goToQuestion(currentQuestion - 1)}
          >
            Prev
          </button>
        </div>

        <div className={styles.questionNav}>
          {QUESTIONS.map((q, i) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = i === currentQuestion;
            const isFlagged = flaggedQuestions.has(q.id);

            return (
              <button
                key={q.id}
                className={`${styles.navDot} ${isCurrent ? styles.navCurrent : ""} ${isAnswered ? styles.navAnswered : ""}`}
                onClick={() => goToQuestion(i)}
                title={`Question ${q.id}${isFlagged ? " (flagged)" : ""}`}
              >
                {q.id}
                {isFlagged && <span className={styles.navFlag}>⚑</span>}
                {isCurrent && <span className={styles.navIndicator} />}
              </button>
            );
          })}
        </div>

        <div className={styles.navArrow}>
          <button
            className={styles.arrowBtn}
            disabled={currentQuestion === totalQuestions - 1}
            onClick={() => goToQuestion(currentQuestion + 1)}
          >
            Next
          </button>
        </div>
      </footer>

      {/* Pause Overlay */}
      {isPaused && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseModal}>
            <h2>Section Paused</h2>
            <p className={styles.pauseInfo}>
              {totalQuestions - Object.keys(selectedAnswers).length} unanswered questions remaining
            </p>
            <p className={styles.pauseNote}>
              Note: You cannot pause the real LSAT. Pausing is for practice only.
            </p>
            <button
              className={styles.resumeBtn}
              onClick={() => setIsPaused(false)}
            >
              Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
