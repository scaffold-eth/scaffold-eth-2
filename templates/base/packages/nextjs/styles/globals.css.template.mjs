import { withDefaults } from '../../../../utils.js'

const contents = ({ postContent }) =>
`@import "tailwindcss";

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));

@theme {
  --shadow-center: 0 0 12px -2px rgb(0 0 0 / 0.05);
  --animate-pulse-fast: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@plugin "daisyui" {
  themes:
    light,
    dark --prefersdark;
}

@plugin "daisyui/theme" {
  name: "light";

  --color-primary: #93bbfb;
  --color-primary-content: #212638;
  --color-secondary: #dae8ff;
  --color-secondary-content: #212638;
  --color-accent: #93bbfb;
  --color-accent-content: #212638;
  --color-neutral: #212638;
  --color-neutral-content: #ffffff;
  --color-base-100: #ffffff;
  --color-base-200: #f4f8ff;
  --color-base-300: #dae8ff;
  --color-base-content: #212638;
  --color-info: #93bbfb;
  --color-success: #34eeb6;
  --color-warning: #ffcf72;
  --color-error: #ff8863;

  --radius-field: 9999rem;
  --radius-box: 1rem;
  --tt-tailw: 6px;
}

@plugin "daisyui/theme" {
  name: "dark";

  --color-primary: #212638;
  --color-primary-content: #f9fbff;
  --color-secondary: #323f61;
  --color-secondary-content: #f9fbff;
  --color-accent: #4969a6;
  --color-accent-content: #f9fbff;
  --color-neutral: #f9fbff;
  --color-neutral-content: #385183;
  --color-base-100: #385183;
  --color-base-200: #2a3655;
  --color-base-300: #212638;
  --color-base-content: #f9fbff;
  --color-info: #385183;
  --color-success: #34eeb6;
  --color-warning: #ffcf72;
  --color-error: #ff8863;

  --radius-field: 9999rem;
  --radius-box: 1rem;

  --tt-tailw: 6px;
  --tt-bg: var(--color-primary);
}

/*
  The default border color has changed to \`currentColor\` in Tailwind CSS v4,
  so we've added these compatibility styles to make sure everything still
  looks the same as it did with Tailwind CSS v3.

  If we ever want to remove these styles, we need to add an explicit border
  color utility to any element that depends on these defaults.
*/
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }

  p {
    margin: 1rem 0;
  }

  body {
    min-height: 100vh;
  }

  h1,
  h2,
  h3,
  h4 {
    margin-bottom: 0.5rem;
    line-height: 1;
  }
}

:root,
[data-theme] {
  background: var(--color-base-200);
}

.btn {
  @apply shadow-md;
}

.btn.btn-ghost {
  @apply shadow-none;
}

.link {
  text-underline-offset: 2px;
}

.link:hover {
  opacity: 80%;
}
  
${postContent[0] ? `
  /* -- EXTENSION OVERRIDES -- */
  ${postContent[0]}
` : ''}`

export default withDefaults(contents, {
  postContent: ''
})
