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
  const [launchViewLevel, setLaunchViewLevel] = useState<"section" | "pt">("pt");
  const [ptHistoryOpen, setPtHistoryOpen] = useState(false);
  const [reviewTab, setReviewTab] = useState<"PT" | "S1" | "S2" | "S3" | "RC">("S1");
  const [reviewSort, setReviewSort] = useState<
    "order" | "reverse" | "wrong" | "correct" | "camo" | "slowest" | "fastest" | "in-waj" | "need-waj"
  >("order");
  const [reviewFilters, setReviewFilters] = useState<{
    answer: "all" | "correct" | "wrong" | "skipped";
    camo: "all" | "conceptual" | "misread" | "self-doubt" | "self-confidence";
    flag: "all" | "flagged";
    timing:
      | "all"
      | "major-sink"
      | "minor-sink"
      | "near-pace"
      | "time-saver"
      | "skipped-guess"
      | "above-pace"
      | "below-pace";
  }>({ answer: "all", camo: "all", flag: "all", timing: "all" });
  const [reviewTagFilter, setReviewTagFilter] = useState<string | null>(null);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  type WajEntry = { whyMissed: string; whatDifferently: string; processed: boolean };
  const [wajEntries, setWajEntries] = useState<Record<number, WajEntry>>({});
  const isInWaj = useCallback((id: number) => wajEntries[id]?.processed === true, [wajEntries]);
  const [wajOpenQId, setWajOpenQId] = useState<number | null>(null);
  const [wajDraft, setWajDraft] = useState<{ whyMissed: string; whatDifferently: string; editing: boolean }>({ whyMissed: "", whatDifferently: "", editing: false });
  const [detailQId, setDetailQId] = useState<number | null>(null);
  const [detailTab, setDetailTab] = useState<"question" | "history">("question");
  const [clirVisible, setClirVisible] = useState(false);
  const [zoneExplorerQId, setZoneExplorerQId] = useState<number | null>(null);
  const [zoneExplorerMode, setZoneExplorerMode] = useState<"original" | "camo">("original");
  const [zoneExplorerTime, setZoneExplorerTime] = useState(0);
  const [videoExplanationQId, setVideoExplanationQId] = useState<number | null>(null);
  const [reviewMenuOpen, setReviewMenuOpen] = useState(false);
  const [excludeFromAnalytics, setExcludeFromAnalytics] = useState(false);
  const [deleteModal, setDeleteModal] = useState<"section" | "pt" | null>(null);
  const [tableHeaderSort, setTableHeaderSort] = useState<"" | "num-asc" | "num-desc" | "time-asc" | "time-desc" | "date-asc" | "date-desc">("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [wajStatusFilter, setWajStatusFilter] = useState<"all" | "in-waj" | "need-waj">("all");
  const [qTypeFilter, setQTypeFilter] = useState<string[]>([]);
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [qTypeOpen, setQTypeOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [labelSearch, setLabelSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<"all" | "S1" | "S2" | "S3" | "Exp">("all");
  const [camoAnswers, setCamoAnswers] = useState<Record<number, string>>({});
  const [camoQuestions, setCamoQuestions] = useState<number[]>([]);
  const [textSize, setTextSize] = useState<"small" | "default" | "large" | "xlarge">("default");
  const [lineHeight, setLineHeight] = useState<"default" | "medium" | "large">("default");
  const [textSizeOpen, setTextSizeOpen] = useState(false);
  const [lineHeightOpen, setLineHeightOpen] = useState(false);

  // Load persisted reading preferences
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ts = window.localStorage.getItem("loophole:textSize");
    const lh = window.localStorage.getItem("loophole:lineHeight");
    if (ts === "small" || ts === "default" || ts === "large" || ts === "xlarge") setTextSize(ts);
    if (lh === "default" || lh === "medium" || lh === "large") setLineHeight(lh);
  }, []);

  const setPersistedTextSize = useCallback((v: "small" | "default" | "large" | "xlarge") => {
    setTextSize(v);
    if (typeof window !== "undefined") window.localStorage.setItem("loophole:textSize", v);
  }, []);
  const setPersistedLineHeight = useCallback((v: "default" | "medium" | "large") => {
    setLineHeight(v);
    if (typeof window !== "undefined") window.localStorage.setItem("loophole:lineHeight", v);
  }, []);

  const textSizePx: Record<typeof textSize, number> = { small: 14, default: 16, large: 19, xlarge: 23 };
  const lineHeightNum: Record<typeof lineHeight, number> = { default: 1.4, medium: 1.65, large: 1.9 };
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
  const mockTagPools: string[][] = [
    ["Assumption", "Necessary"],
    ["Flaw", "Gap"],
    ["Strengthen"],
    ["Principle", "Apply"],
    ["Weaken"],
    ["Parallel"],
    ["Inference"],
    ["Method"],
    ["Conclusion"],
    ["Cause-Effect"],
  ];
  const sectionDate = "04/20/26";
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
    const tags = mockTagPools[i % mockTagPools.length];

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

    // Mock zone breakdown per question — stimulus, stem, A-E, with proportional durations
    const zonePattern = [
      { zone: "Stimulus", pct: 0.38 },
      { zone: "Stem", pct: 0.10 },
      { zone: "A", pct: 0.06 },
      { zone: "B", pct: 0.18 },
      { zone: "C", pct: 0.08 },
      { zone: "D", pct: 0.12 },
      { zone: "E", pct: 0.08 },
    ];
    const zones = zonePattern.map((z) => ({ zone: z.zone, duration: Math.round(time * z.pct) }));
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
      repeatDaysAgo: (i % 3 === 0 && !isCorrect) ? 14 + (i % 40) : null,
      tags,
      date: sectionDate,
      zones,
      startedAt: `${Math.floor((i * 2) / 60)}:${((i * 2) % 60).toString().padStart(2, "0")}`,
      returnedAt: i % 5 === 0 ? `${Math.floor((i * 2 + 15) / 60)}:${((i * 2 + 15) % 60).toString().padStart(2, "0")}` : null,
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
    if (reviewSort === "reverse") base.sort((a, b) => b.id - a.id);
    else if (reviewSort === "wrong") base.sort((a, b) => Number(b.repeatWrong) - Number(a.repeatWrong) || Number(!a.isCorrect) - Number(!b.isCorrect));
    else if (reviewSort === "correct") base.sort((a, b) => Number(b.isCorrect) - Number(a.isCorrect));
    else if (reviewSort === "camo") base.sort((a, b) => (camoOrder[a.camo] ?? 9) - (camoOrder[b.camo] ?? 9));
    else if (reviewSort === "slowest") base.sort((a, b) => b.time - a.time);
    else if (reviewSort === "fastest") base.sort((a, b) => a.time - b.time);
    else if (reviewSort === "in-waj") base.sort((a, b) => Number(isInWaj(b.id)) - Number(isInWaj(a.id)));
    else if (reviewSort === "need-waj") base.sort((a, b) =>
      Number((!b.isCorrect && b.userAnswer !== "—" && !isInWaj(b.id))) -
      Number((!a.isCorrect && a.userAnswer !== "—" && !isInWaj(a.id)))
    );
    return base;
  })();

  const paceRatio = (delta: number, target: number) => (target + delta) / target;
  const filteredRows = sortedRows.filter((r) => {
    if (reviewFilters.answer === "correct" && !r.isCorrect) return false;
    if (reviewFilters.answer === "wrong" && (r.isCorrect || r.userAnswer === "—")) return false;
    if (reviewFilters.answer === "skipped" && r.userAnswer !== "—") return false;
    if (reviewFilters.camo !== "all" && r.camo !== reviewFilters.camo) return false;
    if (reviewFilters.flag === "flagged" && !r.wasFlagged) return false;
    const ratio = paceRatio(r.delta, 90);
    if (reviewFilters.timing === "major-sink" && ratio < 2) return false;
    if (reviewFilters.timing === "minor-sink" && (ratio < 1.25 || ratio >= 2)) return false;
    if (reviewFilters.timing === "near-pace" && (ratio < 0.9 || ratio > 1.25)) return false;
    if (reviewFilters.timing === "time-saver" && (ratio >= 0.9 || r.time <= 15)) return false;
    if (reviewFilters.timing === "skipped-guess" && r.time > 15) return false;
    if (reviewFilters.timing === "above-pace" && ratio <= 1) return false;
    if (reviewFilters.timing === "below-pace" && ratio >= 1) return false;
    if (reviewTagFilter && !r.tags.includes(reviewTagFilter)) return false;
    if (wajStatusFilter === "in-waj" && !isInWaj(r.id)) return false;
    if (wajStatusFilter === "need-waj" && (r.isCorrect || r.userAnswer === "—" || isInWaj(r.id))) return false;
    if (reviewSearch.trim()) {
      const q = reviewSearch.trim().toLowerCase();
      const haystack = `${r.citation} ${r.tags.join(" ")} Q${r.id}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  })
  // Column header sorting overrides primary sort
  .sort((a, b) => {
    if (tableHeaderSort === "num-asc") return a.id - b.id;
    if (tableHeaderSort === "num-desc") return b.id - a.id;
    if (tableHeaderSort === "time-asc") return a.time - b.time;
    if (tableHeaderSort === "time-desc") return b.time - a.time;
    if (tableHeaderSort === "date-asc") return a.date.localeCompare(b.date);
    if (tableHeaderSort === "date-desc") return b.date.localeCompare(a.date);
    return 0;
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
                  <span className={styles.upNextPanelIcon} aria-hidden>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                      <rect x="3" y="5" width="18" height="14" rx="2"/>
                      <line x1="15" y1="5" x2="15" y2="19"/>
                    </svg>
                  </span>
                  <span className={styles.upNextDivider} aria-hidden />
                  <span className={styles.upNextLabel}>Up Next</span>
                  <span className={styles.upNextCount}>{upNext.length}</span>
                </button>
              </div>
            </div>

            {/* Settings pill — actual values with trailing dropdown carets */}
            <div className={styles.launchHeroSettings}>
              <div className={styles.launchSettingsPill}>
                {[
                  { icon: (<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>), label: "Countdown" },
                  { icon: (<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>), label: "35 min" },
                  { icon: (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>), label: "Timer" },
                  { icon: (<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>), label: "5 min" },
                  { icon: (<><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></>), label: "Focus" },
                ].map((item, i) => (
                  <button key={i} className={styles.launchSettingsBtn}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                      {item.icon}
                    </svg>
                    <span>{item.label}</span>
                    <span className={styles.launchSettingsCaret} aria-hidden>▾</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Large search bar */}
            <div className={styles.launchHeroSearchWrapper}>
              <div className={styles.launchHeroSearchIcon} aria-hidden>
                <span className={styles.launchHeroSearchIconLogo}>PB</span>
              </div>
              <input
                className={styles.launchHeroSearchInput}
                placeholder="Find PRACTICE TESTS and sections"
                value={launchSearch}
                onChange={e => setLaunchSearch(e.target.value)}
              />
            </div>

            {/* Quick action pills */}
            <div className={styles.launchHeroQuick}>
              <button
                className={styles.launchQuickBtn}
                onClick={() => { setLaunchFilterType("LR1"); setScreen("test"); }}
              >
                Next LR
                <span className={styles.launchQuickPlay}>▶</span>
              </button>
              <button
                className={styles.launchQuickBtn}
                onClick={() => { setLaunchFilterType("RC"); setScreen("test"); }}
              >
                Next RC
                <span className={styles.launchQuickPlay}>▶</span>
              </button>
              <button
                className={styles.launchQuickBtn}
                onClick={() => setScreen("test")}
              >
                I&apos;m Feeling Lucky!
                <span className={styles.launchQuickDice} aria-hidden>🎲</span>
              </button>
            </div>

            {/* PT History toggle */}
            <button
              className={styles.launchPtHistory}
              onClick={() => setPtHistoryOpen(o => !o)}
            >
              <span className={styles.launchPtHistoryChevron} data-open={ptHistoryOpen}>⌄</span>
              <span>PT History</span>
            </button>
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
            {/* Fresh PTs Left card + PT Breakdown bar */}
            <div className={styles.launchSummaryRow}>
              <div className={styles.launchFreshCard}>
                <span className={styles.launchFreshLabel}>Fresh PTs left</span>
                <div className={styles.launchFreshValueRow}>
                  <span className={styles.launchFreshValue}>
                    {PT_DATA.reduce((acc, s) => {
                      const ptHasAny = PT_DATA.some(p => p.pt === s.pt && p.status !== "not-started");
                      return acc;
                    }, 0) || (28 - PT_GROUPS.flatMap(g => g.pts).filter(pt => PT_DATA.some(s => s.pt === pt && s.status !== "not-started")).length)}
                  </span>
                  <span className={styles.launchFreshIcon} aria-hidden>🌱</span>
                </div>
              </div>
              <div className={styles.launchBreakdownCard}>
                <span className={styles.launchBreakdownLabel}>PT Breakdown</span>
                <div className={styles.launchBreakdownBar}>
                  {(() => {
                    const all = PT_GROUPS.flatMap(g => g.pts);
                    const total = all.length;
                    const completed = all.filter(pt => {
                      const rows = PT_DATA.filter(s => s.pt === pt);
                      return rows.length > 0 && rows.every(r => r.status === "completed");
                    }).length;
                    const inProgress = all.filter(pt => {
                      const rows = PT_DATA.filter(s => s.pt === pt);
                      return rows.some(r => r.status !== "not-started") && !rows.every(r => r.status === "completed");
                    }).length;
                    const fresh = total - completed - inProgress;
                    return (
                      <>
                        <div className={styles.launchBreakdownSeg} style={{ width: `${(completed / total) * 100}%`, background: "var(--turquoise-hc)" }} title={`${completed} completed`} />
                        <div className={styles.launchBreakdownSeg} style={{ width: `${(inProgress / total) * 100}%`, background: "var(--chartreuse)" }} title={`${inProgress} in progress`} />
                        <div className={styles.launchBreakdownSeg} style={{ width: `${(fresh / total) * 100}%`, background: "var(--turquoise-lc)" }} title={`${fresh} fresh`} />
                      </>
                    );
                  })()}
                  <span className={styles.launchBreakdownEndIcon} aria-hidden>🌱</span>
                </div>
              </div>
            </div>

            {/* Level toggle + dropdowns */}
            <div className={styles.launchContentBar}>
              <div className={styles.launchLevelToggle}>
                <button
                  className={`${styles.launchLevelBtn} ${launchViewLevel === "section" ? styles.launchLevelBtnActive : ""}`}
                  onClick={() => setLaunchViewLevel("section")}
                >
                  Section-Level
                </button>
                <button
                  className={`${styles.launchLevelBtn} ${launchViewLevel === "pt" ? styles.launchLevelBtnActive : ""}`}
                  onClick={() => setLaunchViewLevel("pt")}
                >
                  PT-Level
                </button>
              </div>
              <div className={styles.launchDropdownGroup}>
                <button
                  className={`${styles.launchDropdownBtn} ${launchFilterStatus !== "all" ? styles.launchDropdownBtnActive : ""}`}
                  onClick={() => {
                    const order = ["all", "not-started", "in-progress", "completed"] as const;
                    const idx = order.indexOf(launchFilterStatus);
                    setLaunchFilterStatus(order[(idx + 1) % order.length]);
                  }}
                >
                  {launchFilterStatus === "all" ? "Status" : launchFilterStatus === "not-started" ? "Status: Fresh" : launchFilterStatus === "in-progress" ? "Status: In Progress" : "Status: Completed"}
                  <span className={styles.launchDropdownCaret}>▾</span>
                </button>
                <button
                  className={`${styles.launchDropdownBtn} ${launchFilterType !== "all" ? styles.launchDropdownBtnActive : ""}`}
                  onClick={() => {
                    const order = ["all", "LR1", "LR2", "RC", "Exp"] as const;
                    const idx = order.indexOf(launchFilterType);
                    setLaunchFilterType(order[(idx + 1) % order.length]);
                  }}
                >
                  {launchFilterType === "all" ? "Section Type" : `Type: ${launchFilterType}`}
                  <span className={styles.launchDropdownCaret}>▾</span>
                </button>
              </div>
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
                      {launchViewLevel === "pt"
                        ? group.pts.map(pt => {
                            const rows = PT_DATA.filter(s => s.pt === pt);
                            const anyTouched = rows.some(r => r.status !== "not-started");
                            const allDone = rows.length > 0 && rows.every(r => r.status === "completed");
                            const status = allDone ? "completed" : anyTouched ? "in-progress" : "not-started";
                            const inUpNext = upNext.some(s => s.pt === pt);
                            const statusLabel = status === "completed" ? "Done" : status === "in-progress" ? "In Progress" : "Fresh to You";
                            return (
                              <div
                                key={`pt-${pt}`}
                                className={`${styles.launchPtTile} ${status === "completed" ? styles.launchPtTileCompleted : status === "in-progress" ? styles.launchPtTileInProgress : ""}`}
                              >
                                <div className={styles.launchPtTileSeed} aria-hidden>🌱</div>
                                <span className={styles.launchPtTileNum}>{pt}</span>
                                <span className={styles.launchPtTileStatus}>{statusLabel}</span>
                                <div className={styles.launchPtTileActions}>
                                  <button
                                    className={`${styles.launchPtTileAdd} ${inUpNext ? styles.launchPtTileAddActive : ""}`}
                                    onClick={() => toggleUpNext(pt, "LR1")}
                                    title={inUpNext ? "Remove from Up Next" : "Add to Up Next"}
                                  >
                                    {inUpNext ? "✓" : "+"}
                                  </button>
                                  <button
                                    className={styles.launchPtTileLaunch}
                                    onClick={() => setScreen("test")}
                                    title="Launch Now"
                                  >▶</button>
                                </div>
                              </div>
                            );
                          })
                        : group.pts.flatMap(pt =>
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

            {/* Footer */}
            <footer className={styles.launchFooter}>
              <div className={styles.launchFooterRow}>
                <div className={styles.launchFooterLeft}>
                  <span className={styles.launchFooterDot} aria-hidden>◉</span>
                  <a className={styles.launchFooterLink} href="#contact">Contact</a>
                  <a className={styles.launchFooterLink} href="#terms">Terms of Service</a>
                  <a className={styles.launchFooterLink} href="#privacy">Privacy Policy</a>
                </div>
                <span className={styles.launchFooterCopy}>Copyright © 2026 Elemental Prep. All rights reserved.</span>
              </div>
              <p className={styles.launchFooterDisclaimer}>
                LSAT® is a trademark registered by LSAC, which is not affiliated with, and does not endorse, this site.
              </p>
            </footer>
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
      { id: "S3", label: "S3 · RC" },
      { id: "RC", label: "Exp" },
    ];

    const heroSubtitle = !camoCompleted
      ? "You skipped Camo — view section results and launch Camo anytime."
      : wrongCount === 0
      ? "You aced this section — keep that momentum."
      : camoBuckets["self-doubt"] > 0 && camoBuckets.misread === 0
      ? "You second-guessed yourself in Camo — trust your instincts, my lamb."
      : "Review how you did and sharpen your edges with Camo.";

    return (
      <div className={styles.reviewContainer}>
        {/* Hero banner */}
        <header className={styles.reviewHero}>
          <div className={styles.reviewHeroTopRow}>
            <button className={styles.reviewBackBtn} onClick={() => setScreen("launch")}>
              ← Back to My Progress
            </button>
            <div className={styles.reviewMenuWrap}>
              <button
                className={styles.reviewMenuBtn}
                title="Options"
                onClick={() => setReviewMenuOpen((o) => !o)}
              >⋮</button>
              {reviewMenuOpen && (
                <div className={styles.reviewMenuDropdown}>
                  <label className={styles.reviewMenuToggle}>
                    <input
                      type="checkbox"
                      checked={excludeFromAnalytics}
                      onChange={(e) => setExcludeFromAnalytics(e.target.checked)}
                    />
                    <span>Exclude from Analytics</span>
                  </label>
                  <div className={styles.reviewMenuDivider} />
                  <button
                    className={styles.reviewMenuDelBtn}
                    onClick={() => { setDeleteModal("section"); setReviewMenuOpen(false); }}
                  >Delete this section</button>
                  <button
                    className={styles.reviewMenuDelBtn}
                    onClick={() => { setDeleteModal("pt"); setReviewMenuOpen(false); }}
                  >Delete this PT attempt</button>
                </div>
              )}
            </div>
          </div>
          <div className={styles.reviewHeroTitleBlock}>
            <span className={styles.reviewHeroEyebrow}>Section Review</span>
            <h1 className={styles.reviewHeroTitle}>PT 92 — LR Section 1</h1>
            <p className={styles.reviewHeroSubtitle}>{heroSubtitle}</p>
          </div>
          <div className={styles.reviewActions}>
            <button className={styles.reviewActionBtn} onClick={() => setScreen("test")}>
              <span className={styles.reviewActionIcon} aria-hidden>◉</span>
              <span>View Take</span>
            </button>
            <button className={styles.reviewActionBtn} onClick={() => setScreen("test")}>
              <span className={styles.reviewActionIcon} aria-hidden>↩</span>
              <span>Jump Back In</span>
            </button>
            <button className={styles.reviewActionBtn} onClick={() => setScreen("test")}>
              <span className={styles.reviewActionIcon} aria-hidden>↻</span>
              <span>Fresh Take</span>
            </button>
          </div>
        </header>

        {/* Section tabs */}
        <nav className={styles.reviewTabs}>
          {tabs.map((t) => {
            const lockedSectionsRemaining = tabs.filter((x) => x.locked).length;
            const tabTitle = t.locked
              ? t.id === "PT"
                ? `Complete ${lockedSectionsRemaining} remaining section${lockedSectionsRemaining > 1 ? "s" : ""} to unlock PT Review`
                : "Complete this section to unlock"
              : undefined;
            return (
              <button
                key={t.id}
                className={`${styles.reviewTab} ${reviewTab === t.id ? styles.reviewTabActive : ""} ${t.locked ? styles.reviewTabLocked : ""}`}
                onClick={() => !t.locked && setReviewTab(t.id)}
                disabled={t.locked}
                title={tabTitle}
              >
                {t.label}
                {t.locked && <span className={styles.reviewTabLock}>🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* Section Metadata row */}
        <div className={styles.reviewMeta}>
          <div className={styles.reviewMetaItem}>
            <span className={styles.reviewMetaLabel}>Questions</span>
            <span className={styles.reviewMetaValue}>{totalQuestions}</span>
          </div>
          <div className={styles.reviewMetaItem}>
            <span className={styles.reviewMetaLabel}>Timing</span>
            <span className={styles.reviewMetaValue}>Countdown · 35 min</span>
          </div>
          <div className={styles.reviewMetaItem}>
            <span className={styles.reviewMetaLabel}>Time Used</span>
            <span className={styles.reviewMetaValue}>{elapsedDisplay}</span>
          </div>
          <div className={styles.reviewMetaItem}>
            <span className={styles.reviewMetaLabel}>Timer</span>
            <span className={styles.reviewMetaValue}>{timerVisible ? "Visible" : "Hidden"}</span>
          </div>
          <div className={styles.reviewMetaItem}>
            <span className={styles.reviewMetaLabel}>Take</span>
            <span className={styles.reviewMetaValue}>1st</span>
          </div>
          {reviewTab === "RC" && (
            <span className={styles.reviewMetaBadge}>Experimental</span>
          )}
        </div>

        {/* Experimental info box */}
        {reviewTab === "RC" && (
          <div className={styles.reviewExperimentalInfo}>
            <span className={styles.reviewExperimentalIcon} aria-hidden>⚠️</span>
            <span>
              This section was experimental on the actual LSAT — your performance here is informational and
              does not affect your section or PT scored score.
            </span>
          </div>
        )}

        <main className={styles.reviewMain}>
          {reviewTab === "PT" && (
            <section className={styles.ptAggregate}>
              <div className={styles.ptAggregateCard}>
                <span className={styles.reviewScoreLabel}>PT Scaled</span>
                <span className={styles.reviewScoreValue}>163</span>
                <span className={styles.reviewScoreSub}>Aggregate · all scored sections</span>
              </div>
              <div className={styles.reviewScoreDivider} />
              <div className={styles.ptAggregateSections}>
                {([
                  { id: "S1", label: "S1 · LR", score: 169, wrong: 4 },
                  { id: "S2", label: "S2 · LR", score: 158, wrong: 7 },
                  { id: "S3", label: "S3 · RC", score: 161, wrong: 6 },
                  { id: "Exp", label: "Exp (unscored)", score: null, wrong: 5 },
                ] as const).map((s) => (
                  <div key={s.id} className={styles.ptAggregateItem}>
                    <span className={styles.ptAggregateItemLabel}>{s.label}</span>
                    <span className={styles.ptAggregateItemScore}>
                      {s.score ?? "—"}
                    </span>
                    <span className={styles.ptAggregateItemSub}>{s.wrong} wrong</span>
                  </div>
                ))}
              </div>
            </section>
          )}
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
              <div className={`${styles.camoCallout} ${styles.camoCalloutSkipped}`}>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>Camo skipped</span>
                  <span className={styles.camoCalloutHeading}>Category data unavailable</span>
                  <span className={styles.camoCalloutBody}>
                    You skipped Camo, so we can&apos;t tell which wrong answers were misreads vs true gaps. Your section score reflects your original take.
                  </span>
                </div>
                <button
                  className={styles.camoCalloutCta}
                  onClick={startCamo}
                >
                  Launch Camo Now
                </button>
              </div>
            ) : wrongCount === 0 ? (
              <div className={`${styles.camoCallout} ${styles.camoCalloutPerfect}`}>
                <div className={styles.camoCalloutIcon}>✓</div>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutHeading}>Perfect section — no Camo needed!</span>
                  <span className={styles.camoCalloutBody}>
                    You got all {totalQuestions} questions correct on your first try. Move to the next section and keep that streak going.
                  </span>
                </div>
              </div>
            ) : camoBuckets["self-doubt"] > 0 && camoBuckets.misread === 0 ? (
              <div className={`${styles.camoCallout} ${styles.camoCalloutDecreased}`}>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>Decreased</span>
                  <span className={styles.camoCalloutHeading}>{`−${camoBuckets["self-doubt"]} point${camoBuckets["self-doubt"] > 1 ? "s" : ""} in Camo`}</span>
                  <span className={styles.camoCalloutBody}>
                    You second-guessed yourself on {camoBuckets["self-doubt"]} question{camoBuckets["self-doubt"] > 1 ? "s" : ""} you had correct originally. Trust your instincts, my lamb.
                  </span>
                </div>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>What to do</span>
                  <span className={styles.camoCalloutHeading}>Commit earlier</span>
                  <span className={styles.camoCalloutBody}>
                    When you see your original answer in Camo, lean into it unless you spot a concrete reason to switch.
                  </span>
                </div>
              </div>
            ) : camoBuckets.misread > 0 ? (
              <div className={styles.camoCallout}>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>What you did well</span>
                  <span className={styles.camoCalloutHeading}>{`+${camoBuckets.misread} point${camoBuckets.misread > 1 ? "s" : ""} in Camo`}</span>
                  <span className={styles.camoCalloutBody}>
                    You caught {camoBuckets.misread} misread trap{camoBuckets.misread > 1 ? "s" : ""}. Slow down on comparative language — you re-read those stems correctly.
                  </span>
                </div>
                {camoBuckets.conceptual > 0 && (
                  <div className={styles.camoCalloutCol}>
                    <span className={styles.camoCalloutLabel}>Where to focus next</span>
                    <span className={styles.camoCalloutHeading}>{`${camoBuckets.conceptual} conceptual gap${camoBuckets.conceptual > 1 ? "s" : ""}`}</span>
                    <span className={styles.camoCalloutBody}>
                      Stuck after Camo? Review the underlying rule and return fresh.
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className={styles.camoCallout}>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>No movement</span>
                  <span className={styles.camoCalloutHeading}>Score stayed the same</span>
                  <span className={styles.camoCalloutBody}>
                    Either these were tough questions or you rushed through Camo. Slow down on your next review and re-read each stem carefully.
                  </span>
                </div>
                <div className={styles.camoCalloutCol}>
                  <span className={styles.camoCalloutLabel}>Try next time</span>
                  <span className={styles.camoCalloutHeading}>Translation Drill first</span>
                  <span className={styles.camoCalloutBody}>
                    Use Translation Drill on these question types to build conceptual fluency.
                  </span>
                </div>
              </div>
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
              <div className={styles.reviewSortWrap}>
                <button
                  className={styles.reviewSortDropdownBtn}
                  onClick={() => setSortMenuOpen((o) => !o)}
                >
                  Sort: {
                    reviewSort === "order" ? "Order" :
                    reviewSort === "reverse" ? "Reverse order" :
                    reviewSort === "wrong" ? "Incorrect first" :
                    reviewSort === "correct" ? "Correct first" :
                    reviewSort === "camo" ? "Camo order" :
                    reviewSort === "slowest" ? "Slowest first" :
                    reviewSort === "fastest" ? "Fastest first" :
                    reviewSort === "in-waj" ? "In WAJ first" :
                    "Need to WAJ"
                  }
                  <span className={styles.reviewSortCaret} aria-hidden>▾</span>
                </button>
                {sortMenuOpen && (
                  <div className={styles.reviewSortMenu}>
                    {([
                      ["order", "Order"],
                      ["reverse", "Reverse order"],
                      ["wrong", "Incorrect first"],
                      ["correct", "Correct first"],
                      ["camo", "Camo order"],
                      ["slowest", "Slowest first"],
                      ["fastest", "Fastest first"],
                      ["in-waj", "In WAJ first"],
                      ["need-waj", "Need to WAJ"],
                    ] as const).map(([val, label]) => (
                      <button
                        key={val}
                        className={`${styles.reviewSortOption} ${reviewSort === val ? styles.reviewSortOptionActive : ""}`}
                        onClick={() => { setReviewSort(val); setSortMenuOpen(false); }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Filter Bar — dropdown pattern */}
            {(() => {
              const answerOrder = ["all", "correct", "wrong", "skipped"] as const;
              const camoOrder = ["all", "conceptual", "misread", "self-doubt", "self-confidence"] as const;
              const timingOrder = [
                "all",
                "major-sink",
                "minor-sink",
                "near-pace",
                "time-saver",
                "skipped-guess",
                "above-pace",
                "below-pace",
              ] as const;
              const labelForTiming = (v: string) =>
                v === "major-sink" ? "Major Time Sink" :
                v === "minor-sink" ? "Minor Time Sink" :
                v === "near-pace" ? "Near Pace" :
                v === "time-saver" ? "Time Saver" :
                v === "skipped-guess" ? "Skipped (guess)" :
                v === "above-pace" ? "Above Pace" :
                v === "below-pace" ? "Below Pace" :
                "All";
              function cycle<T extends readonly string[]>(order: T, curr: T[number]): T[number] {
                const idx = order.indexOf(curr);
                return order[(idx + 1) % order.length] as T[number];
              }
              const activeChips: Array<{ key: string; label: string; onRemove: () => void }> = [];
              if (reviewFilters.answer !== "all") {
                activeChips.push({
                  key: "answer",
                  label: reviewFilters.answer.charAt(0).toUpperCase() + reviewFilters.answer.slice(1),
                  onRemove: () => setReviewFilters((f) => ({ ...f, answer: "all" })),
                });
              }
              if (reviewFilters.camo !== "all") {
                activeChips.push({
                  key: "camo",
                  label: labelForCamo(reviewFilters.camo),
                  onRemove: () => setReviewFilters((f) => ({ ...f, camo: "all" })),
                });
              }
              if (reviewFilters.flag === "flagged") {
                activeChips.push({
                  key: "flag",
                  label: "Flagged",
                  onRemove: () => setReviewFilters((f) => ({ ...f, flag: "all" })),
                });
              }
              if (reviewFilters.timing !== "all") {
                activeChips.push({
                  key: "timing",
                  label: labelForTiming(reviewFilters.timing),
                  onRemove: () => setReviewFilters((f) => ({ ...f, timing: "all" })),
                });
              }
              if (reviewTagFilter) {
                activeChips.push({
                  key: `tag-${reviewTagFilter}`,
                  label: reviewTagFilter,
                  onRemove: () => setReviewTagFilter(null),
                });
              }
              return (
                <div className={styles.filterBar}>
                  <div className={styles.filterPrimaryRow}>
                    <button
                      className={`${styles.filterDropdown} ${reviewFilters.answer !== "all" ? styles.filterDropdownActive : ""}`}
                      onClick={() => setReviewFilters((f) => ({ ...f, answer: cycle(answerOrder, f.answer) }))}
                    >
                      {reviewFilters.answer === "all"
                        ? "Answer"
                        : `Answer: ${reviewFilters.answer.charAt(0).toUpperCase() + reviewFilters.answer.slice(1)}`}
                      <span className={styles.filterDropdownCaret}>▾</span>
                    </button>
                    <button
                      className={`${styles.filterDropdown} ${reviewFilters.camo !== "all" ? styles.filterDropdownActive : ""}`}
                      onClick={() => setReviewFilters((f) => ({ ...f, camo: cycle(camoOrder, f.camo) }))}
                    >
                      {reviewFilters.camo === "all" ? "Camo Type" : `Camo: ${labelForCamo(reviewFilters.camo)}`}
                      <span className={styles.filterDropdownCaret}>▾</span>
                    </button>
                    <button
                      className={`${styles.filterDropdown} ${reviewFilters.flag === "flagged" ? styles.filterDropdownActive : ""}`}
                      onClick={() =>
                        setReviewFilters((f) => ({ ...f, flag: f.flag === "flagged" ? "all" : "flagged" }))
                      }
                    >
                      {reviewFilters.flag === "flagged" ? "⚑ Flagged" : "Flag"}
                      <span className={styles.filterDropdownCaret}>▾</span>
                    </button>
                    <button
                      className={`${styles.filterDropdown} ${reviewFilters.timing !== "all" ? styles.filterDropdownActive : ""}`}
                      onClick={() => setReviewFilters((f) => ({ ...f, timing: cycle(timingOrder, f.timing) }))}
                    >
                      {reviewFilters.timing === "all" ? "Timing" : `Timing: ${labelForTiming(reviewFilters.timing)}`}
                      <span className={styles.filterDropdownCaret}>▾</span>
                    </button>
                    <button
                      className={`${styles.filterDropdown} ${wajStatusFilter !== "all" ? styles.filterDropdownActive : ""}`}
                      onClick={() => {
                        const order = ["all", "need-waj", "in-waj"] as const;
                        const idx = order.indexOf(wajStatusFilter);
                        setWajStatusFilter(order[(idx + 1) % order.length]);
                      }}
                    >
                      {wajStatusFilter === "all" ? "WAJ"
                        : wajStatusFilter === "need-waj" ? "WAJ: Need to WAJ"
                        : "WAJ: In WAJ"}
                      <span className={styles.filterDropdownCaret}>▾</span>
                    </button>
                    {/* Q-Type multi-select dropdown */}
                    <div className={styles.filterMultiWrap}>
                      <button
                        className={`${styles.filterDropdown} ${qTypeFilter.length > 0 ? styles.filterDropdownActive : ""}`}
                        onClick={() => { setQTypeOpen((o) => !o); setLabelOpen(false); }}
                      >
                        {qTypeFilter.length === 0 ? "Q-Type" : `Q-Type: ${qTypeFilter.length}`}
                        <span className={styles.filterDropdownCaret}>▾</span>
                      </button>
                      {qTypeOpen && (
                        <div className={styles.filterMultiMenu}>
                          <span className={styles.filterMultiLabel}>Question type</span>
                          {["Assumption (Necessary)", "Assumption (Sufficient)", "Flaw", "Strengthen", "Weaken", "Principle (Apply)", "Principle (Identify)", "Parallel", "Method", "Inference", "Main Point"].map((qt) => (
                            <label key={qt} className={styles.filterMultiOption}>
                              <input
                                type="checkbox"
                                checked={qTypeFilter.includes(qt)}
                                onChange={(e) => setQTypeFilter((prev) =>
                                  e.target.checked ? [...prev, qt] : prev.filter((x) => x !== qt)
                                )}
                              />
                              <span>{qt}</span>
                            </label>
                          ))}
                          <button
                            className={styles.filterMultiClear}
                            onClick={() => setQTypeFilter([])}
                          >Clear</button>
                        </div>
                      )}
                    </div>
                    {/* Labels searchable multi-select */}
                    <div className={styles.filterMultiWrap}>
                      <button
                        className={`${styles.filterDropdown} ${labelFilter.length > 0 ? styles.filterDropdownActive : ""}`}
                        onClick={() => { setLabelOpen((o) => !o); setQTypeOpen(false); }}
                      >
                        {labelFilter.length === 0 ? "Labels" : `Labels: ${labelFilter.length}`}
                        <span className={styles.filterDropdownCaret}>▾</span>
                      </button>
                      {labelOpen && (
                        <div className={styles.filterMultiMenu}>
                          <span className={styles.filterMultiLabel}>Labels</span>
                          <input
                            type="search"
                            className={styles.filterMultiSearch}
                            placeholder="Search labels…"
                            value={labelSearch}
                            onChange={(e) => setLabelSearch(e.target.value)}
                          />
                          {["Necessary", "Sufficient", "Causal", "Conditional", "Comparative", "Quantifier", "Passage Science", "Passage Humanities", "Passage Law", "Stem reattempt", "New rule this take", "Vocab-heavy"]
                            .filter((l) => !labelSearch.trim() || l.toLowerCase().includes(labelSearch.toLowerCase()))
                            .map((label) => (
                              <label key={label} className={styles.filterMultiOption}>
                                <input
                                  type="checkbox"
                                  checked={labelFilter.includes(label)}
                                  onChange={(e) => setLabelFilter((prev) =>
                                    e.target.checked ? [...prev, label] : prev.filter((x) => x !== label)
                                  )}
                                />
                                <span>{label}</span>
                              </label>
                            ))}
                          <button
                            className={styles.filterMultiClear}
                            onClick={() => { setLabelFilter([]); setLabelSearch(""); }}
                          >Clear</button>
                        </div>
                      )}
                    </div>
                    {/* Section filter — only for PT Review tab */}
                    {reviewTab === "PT" && (
                      <button
                        className={`${styles.filterDropdown} ${sectionFilter !== "all" ? styles.filterDropdownActive : ""}`}
                        onClick={() => {
                          const order = ["all", "S1", "S2", "S3", "Exp"] as const;
                          const idx = order.indexOf(sectionFilter);
                          setSectionFilter(order[(idx + 1) % order.length]);
                        }}
                      >
                        {sectionFilter === "all" ? "Section" : `Section: ${sectionFilter}`}
                        <span className={styles.filterDropdownCaret}>▾</span>
                      </button>
                    )}
                    <div className={styles.filterSearch}>
                      <span className={styles.filterSearchIcon} aria-hidden>⌕</span>
                      <input
                        type="search"
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        placeholder="Search"
                        className={styles.filterSearchInput}
                      />
                    </div>
                    <span className={styles.filterCount}>
                      Showing {filteredRows.length} of {reviewRows.length}
                    </span>
                  </div>

                  {activeChips.length > 0 && (
                    <div className={styles.filterSecondaryRow}>
                      {activeChips.map((c) => (
                        <button key={c.key} className={styles.filterActiveChip} onClick={c.onRemove}>
                          {c.label}
                          <span className={styles.filterActiveChipX}>×</span>
                        </button>
                      ))}
                      <button
                        className={styles.filterClearAll}
                        onClick={() => {
                          setReviewFilters({ answer: "all", camo: "all", flag: "all", timing: "all" });
                          setReviewTagFilter(null);
                        }}
                      >
                        Clear all
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <table className={styles.reviewTable}>
              <thead>
                <tr>
                  <th
                    className={styles.thSortable}
                    onClick={() => setTableHeaderSort((s) => s === "num-asc" ? "num-desc" : "num-asc")}
                  >
                    # {tableHeaderSort === "num-asc" ? "↑" : tableHeaderSort === "num-desc" ? "↓" : ""}
                  </th>
                  <th>Question</th>
                  <th
                    className={styles.thSortable}
                    onClick={() => setTableHeaderSort((s) => s === "date-asc" ? "date-desc" : "date-asc")}
                  >
                    Date {tableHeaderSort === "date-asc" ? "↑" : tableHeaderSort === "date-desc" ? "↓" : ""}
                  </th>
                  <th>Section</th>
                  <th>Camo</th>
                  <th
                    className={`${styles.tdRight} ${styles.thSortable}`}
                    onClick={() => setTableHeaderSort((s) => s === "time-asc" ? "time-desc" : "time-asc")}
                  >
                    Time {tableHeaderSort === "time-asc" ? "↑" : tableHeaderSort === "time-desc" ? "↓" : ""}
                  </th>
                  <th className={styles.tdCenter}>WAJ</th>
                  <th className={styles.tdChevron} aria-hidden></th>
                </tr>
              </thead>
              <tbody>
                {reviewTab === "S3" && (() => {
                  // Mock RC passages grouping — 4 passages with 5-7 questions each
                  const passages = [
                    { id: 1, topic: "Archaeology", tags: ["Humanities"], questionCount: 6, readingTime: 285, combinedDelta: -8 },
                    { id: 2, topic: "Antitrust law", tags: ["Law"], questionCount: 7, readingTime: 320, combinedDelta: 18 },
                    { id: 3, topic: "Dark matter", tags: ["Science", "Physics"], questionCount: 6, readingTime: 310, combinedDelta: 32 },
                    { id: 4, topic: "Comparative passages · jazz theory", tags: ["Humanities", "Comparative"], questionCount: 8, readingTime: 348, combinedDelta: -12 },
                  ];
                  let q = 0;
                  return passages.flatMap((p) => {
                    const rows = filteredRows.slice(q, q + Math.min(p.questionCount, filteredRows.length - q));
                    q += p.questionCount;
                    if (rows.length === 0) return [];
                    const paceTarget = 240; // 4:00 baseline passage reading
                    const ratio = (paceTarget + p.combinedDelta) / paceTarget;
                    return [
                      <tr key={`passage-${p.id}`} className={styles.passageRow}>
                        <td colSpan={8}>
                          <div
                            className={styles.passageRowInner}
                            title={`Reading: ${Math.round(p.readingTime * 0.35)}s · Questions: ${Math.round(p.readingTime * 0.65)}s · Paragraph breakdown on hover`}
                          >
                            <span className={styles.passageLabel}>Passage {p.id}</span>
                            <span className={styles.passageTopic}>{p.topic}</span>
                            <div className={styles.passageTags}>
                              {p.tags.map((t) => (
                                <span key={t} className={styles.passageTag}>{t}</span>
                              ))}
                            </div>
                            <span className={styles.passageMeta}>{p.questionCount} questions</span>
                            <span className={styles.passageTime}>
                              {Math.floor(p.readingTime / 60)}:{(p.readingTime % 60).toString().padStart(2, "0")}
                              <span
                                className={styles.passageDelta}
                                style={{
                                  color: p.combinedDelta < 0 ? "var(--turquoise-hc)" : p.combinedDelta > 0 ? "var(--perform)" : "var(--text-muted)",
                                }}
                              >
                                {p.combinedDelta >= 0 ? `+${p.combinedDelta}` : p.combinedDelta}s
                              </span>
                            </span>
                          </div>
                        </td>
                      </tr>,
                      ...rows.map((r) => (
                        <tr key={r.id} className={styles.reviewTableRow} onClick={() => setDetailQId(r.id)}>
                          <td className={styles.tdQNum}>
                            {r.id}
                            {r.repeatWrong && (
                              <span
                                className={styles.repeatBadge}
                                title={`You also missed this question ${r.repeatDaysAgo} days ago.`}
                              >⚠</span>
                            )}
                          </td>
                          <td className={styles.tdCitation}>
                            <div className={styles.tdCitationLine}>
                              <span>{r.citation}</span>
                              <span className={styles.tdCitationIcons} onClick={(e) => e.stopPropagation()}>
                                <button className={styles.tdCitationIconBtn} title="Open question detail" onClick={() => setDetailQId(r.id)}>ⓘ</button>
                                <button className={styles.tdCitationIconBtn} title="Open in full PT context" onClick={() => setDetailQId(r.id)}>↗</button>
                              </span>
                            </div>
                            <div className={styles.tdTagPills}>
                              {r.tags.map((tag) => (
                                <button
                                  key={tag}
                                  className={`${styles.tdTagPill} ${reviewTagFilter === tag ? styles.tdTagPillActive : ""}`}
                                  onClick={(e) => { e.stopPropagation(); setReviewTagFilter((prev) => (prev === tag ? null : tag)); }}
                                >{tag}</button>
                              ))}
                            </div>
                          </td>
                          <td className={styles.tdDate}>{r.date}</td>
                          <td>
                            <AnswerCircle letter={r.userAnswer} color={r.userAnswer === "—" ? "var(--pewter)" : r.isCorrect ? "var(--turquoise)" : "var(--perform)"} />
                          </td>
                          <td>
                            {!r.isInCamo || !r.camoAnswer ? (
                              <span className={styles.tdMuted}>—</span>
                            ) : (
                              <AnswerCircle letter={r.camoAnswer} color={r.camoAnswer === r.correctAnswer ? "var(--turquoise)" : camoColors[r.camo]} />
                            )}
                          </td>
                          <td className={styles.tdRight}>
                            <div className={styles.tdTimeBlock}>
                              <div>
                                <span className={styles.timeMain}>{r.time}s</span>
                                <span className={styles.timeDelta} style={{ color: r.delta < 0 ? "var(--turquoise-hc)" : r.delta > 0 ? "var(--perform)" : "var(--text-muted)" }}>
                                  {r.delta >= 0 ? `+${r.delta}` : r.delta}s
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className={styles.tdCenter}>
                            <span className={styles.tdMuted}>—</span>
                          </td>
                          <td className={styles.tdChevron} aria-hidden>
                            <span className={styles.tdChevronBtn}>›</span>
                          </td>
                        </tr>
                      )),
                    ];
                  });
                })()}
                {reviewTab !== "S3" && filteredRows.map((r) => (
                  <tr key={r.id} className={styles.reviewTableRow} onClick={() => setDetailQId(r.id)}>
                    <td className={styles.tdQNum}>
                      {r.id}
                      {r.repeatWrong && (
                        <span
                          className={styles.repeatBadge}
                          title={`You also missed this question ${r.repeatDaysAgo} days ago. Pay special attention to this one.`}
                        >
                          ⚠
                        </span>
                      )}
                    </td>
                    <td className={styles.tdCitation}>
                      <div className={styles.tdCitationLine}>
                        <span>{r.citation}</span>
                        <span className={styles.tdCitationIcons} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={styles.tdCitationIconBtn}
                            title="Open question detail"
                            onClick={() => setDetailQId(r.id)}
                          >ⓘ</button>
                          <button
                            className={styles.tdCitationIconBtn}
                            title="Open in full PT context"
                            onClick={() => setDetailQId(r.id)}
                          >↗</button>
                        </span>
                      </div>
                      <div className={styles.tdTagPills}>
                        {r.tags.map((tag) => (
                          <button
                            key={tag}
                            className={`${styles.tdTagPill} ${reviewTagFilter === tag ? styles.tdTagPillActive : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setReviewTagFilter((prev) => (prev === tag ? null : tag));
                            }}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className={styles.tdDate}>{r.date}</td>
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
                      <div className={styles.tdTimeBlock} title={`Started at ${r.startedAt}${r.returnedAt ? ` · Returned at ${r.returnedAt}` : ""}`}>
                        <div>
                          <span className={styles.timeMain}>{r.time}s</span>
                          <span className={styles.timeDelta} style={{ color: r.delta < 0 ? "var(--turquoise-hc)" : r.delta > 0 ? "var(--perform)" : "var(--text-muted)" }}>
                            {r.delta >= 0 ? `+${r.delta}` : r.delta}s
                          </span>
                        </div>
                        <button
                          className={styles.tdZoneBar}
                          onClick={(e) => {
                            e.stopPropagation();
                            setZoneExplorerQId(r.id);
                            setZoneExplorerMode("original");
                            setZoneExplorerTime(0);
                          }}
                          title="Click to open Zone Explorer"
                        >
                          {r.zones.map((z, idx) => {
                            const zoneColor =
                              z.zone === "Stimulus" ? "var(--seafoam)" :
                              z.zone === "Stem" ? "var(--turquoise-lc)" :
                              z.zone === r.correctAnswer ? "var(--turquoise)" :
                              z.zone === r.userAnswer && !r.isCorrect ? "var(--perform)" :
                              "var(--pewter)";
                            return (
                              <span
                                key={idx}
                                className={styles.tdZoneSeg}
                                style={{ flex: z.duration, background: zoneColor }}
                                title={`${z.zone}: ${z.duration}s`}
                              />
                            );
                          })}
                        </button>
                      </div>
                    </td>
                    <td className={styles.tdCenter} onClick={(e) => e.stopPropagation()}>
                      {!r.isCorrect && r.userAnswer !== "—" ? (
                        <button
                          className={`${styles.wajBtn} ${isInWaj(r.id) ? styles.wajBtnActive : ""}`}
                          onClick={() => {
                            const existing = wajEntries[r.id];
                            setWajDraft({
                              whyMissed: existing?.whyMissed ?? "",
                              whatDifferently: existing?.whatDifferently ?? "",
                              editing: !(existing?.processed),
                            });
                            setWajOpenQId(r.id);
                          }}
                          title={isInWaj(r.id) ? "View / edit WAJ entry" : "Add to Wrong Answer Journal"}
                        >
                          {isInWaj(r.id) ? "✓" : "+"}
                        </button>
                      ) : (
                        <span className={styles.tdMuted}>—</span>
                      )}
                    </td>
                    <td className={styles.tdChevron} aria-hidden>
                      <span className={styles.tdChevronBtn}>›</span>
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className={styles.reviewEmpty}>
                        <span className={styles.reviewEmptyIcon} aria-hidden>◎</span>
                        <span className={styles.reviewEmptyTitle}>No questions match these filters</span>
                        <span className={styles.reviewEmptyHint}>Clear filters or widen your search to see more.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </main>

        {/* Question Detail Drawer */}
        {detailQId !== null && detailRow && detailQ && (
          <>
            <div
              className={styles.drawerOverlay}
              onClick={() => { setDetailQId(null); setDetailTab("question"); setClirVisible(false); }}
            />
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
                <button className={styles.drawerClose} onClick={() => { setDetailQId(null); setDetailTab("question"); setClirVisible(false); }}>✕</button>
              </header>

              {/* Tabs */}
              <div className={styles.drawerTabs}>
                <button
                  className={`${styles.drawerTab} ${detailTab === "question" ? styles.drawerTabActive : ""}`}
                  onClick={() => setDetailTab("question")}
                >Question</button>
                <button
                  className={`${styles.drawerTab} ${detailTab === "history" ? styles.drawerTabActive : ""}`}
                  onClick={() => setDetailTab("history")}
                >Your History</button>
              </div>

              {detailTab === "question" ? (
              <div className={styles.drawerBody}>
                {/* Show CLIR toggle */}
                <div className={styles.drawerClirRow}>
                  <button
                    className={`${styles.drawerClirBtn} ${clirVisible ? styles.drawerClirBtnActive : ""}`}
                    onClick={() => setClirVisible((v) => !v)}
                  >
                    {clirVisible ? "Hide CLIR" : "Show CLIR"}
                  </button>
                  <button className={styles.drawerClirBtnDisabled} disabled title="Translation key coming soon">
                    Show Translation
                  </button>
                </div>

                {/* Stimulus */}
                <div className={styles.drawerStimulus}>
                  <p className={styles.drawerStimulusText}>{detailQ.stimulus}</p>
                  {clirVisible && (
                    <div className={styles.drawerClirBox}>
                      <span className={styles.drawerClirLabel}>CLIR</span>
                      <p className={styles.drawerClirText}>
                        Manufacturers made smartphones LIGHTER over a ten-year period, the researchers claim.
                        The critic counters: the WEIGHTS we measured are at DISCARD time, not purchase. If phones
                        today are used for SHORTER periods, they lose less component weight before discard —
                        explaining the observed decrease without any manufacturer change.
                      </p>
                    </div>
                  )}
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

                {/* Watch Explanation */}
                <button
                  className={styles.drawerClirBtn}
                  onClick={() => setVideoExplanationQId(detailRow.id)}
                >
                  ▶ Watch Explanation
                </button>

                {/* WAJ quick-add → opens Quick-Fill drawer */}
                {!detailRow.isCorrect && detailRow.userAnswer !== "—" && (
                  <button
                    className={`${styles.drawerWajBtn} ${isInWaj(detailRow.id) ? styles.drawerWajBtnActive : ""}`}
                    onClick={() => {
                      const existing = wajEntries[detailRow.id];
                      setWajDraft({
                        whyMissed: existing?.whyMissed ?? "",
                        whatDifferently: existing?.whatDifferently ?? "",
                        editing: !(existing?.processed),
                      });
                      setWajOpenQId(detailRow.id);
                    }}
                  >
                    {isInWaj(detailRow.id) ? "✓ View Wrong Answer Journal entry" : "+ Add to Wrong Answer Journal"}
                  </button>
                )}
              </div>
              ) : (
                // History tab — mock chronological encounters
                <div className={styles.drawerBody}>
                  {(() => {
                    const encounters: Array<{ date: string; source: string; result: "correct" | "wrong"; camo?: string; time: number }> = [];
                    if (detailRow.id % 4 === 0) {
                      encounters.push({
                        date: "02/18/26",
                        source: "Workout: Answer Choice Warmup",
                        result: "wrong",
                        camo: "misread",
                        time: 98,
                      });
                    }
                    if (detailRow.id % 3 === 0) {
                      encounters.push({
                        date: "03/05/26",
                        source: "PT 78 · S2 · LR",
                        result: "wrong",
                        camo: "conceptual",
                        time: 127,
                      });
                    }
                    encounters.push({
                      date: sectionDate,
                      source: "PT 92 · S2 · LR",
                      result: detailRow.isCorrect ? "correct" : "wrong",
                      camo: detailRow.camo !== "correct" ? labelForCamo(detailRow.camo) : undefined,
                      time: detailRow.time,
                    });

                    if (encounters.length === 1) {
                      return (
                        <div className={styles.drawerHistoryEmpty}>
                          <span className={styles.drawerHistoryEmptyLabel}>First attempt</span>
                          <p className={styles.drawerHistoryEmptyText}>
                            This is your first encounter with this question. Your ongoing performance on Q{detailRow.id}
                            will appear here after future attempts in PTs or workouts.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className={styles.drawerHistoryList}>
                        {encounters.map((e, idx) => (
                          <div key={idx} className={styles.drawerHistoryItem}>
                            <div className={styles.drawerHistoryMeta}>
                              <span className={styles.drawerHistoryDate}>{e.date}</span>
                              <span className={styles.drawerHistorySource}>{e.source}</span>
                            </div>
                            <div className={styles.drawerHistoryResultRow}>
                              <span
                                className={`${styles.drawerHistoryResult} ${e.result === "correct" ? styles.drawerHistoryResultCorrect : styles.drawerHistoryResultWrong}`}
                              >
                                {e.result === "correct" ? "Correct" : "Wrong"}
                              </span>
                              {e.camo && <span className={styles.drawerHistoryCamo}>{e.camo}</span>}
                              <span className={styles.drawerHistoryTime}>{e.time}s</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            </aside>
          </>
        )}

        {/* WAJ Quick-Fill Drawer */}
        {wajOpenQId !== null && (() => {
          const row = reviewRows.find((r) => r.id === wajOpenQId);
          const q = QUESTIONS.find((qq) => qq.id === wajOpenQId);
          if (!row || !q) return null;
          const MAX = 300;
          const whyLen = wajDraft.whyMissed.length;
          const whatLen = wajDraft.whatDifferently.length;
          const canSubmit = whyLen > 0 && whatLen > 0;
          const existing = wajEntries[wajOpenQId];
          const readOnly = existing?.processed === true && !wajDraft.editing;
          return (
            <>
              <div
                className={styles.drawerOverlay}
                style={{ zIndex: 210 }}
                onClick={() => { setWajOpenQId(null); setWajDraft({ whyMissed: "", whatDifferently: "", editing: false }); }}
              />
              <aside className={styles.wajDrawer}>
                <header className={styles.drawerHeader}>
                  <div className={styles.drawerHeaderLeft}>
                    <span className={styles.drawerQNum}>Wrong Answer Journal</span>
                    <span className={styles.drawerCitation}>Q{row.id} · {row.citation}</span>
                  </div>
                  <button
                    className={styles.drawerClose}
                    onClick={() => { setWajOpenQId(null); setWajDraft({ whyMissed: "", whatDifferently: "", editing: false }); }}
                  >✕</button>
                </header>

                <div className={styles.drawerBody}>
                  <div className={styles.wajField}>
                    <label className={styles.wajLabel}>Why did you miss this question?</label>
                    <textarea
                      className={styles.wajTextarea}
                      value={wajDraft.whyMissed}
                      onChange={(e) => setWajDraft((d) => ({ ...d, whyMissed: e.target.value.slice(0, MAX) }))}
                      maxLength={MAX}
                      readOnly={readOnly}
                      placeholder="What led you to the wrong answer? Specific error, assumption, phrase you misread…"
                      rows={5}
                    />
                    <span
                      className={styles.wajCounter}
                      style={{ color: whyLen >= 290 ? "var(--perform)" : "var(--text-muted)" }}
                    >
                      {whyLen} / {MAX}
                    </span>
                  </div>

                  <div className={styles.wajField}>
                    <label className={styles.wajLabel}>What will you do differently next time?</label>
                    <textarea
                      className={styles.wajTextarea}
                      value={wajDraft.whatDifferently}
                      onChange={(e) => setWajDraft((d) => ({ ...d, whatDifferently: e.target.value.slice(0, MAX) }))}
                      maxLength={MAX}
                      readOnly={readOnly}
                      placeholder="Concrete tactic or rule you'll apply on the next question of this type…"
                      rows={5}
                    />
                    <span
                      className={styles.wajCounter}
                      style={{ color: whatLen >= 290 ? "var(--perform)" : "var(--text-muted)" }}
                    >
                      {whatLen} / {MAX}
                    </span>
                  </div>

                  <div className={styles.wajActions}>
                    {readOnly ? (
                      <button
                        className={styles.wajEditBtn}
                        onClick={() => setWajDraft((d) => ({ ...d, editing: true }))}
                      >
                        Edit entry
                      </button>
                    ) : (
                      <>
                        <button
                          className={styles.wajCancelBtn}
                          onClick={() => {
                            setWajOpenQId(null);
                            setWajDraft({ whyMissed: "", whatDifferently: "", editing: false });
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className={styles.wajSubmitBtn}
                          disabled={!canSubmit}
                          onClick={() => {
                            setWajEntries((prev) => ({
                              ...prev,
                              [wajOpenQId as number]: {
                                whyMissed: wajDraft.whyMissed,
                                whatDifferently: wajDraft.whatDifferently,
                                processed: true,
                              },
                            }));
                            setWajOpenQId(null);
                            setWajDraft({ whyMissed: "", whatDifferently: "", editing: false });
                          }}
                        >
                          {existing?.processed ? "Save changes" : "Submit to WAJ"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </aside>
            </>
          );
        })()}

        {/* Zone Explorer Popup */}
        {zoneExplorerQId !== null && (() => {
          const row = reviewRows.find((r) => r.id === zoneExplorerQId);
          if (!row) return null;
          const totalTime = row.zones.reduce((s, z) => s + z.duration, 0);
          const cursorZoneIdx = (() => {
            let acc = 0;
            for (let i = 0; i < row.zones.length; i++) {
              acc += row.zones[i].duration;
              if (zoneExplorerTime <= acc) return i;
            }
            return row.zones.length - 1;
          })();
          const cursorZone = row.zones[cursorZoneIdx];
          const actionLog = row.zones.flatMap((z, i) => {
            let cumulative = 0;
            for (let j = 0; j < i; j++) cumulative += row.zones[j].duration;
            return [
              { t: cumulative, action: `Entered ${z.zone}` },
              ...(z.zone === row.correctAnswer ? [{ t: cumulative + Math.floor(z.duration / 2), action: `Considered ${z.zone} (correct)` }] : []),
              ...(z.zone === row.userAnswer && !row.isCorrect ? [{ t: cumulative + z.duration - 2, action: `Selected ${z.zone}` }] : []),
            ];
          });
          return (
            <>
              <div
                className={styles.drawerOverlay}
                style={{ zIndex: 230 }}
                onClick={() => setZoneExplorerQId(null)}
              />
              <div className={styles.zoneExplorer}>
                <header className={styles.zoneExplorerHeader}>
                  <div>
                    <span className={styles.drawerQNum}>Q{row.id} · Zone Explorer</span>
                    <span className={styles.drawerCitation}>{row.citation}</span>
                  </div>
                  <div className={styles.zoneExplorerToggle}>
                    <button
                      className={`${styles.zoneModeBtn} ${zoneExplorerMode === "original" ? styles.zoneModeBtnActive : ""}`}
                      onClick={() => setZoneExplorerMode("original")}
                    >Original</button>
                    <button
                      className={`${styles.zoneModeBtn} ${zoneExplorerMode === "camo" ? styles.zoneModeBtnActive : ""}`}
                      onClick={() => setZoneExplorerMode("camo")}
                      disabled={!row.isInCamo}
                      title={!row.isInCamo ? "No Camo attempt for this question" : undefined}
                    >Camo</button>
                  </div>
                  <button
                    className={styles.drawerClose}
                    onClick={() => setZoneExplorerQId(null)}
                  >✕</button>
                </header>

                <div className={styles.zoneExplorerBody}>
                  {/* Scrubbable timeline */}
                  <div className={styles.zoneTimelineWrap}>
                    <div className={styles.zoneTimelineHeader}>
                      <span>Scrubbable Timeline</span>
                      <span className={styles.zoneTimelineClock}>
                        {zoneExplorerTime}s / {totalTime}s
                      </span>
                    </div>
                    <div className={styles.zoneTimelineBar}>
                      {row.zones.map((z, idx) => {
                        const zoneColor =
                          z.zone === "Stimulus" ? "var(--seafoam)" :
                          z.zone === "Stem" ? "var(--turquoise-lc)" :
                          z.zone === row.correctAnswer ? "var(--turquoise)" :
                          z.zone === row.userAnswer && !row.isCorrect ? "var(--perform)" :
                          "var(--pewter)";
                        return (
                          <button
                            key={idx}
                            className={`${styles.zoneTimelineSeg} ${idx === cursorZoneIdx ? styles.zoneTimelineSegActive : ""}`}
                            style={{ flex: z.duration, background: zoneColor }}
                            onClick={() => {
                              let before = 0;
                              for (let j = 0; j < idx; j++) before += row.zones[j].duration;
                              setZoneExplorerTime(before);
                            }}
                            title={`${z.zone} · ${z.duration}s`}
                          >
                            <span className={styles.zoneTimelineSegLabel}>{z.zone}</span>
                          </button>
                        );
                      })}
                      <input
                        type="range"
                        className={styles.zoneTimelineScrubber}
                        min={0}
                        max={totalTime}
                        value={zoneExplorerTime}
                        onChange={(e) => setZoneExplorerTime(Number(e.target.value))}
                      />
                    </div>
                    <div className={styles.zoneTimelineControls}>
                      <button
                        className={styles.zoneCtrlBtn}
                        onClick={() => setZoneExplorerTime((t) => Math.max(0, t - 5))}
                      >⏮</button>
                      <button
                        className={`${styles.zoneCtrlBtn} ${styles.zoneCtrlBtnPrimary}`}
                        onClick={() => setZoneExplorerTime((t) => Math.min(totalTime, t + 5))}
                      >▶</button>
                      <button
                        className={styles.zoneCtrlBtn}
                        onClick={() => setZoneExplorerTime((t) => Math.min(totalTime, t + 10))}
                      >⏭</button>
                    </div>
                  </div>

                  {/* Current zone snapshot */}
                  <div className={styles.zoneSnapshot}>
                    <div className={styles.zoneSnapshotLabel}>
                      At {zoneExplorerTime}s — cursor in <strong>{cursorZone.zone}</strong>
                    </div>
                    <div className={styles.zoneSnapshotStage}>
                      <div className={styles.zoneSnapshotStim}>
                        <span className={styles.zoneSnapshotStageLabel}>Stimulus</span>
                        <div className={styles.zoneSnapshotText}>
                          {cursorZone.zone === "Stimulus" ? "▓▓▓▓▓▓▓ reading focus ▓▓▓▓▓▓▓" : "…"}
                        </div>
                      </div>
                      <div className={styles.zoneSnapshotAns}>
                        <span className={styles.zoneSnapshotStageLabel}>Answers</span>
                        {["A", "B", "C", "D", "E"].map((L) => (
                          <div
                            key={L}
                            className={`${styles.zoneSnapshotAnsRow} ${L === cursorZone.zone ? styles.zoneSnapshotAnsActive : ""}`}
                          >
                            {L}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action log */}
                  <div className={styles.zoneActionLog}>
                    <div className={styles.zoneActionLogHeader}>Action Log</div>
                    {actionLog.map((a, idx) => (
                      <div
                        key={idx}
                        className={`${styles.zoneActionEntry} ${a.t === zoneExplorerTime ? styles.zoneActionEntryActive : ""}`}
                      >
                        <span className={styles.zoneActionTime}>{a.t}s</span>
                        <span className={styles.zoneActionText}>{a.action}</span>
                      </div>
                    ))}
                  </div>

                  {row.isInCamo && zoneExplorerMode === "camo" && (
                    <div className={styles.zoneCamoNote}>
                      <strong>Camo Replication:</strong> showing your Camo attempt path. Note
                      where you hovered differently this time.
                    </div>
                  )}
                </div>
              </div>
            </>
          );
        })()}

        {/* Video Explanation Drawer */}
        {videoExplanationQId !== null && (
          <>
            <div
              className={styles.drawerOverlay}
              style={{ zIndex: 230 }}
              onClick={() => setVideoExplanationQId(null)}
            />
            <aside className={styles.wajDrawer}>
              <header className={styles.drawerHeader}>
                <div className={styles.drawerHeaderLeft}>
                  <span className={styles.drawerQNum}>Watch Explanation</span>
                  <span className={styles.drawerCitation}>Q{videoExplanationQId}</span>
                </div>
                <button
                  className={styles.drawerClose}
                  onClick={() => setVideoExplanationQId(null)}
                >✕</button>
              </header>
              <div className={styles.drawerBody}>
                <div className={styles.videoPlayerMock}>
                  <span className={styles.videoPlayBtn} aria-hidden>▶</span>
                  <span className={styles.videoPlayHint}>Video explanation · 4:32</span>
                </div>
                <p className={styles.videoTranscript}>
                  Chandler breaks down this question step-by-step: the argument structure, why the
                  trap answer looks tempting, and what phrase to lock in on next time.
                </p>
              </div>
            </aside>
          </>
        )}

        {/* Delete confirmation modal */}
        {deleteModal && (
          <div className={styles.deleteOverlay} onClick={() => setDeleteModal(null)}>
            <div className={styles.deleteModal} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.deleteTitle}>
                {deleteModal === "section" ? "Delete this section?" : "Delete this PT attempt?"}
              </h3>
              <p className={styles.deleteBody}>
                {deleteModal === "section"
                  ? "This permanently removes the section from Analytics, deletes all associated Wrong Answers Journal entries, and recalculates your personal bests and scaled scores. This action cannot be undone."
                  : "This removes ALL sections from this PT attempt in a single batch, deletes associated WAJ entries, and recalculates your personal bests. This action cannot be undone."}
              </p>
              <div className={styles.deleteActions}>
                <button className={styles.wajCancelBtn} onClick={() => setDeleteModal(null)}>Cancel</button>
                <button
                  className={styles.deleteConfirmBtn}
                  onClick={() => { setDeleteModal(null); setReviewMenuOpen(false); }}
                >Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
     <button className={styles.backToLaunchBtn} onClick={() => setScreen("launch")}>
       ← Back to Launch Page
     </button>
     <div className={styles.contentWrap}>
      {/* Header — PT_Test_v2.1: simplified, only section label + compound Timer pill */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.sectionLabel}>PT 92 - LR Section 1</span>
          <span className={styles.questionLabel}>{answeredCount} / {totalQuestions} Complete</span>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.timerV2}>
            <button
              className={styles.timerV2PauseBtn}
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? "Resume section" : "Pause section"}
            >
              {isPaused ? "▶" : "⏸"}
            </button>
            {timerVisible ? (
              <>
                <div className={styles.timerV2Bar}>
                  <div
                    className={styles.timerV2BarFill}
                    style={{ width: `${timerProgress * 100}%` }}
                  />
                </div>
                <span className={styles.timerV2Value}>{formatTime(timerSeconds)}</span>
              </>
            ) : (
              <span className={styles.timerV2HiddenLabel}>Timer hidden</span>
            )}
            <button
              className={styles.timerV2EyeBtn}
              onClick={() => setTimerVisible(!timerVisible)}
              title={timerVisible ? "Hide timer" : "Show timer"}
            >
              {timerVisible ? "👁" : "⊘"}
            </button>
          </div>
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
          <button className={`${styles.highlightBtn} ${styles.highlightPink}`} title="Pink highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("pink")} />
          <button className={`${styles.highlightBtn} ${styles.highlightOrange}`} title="Orange highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("orange")} />
          <button className={`${styles.highlightBtn} ${styles.highlightYellow}`} title="Yellow highlight" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("yellow")} />
          <button className={styles.toolBtn} title="Underline" onMouseDown={(e) => e.preventDefault()} onClick={() => applyHighlight("underline")}>U̲</button>
          <button className={styles.toolBtn} title="Eraser" onMouseDown={(e) => e.preventDefault()} onClick={eraseHighlight}>⌫</button>
          <span className={styles.toolbarDivider} />
          <div className={styles.toolBtnWrap}>
            <button
              className={`${styles.toolBtn} ${textSizeOpen ? styles.toolBtnActive : ""}`}
              title="Text size"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setTextSizeOpen((o) => !o); setLineHeightOpen(false); }}
            >Aa</button>
            {textSizeOpen && (
              <div className={styles.toolDropdown}>
                <span className={styles.toolDropdownHeader}>Text size</span>
                {(["small", "default", "large", "xlarge"] as const).map((v) => (
                  <button
                    key={v}
                    className={`${styles.toolDropdownRow} ${textSize === v ? styles.toolDropdownRowActive : ""}`}
                    onClick={() => { setPersistedTextSize(v); setTextSizeOpen(false); }}
                  >
                    <span className={styles.toolRadio} aria-hidden>
                      {textSize === v && <span className={styles.toolRadioDot} />}
                    </span>
                    <span className={styles.toolDropdownLabel} style={{ fontSize: textSizePx[v] * 0.85 }}>
                      {v === "xlarge" ? "Extra Large" : v.charAt(0).toUpperCase() + v.slice(1)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Line height dropdown removed in v2.1 */}
        </div>
      </div>

      {/* Main Split Panel */}
      <main
        className={styles.main}
        style={{
          ["--reading-size" as string]: `${textSizePx[textSize]}px`,
          ["--reading-lh" as string]: lineHeightNum[lineHeight],
        } as CSSProperties}
      >
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
          <div className={styles.questionStemRow}>
            <div className={styles.questionStem}>
              <p>
                <span className={styles.questionStemNum}>{question.id}.</span>{" "}
                {renderStyledText(question.stem, false)}
              </p>
            </div>
            <button
              className={`${styles.flagBtn} ${flaggedQuestions.has(question.id) ? styles.flagActive : ""}`}
              onClick={toggleFlag}
              title="Flag for review"
            >
              ⚑
            </button>
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

      {/* Question Navigation Bar — PT_Test_v2.1: numbers left, Prev/Next + Complete right */}
      <footer className={styles.footer}>
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

        <div className={styles.navButtons}>
          <button
            className={styles.arrowBtn}
            disabled={currentQuestion === 0}
            onClick={() => goToQuestion(currentQuestion - 1)}
          >
            Prev
          </button>
          <button
            className={styles.arrowBtn}
            disabled={currentQuestion === totalQuestions - 1}
            onClick={() => goToQuestion(currentQuestion + 1)}
          >
            Next
          </button>
          <button className={styles.completeBtn} onClick={() => setScreen("transition")}>
            Complete Section
          </button>
        </div>
      </footer>
     </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className={styles.pauseOverlay} onClick={() => setIsPaused(false)}>
          <div className={styles.pauseModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pauseIconCircle} aria-hidden>▶</div>
            <h2 className={styles.pauseTitle}>Paused</h2>
            <p className={styles.pauseSubtitle}>
              Timer is paused. Click Resume when you&apos;re ready.
              <br />
              <span className={styles.pauseNote}>
                Note: you can&apos;t pause the real LSAT — this is for practice only.
              </span>
            </p>
            <button className={styles.pauseResumeBtn} onClick={() => setIsPaused(false)}>
              Resume Section
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
