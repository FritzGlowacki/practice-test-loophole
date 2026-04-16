"use client";

import { useState, useCallback, useEffect, useRef, type ReactNode, type CSSProperties } from "react";
import styles from "./page.module.css";

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

  const stimulusRef = useRef<HTMLParagraphElement>(null);

  const question = QUESTIONS[currentQuestion];
  const totalQuestions = QUESTIONS.length;

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused]);

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
          <button className={styles.completeBtn}>Complete Section</button>
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
