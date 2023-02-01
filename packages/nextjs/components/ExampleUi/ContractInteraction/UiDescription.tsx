import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const UiDescription = () => {
  const [visible, setVisible] = useState(true);
  return (
    <div className={`mt-10 flex gap-2 ${visible ? "" : "invisible"} max-w-2xl`}>
      <div className="flex gap-5 bg-base-200 bg-opacity-80 z-0 p-7 rounded-2xl shadow-lg">
        <span className="text-3xl">👋🏻</span>
        <div>
          <div>
            In this page you can see how some of our <strong>hooks & components</strong> work, and how you can bring
            them to life with your own design! Have fun and try it out!
          </div>
          <div className="mt-2">
            Check out{" "}
            <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem]">
              packages / nextjs/pages / example-ui.tsx
            </code>{" "}
            and its underlying components.
          </div>
        </div>
      </div>
      <button
        className="btn btn-circle btn-ghost h-6 w-6 bg-base-200 bg-opacity-80 z-0 min-h-0 drop-shadow-md"
        onClick={() => setVisible(false)}
      >
        <XMarkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};
