# Seat of Wisdom Montessori Maths Olympiad

Host console for the maths competition, JSS 1 to SSS 3. No backend, no database, no environment variables.
Next.js (App Router), TypeScript, Tailwind CSS v4. Deploys to Vercel as a static site.

## Run it

```bash
npm install
npm run dev
```

## Add your questions

Open `src/data/questions.ts`. Each class has its own list. The ones in there now are placeholders.

```ts
{
  id: "jss2-6",                       // any unique text
  question: String.raw`Solve for $x$: $2x + 5 = 17$`,
  answer: "6",
  options: ["6", "11", "5", "8"],     // optional
  image: "/questions/triangle.png",   // optional, file goes in /public/questions
  seconds: 90,                        // optional, default 60
  points: 20,                         // optional, default 10
}
```

- Wrap maths in `$...$` and use `String.raw` so backslashes work: `$\frac{3}{4}$`, `$x^2$`, `$\sqrt{49}$`.
- If you give `options`, `answer` must match one of them exactly.
- Order does not matter. Every page load reshuffles each class's questions, and the options too.

## Running the competition

1. Pick a class, add the students (names separated by commas works).
2. Press **Call a student** (fewest turns goes first, ties are random) or press **Call** next to a name.
3. On the stage: Show question, Reveal answer, then mark Correct or Wrong.

Keyboard: Space moves on, C correct, X wrong, P pauses the timer, Esc leaves the stage.

## Things to know

- Students and scores are saved in the browser's localStorage on the host's device, so a refresh keeps them.
  Questions reshuffle on refresh by design. Use the same laptop and browser for the whole event.
- A question does not repeat within a class until the whole class deck has been used.
- Anyone who opens the site gets the host console and the answers. Share the link only with the host,
  or put the project behind Vercel password protection.

## Deploy

Push to GitHub and import into Vercel. No settings needed.
