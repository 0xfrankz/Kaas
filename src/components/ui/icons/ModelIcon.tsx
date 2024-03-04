import type { JSX, SVGProps } from 'react';

export function ModelIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M8 7V15M8 7L1.12883 4.22562M8 7L14.9809 4.20227M7.79501 0.666675C7.9475 0.59825 8.12367 0.59825 8.27616 0.666675L15.1028 3.72993C15.3032 3.8198 15.4312 4.0131 15.4312 4.22562V11.7744C15.4312 11.9869 15.3032 12.1801 15.1028 12.2701L8.27616 15.3333C8.12367 15.4017 7.9475 15.4017 7.79501 15.3333L0.968332 12.2701C0.768038 12.1801 0.640015 11.9869 0.640015 11.7744V4.22562C0.640015 4.0131 0.768038 3.8198 0.968332 3.72993L7.79501 0.666675Z"
        strokeLinecap="round"
      />
    </svg>
  );
}
