import type { Level, Slide } from "@/lib/types";

/**
 * QUESTION BANK
 * -------------
 * Add your real questions here before you go live. Each class is its own list.
 *
 * - Wrap maths in $...$ and it renders as proper notation: $\frac{3}{4}$, $x^2$, $\sqrt{49}$
 * - `options` is optional. Leave it out for questions the student answers out loud.
 *   If you add options, `answer` must match one of them exactly.
 * - `image` is optional: put the file in /public/questions and use "/questions/name.png"
 * - `seconds` and `points` are optional (defaults: 60 seconds, 10 points)
 *
 * The questions below are PLACEHOLDERS so you can see how everything works.
 * Order does not matter. The order is reshuffled on every page load.
 */
export const QUESTIONS: Record<Level, Slide[]> = {
  JSS1: [
    {
      id: "jss1-1",
      question: String.raw`Simplify: $3 + 4 \times 2$`,
      answer: "11",
      options: ["11", "14", "10", "9"],
    },
    {
      id: "jss1-2",
      question: "What is the LCM of 4 and 6?",
      answer: "12",
      options: ["12", "24", "10", "8"],
    },
    {
      id: "jss1-3",
      question: String.raw`Find $\frac{3}{4}$ of 20.`,
      answer: "15",
    },
    {
      id: "jss1-4",
      question: String.raw`What is the value of $2^5$?`,
      answer: "32",
    },
    {
      id: "jss1-5",
      question: "A rectangle is 8 cm long and 5 cm wide. What is its perimeter?",
      answer: "26 cm",
    },
  ],
  JSS2: [
    {
      id: "jss2-1",
      question: String.raw`Solve for $x$: $2x + 5 = 17$`,
      answer: "6",
      options: ["6", "11", "5", "8"],
    },
    {
      id: "jss2-2",
      question: "Express 0.35 as a fraction in its lowest terms.",
      answer: String.raw`$\frac{7}{20}$`,
    },
    {
      id: "jss2-3",
      question: "What is the sum of the interior angles of a triangle?",
      answer: "180°",
    },
    {
      id: "jss2-4",
      question: "Find the HCF of 18 and 24.",
      answer: "6",
    },
    {
      id: "jss2-5",
      question: String.raw`Simplify: $\sqrt{49} + \sqrt{64}$`,
      answer: "15",
      options: ["15", "13", "17", "113"],
    },
  ],
  JSS3: [
    {
      id: "jss3-1",
      question: String.raw`Factorise completely: $x^2 - 9$`,
      answer: String.raw`$(x - 3)(x + 3)$`,
    },
    {
      id: "jss3-2",
      question: String.raw`If $y = 3x - 2$, find $y$ when $x = 4$.`,
      answer: "10",
      options: ["10", "12", "14", "6"],
    },
    {
      id: "jss3-3",
      question: "Find the gradient of the line through (1, 2) and (3, 8).",
      answer: "3",
    },
    {
      id: "jss3-4",
      question: "Express 45 000 in standard form.",
      answer: String.raw`$4.5 \times 10^{4}$`,
    },
    {
      id: "jss3-5",
      question: String.raw`Solve: $3(x - 2) = 12$`,
      answer: "6",
    },
  ],
  SSS1: [
    {
      id: "sss1-1",
      question: String.raw`Solve: $x^2 - 5x + 6 = 0$`,
      answer: String.raw`$x = 2$ or $x = 3$`,
    },
    {
      id: "sss1-2",
      question: String.raw`Evaluate: $\log_{2} 32$`,
      answer: "5",
      options: ["5", "16", "4", "6"],
    },
    {
      id: "sss1-3",
      question: "Find the sum of the first 10 terms of the AP 3, 7, 11, 15, ...",
      answer: "210",
    },
    {
      id: "sss1-4",
      question: String.raw`Simplify: $\dfrac{x^2 - 4}{x - 2}$`,
      answer: String.raw`$x + 2$`,
    },
    {
      id: "sss1-5",
      question: "What is the size of each exterior angle of a regular hexagon?",
      answer: "60°",
    },
  ],
  SSS2: [
    {
      id: "sss2-1",
      question: String.raw`Differentiate $y = 3x^2 + 2x$ with respect to $x$.`,
      answer: String.raw`$\dfrac{dy}{dx} = 6x + 2$`,
    },
    {
      id: "sss2-2",
      question: "Find the 5th term of the GP 2, 6, 18, ...",
      answer: "162",
      options: ["162", "54", "486", "108"],
    },
    {
      id: "sss2-3",
      question: String.raw`Evaluate: $\sin 30° + \cos 60°$`,
      answer: "1",
    },
    {
      id: "sss2-4",
      question: String.raw`Solve: $2^{x} = 64$`,
      answer: "6",
    },
    {
      id: "sss2-5",
      question: "In how many ways can 4 different books be arranged on a shelf?",
      answer: "24",
    },
  ],
  SSS3: [
    {
      id: "sss3-1",
      question: String.raw`Evaluate: $\displaystyle\int 6x^2 \, dx$`,
      answer: String.raw`$2x^3 + C$`,
    },
    {
      id: "sss3-2",
      question: String.raw`Find the value of $x$ at the stationary point of $y = x^2 - 4x + 1$.`,
      answer: "2",
      options: ["2", "4", "-2", "1"],
    },
    {
      id: "sss3-3",
      question: String.raw`Evaluate: $\displaystyle\lim_{x \to 2} \dfrac{x^2 - 4}{x - 2}$`,
      answer: "4",
    },
    {
      id: "sss3-4",
      question: String.raw`Find the determinant of $\begin{pmatrix} 3 & 2 \\ 1 & 4 \end{pmatrix}$`,
      answer: "10",
    },
    {
      id: "sss3-5",
      question: "Find the mean of 2, 4, 6, 8 and 10.",
      answer: "6",
    },
  ],
};
