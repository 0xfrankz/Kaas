import type { JSX, SVGProps } from 'react';

export function LoadingIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" {...props}>
      <circle
        fill="#F8C611"
        stroke="#F8C611"
        strokeWidth="15"
        r="15"
        cx="40"
        cy="100"
      >
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="1.2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.4"
        />
      </circle>
      <circle
        fill="#F8C611"
        stroke="#F8C611"
        strokeWidth="15"
        r="15"
        cx="100"
        cy="100"
      >
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="1.2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="-.2"
        />
      </circle>
      <circle
        fill="#F8C611"
        stroke="#F8C611"
        strokeWidth="15"
        r="15"
        cx="160"
        cy="100"
      >
        <animate
          attributeName="opacity"
          calcMode="spline"
          dur="1.2"
          values="1;0;1;"
          keySplines=".5 0 .5 1;.5 0 .5 1"
          repeatCount="indefinite"
          begin="0"
        />
      </circle>
    </svg>
  );
}
